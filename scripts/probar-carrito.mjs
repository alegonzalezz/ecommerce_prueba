// Prueba el carrito y los vistos recientemente en un Chrome real (Chrome DevTools Protocol).
// Uso: npm run probar:carrito -- http://localhost:3100 [carpeta-para-capturas]
// Conviene correrlo contra el build de producción (`npm run build` + `node .output/server/index.mjs`):
// en desarrollo, las herramientas de Vue lanzan errores propios cuando se bloquea el almacenamiento.
// Variable opcional CHROME_PATH si Chrome no está en la ruta de macOS.
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { dormir, lanzarNavegador } from './lib/cdp.mjs'

const BASE = (process.argv[2] ?? 'http://localhost:3100').replace(/\/+$/, '')
const SALIDA = process.argv[3] ?? mkdtempSync(join(tmpdir(), 'capturas-'))
const navegador = await lanzarNavegador({ base: BASE, salida: SALIDA })

const resultados = []
const ok = (condicion, mensaje, detalle = '') => { resultados.push({ ok: !!condicion, mensaje, detalle }); if (!condicion) console.log(`  ✗ ${mensaje} ${detalle}`) }
const guardado = (t, clave) => t.ev(`localStorage.getItem(${JSON.stringify(clave)})`)
const envoltorio = async (t, clave) => { const c = await guardado(t, clave); return c ? JSON.parse(c) : null }
const poner = (t, clave, valor) => t.ev(`localStorage.setItem(${JSON.stringify(clave)}, ${JSON.stringify(typeof valor === 'string' ? valor : JSON.stringify(valor))})`)
const badge = (t) => t.ev(`document.querySelector('.carrito__cantidad')?.textContent.trim() ?? ''`)
const texto = (t, sel) => t.ev(`document.querySelector(${JSON.stringify(sel)})?.textContent.replace(/\\s+/g,' ').trim() ?? ''`)
const lineas = (t) => t.ev(`document.querySelectorAll('.linea').length`)
const futuro = (ms) => Date.now() + ms
const DOS_HORAS = 2 * 60 * 60 * 1000

const t = await navegador.abrirPestana()
await t.dispositivo(1440, 900, false)

// ---------- 1. Agregar desde la ficha ----------
console.log('1. Agregar desde la ficha')
await t.ir('/')
await t.ev('localStorage.clear()')
await t.ir('/producto/taladro-percutor-13mm')
ok(await t.clic('Agregar al carrito'), 'se puede hacer clic en "Agregar al carrito"')
await t.esperar(`document.querySelector('.carrito__cantidad')`)
ok((await badge(t)) === '1', 'el ícono del header muestra 1', await badge(t))
ok((await t.ev(`document.querySelector('a[href="/carrito"]')?.getAttribute('aria-label')`)) === 'Carrito, 1 unidad', 'el enlace del header tiene nombre accesible con la cantidad')
ok((await texto(t, '.ficha__estado')) === 'Agregado al carrito.', 'mensaje accesible "Agregado al carrito."', await texto(t, '.ficha__estado'))
ok((await t.ev(`document.querySelector('.ficha__estado')?.getAttribute('role')`)) === 'status', 'el mensaje está en una región role=status')
let g = await envoltorio(t, 'ecommerce:carrito')
ok(g?.version === 1 && JSON.stringify(g.datos) === JSON.stringify([{ id: 'tal-001', cantidad: 1 }]), 'queda guardado solo id y cantidad', JSON.stringify(g?.datos))
ok(g && g.expiraEn - Date.now() > DOS_HORAS - 60000 && g.expiraEn - Date.now() <= DOS_HORAS, 'vence en ~2 horas', String(Math.round((g?.expiraEn - Date.now()) / 60000)) + ' min')
ok(!JSON.stringify(g).includes('89900') && !JSON.stringify(g).includes('Taladro'), 'no se guardan precios ni nombres')
await t.clic('Agregar al carrito')
await dormir(200)
ok((await badge(t)) === '2', 'segundo clic: el ícono muestra 2', await badge(t))
ok((await texto(t, '.ficha__en-carrito')).includes('Tenés 2 unidades'), 'la ficha dice cuántas unidades hay')

