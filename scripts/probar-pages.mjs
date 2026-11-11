// Prueba en un Chrome real la versión ESTÁTICA (GitHub Pages): subcarpeta, imágenes, navegación,
// carrito sin pago, 404 y SEO. Sirve igual contra el emulador local o contra el sitio publicado.
// Uso: npm run probar:pages -- http://localhost:4173/ecommerce_prueba [carpeta-para-capturas]
//      npm run probar:pages -- https://alegonzalezz.github.io/ecommerce_prueba
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { dormir, lanzarNavegador } from './lib/cdp.mjs'

const BASE = (process.argv[2] ?? 'http://localhost:4173/ecommerce_prueba').replace(/\/+$/, '')
const SALIDA = process.argv[3] ?? mkdtempSync(join(tmpdir(), 'capturas-'))
const { origin, pathname: SUB } = new URL(BASE) // SUB = "/ecommerce_prueba"
const resultados = []
const ok = (c, m, d = '') => { resultados.push({ ok: !!c, m, d }); if (!c) console.log(`  ✗ ${m} ${d}`) }

const navegador = await lanzarNavegador({ base: BASE, salida: SALIDA, puerto: 9347 })
const t = await navegador.abrirPestana()
await t.dispositivo(1440, 900, false)

const texto = (sel) => t.ev(`document.querySelector(${JSON.stringify(sel)})?.textContent.replace(/\\s+/g,' ').trim() ?? ''`)
const ruta = () => t.ev('location.pathname + location.hash')
const propias = () => t.respuestas.filter((r) => r.url.startsWith(origin))
const roto = () => propias().filter((r) => r.estado >= 400)
const imagenesRotas = () => t.ev(`(async () => {
  window.scrollTo(0, document.body.scrollHeight); await new Promise(r => setTimeout(r, 900))
  window.scrollTo(0, document.body.scrollHeight / 2); await new Promise(r => setTimeout(r, 600))
  return JSON.stringify([...document.images].filter(i => !(i.complete && i.naturalWidth > 0)).map(i => i.currentSrc || i.src))
})()`)

// ---------- 1. Home ----------
console.log('1. Home bajo la subcarpeta')
t.respuestas.length = 0
await t.ir('/')
ok((await ruta()) === `${SUB}/`, 'la home está en la subcarpeta', await ruta())
ok((await texto('h1')).includes('Todo para tu obra'), 'se ve el título del hero', await texto('h1'))
const rotas = JSON.parse(await imagenesRotas())
ok(rotas.length === 0, 'todas las imágenes de la home cargan (hero y cards)', rotas.join(', '))
ok(roto().length === 0, 'ningún recurso propio de la home da error', JSON.stringify(roto().slice(0, 3)))
const enlaces = JSON.parse(await t.ev(`JSON.stringify([...document.querySelectorAll('a[href], link[href], script[src], img[src], source[srcset]')].map(e => e.getAttribute('href') ?? e.getAttribute('src') ?? e.getAttribute('srcset')).filter(u => u && u.startsWith('/') && !u.startsWith('//') && !u.startsWith(${JSON.stringify(SUB + '/')}) && u !== ${JSON.stringify(SUB)}))`))
ok(enlaces.length === 0, 'ningún enlace ni recurso sale de la subcarpeta', enlaces.slice(0, 5).join(', '))
ok((await t.ev(`document.querySelectorAll('.carrusel').length`)) === 3, 'los 3 carruseles están')
ok(!t.respuestas.some((r) => r.url.includes('/api/')), 'no se hace ninguna llamada a /api/')
await t.captura('pages-home-desktop.png', 1440)

// ---------- 2. Navegación sin recargar ----------
console.log('2. Navegación')
await t.ev('window.__marca = 1')
await t.ev(`document.querySelector('.card__enlace').click()`)
await t.esperar(`location.pathname.startsWith(${JSON.stringify(SUB + '/producto/')}) && !!document.querySelector('.ficha__titulo')`, 8000)
ok((await ruta()).startsWith(`${SUB}/producto/`), 'tocar una card abre la ficha dentro de la subcarpeta', await ruta())
ok((await t.ev('window.__marca')) === 1, 'la navegación fue sin recargar la página')
const rotasFicha = JSON.parse(await imagenesRotas())
ok(rotasFicha.length === 0, 'la imagen de la ficha carga', rotasFicha.join(', '))
await t.ev(`[...document.querySelectorAll('.menu__enlace')].find(a => a.textContent.includes('Lo nuevo')).click()`)
await t.esperar(`location.hash === '#nuevo'`, 5000)
await dormir(900)
ok((await ruta()) === `${SUB}/#nuevo`, 'el menú de la ficha lleva a /#nuevo de la home', await ruta())
ok(await t.ev(`window.scrollY > 300 && document.getElementById('nuevo').getBoundingClientRect().top < 400`), 'y baja hasta esa sección')
ok(await t.ev(`!!document.querySelector('.ficha__titulo') === false`), 'ya no se ve la ficha')

// ---------- 3. Enlace directo y 404 ----------
console.log('3. Enlace directo y 404')
await t.ir('/producto/martillo-carpintero-500g')
ok((await texto('h1')) === 'Martillo de carpintero 500 g', 'un enlace directo a una ficha carga', await texto('h1'))
const estado404 = await t.ev(`fetch(${JSON.stringify(BASE + '/producto/no-existe')}).then(r => r.status)`)
ok(estado404 === 404, 'un slug inexistente responde 404 (no 200)', String(estado404))
await t.enviar('Page.navigate', { url: `${BASE}/producto/no-existe` })
await t.esperar(`document.querySelector('h1')?.textContent.includes('No encontramos esa página')`, 8000)
ok((await texto('h1')).includes('No encontramos esa página'), 'se muestra la página de error de la tienda', await texto('h1'))
ok(/noindex/.test(await t.ev(`document.querySelector('meta[name="robots"]')?.content ?? ''`)), 'la página de error tiene noindex')
ok(await t.ev(`!!document.querySelector('.error__enlace')`), 'ofrece volver al inicio')
await t.ev(`document.querySelector('.error__enlace').click()`)
await t.esperar(`location.pathname === ${JSON.stringify(SUB + '/')}`, 5000)
ok((await ruta()) === `${SUB}/`, 'el botón "Volver al inicio" va a la home de la subcarpeta', await ruta())

