// Prueba el flujo de pago COMPLETO en un Chrome real, contra el Mercado Pago simulado:
// carrito → "Finalizar compra" → sitio de pago simulado → vuelta a la tienda → resultado.
// Uso: npm run build && npm run probar:pago-navegador [carpeta-para-capturas]
//
// ATENCIÓN: el simulado refleja nuestra lectura de la documentación; no prueba contra el Mercado Pago real.
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { iniciarSimulado } from './mercadopago-simulado.mjs'
import { dormir, lanzarNavegador } from './lib/cdp.mjs'
import { detenerApps, hayBuild, lanzarApp } from './lib/app.mjs'

if (!hayBuild()) { console.error('Falta el build. Corré primero: npm run build'); process.exit(2) }

const SALIDA = process.argv[2] ?? mkdtempSync(join(tmpdir(), 'capturas-'))
const TOKEN = 'TEST-token-del-navegador-0123456789'
const resultados = []
const ok = (cond, msg, detalle = '') => { resultados.push({ ok: !!cond, msg, detalle }); if (!cond) console.log(`  ✗ ${msg} ${detalle}`) }

const sim = await iniciarSimulado({ puerto: 0, token: TOKEN })
const app = await lanzarApp(3111, { NUXT_MERCADOPAGO_ACCESS_TOKEN: TOKEN, NUXT_MERCADOPAGO_API_URL: sim.url })
const appSinToken = await lanzarApp(3112, { NUXT_MERCADOPAGO_ACCESS_TOKEN: '' })
const navegador = await lanzarNavegador({ base: app.base, salida: SALIDA, puerto: 9345 })
const t = await navegador.abrirPestana()
await t.dispositivo(1440, 900, false)

const CLAVE = 'ecommerce:carrito'
const futuro = () => Date.now() + 2 * 60 * 60 * 1000
const cargarCarrito = async (...pares) => {
  await t.ir('/')
  await t.ev(`localStorage.setItem(${JSON.stringify(CLAVE)}, ${JSON.stringify(JSON.stringify({ version: 1, expiraEn: futuro(), datos: pares.map(([id, cantidad]) => ({ id, cantidad })) }))})`)
  await t.ir('/carrito')
  await t.esperar(`!document.body.innerText.includes('Cargando tu carrito')`)
}
const carritoGuardado = async () => { const c = await t.ev(`localStorage.getItem(${JSON.stringify(CLAVE)})`); return c ? JSON.parse(c).datos : null }
const texto = (sel) => t.ev(`document.querySelector(${JSON.stringify(sel)})?.textContent.replace(/\\s+/g,' ').trim() ?? ''`)
const titulo = () => texto('h1')
const esperarTitulo = (frag) => t.esperar(`document.querySelector('h1')?.textContent.includes(${JSON.stringify(frag)})`, 8000)
const cookieOrden = async () => (await t.enviar('Network.getCookies', { urls: [app.base] })).result.cookies.find((c) => c.name === 'ecommerce_orden')

/** Toca "Finalizar compra", espera el sitio de pago simulado y elige un resultado. */
async function pagar(resultado) {
  ok(await t.clic('Finalizar compra'), `se toca "Finalizar compra" (${resultado})`)
  const llego = await t.esperar(`location.href.startsWith(${JSON.stringify(sim.url)})`, 8000)
  ok(llego, `el navegador va al sitio de pago de Mercado Pago (${resultado})`, await t.ev('location.href'))
  if (!llego) return false
  await t.ev(`document.getElementById(${JSON.stringify(resultado)}).click()`)
  const volvio = await t.esperar(`location.origin === ${JSON.stringify(app.base)} && location.pathname === '/compra/resultado' && !document.querySelector('h1')?.textContent.includes('Verificando')`, 10000)
  ok(volvio, `vuelve a la tienda con el resultado (${resultado})`, await t.ev('location.href'))
  return volvio
}

