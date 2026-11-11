// Verifica el SEO de todas las fichas del catálogo contra un servidor en marcha.
// Uso: npm run verificar:seo [-- http://localhost:3000]
// Sale con código 1 si algo incumple. Solo mira el HTML que entrega el servidor (sin ejecutar JavaScript),
// que es lo que ve un rastreador. No mide indexación ni citas en asistentes de IA.
import { readFile } from 'node:fs/promises'
import { formatPrecio } from '../shared/utils/formatPrecio.ts'
import { RASTREADORES_IA } from '../shared/utils/seo.ts'

const base = (process.argv[2] ?? 'http://localhost:3000').replace(/\/+$/, '')
const catalogo = JSON.parse(await readFile(new URL('../data/catalogo.json', import.meta.url), 'utf8'))
const activos = catalogo.productos.filter((p) => p.activo)
const inactivos = catalogo.productos.filter((p) => !p.activo)

const errores = []
const avisos = []
const fallo = (donde, msg) => errores.push(`${donde}: ${msg}`)

async function pedir(ruta) {
  const r = await fetch(base + ruta, { headers: { Accept: 'text/html,application/xml,text/plain' }, redirect: 'manual' })
  return { status: r.status, texto: await r.text(), tipo: r.headers.get('content-type') ?? '' }
}

// El HTML escribe comillas y barras como entidades; un navegador las decodifica, así que comparamos decodificado.
const decodificar = (t) =>
  (t ?? '')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

const sinEtiquetas = (html) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;| /g, ' ').replace(/\s+/g, ' ')
const meta = (html, atributo, valor) => {
  const m = html.match(new RegExp(`<meta[^>]*${atributo}="${valor}"[^>]*content="([^"]*)"`)) ?? html.match(new RegExp(`<meta[^>]*content="([^"]*)"[^>]*${atributo}="${valor}"`))
  return m ? decodificar(m[1]) : undefined
}
const canonical = (html) => html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/)?.[1] ?? html.match(/<link[^>]*href="([^"]*)"[^>]*rel="canonical"/)?.[1]
const bloquesJsonLd = (html) => [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1])
const esAbsoluta = (u) => /^https?:\/\/[^/]+\//.test(u ?? '')

const canonicos = []
const titulos = new Map()
const descripciones = new Map()