// ---------- 4. Carrito sin pago ----------
console.log('4. Carrito sin pago')
await t.ev('localStorage.clear()')
await t.ir('/producto/taladro-percutor-13mm')
await t.clic('Agregar al carrito')
await t.esperar(`!!document.querySelector('.carrito__cantidad')`, 4000)
ok((await texto('.carrito__cantidad')) === '1', 'se puede agregar al carrito')
ok((await texto('.ficha__aviso')).includes('Versión de demostración'), 'la ficha avisa que es una demostración', await texto('.ficha__aviso'))
await t.ev(`document.querySelector('a[aria-label^="Carrito"]').click()`)
await t.esperar(`location.pathname === ${JSON.stringify(SUB + '/carrito')} && document.querySelectorAll('.linea').length === 1`, 6000)
ok((await t.ev(`document.querySelectorAll('.linea').length`)) === 1, 'el carrito muestra el producto')
const imgCarrito = JSON.parse(await imagenesRotas())
ok(imgCarrito.length === 0, 'la imagen del carrito carga', imgCarrito.join(', '))
ok((await texto('.modo-prueba')).includes('Versión de demostración: el pago online no está disponible'), 'el carrito avisa que el pago no está disponible', await texto('.modo-prueba'))
ok(await t.ev(`(() => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Pago no disponible')); return !!b && b.disabled })()`), '"Pago no disponible" está deshabilitado')
ok(!(await t.ev(`document.body.innerText.includes('Pagás de forma segura')`)), 'no promete un pago seguro con Mercado Pago')
ok(!t.respuestas.some((r) => r.url.includes('/api/')), 'sigue sin llamar a /api/')
await t.captura('pages-carrito-desktop.png', 1440)

// persistencia
await t.ir('/carrito')
await t.esperar(`!document.body.innerText.includes('Cargando tu carrito')`)
ok((await t.ev(`document.querySelectorAll('.linea').length`)) === 1, 'el carrito sigue tras recargar (se guarda en el navegador)')

// ---------- 5. Resultado y vistos ----------
console.log('5. Resultado y vistos')
await t.ir('/compra/resultado')
await t.esperar(`document.querySelector('h1')?.textContent.includes('No encontramos una compra')`, 5000)
ok((await texto('h1')).includes('No encontramos una compra'), '/compra/resultado dice que no hay compra para verificar', await texto('h1'))
await t.ir('/producto/tarugos-nylon-8mm-x100')
await t.ir('/producto/rodillo-lana-22cm')
await t.ir('/')
await t.esperar(`!!document.getElementById('vistos')`, 5000)
ok((await t.ev(`[...document.querySelectorAll('#vistos .card__nombre')].length`)) >= 2, 'los vistos recientemente aparecen')

// ---------- 6. SEO y archivos ----------
console.log('6. SEO y archivos')
const sitio = await t.ev(`Promise.all(['/sitemap.xml','/robots.txt','/llms.txt'].map(p => fetch(${JSON.stringify(BASE)} + p).then(async r => ({ p, s: r.status, c: await r.text() }))))`)
for (const f of sitio) ok(f.s === 200 && f.c.includes(`${origin}${SUB}`) || f.s === 200 && f.p === '/robots.txt', `${f.p} responde 200 con la URL de la subcarpeta`, `${f.s}`)
await t.ir('/producto/taladro-percutor-13mm')
const canonical = await t.ev(`document.querySelector('link[rel="canonical"]')?.href ?? ''`)
ok(canonical.endsWith(`${SUB}/producto/taladro-percutor-13mm`), 'el canonical incluye la subcarpeta', canonical)

// ---------- 7. Mobile ----------
console.log('7. Mobile 390 px')
await t.dispositivo(390, 844, true)
for (const r of ['/', '/producto/taladro-percutor-13mm', '/carrito']) {
  await t.ir(r)
  const m = JSON.parse(await t.ev(`JSON.stringify({ ancho: innerWidth, contenido: document.documentElement.scrollWidth })`))
  ok(m.contenido <= m.ancho, `mobile: ${r} sin desborde horizontal`, JSON.stringify(m))
}
await t.ir('/')
await t.captura('pages-home-mobile.png', 390)

// ---------- Consola y recursos ----------
ok(roto().filter((r) => !r.url.includes('/producto/no-existe')).length === 0, 'ningún recurso propio dio error en toda la prueba (salvo el 404 buscado)', JSON.stringify(roto().filter((r) => !r.url.includes('/producto/no-existe')).slice(0, 3)))
const errores = t.consola.filter((c) => !/Failed to load resource.*404/.test(c))
ok(errores.length === 0, 'sin errores ni avisos de hidratación en la consola', errores.join(' | ').slice(0, 300))

const fallidos = resultados.filter((r) => !r.ok)
console.log(`\n${resultados.length - fallidos.length}/${resultados.length} comprobaciones correctas`)
for (const f of fallidos) console.log(`  ✗ ${f.m} ${f.d}`)
navegador.cerrar()
process.exit(fallidos.length ? 1 : 0)
