import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { iniciarSimulado, validarCuerpoOrden } from '../scripts/mercadopago-simulado.mjs'
import { ErrorMercadoPago, crearOrden, estaConfigurado, obtenerOrden } from '../shared/utils/mercadopago-cliente.ts'
import { construirOrden, interpretarOrden } from '../shared/utils/mercadopago.ts'
import { armarPedido } from '../shared/utils/pedido.ts'

const base = JSON.parse(await readFile(new URL('../data/catalogo.json', import.meta.url), 'utf8'))
const pedido = armarPedido([{ id: 'tal-001', cantidad: 2 }, { id: 'mar-001', cantidad: 1 }], base).pedido
const TOKEN = 'TEST-simulado-1234567890'
const cuerpo = () => construirOrden({ pedido, referencia: 'ec-prueba', siteUrl: 'https://ferreteria.example', tienda: 'Tu Ferretería' })

let sim, cfg
before(async () => { sim = await iniciarSimulado({ puerto: 0, token: TOKEN }); cfg = { accessToken: TOKEN, apiUrl: sim.url, timeoutMs: 3000 } })
after(async () => { await sim.cerrar() })

test('estaConfigurado: solo con un token no vacío', () => {
  assert.equal(estaConfigurado({ accessToken: TOKEN }), true)
  for (const t of ['', '   ', undefined, null]) assert.equal(estaConfigurado({ accessToken: t }), false)
})

test('el cuerpo que armamos pasa la validación del simulado (según la documentación)', () => {
  assert.deepEqual(validarCuerpoOrden(cuerpo()), [])
})

test('el simulado detecta un total que no es la suma de los ítems', () => {
  const malo = { ...cuerpo(), total_amount: '1.00' }
  assert.ok(validarCuerpoOrden(malo).some((p) => p.includes('total_amount')))
})

test('crearOrden: devuelve id y checkout_url', async () => {
  const o = await crearOrden(cfg, cuerpo())
  assert.match(o.id, /^ORDTST/)
  assert.match(o.checkout_url, /\/checkout\/v1\/redirect\?order_id=/)
  assert.equal(o.status, 'created')
  assert.equal(o.external_reference, 'ec-prueba')
  assert.equal(o.total_amount, '192700.00')
})

test('obtenerOrden: devuelve la orden creada', async () => {
  const creada = await crearOrden(cfg, cuerpo())
  const o = await obtenerOrden(cfg, creada.id)
  assert.equal(o.id, creada.id)
  assert.equal(interpretarOrden(o).estado, 'pendiente')
})

test('obtenerOrden: un id inexistente da no-encontrada', async () => {
  await assert.rejects(obtenerOrden(cfg, 'ORDTSTNOEXISTE0000'), (e) => e instanceof ErrorMercadoPago && e.tipo === 'no-encontrada' && e.estado === 404)
})

test('sin token configurado: error sin llamar a la red', async () => {
  const antes = sim.llamadas.length
  await assert.rejects(crearOrden({ accessToken: '', apiUrl: sim.url }, cuerpo()), (e) => e.tipo === 'sin-configurar')
  assert.equal(sim.llamadas.length, antes)
})

test('token incorrecto: no-autorizado, y el error NO contiene el token', async () => {
  const MAL = 'TEST-token-que-no-es-el-correcto'
  await assert.rejects(crearOrden({ ...cfg, accessToken: MAL }, cuerpo()), (e) => {
    assert.equal(e.tipo, 'no-autorizado')
    assert.equal(e.estado, 401)
    for (const texto of [e.message, e.detalle, String(e.stack ?? '')]) assert.ok(!texto.includes(MAL), 'el token aparece en el error')
    return true
  })
})

test('cuerpo inválido: error de respuesta con detalle para el registro del servidor', async () => {
  await assert.rejects(crearOrden(cfg, { ...cuerpo(), total_amount: '5.00' }), (e) => e.tipo === 'respuesta' && e.estado === 400 && e.detalle.includes('total_amount'))
})

test('cada intento envía una clave de idempotencia distinta', async () => {
  const claves = []
  const espia = async (url, init) => { claves.push(init.headers['X-Idempotency-Key']); return fetch(url, init) }
  await crearOrden({ ...cfg, fetch: espia }, cuerpo())
  await crearOrden({ ...cfg, fetch: espia }, cuerpo())
  assert.equal(claves.length, 2)
  assert.ok(claves.every((c) => /^[0-9a-f-]{36}$/.test(c)))
  assert.notEqual(claves[0], claves[1])
})

test('envía el token solo en el encabezado Authorization', async () => {
  let visto
  const espia = async (url, init) => { visto = { url, init }; return fetch(url, init) }
  await crearOrden({ ...cfg, fetch: espia }, cuerpo())
  assert.equal(visto.init.headers.Authorization, `Bearer ${TOKEN}`)
  assert.ok(!visto.url.includes(TOKEN))
  assert.ok(!visto.init.body.includes(TOKEN))
})

test('error 500 de Mercado Pago: respuesta con estado 500', async () => {
  const f = async () => new Response('{"message":"internal"}', { status: 500 })
  await assert.rejects(crearOrden({ ...cfg, fetch: f }, cuerpo()), (e) => e.tipo === 'respuesta' && e.estado === 500)
})

test('respuesta sin id o sin checkout_url: se rechaza', async () => {
  for (const cuerpoRespuesta of ['{}', '{"id":"ORD1"}', '{"checkout_url":"https://x"}', 'no es json', 'null']) {
    const f = async () => new Response(cuerpoRespuesta, { status: 201 })
    await assert.rejects(crearOrden({ ...cfg, fetch: f }, cuerpo()), (e) => e.tipo === 'respuesta', cuerpoRespuesta)
  }
})

test('sin conexión: error de red sin datos sensibles', async () => {
  const f = async () => { throw new TypeError('fetch failed') }
  await assert.rejects(crearOrden({ ...cfg, fetch: f }, cuerpo()), (e) => e.tipo === 'red' && !e.message.includes(TOKEN))
})

test('tiempo de espera agotado: error de red', async () => {
  const f = (url, init) => new Promise((_, rechazar) => init.signal.addEventListener('abort', () => rechazar(init.signal.reason)))
  await assert.rejects(crearOrden({ ...cfg, fetch: f, timeoutMs: 50 }, cuerpo()), (e) => e.tipo === 'red')
})

test('flujo completo del simulado: aprobar, rechazar y dejar pendiente', async () => {
  for (const [resultado, esperado] of [['aprobado', 'aprobado'], ['rechazado', 'rechazado'], ['pendiente', 'pendiente'], ['cancelado', 'cancelado']]) {
    const o = await crearOrden(cfg, cuerpo())
    const r = await fetch(`${sim.url}/simular?order_id=${o.id}&resultado=${resultado}`, { redirect: 'manual' })
    assert.equal(r.status, 302)
    const retorno = new URL(r.headers.get('location'))
    assert.equal(retorno.pathname, '/compra/resultado')
    assert.equal(retorno.searchParams.get('external_reference'), 'ec-prueba')
    assert.equal(interpretarOrden(await obtenerOrden(cfg, o.id)).estado, esperado, resultado)
  }
})