// ---------- fichas ----------
for (const p of activos) {
  const ruta = `/producto/${p.slug}`
  const donde = ruta
  const { status, texto: html } = await pedir(ruta)
  if (status !== 200) { fallo(donde, `responde ${status}, se esperaba 200`); continue }

  const h1 = (html.match(/<h1[\s>]/g) ?? []).length
  if (h1 !== 1) fallo(donde, `tiene ${h1} <h1>, debe tener 1`)

  const titulo = decodificar(html.match(/<title>([^<]*)<\/title>/)?.[1]) || undefined
  if (!titulo) fallo(donde, 'sin <title>')
  else {
    if (!titulo.includes(p.nombre)) fallo(donde, `el <title> no incluye el nombre del producto: "${titulo}"`)
    if (titulos.has(titulo)) fallo(donde, `<title> repetido con ${titulos.get(titulo)}`)
    titulos.set(titulo, ruta)
  }

  const desc = meta(html, 'name', 'description')
  if (!desc) fallo(donde, 'sin meta description')
  else {
    if (desc.length > 160) fallo(donde, `description de ${desc.length} caracteres (máx. 160)`)
    if (descripciones.has(desc)) fallo(donde, `description repetida con ${descripciones.get(desc)}`)
    descripciones.set(desc, ruta)
  }

  const canon = canonical(html)
  canonicos.push(canon ?? '')
  if (!esAbsoluta(canon)) fallo(donde, `canonical ausente o no absoluto: ${canon}`)
  else if (!canon.endsWith(ruta)) fallo(donde, `canonical no apunta a la propia ficha: ${canon}`)

  for (const etiqueta of ['og:title', 'og:description', 'og:url', 'og:image']) {
    if (!meta(html, 'property', etiqueta)) fallo(donde, `falta ${etiqueta}`)
  }
  if (!esAbsoluta(meta(html, 'property', 'og:image'))) fallo(donde, 'og:image no es una URL absoluta')
  if (meta(html, 'name', 'twitter:card') !== 'summary_large_image') fallo(donde, 'falta twitter:card summary_large_image')

  // JSON-LD
  const bloques = bloquesJsonLd(html)
  const datos = []
  for (const b of bloques) {
    try { datos.push(JSON.parse(b)) } catch { fallo(donde, 'un bloque JSON-LD no es JSON válido') }
  }
  const prod = datos.find((d) => d['@type'] === 'Product')
  const migas = datos.find((d) => d['@type'] === 'BreadcrumbList')
  if (!prod) fallo(donde, 'falta JSON-LD Product')
  else {
    if (prod.name !== p.nombre) fallo(donde, `JSON-LD name "${prod.name}" ≠ "${p.nombre}"`)
    if (prod.sku !== p.sku) fallo(donde, 'JSON-LD sku no coincide')
    if (prod.brand?.name !== p.marca) fallo(donde, 'JSON-LD brand no coincide')
    if (prod.offers?.price !== p.precio) fallo(donde, `JSON-LD price ${prod.offers?.price} ≠ ${p.precio}`)
    if (prod.offers?.priceCurrency !== 'ARS') fallo(donde, 'JSON-LD priceCurrency debe ser ARS')
    const esperada = p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    if (prod.offers?.availability !== esperada) fallo(donde, `JSON-LD availability ${prod.offers?.availability} ≠ ${esperada}`)
    if (!(prod.image ?? []).every(esAbsoluta) || !prod.image?.length) fallo(donde, 'JSON-LD image debe ser una lista de URLs absolutas')
    for (const prohibido of ['aggregateRating', 'review']) if (prohibido in prod) fallo(donde, `JSON-LD no debe inventar ${prohibido}`)
  }
  if (!migas) fallo(donde, 'falta JSON-LD BreadcrumbList')
  else if ((migas.itemListElement ?? []).length < 2) fallo(donde, 'BreadcrumbList con menos de 2 ítems')

  // El JSON-LD solo puede decir lo que la página muestra
  const visible = decodificar(sinEtiquetas(html))
  const precioVisible = formatPrecio(p.precio).replace(/ /g, ' ')
  if (!visible.includes(precioVisible)) fallo(donde, `el precio ${precioVisible} del JSON-LD no se ve en la página`)
  const textoStock = p.stock > 0 ? 'Disponible' : 'Sin stock'
  if (!visible.includes(textoStock)) fallo(donde, `la disponibilidad "${textoStock}" del JSON-LD no se ve en la página`)
  if (!visible.includes(p.sku)) fallo(donde, 'el SKU del JSON-LD no se ve en la página')
  if (!visible.includes(p.marca)) fallo(donde, 'la marca del JSON-LD no se ve en la página')
}

// productos inactivos y slugs inexistentes: 404 real
for (const p of inactivos) {
  const { status } = await pedir(`/producto/${p.slug}`)
  if (status !== 404) fallo(`/producto/${p.slug}`, `producto inactivo responde ${status}, se esperaba 404`)
}
{
  const { status } = await pedir('/producto/este-producto-no-existe')
  if (status !== 404) fallo('/producto/este-producto-no-existe', `responde ${status}, se esperaba 404`)
}

// ---------- home ----------
{
  const { status, texto: html } = await pedir('/')
  if (status !== 200) fallo('/', `responde ${status}`)
  else {
    if (!esAbsoluta(canonical(html))) fallo('/', 'canonical ausente o no absoluto')
    if (!bloquesJsonLd(html).some((b) => { try { return JSON.parse(b)['@type'] === 'WebSite' } catch { return false } })) fallo('/', 'falta JSON-LD WebSite')
    if (!meta(html, 'property', 'og:image')) fallo('/', 'falta og:image')
  }
}

// ---------- carrito: personal, no se indexa ----------
{
  const { status, texto: html } = await pedir('/carrito')
  if (status !== 200) fallo('/carrito', `responde ${status}`)
  else {
    if (!/noindex/.test(meta(html, 'name', 'robots') ?? '')) fallo('/carrito', 'falta <meta name="robots"> con noindex')
    if (/Tu carrito está vacío/.test(html)) fallo('/carrito', 'el servidor no debería decidir que el carrito está vacío (solo el navegador conoce lo guardado)')
  }
}

// ---------- resultado del pago: personal, no se indexa ----------
{
  const { status, texto: html } = await pedir('/compra/resultado')
  if (status !== 200) fallo('/compra/resultado', `responde ${status}`)
  else {
    if (!/noindex/.test(meta(html, 'name', 'robots') ?? '')) fallo('/compra/resultado', 'falta <meta name="robots"> con noindex')
    if (/Pago aprobado/.test(html)) fallo('/compra/resultado', 'el servidor no debería afirmar que un pago está aprobado: lo decide Mercado Pago, en el navegador')
  }
}

