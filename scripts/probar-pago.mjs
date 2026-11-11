// Prueba las rutas de pago de la app REAL (build de producción) contra el Mercado Pago simulado.
// Uso: npm run build && npm run probar:pago
//
// Levanta varias copias de la app con distintas configuraciones (con token, sin token, API caída,
// URL de pago ajena, token incorrecto) y comprueba cada respuesta, la cookie y que el token no se filtre.
// ATENCIÓN: el simulado refleja nuestra lectura de la documentación; no prueba contra el Mercado Pago real.
import { readFileSync } from 'node:fs'
import { iniciarSimulado } from './mercadopago-simulado.mjs'
import { dormir } from './lib/cdp.mjs'
import { detenerApps, hayBuild, lanzarApp } from './lib/app.mjs'

if (!hayBuild()) {
  console.error('Falta el build. Corré primero: npm run build')
  process.exit(2)
}

const catalogo = JSON.parse(readFileSync(new URL('../data/catalogo.json', import.meta.url), 'utf8'))
const TOKEN = 'TEST-token-de-la-prueba-0123456789'
const resultados = []
const ok = (cond, msg, detalle = '') => { resultados.push({ ok: !!cond, msg, detalle }); if (!cond) console.log(`  ✗ ${msg} ${detalle}`) }

async function post(base, cuerpo, { crudo = false } = {}) {
  const r = await fetch(`${base}/api/checkout`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: crudo ? cuerpo : JSON.stringify(cuerpo) })
  const texto = await r.text()
  let json = null
  try { json = JSON.parse(texto) } catch {}
  return { estado: r.status, json, texto, cookie: r.headers.get('set-cookie') ?? '' }
}
async function estadoPago(base, { cookie, query = '' } = {}) {
  const r = await fetch(`${base}/api/pago/estado${query}`, { headers: cookie ? { cookie } : {} })
  const texto = await r.text()
  let json = null
  try { json = JSON.parse(texto) } catch {}
  return { estado: r.status, json, texto, cookie: r.headers.get('set-cookie') ?? '', cache: r.headers.get('cache-control') ?? '' }
}
const resolver = (sim, id, resultado) => fetch(`${sim.url}/simular?order_id=${id}&resultado=${resultado}`, { redirect: 'manual' })
async function nuevaOrden(app, sim, ...pares) {
  const r = await post(app.base, { lineas: pares.map(([id, cantidad]) => ({ id, cantidad })) })
  const id = r.cookie.match(/ecommerce_orden=([^;]+)/)?.[1]
  return { id, ref: sim.ordenes.get(id)?.external_reference, cookie: `ecommerce_orden=${id}` }
}
const lineas = (...pares) => ({ lineas: pares.map(([id, cantidad]) => ({ id, cantidad })) })
const precio = (id) => catalogo.productos.find((p) => p.id === id).precio