// ---------- 2. Página del carrito ----------
console.log('2. Página /carrito')
await t.ir('/carrito')
await t.esperar(`!document.body.innerText.includes('Cargando tu carrito')`)
ok((await lineas(t)) === 1, 'hay una línea')
ok((await texto(t, '.linea__nombre')) === 'Taladro percutor 13 mm 750 W', 'muestra el nombre desde el catálogo')
ok((await texto(t, '.cantidad__valor')) === '2', 'cantidad 2')
ok((await texto(t, '.linea__subtotal')).includes('179.800'), 'subtotal de la línea $ 179.800', await texto(t, '.linea__subtotal'))
ok((await texto(t, '.resumen__total dd')).includes('179.800'), 'subtotal del resumen $ 179.800')
ok(await t.ev(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Finalizar compra'))?.disabled === false`), '"Finalizar compra" está habilitado (hay productos)')
ok((await texto(t, '.resumen__aviso')) === 'Pagás de forma segura en Mercado Pago.', 'aviso "Pagás de forma segura en Mercado Pago."')
ok((await texto(t, '.modo-prueba')) === 'Modo de prueba: no se cobra dinero real.', 'aviso de modo de prueba')
ok((await texto(t, '.resumen__guardado')).includes('2 horas'), 'avisa que se guarda 2 horas')
ok(/noindex/.test(await t.ev(`document.querySelector('meta[name="robots"]')?.content ?? ''`)), '/carrito tiene noindex')
await t.clic('+'); await dormir(200)
ok((await texto(t, '.cantidad__valor')) === '3', 'el botón + sube a 3')
ok((await texto(t, '.linea__subtotal')).includes('269.700'), 'subtotal 269.700')
await t.clic('−'); await t.clic('−'); await dormir(200)
ok((await texto(t, '.cantidad__valor')) === '1', 'el botón − baja a 1')
await t.clic('−'); await dormir(250)
ok((await lineas(t)) === 0 && (await texto(t, '.carrito__vacio-titulo')) === 'Tu carrito está vacío', 'bajar a 0 quita la línea y muestra el carrito vacío')
ok((await badge(t)) === '', 'el ícono ya no muestra número')

// ---------- 3. Máximo por stock ----------
console.log('3. Máximo por stock')
await t.ir('/producto/amoladora-angular-115mm') // stock 9
for (let i = 0; i < 12; i++) await t.clic('Agregar al carrito')
await dormir(250)
g = await envoltorio(t, 'ecommerce:carrito')
ok(g?.datos?.[0]?.cantidad === 9, 'no pasa del stock (9) aunque se haga clic 12 veces', String(g?.datos?.[0]?.cantidad))
ok(await t.ev(`[...document.querySelectorAll('button')].some(b => b.textContent.includes('Máximo en tu carrito') && b.disabled)`), 'el botón se deshabilita con "Máximo en tu carrito"')
await t.ir('/producto/taladro-percutor-13mm') // stock 14, tope 10
for (let i = 0; i < 14; i++) await t.clic('Agregar al carrito')
await dormir(250)
g = await envoltorio(t, 'ecommerce:carrito')
ok(g?.datos?.find((l) => l.id === 'tal-001')?.cantidad === 10, 'no pasa del tope de 10', JSON.stringify(g?.datos))

// ---------- 4. Persistencia ----------
console.log('4. Persistencia tras recargar')
await t.ir('/carrito')
await t.esperar(`!document.body.innerText.includes('Cargando tu carrito')`)
ok((await lineas(t)) === 2, 'tras recargar siguen las 2 líneas', String(await lineas(t)))
ok((await t.ev(`document.querySelector('a[href="/carrito"]')?.getAttribute('aria-label')`)) === 'Carrito, 19 unidades', 'el header refleja 19 unidades', await t.ev(`document.querySelector('a[href="/carrito"]')?.getAttribute('aria-label')`))

// ---------- 5. Renovación ----------
console.log('5. Renovación del vencimiento')
await poner(t, 'ecommerce:carrito', { version: 1, expiraEn: futuro(60_000), datos: [{ id: 'tal-001', cantidad: 3 }] })
await t.ir('/carrito')
await t.esperar(`!document.body.innerText.includes('Cargando tu carrito')`)
let antes = (await envoltorio(t, 'ecommerce:carrito')).expiraEn
await t.clic('+'); await dormir(250)
let despues = (await envoltorio(t, 'ecommerce:carrito')).expiraEn
ok(despues - Date.now() > DOS_HORAS - 60000, 'un cambio renueva el vencimiento a ~2 horas', String(Math.round((despues - Date.now()) / 60000)) + ' min')
ok(despues > antes + DOS_HORAS - 120000, 'el nuevo vencimiento es muy posterior al anterior')
await poner(t, 'ecommerce:carrito', { version: 1, expiraEn: futuro(60_000), datos: [{ id: 'tal-001', cantidad: 3 }] })
await t.ir('/carrito')
await t.esperar(`!document.body.innerText.includes('Cargando tu carrito')`)
const venc = (await envoltorio(t, 'ecommerce:carrito')).expiraEn
ok(venc <= futuro(61_000), 'solo mirar el carrito NO renueva el vencimiento')

// ---------- 6. Vencimiento ----------
console.log('6. Vencimiento')
await poner(t, 'ecommerce:carrito', { version: 1, expiraEn: Date.now() - 1000, datos: [{ id: 'tal-001', cantidad: 3 }] })
await t.ir('/carrito')
await t.esperar(`!document.body.innerText.includes('Cargando tu carrito')`)
ok((await texto(t, '.carrito__vacio-titulo')) === 'Tu carrito está vacío', 'vencido: el carrito está vacío')
ok((await guardado(t, 'ecommerce:carrito')) === null, 'vencido: se elimina la clave')

// ---------- 7. Datos corruptos ----------
console.log('7. Datos corruptos')
t.consola.length = 0
for (const [nombre, valor] of [['JSON inválido', '{esto no es json'], ['forma incorrecta', '{"version":1,"expiraEn":9999999999999,"datos":"hola"}'], ['otra versión', JSON.stringify({ version: 99, expiraEn: futuro(DOS_HORAS), datos: [] })], ['cantidades negativas', JSON.stringify({ version: 1, expiraEn: futuro(DOS_HORAS), datos: [{ id: 'tal-001', cantidad: -3 }] })]]) {
  await poner(t, 'ecommerce:carrito', valor)
  await t.ir('/carrito')
  await t.esperar(`!document.body.innerText.includes('Cargando tu carrito')`)
  ok((await texto(t, '.carrito__vacio-titulo')) === 'Tu carrito está vacío', `${nombre}: carrito vacío sin romper`)
  ok((await guardado(t, 'ecommerce:carrito')) === null, `${nombre}: se elimina lo corrupto`)
}
ok(t.consola.length === 0, 'sin errores en consola con datos corruptos', t.consola.join(' | '))

// ---------- 8. Reconciliación con el catálogo ----------
console.log('8. Reconciliación con el catálogo')
await poner(t, 'ecommerce:carrito', { version: 1, expiraEn: futuro(DOS_HORAS), datos: [{ id: 'ama-001', cantidad: 50 }, { id: 'zzz-999', cantidad: 1 }, { id: 'llv-001', cantidad: 2 }, { id: 'tal-001', cantidad: 2 }] })
await t.ir('/carrito')
await t.esperar(`!document.body.innerText.includes('Cargando tu carrito')`)
const avisos = await texto(t, '.carrito__avisos')
ok((await lineas(t)) === 2, 'quedan solo las 2 líneas válidas', String(await lineas(t)))
ok(avisos.includes('Ajustamos Amoladora') && avisos.includes('9 unidades'), 'avisa que ajustó la cantidad al stock', avisos)
ok(avisos.includes('sin stock'), 'avisa que quitó el producto sin stock')
ok(avisos.includes('ya no está disponible'), 'avisa que quitó el producto inexistente')
g = await envoltorio(t, 'ecommerce:carrito')
ok(JSON.stringify(g.datos) === JSON.stringify([{ id: 'ama-001', cantidad: 9 }, { id: 'tal-001', cantidad: 2 }]), 'lo guardado queda corregido', JSON.stringify(g.datos))
ok(await t.ev(`document.querySelector('.carrito__avisos')?.getAttribute('role') === 'status'`), 'los avisos están en una región role=status')

// ---------- 9. Sin stock ----------
console.log('9. Producto sin stock')
await t.ir('/producto/juego-llaves-combinadas-8-22')
ok(await t.ev(`[...document.querySelectorAll('button')].some(b => b.textContent.trim() === 'Sin stock' && b.disabled)`), 'la ficha sin stock tiene el botón deshabilitado')

// ---------- 10. Vistos recientemente ----------
console.log('10. Vistos recientemente')
await t.ir('/'); await t.ev('localStorage.removeItem("ecommerce:vistos")'); await t.ir('/')
ok((await t.ev(`!!document.getElementById('vistos')`)) === false, 'sin vistos: la sección no aparece')
for (const slug of ['taladro-percutor-13mm', 'martillo-carpintero-500g', 'amoladora-angular-115mm']) { await t.ir(`/producto/${slug}`); await dormir(200) }
await t.ir('/')
await t.esperar(`!!document.getElementById('vistos')`, 5000)
const nombres = () => t.ev(`[...document.querySelectorAll('#vistos .card__nombre')].map(e => e.textContent.trim())`)
let v = await nombres()
ok(JSON.stringify(v) === JSON.stringify(['Amoladora angular 115 mm 850 W', 'Martillo de carpintero 500 g', 'Taladro percutor 13 mm 750 W']), 'aparece "Vistos recientemente", el más reciente primero', JSON.stringify(v))
ok((await texto(t, '#vistos h2')) === 'Vistos recientemente', 'el título es "Vistos recientemente"')
ok(await t.ev(`document.getElementById('vistos').compareDocumentPosition(document.getElementById('con-descuento')) & Node.DOCUMENT_POSITION_PRECEDING`) !== 0, 'la sección está debajo de los 3 carruseles')
await t.ir('/producto/taladro-percutor-13mm'); await dormir(200); await t.ir('/')
await t.esperar(`!!document.getElementById('vistos')`, 5000)
v = await nombres()
ok(v.length === 3 && v[0] === 'Taladro percutor 13 mm 750 W', 'uno repetido pasa al frente sin duplicarse', JSON.stringify(v))
const ids = [] ; for (const s of ['tarugos-nylon-8mm-x100', 'cinta-teflon-12mm-pack-10', 'rodillo-lana-22cm', 'guantes-cuero-vaqueta', 'canilla-bronce-media-cromada', 'latex-interior-lavable-20l', 'tornillos-autoperforantes-500']) { await t.ir(`/producto/${s}`); await dormir(120); ids.push(s) }
await t.ir('/'); await t.esperar(`!!document.getElementById('vistos')`, 5000)
ok((await nombres()).length === 8, 'nunca más de 8 vistos', String((await nombres()).length))
await poner(t, 'ecommerce:vistos', { version: 1, expiraEn: Date.now() - 1000, datos: ['tal-001'] })
await t.ir('/'); await dormir(300)
ok((await t.ev(`!!document.getElementById('vistos')`)) === false && (await guardado(t, 'ecommerce:vistos')) === null, 'vistos vencidos: no aparece la sección y se elimina la clave')
await poner(t, 'ecommerce:vistos', { version: 1, expiraEn: futuro(DOS_HORAS), datos: ['zzz-999', 'tal-001'] })
await t.ir('/'); await t.esperar(`!!document.getElementById('vistos')`, 5000)
ok(JSON.stringify(await nombres()) === JSON.stringify(['Taladro percutor 13 mm 750 W']), 'vistos con un id inexistente: lo ignora')
ok(!(await t.ev(`!!document.getElementById('vistos')`)) === false, 'con un solo producto la sección se muestra')

// ---------- 11. Sincronización entre pestañas ----------
console.log('11. Dos pestañas')
await t.ev('localStorage.removeItem("ecommerce:carrito")')
await t.ir('/carrito'); await t.esperar(`!document.body.innerText.includes('Cargando tu carrito')`)
const t2 = await navegador.abrirPestana(true)
await t2.dispositivo(1440, 900, false)
await t2.ir('/producto/martillo-carpintero-500g')
await t2.clic('Agregar al carrito'); await dormir(600)
await t.esperar(`document.querySelectorAll('.linea').length === 1`, 4000)
ok((await lineas(t)) === 1, 'lo que se agrega en una pestaña aparece en la otra sin recargar', String(await lineas(t)))
ok((await badge(t)) === '1', 'el ícono de la otra pestaña también se actualiza')
await t2.ev('window.close()').catch(() => {})

// ---------- 12. Sin almacenamiento disponible ----------
console.log('12. Almacenamiento bloqueado')
const s = await t.enviar('Page.addScriptToEvaluateOnNewDocument', { source: `Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('bloqueado', 'SecurityError') } })` })
t.consola.length = 0
await t.ir('/producto/taladro-percutor-13mm')
ok(await t.clic('Agregar al carrito'), 'se puede agregar con el almacenamiento bloqueado')
await dormir(250)
ok((await badge(t)) === '1', 'funciona en memoria: el ícono muestra 1', await badge(t))
await t.ev(`document.querySelector('a[href="/carrito"]').click()`)
await t.esperar(`location.pathname === '/carrito' && document.querySelectorAll('.linea').length === 1`, 4000)
ok((await lineas(t)) === 1, 'al ir al carrito sin recargar, el producto sigue ahí (en memoria)')
ok(t.consola.length === 0, 'sin errores en consola con el almacenamiento bloqueado', t.consola.join(' | '))
await t.enviar('Page.removeScriptToEvaluateOnNewDocument', { identifier: s.result.identifier })

// ---------- 13. Mobile y capturas ----------
console.log('13. Mobile 390 px')
await t.dispositivo(390, 844, true)
await t.ir('/')
await poner(t, 'ecommerce:carrito', { version: 1, expiraEn: futuro(DOS_HORAS), datos: [{ id: 'tal-001', cantidad: 2 }, { id: 'des-001', cantidad: 1 }, { id: 'llv-001', cantidad: 1 }] })
await t.ir('/carrito'); await t.esperar(`!document.body.innerText.includes('Cargando tu carrito')`)
const m = await t.ev(`(() => { const e = document.querySelector('a[href="/carrito"]').getBoundingClientRect(); return JSON.stringify({ ancho: innerWidth, contenido: document.documentElement.scrollWidth, der: Math.round(e.right), izq: Math.round(e.left), alto: Math.round(e.height) }) })()`)
const mm = JSON.parse(m)
ok(mm.contenido <= mm.ancho, 'mobile: sin desborde horizontal en /carrito', m)
ok(mm.der <= mm.ancho && mm.izq >= 0, 'mobile: el ícono del carrito está dentro de la pantalla', m)
await t.captura('carrito-mobile.png', 390)
await t.ir('/producto/taladro-percutor-13mm'); await t.captura('ficha-carrito-mobile.png', 390)
await t.dispositivo(1440, 900, false)
await t.ir('/carrito'); await t.esperar(`!document.body.innerText.includes('Cargando tu carrito')`)
await t.captura('carrito-desktop.png', 1440)
await t.ir('/producto/taladro-percutor-13mm'); await t.captura('ficha-carrito-desktop.png', 1440)
await t.ir('/')
await t.captura('home-vistos-desktop.png', 1440)

// ---------- Consola general ----------
const hidratacion = t.consola.filter((c) => /hydrat/i.test(c))
ok(hidratacion.length === 0, 'ningún aviso de hidratación', hidratacion.join(' | '))

const fallidos = resultados.filter((r) => !r.ok)
console.log(`\n${resultados.length - fallidos.length}/${resultados.length} comprobaciones correctas`)
for (const f of fallidos) console.log(`  ✗ ${f.mensaje} ${f.detalle}`)
navegador.cerrar()
process.exit(fallidos.length ? 1 : 0)