// ---------- sitemap ----------
{
  const { status, texto, tipo } = await pedir('/sitemap.xml')
  if (status !== 200) fallo('/sitemap.xml', `responde ${status}`)
  else {
    if (!/xml/.test(tipo)) fallo('/sitemap.xml', `content-type inesperado: ${tipo}`)
    const locs = [...texto.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1])
    if (!locs.every(esAbsoluta)) fallo('/sitemap.xml', 'hay <loc> que no son URLs absolutas')
    for (const p of activos) if (!locs.some((l) => l.endsWith(`/producto/${p.slug}`))) fallo('/sitemap.xml', `falta ${p.slug}`)
    for (const p of inactivos) if (locs.some((l) => l.endsWith(`/producto/${p.slug}`))) fallo('/sitemap.xml', `incluye el producto inactivo ${p.slug}`)
    if (locs.some((l) => l.endsWith('/carrito') || l.includes('/compra/'))) fallo('/sitemap.xml', 'incluye /carrito o /compra, que no deben indexarse')
    if (locs.length !== activos.length + 1) fallo('/sitemap.xml', `tiene ${locs.length} URLs, se esperaban ${activos.length + 1} (home + productos activos)`)
  }
}

// ---------- robots ----------
{
  const { status, texto } = await pedir('/robots.txt')
  if (status !== 200) fallo('/robots.txt', `responde ${status}`)
  else {
    if (!/^User-agent: \*$/m.test(texto)) fallo('/robots.txt', 'falta "User-agent: *"')
    if (/^Disallow: \/\s*$/m.test(texto)) fallo('/robots.txt', 'bloquea todo el sitio')
    const sm = texto.match(/^Sitemap: (\S+)$/m)?.[1]
    if (!esAbsoluta(sm)) fallo('/robots.txt', 'falta la línea Sitemap con URL absoluta')
    for (const bot of RASTREADORES_IA) {
      if (!new RegExp(`^User-agent: ${bot}\\nAllow: /\\s*$`, 'm').test(texto)) fallo('/robots.txt', `el rastreador de IA ${bot} no está permitido de forma explícita`)
    }
  }
}

// ---------- llms.txt ----------
{
  const { status, texto, tipo } = await pedir('/llms.txt')
  if (status !== 200) fallo('/llms.txt', `responde ${status}`)
  else {
    if (!/text\/plain/.test(tipo)) fallo('/llms.txt', `content-type inesperado: ${tipo}`)
    const lineas = texto.split('\n')
    if (!/^# \S/.test(lineas[0])) fallo('/llms.txt', 'la primera línea debe ser un título "# <tienda>"')
    if (!lineas.some((l) => l.startsWith('> '))) fallo('/llms.txt', 'falta el resumen con "> "')
    if (!lineas.some((l) => l.startsWith('## '))) fallo('/llms.txt', 'faltan secciones "## "')
    const enlaces = [...texto.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1])
    for (const p of activos) if (!enlaces.some((e) => e.endsWith(`/producto/${p.slug}`))) fallo('/llms.txt', `falta el producto ${p.slug}`)
    for (const p of inactivos) if (enlaces.some((e) => e.endsWith(`/producto/${p.slug}`))) fallo('/llms.txt', `incluye el producto inactivo ${p.slug}`)
    if (enlaces.length !== activos.length + 1) fallo('/llms.txt', `tiene ${enlaces.length} enlaces, se esperaban ${activos.length + 1}`)
    if (enlaces.some((e) => e.endsWith('/carrito') || e.includes('/compra/'))) fallo('/llms.txt', 'incluye /carrito o /compra, que no deben indexarse')
    if (/\]\(\/[^)]*\)/.test(texto)) fallo('/llms.txt', 'hay enlaces relativos')
  }
}

if (canonicos.some((c) => /localhost|127\.0\.0\.1/.test(c))) {
  avisos.push('Los canonical apuntan a localhost (URL provisoria). Definí NUXT_PUBLIC_SITE_URL antes de `npm run build` para publicar.')
}

for (const a of avisos) console.warn(`AVISO  ${a}`)
for (const e of errores) console.error(`ERROR  ${e}`)
if (errores.length) {
  console.error(`\nSEO con problemas: ${errores.length} error(es) en ${activos.length} ficha(s) revisada(s).`)
  process.exit(1)
}
console.log(`SEO correcto: ${activos.length} fichas, home, sitemap, robots (con ${RASTREADORES_IA.length} rastreadores de IA) y llms.txt revisados en ${base}.`)