try {
  // ---------------- A: con token, contra el simulado ----------------
  console.log('A. Con credenciales (simulado)')
  const simA = await iniciarSimulado({ puerto: 0, token: TOKEN })
  const A = await lanzarApp(3101, { NUXT_MERCADOPAGO_ACCESS_TOKEN: TOKEN, NUXT_MERCADOPAGO_API_URL: simA.url })

  let r = await post(A.base, lineas(['tal-001', 2], ['mar-001', 1]))
  ok(r.estado === 200, 'pedido válido: 200', `${r.estado} ${r.texto.slice(0, 120)}`)
  ok(typeof r.json?.url === 'string' && r.json.url.startsWith(`${simA.url}/checkout/v1/redirect?order_id=ORDTST`), 'devuelve la URL de pago', r.json?.url)
  const idOrden = r.cookie.match(/ecommerce_orden=([^;]+)/)?.[1]
  ok(!!idOrden && idOrden.startsWith('ORDTST'), 'guarda el id de la orden en la cookie', r.cookie)
  ok(/HttpOnly/i.test(r.cookie) && /SameSite=Lax/i.test(r.cookie) && /Path=\//i.test(r.cookie), 'la cookie es HttpOnly, SameSite=Lax y Path=/', r.cookie)
  ok(/Secure/i.test(r.cookie), 'en producción la cookie es Secure', r.cookie)
  ok(!r.cookie.includes(TOKEN) && !r.texto.includes(TOKEN), 'el token no aparece en la respuesta ni en la cookie')
  const orden = simA.ordenes.get(idOrden)
  const esperado = 2 * precio('tal-001') + precio('mar-001')
  ok(orden && orden.total_amount === `${esperado}.00`, `la orden en Mercado Pago tiene el total del catálogo (${esperado}.00)`, orden?.total_amount)
  ok(orden?.items?.length === 2 && orden.items[0].title === 'Taladro percutor 13 mm 750 W' && orden.items[0].unit_price === `${precio('tal-001')}.00`, 'los ítems salen del catálogo')
  ok(/^ec-[0-9a-f-]{36}$/.test(orden?.external_reference ?? ''), 'external_reference propia', orden?.external_reference)
  ok(orden?.config?.online?.success_url === `${A.base}/compra/resultado` && orden.config.online.auto_return === 'all', 'las URLs de retorno salen de SITE_URL', JSON.stringify(orden?.config))

  const antes = simA.ordenes.size
  r = await post(A.base, { lineas: [{ id: 'tal-001', cantidad: 1, precio: 1, nombre: 'gratis', total: '1.00' }], total: '1.00', precio: 1, descuento: 99 })
  const falsa = [...simA.ordenes.values()].at(-1)
  ok(r.estado === 200 && simA.ordenes.size === antes + 1 && falsa.total_amount === `${precio('tal-001')}.00`, 'precios y totales inventados por el navegador se ignoran', falsa?.total_amount)

  const antes2 = simA.ordenes.size
  const casos400 = [
    ['JSON inválido', '{', true], ['sin líneas', {}], ['carrito vacío', { lineas: [] }], ['id inválido', lineas(['TAL 001', 1])],
    ['cantidad 0', lineas(['tal-001', 0])], ['cantidad 11', lineas(['tal-001', 11])], ['cantidad texto', { lineas: [{ id: 'tal-001', cantidad: '2' }] }],
    ['producto repetido', lineas(['tal-001', 1], ['tal-001', 1])],
  ]
  for (const [nombre, cuerpo, crudo] of casos400) {
    r = await post(A.base, cuerpo, { crudo })
    ok(r.estado === 400 && typeof r.json?.error === 'string', `400: ${nombre}`, `${r.estado} ${r.texto.slice(0, 80)}`)
  }
  r = await post(A.base, lineas(['llv-001', 1]))
  ok(r.estado === 409 && /sin stock/.test(r.json?.error ?? ''), '409: producto sin stock con su motivo', `${r.estado} ${r.json?.error}`)
  r = await post(A.base, lineas(['ama-001', 10]))
  ok(r.estado === 409 && /hasta 9/.test(r.json?.error ?? ''), '409: cantidad mayor al stock', `${r.estado} ${r.json?.error}`)
  r = await post(A.base, lineas(['zzz-999', 1]))
  ok(r.estado === 409 && /ya no está disponible/.test(r.json?.error ?? ''), '409: producto inexistente', `${r.estado} ${r.json?.error}`)
  r = await post(A.base, JSON.stringify({ lineas: [{ id: 'tal-001', cantidad: 1 }], relleno: 'x'.repeat(9000) }), { crudo: true })
  ok(r.estado === 413, '413: cuerpo demasiado grande', String(r.estado))
  ok(simA.ordenes.size === antes2, 'ningún pedido inválido llegó a crear una orden en Mercado Pago', `${simA.ordenes.size - antes2} órdenes de más`)
  const g = await fetch(`${A.base}/api/checkout`)
  ok(g.status === 404 || g.status === 405, 'GET a /api/checkout no está permitido', String(g.status))

  // ---------------- A: estado del pago ----------------
  console.log('A. Estado del pago')
  const o1 = await nuevaOrden(A, simA, ['tal-001', 1])
  let e = await estadoPago(A.base, { cookie: o1.cookie })
  ok(e.estado === 200 && e.json?.estado === 'pendiente', 'orden recién creada (sin pagar): pendiente', `${e.estado} ${e.texto.slice(0, 100)}`)
  ok(JSON.stringify(Object.keys(e.json ?? {}).sort()) === JSON.stringify(['estado', 'referencia', 'total']), 'la respuesta tiene solo estado, referencia y total', Object.keys(e.json ?? {}).join(','))
  ok(e.json?.referencia === o1.ref && e.json?.total === `${precio('tal-001')}.00`, 'devuelve la referencia y el total de la orden', JSON.stringify(e.json))
  ok(/no-store/.test(e.cache), 'la respuesta no se guarda en caché', e.cache)
  ok(!e.texto.includes(TOKEN), 'la respuesta no incluye el token')

  e = await estadoPago(A.base, { cookie: o1.cookie, query: `?status=approved&collection_status=approved&payment_id=123&external_reference=${o1.ref}` })
  ok(e.json?.estado === 'pendiente', 'una URL con status=approved NO cambia el estado real (la orden no está pagada)', JSON.stringify(e.json))

  await resolver(simA, o1.id, 'aprobado')
  e = await estadoPago(A.base, { cookie: o1.cookie, query: `?external_reference=${o1.ref}` })
  ok(e.json?.estado === 'aprobado', 'tras pagar en Mercado Pago: aprobado', JSON.stringify(e.json))
  ok(/ecommerce_orden=;/.test(e.cookie) && /(Max-Age=0|Expires=Thu, 01 Jan 1970)/i.test(e.cookie), 'al aprobarse, se borra la cookie', e.cookie)

  for (const [resultado, esperado] of [['rechazado', 'rechazado'], ['cancelado', 'cancelado'], ['pendiente', 'pendiente']]) {
    const o = await nuevaOrden(A, simA, ['mar-001', 1])
    await resolver(simA, o.id, resultado)
    e = await estadoPago(A.base, { cookie: o.cookie, query: `?external_reference=${o.ref}` })
    ok(e.json?.estado === esperado, `Mercado Pago dice "${resultado}": se muestra ${esperado}`, JSON.stringify(e.json))
    ok(e.cookie === '', `con "${resultado}" la cookie NO se borra (se puede reintentar)`, e.cookie)
  }

  const llamadasAntes = simA.llamadas.length
  e = await estadoPago(A.base)
  ok(e.estado === 404 && /No encontramos una compra/.test(e.json?.error ?? ''), 'sin cookie ni order_id: 404', `${e.estado} ${e.texto.slice(0, 80)}`)
  for (const malo of ['../x', 'abc', 'ORD', "ORDTST'; DROP", '%00']) {
    e = await estadoPago(A.base, { query: `?order_id=${encodeURIComponent(malo)}` })
    ok(e.estado === 404, `order_id inválido (${malo}): 404`, String(e.estado))
  }
  e = await estadoPago(A.base, { cookie: 'ecommerce_orden=../../etc/passwd' })
  ok(e.estado === 404, 'cookie con formato inválido: 404', String(e.estado))
  ok(simA.llamadas.length === llamadasAntes, 'ninguno de esos casos llegó a Mercado Pago')

  const o2 = await nuevaOrden(A, simA, ['tal-001', 1])
  await resolver(simA, o2.id, 'aprobado')
  e = await estadoPago(A.base, { query: `?order_id=${o2.id}&external_reference=${o2.ref}` })
  ok(e.json?.estado === 'aprobado', 'sin cookie, con order_id válido y referencia que coincide: se verifica', `${e.estado} ${e.texto.slice(0, 80)}`)
  e = await estadoPago(A.base, { query: `?order_id=${o2.id}&external_reference=ec-otra-compra` })
  ok(e.estado === 404, 'con una referencia que NO coincide con la orden: 404', String(e.estado))
  e = await estadoPago(A.base, { query: `?order_id=${o2.id}` })
  ok(e.json?.estado === 'aprobado', 'sin referencia en la URL, con order_id válido: se verifica contra Mercado Pago', `${e.estado}`)
  e = await estadoPago(A.base, { cookie: 'ecommerce_orden=ORDTSTNOEXISTE000000' })
  ok(e.estado === 404, 'cookie con una orden que no existe en Mercado Pago: 404', String(e.estado))
  const o3 = await nuevaOrden(A, simA, ['mar-001', 1])
  e = await estadoPago(A.base, { cookie: o3.cookie, query: `?order_id=${o2.id}&external_reference=${o2.ref}` })
  ok(e.estado === 404, 'la cookie manda: si la URL habla de otra compra, no se mezclan', `${e.estado} ${e.texto.slice(0, 80)}`)

  // ---------------- A2: límite de pedidos ----------------
  console.log('A2. Límite de pedidos por IP')
  const simL = await iniciarSimulado({ puerto: 0, token: TOKEN })
  const L = await lanzarApp(3102, { NUXT_MERCADOPAGO_ACCESS_TOKEN: TOKEN, NUXT_MERCADOPAGO_API_URL: simL.url })
  const estados = []
  for (let i = 0; i < 12; i++) estados.push((await post(L.base, lineas(['mar-001', 1]))).estado)
  ok(estados.slice(0, 10).every((e) => e === 200) && estados[10] === 429 && estados[11] === 429, '10 pedidos pasan y el 11.º y 12.º dan 429', estados.join(','))
  ok(simL.ordenes.size === 10, 'solo 10 órdenes llegaron a Mercado Pago', String(simL.ordenes.size))
  r = await post(L.base, lineas(['mar-001', 1]))
  ok(/muchos intentos/.test(r.json?.error ?? ''), 'el 429 explica qué hacer', r.json?.error)
  const sinCookie = []
  for (let i = 0; i < 62; i++) sinCookie.push((await estadoPago(L.base)).estado)
  ok(sinCookie.slice(0, 60).every((x) => x === 404) && sinCookie[60] === 429, 'la consulta de estado también se limita (60 por minuto)', sinCookie.slice(58).join(','))
  await simL.cerrar()

  // ---------------- B: sin token ----------------
  console.log('B. Sin credenciales')
  const simB = await iniciarSimulado({ puerto: 0, token: TOKEN })
  const B = await lanzarApp(3103, { NUXT_MERCADOPAGO_ACCESS_TOKEN: '', NUXT_MERCADOPAGO_API_URL: simB.url })
  r = await post(B.base, lineas(['tal-001', 1]))
  ok(r.estado === 503 && r.json?.error === 'El pago online todavía no está configurado.', '503 con el mensaje claro', `${r.estado} ${r.json?.error}`)
  ok(simB.llamadas.length === 0 && r.cookie === '', 'no llama a Mercado Pago ni deja cookie')
  e = await estadoPago(B.base, { cookie: 'ecommerce_orden=ORDTST0123456789ABC' })
  ok(e.estado === 503, 'el estado también responde 503 si no hay credenciales', String(e.estado))
  await simB.cerrar()

  // ---------------- C: Mercado Pago caído ----------------
  console.log('C. Mercado Pago no responde')
  const C = await lanzarApp(3104, { NUXT_MERCADOPAGO_ACCESS_TOKEN: TOKEN, NUXT_MERCADOPAGO_API_URL: 'http://127.0.0.1:1' })
  r = await post(C.base, lineas(['tal-001', 1]))
  ok(r.estado === 502 && /No pudimos iniciar el pago/.test(r.json?.error ?? ''), '502 con mensaje genérico', `${r.estado} ${r.json?.error}`)
  ok(!r.texto.includes('127.0.0.1') && !r.texto.includes(TOKEN), 'el mensaje no filtra la dirección interna ni el token')
  ok(r.cookie === '', 'no deja cookie')
  await dormir(200)
  ok(/\[mercadopago\] crearOrden falló: red/.test(C.registro.salida), 'el detalle queda en el registro del servidor', C.registro.salida.slice(-160))
  e = await estadoPago(C.base, { cookie: 'ecommerce_orden=ORDTST0123456789ABC' })
  ok(e.estado === 502 && /No pudimos verificar/.test(e.json?.error ?? '') && !e.texto.includes('127.0.0.1'), 'con Mercado Pago caído, el estado responde 502 genérico', `${e.estado} ${e.texto.slice(0, 100)}`)

  // ---------------- D: URL de pago ajena ----------------
  console.log('D. URL de pago que no es de Mercado Pago')
  const simD = await iniciarSimulado({ puerto: 0, token: TOKEN, checkoutUrlFalsa: 'https://evil.example/mercadopago.com.ar/pagar' })
  const D = await lanzarApp(3105, { NUXT_MERCADOPAGO_ACCESS_TOKEN: TOKEN, NUXT_MERCADOPAGO_API_URL: simD.url })
  r = await post(D.base, lineas(['tal-001', 1]))
  ok(r.estado === 502 && !r.texto.includes('evil.example'), '502 y no redirige a una URL ajena', `${r.estado} ${r.texto.slice(0, 100)}`)
  ok(r.cookie === '', 'no deja cookie')
  await simD.cerrar()

  // ---------------- E: token incorrecto ----------------
  console.log('E. Token incorrecto')
  const TOKEN_MAL = 'TEST-token-equivocado-9876543210'
  const simE = await iniciarSimulado({ puerto: 0, token: TOKEN })
  const E = await lanzarApp(3106, { NUXT_MERCADOPAGO_ACCESS_TOKEN: TOKEN_MAL, NUXT_MERCADOPAGO_API_URL: simE.url })
  r = await post(E.base, lineas(['tal-001', 1]))
  ok(r.estado === 502 && !r.texto.includes(TOKEN_MAL), '502 y la respuesta no incluye el token', `${r.estado} ${r.texto.slice(0, 100)}`)
  await dormir(200)
  ok(/no-autorizado 401/.test(E.registro.salida), 'el registro del servidor dice que Mercado Pago rechazó las credenciales')
  await simE.cerrar()

  // ---------------- El token no aparece en ningún registro ----------------
  console.log('Registros del servidor')
  for (const [nombre, app, token] of [['A', A, TOKEN], ['L', L, TOKEN], ['B', B, TOKEN], ['C', C, TOKEN], ['D', D, TOKEN], ['E', E, TOKEN_MAL]]) {
    ok(!app.registro.salida.includes(token), `el token no aparece en el registro de la copia ${nombre}`)
  }
  await simA.cerrar()
} finally {
  detenerApps()
}

const fallidos = resultados.filter((r) => !r.ok)
console.log(`\n${resultados.length - fallidos.length}/${resultados.length} comprobaciones correctas`)
for (const f of fallidos) console.log(`  ✗ ${f.msg} ${f.detalle}`)
process.exit(fallidos.length ? 1 : 0)