// ---------- 1. Aprobado ----------
console.log('1. Pago aprobado')
await cargarCarrito(['tal-001', 2], ['des-001', 1])
ok((await texto('.modo-prueba')) === 'Modo de prueba: no se cobra dinero real.', 'el carrito avisa que es modo de prueba')
const ordenesAntes = sim.ordenes.size
if (await pagar('aprobado')) {
  const orden = [...sim.ordenes.values()].at(-1)
  ok(sim.ordenes.size === ordenesAntes + 1, 'se creó una sola orden')
  ok(orden.total_amount === `${2 * 89900 + 15800}.00`, 'la orden se creó por el total del catálogo', orden.total_amount)
  ok(await esperarTitulo('Pago aprobado'), 'la página dice "¡Pago aprobado!"', await titulo())
  const pagina = await t.ev('document.body.innerText')
  ok(pagina.includes(orden.external_reference), 'muestra la referencia de la compra')
  ok(pagina.includes('195.600'), 'muestra el total $ 195.600', pagina.slice(0, 200))
  ok(pagina.includes('Modo de prueba'), 'la página de resultado también avisa que es modo de prueba')
  ok((await carritoGuardado()) === null, 'el carrito se vació (se eliminó lo guardado)', JSON.stringify(await carritoGuardado()))
  ok((await t.ev(`document.querySelector('.carrito__cantidad')?.textContent ?? ''`)) === '', 'el ícono del header ya no muestra cantidad')
  ok(!(await cookieOrden()), 'la cookie de la orden se borró al aprobarse')
  ok(/noindex/.test(await t.ev(`document.querySelector('meta[name="robots"]')?.content ?? ''`)), 'la página de resultado tiene noindex')
  await t.captura('pago-aprobado-desktop.png', 1440)
}

