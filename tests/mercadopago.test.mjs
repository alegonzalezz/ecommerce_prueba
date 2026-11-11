import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  API_URL_DEFECTO, RUTA_RESULTADO, construirOrden, esIdOrdenValido, interpretarOrden, referenciaNueva, urlDePagoSegura,
} from '../shared/utils/mercadopago.ts'
import { armarPedido } from '../shared/utils/pedido.ts'

const base = JSON.parse(await readFile(new URL('../data/catalogo.json', import.meta.url), 'utf8'))
const pedido = armarPedido([{ id: 'tal-001', cantidad: 2 }, { id: 'mar-001', cantidad: 1 }], base).pedido
const SITIO = 'https://ferreteria.example'

test('referenciaNueva: es distinta cada vez y con prefijo propio', () => {
  const a = referenciaNueva(), b = referenciaNueva()
  assert.notEqual(a, b)
  assert.match(a, /^ec-[0-9a-f-]{36}$/)
})

test('esIdOrdenValido: acepta el formato de los ejemplos y rechaza lo raro', () => {
  assert.equal(esIdOrdenValido('ORDTST01KS5AJ6HTK2HRQ3XJ3C2JCKP9'), true)
  assert.equal(esIdOrdenValido('ORD01ABCDEFGH'), true)
  for (const malo of ['', 'ord123456789', 'ORD', 'ORD1', '../etc', 'ORDTST 01', 'ORD' + 'A'.repeat(80), null, undefined, 5, {}]) {
    assert.equal(esIdOrdenValido(malo), false, String(malo))
  }
})

test('construirOrden: forma del cuerpo según la documentación', () => {
  const o = construirOrden({ pedido, referencia: 'ec-123', siteUrl: SITIO, tienda: 'Tu Ferretería' })
  assert.equal(o.type, 'online')
  assert.equal(o.processing_mode, 'manual')
  assert.equal(o.total_amount, '192700.00')
  assert.equal(o.external_reference, 'ec-123')
  assert.equal(o.description, 'Compra en Tu Ferretería')
  assert.deepEqual(o.items, [
    { title: 'Taladro percutor 13 mm 750 W', unit_price: '89900.00', quantity: 2 },
    { title: 'Martillo de carpintero 500 g', unit_price: '12900.00', quantity: 1 },
  ])
})

test('construirOrden: el total es exactamente la suma de unit_price × quantity', () => {
  const o = construirOrden({ pedido, referencia: 'x', siteUrl: SITIO, tienda: 't' })
  const suma = o.items.reduce((s, i) => s + Math.round(Number(i.unit_price) * 100) * i.quantity, 0)
  assert.equal(Math.round(Number(o.total_amount) * 100), suma)
})

test('construirOrden: no manda ids internos, ni payer (no se piden datos del comprador)', () => {
  const o = construirOrden({ pedido, referencia: 'x', siteUrl: SITIO, tienda: 't' })
  assert.ok(o.items.every((i) => !('id' in i)))
  assert.ok(!('payer' in o))
})

test('construirOrden: las URLs de retorno salen de siteUrl y apuntan a la página de resultado', () => {
  const o = construirOrden({ pedido, referencia: 'x', siteUrl: `${SITIO}/`, tienda: 't' })
  const u = `${SITIO}${RUTA_RESULTADO}`
  assert.deepEqual(o.config.online, { success_url: u, failure_url: u, pending_url: u, auto_return: 'all' })
})

test('interpretarOrden: processed con lo pagado cubriendo el total es aprobado', () => {
  const r = interpretarOrden({ status: 'processed', status_detail: 'accredited', total_amount: '1000.00', total_paid_amount: '1000.00', external_reference: 'ec-1' })
  assert.deepEqual(r, { estado: 'aprobado', referencia: 'ec-1', total: '1000.00' })
})

test('interpretarOrden: processed pero pagado menos que el total NO es aprobado', () => {
  assert.equal(interpretarOrden({ status: 'processed', total_amount: '1000.00', total_paid_amount: '0.00' }).estado, 'pendiente')
})

test('interpretarOrden: processed sin montos se confía en el estado', () => {
  assert.equal(interpretarOrden({ status: 'processed' }).estado, 'aprobado')
})

test('interpretarOrden: created, action_required y processing son pendientes', () => {
  for (const status of ['created', 'action_required', 'processing']) assert.equal(interpretarOrden({ status }).estado, 'pendiente', status)
})

test('interpretarOrden: failed es rechazado; canceled y expired son cancelado', () => {
  assert.equal(interpretarOrden({ status: 'failed' }).estado, 'rechazado')
  assert.equal(interpretarOrden({ status: 'canceled' }).estado, 'cancelado')
  assert.equal(interpretarOrden({ status: 'expired' }).estado, 'cancelado')
})

test('interpretarOrden: refunded, charged_back, desconocidos y basura son desconocido', () => {
  for (const x of [{ status: 'refunded' }, { status: 'charged_back' }, { status: 'inventado' }, {}, null, undefined, 'x', 5]) {
    assert.equal(interpretarOrden(x).estado, 'desconocido', JSON.stringify(x))
  }
})

test('interpretarOrden: un "status" en la URL no tiene efecto (solo importa la orden)', () => {
  assert.equal(interpretarOrden({ status: 'failed', status_url: 'approved' }).estado, 'rechazado')
})

test('urlDePagoSegura: acepta https de dominios de Mercado Pago', () => {
  for (const u of ['https://www.mercadopago.com.ar/checkout/v1/redirect?order_id=ORD1', 'https://www.mercadopago.com/x', 'https://mercadopago.com.br/y', 'https://www.mercadopago.cl/z']) {
    assert.equal(urlDePagoSegura(u), true, u)
  }
})

test('urlDePagoSegura: rechaza dominios parecidos, http, credenciales y basura', () => {
  for (const u of [
    'http://www.mercadopago.com.ar/x', 'https://evilmercadopago.com.ar/x', 'https://mercadopago.com.ar.evil.com/x',
    'https://evil.com/mercadopago.com.ar', 'https://user:pw@www.mercadopago.com.ar/x', 'javascript:alert(1)', '//evil.com',
    '/relativa', '', null, undefined, 5,
  ]) assert.equal(urlDePagoSegura(u), false, String(u))
})

test('urlDePagoSegura: el origen de la API de pruebas se acepta solo si no es la API oficial', () => {
  assert.equal(urlDePagoSegura('http://127.0.0.1:3400/checkout/v1/redirect', 'http://127.0.0.1:3400'), true)
  assert.equal(urlDePagoSegura('http://127.0.0.1:9999/x', 'http://127.0.0.1:3400'), false)
  assert.equal(urlDePagoSegura('https://api.mercadopago.com/x', API_URL_DEFECTO), true) // dominio de Mercado Pago, https
  assert.equal(urlDePagoSegura('http://localhost:3000/x', API_URL_DEFECTO), false)
})