// ---------- 2. Rechazado ----------
console.log('2. Pago rechazado')
await cargarCarrito(['mar-001', 1])
if (await pagar('rechazado')) {
  ok(await esperarTitulo('No se pudo completar el pago'), 'la página dice que no se pudo completar', await titulo())
  ok(JSON.stringify(await carritoGuardado()) === JSON.stringify([{ id: 'mar-001', cantidad: 1 }]), 'el carrito se conserva', JSON.stringify(await carritoGuardado()))
  ok(!!(await cookieOrden()), 'la cookie se conserva (se puede reintentar)')
  ok(await t.ev(`[...document.querySelectorAll('a')].some(a => a.textContent.includes('Volver al carrito'))`), 'ofrece "Volver al carrito"')
  await t.ev(`[...document.querySelectorAll('a')].find(a => a.textContent.includes('Volver al carrito')).click()`)
  await t.esperar(`location.pathname === '/carrito' && document.querySelectorAll('.linea').length === 1`, 6000)
  ok((await t.ev(`document.querySelectorAll('.linea').length`)) === 1, 'al volver, el carrito sigue con su producto')
  ok(await t.ev(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Finalizar compra'))?.disabled === false`), 'se puede reintentar el pago')
  await t.captura('pago-rechazado-desktop.png', 1440)
}

// ---------- 3. Pendiente ----------
console.log('3. Pago pendiente')
await cargarCarrito(['mar-001', 1])
if (await pagar('pendiente')) {
  ok(await esperarTitulo('Tu pago está pendiente'), 'la página dice que está pendiente', await titulo())
  ok((await carritoGuardado())?.length === 1, 'el carrito se conserva')
}

// ---------- 4. Cancelado ----------
console.log('4. Pago cancelado')
await cargarCarrito(['mar-001', 1])
if (await pagar('cancelado')) {
  ok(await esperarTitulo('El pago se canceló o venció'), 'la página dice que se canceló', await titulo())
  ok((await carritoGuardado())?.length === 1, 'el carrito se conserva')
}

// ---------- 5. URL manipulada ----------
console.log('5. URL manipulada')
await cargarCarrito(['tal-001', 1])
ok(await t.clic('Finalizar compra'), 'se inicia un pago')
await t.esperar(`location.href.startsWith(${JSON.stringify(sim.url)})`, 8000)
const sinPagar = [...sim.ordenes.values()].at(-1)
await t.ir(`/compra/resultado?status=approved&collection_status=approved&payment_id=999&external_reference=${sinPagar.external_reference}`)
ok(await esperarTitulo('Tu pago está pendiente'), 'con status=approved en la URL pero sin pagar: se muestra el estado REAL (pendiente)', await titulo())
ok((await carritoGuardado())?.length === 1, 'y el carrito NO se vacía')

// ---------- 6. Sin cookie ----------
console.log('6. Sin cookie')
await t.enviar('Network.clearBrowserCookies')
await t.ir('/compra/resultado')
ok(await esperarTitulo('No encontramos una compra para verificar'), 'sin cookie ni orden: "No encontramos una compra para verificar"', await titulo())
ok((await carritoGuardado())?.length === 1, 'y no se toca el carrito')

// ---------- 7. Doble clic ----------
console.log('7. Doble clic')
await cargarCarrito(['mar-001', 1])
const antes7 = sim.ordenes.size
await t.ev(`(() => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Finalizar compra')); b.click(); b.click(); b.click() })()`)
await t.esperar(`location.href.startsWith(${JSON.stringify(sim.url)})`, 8000)
await dormir(400)
ok(sim.ordenes.size === antes7 + 1, 'tres clics seguidos crean una sola orden', `${sim.ordenes.size - antes7} órdenes`)

// ---------- 8. Volver atrás desde Mercado Pago ----------
console.log('8. Volver atrás')
await t.ev('history.back()')
await t.esperar(`location.pathname === '/carrito' && !!document.querySelector('#__nuxt')?.__vue_app__`, 8000)
await dormir(500)
ok(await t.ev(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Finalizar compra'))?.disabled === false`), 'al volver con "atrás", el botón vuelve a estar disponible')

// ---------- 9. Sin credenciales ----------
console.log('9. Sin credenciales')
const nav2 = await lanzarNavegador({ base: appSinToken.base, salida: SALIDA, puerto: 9346 })
const t2 = await nav2.abrirPestana()
await t2.dispositivo(1440, 900, false)
await t2.ir('/')
await t2.ev(`localStorage.setItem(${JSON.stringify(CLAVE)}, ${JSON.stringify(JSON.stringify({ version: 1, expiraEn: futuro(), datos: [{ id: 'tal-001', cantidad: 1 }] }))})`)
await t2.ir('/carrito')
await t2.esperar(`!document.body.innerText.includes('Cargando tu carrito')`)
await t2.clic('Finalizar compra')
await t2.esperar(`!!document.querySelector('.resumen__error')`, 5000)
ok((await t2.ev(`document.querySelector('.resumen__error')?.textContent.trim()`)) === 'El pago online todavía no está configurado.', 'sin token se ve "El pago online todavía no está configurado."')
ok((await t2.ev(`document.querySelector('.resumen__error')?.getAttribute('role')`)) === 'alert', 'el error se anuncia con role=alert')
ok(await t2.ev(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Finalizar compra'))?.disabled === false`), 'el botón queda disponible')
ok(await t2.ev(`location.pathname === '/carrito'`), 'la persona se queda en el carrito')
ok(JSON.parse(await t2.ev(`localStorage.getItem(${JSON.stringify(CLAVE)})`)).datos.length === 1, 'el carrito sigue intacto')
await t2.captura('pago-sin-credenciales-desktop.png', 1440)
nav2.cerrar()

// ---------- 10. El token no llega al navegador ----------
console.log('10. El token no llega al navegador')
await t.ir('/carrito')
const filtrado = await t.ev(`(async () => {
  const urls = [location.href, ...performance.getEntriesByType('resource').map(r => r.name).filter(n => n.startsWith(location.origin))]
  const encontrados = []
  for (const u of urls) { const txt = await (await fetch(u)).text(); if (txt.includes(${JSON.stringify(TOKEN)}) || txt.includes('ACCESS_TOKEN')) encontrados.push(u) }
  return JSON.stringify({ revisados: urls.length, encontrados })
})()`)
const f = JSON.parse(filtrado)
ok(f.revisados > 3 && f.encontrados.length === 0, `el token no está en el HTML ni en los ${f.revisados} archivos que recibe el navegador`, JSON.stringify(f.encontrados))
ok(!app.registro.salida.includes(TOKEN), 'el token tampoco aparece en el registro del servidor')

// ---------- 11. Mobile ----------
console.log('11. Mobile 390 px')
await t.dispositivo(390, 844, true)
await cargarCarrito(['tal-001', 2], ['des-001', 1])
let m = JSON.parse(await t.ev(`JSON.stringify({ ancho: innerWidth, contenido: document.documentElement.scrollWidth })`))
ok(m.contenido <= m.ancho, 'mobile: /carrito sin desborde horizontal', JSON.stringify(m))
await t.captura('carrito-pago-mobile.png', 390)
await pagar('aprobado')
await esperarTitulo('Pago aprobado')
m = JSON.parse(await t.ev(`JSON.stringify({ ancho: innerWidth, contenido: document.documentElement.scrollWidth })`))
ok(m.contenido <= m.ancho, 'mobile: la página de resultado no tiene desborde horizontal', JSON.stringify(m))
await t.captura('pago-aprobado-mobile.png', 390)

// ---------- Consola ----------
const errores = t.consola.filter((c) => !/Failed to load resource.*(40[0-9]|50[0-9])/.test(c))
ok(errores.length === 0, 'sin errores ni avisos de hidratación en la consola', errores.join(' | ').slice(0, 300))

const fallidos = resultados.filter((r) => !r.ok)
console.log(`\n${resultados.length - fallidos.length}/${resultados.length} comprobaciones correctas`)
for (const x of fallidos) console.log(`  ✗ ${x.msg} ${x.detalle}`)
navegador.cerrar()
await sim.cerrar()
detenerApps()
process.exit(fallidos.length ? 1 : 0)
