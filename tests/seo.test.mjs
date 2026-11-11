import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  RASTREADORES_IA, descripcionMeta, disponibilidadSchema, generarLlms, generarRobots, generarSitemap, jsonLdMigas,
  jsonLdProducto, jsonLdSitio, normalizarUrlBase, serializarJsonLd, tituloProducto, urlAbsoluta, urlProducto,
} from '../shared/utils/seo.ts'
import { TIENDA } from '../shared/utils/tienda.ts'

const base = JSON.parse(await readFile(new URL('../data/catalogo.json', import.meta.url), 'utf8'))
const copia = () => structuredClone(base)
const prod = (c, id) => c.productos.find((p) => p.id === id)
const SITIO = 'https://ferreteria.example'

test('normalizarUrlBase: saca espacios y barras finales', () => {
  assert.equal(normalizarUrlBase(' https://a.com/ '), 'https://a.com')
  assert.equal(normalizarUrlBase('https://a.com///'), 'https://a.com')
})

test('urlAbsoluta: une base y ruta sin duplicar barras', () => {
  assert.equal(urlAbsoluta('https://a.com/', '/producto/x'), 'https://a.com/producto/x')
  assert.equal(urlAbsoluta('https://a.com', '/'), 'https://a.com/')
  assert.equal(urlAbsoluta('https://a.com', 'img/x.webp'), 'https://a.com/img/x.webp')
})

test('tituloProducto: nombre del producto y de la tienda', () => {
  assert.equal(tituloProducto(prod(base, 'tal-001'), 'Mi Tienda'), 'Taladro percutor 13 mm 750 W | Mi Tienda')
})

test('descripcionMeta: incluye marca y precio y no pasa de 160 caracteres', () => {
  for (const p of base.productos) {
    const d = descripcionMeta(p)
    assert.ok(d.length <= 160, `${p.id}: ${d.length}`)
    assert.ok(d.includes(p.marca), p.id)
    assert.ok(/\$ ?[\d.]+/.test(d), p.id)
  }
})

test('descripcionMeta: corta en una palabra entera cuando es larga', () => {
  const p = { ...prod(base, 'tal-001'), descripcionCorta: 'palabra '.repeat(40).trim() }
  const d = descripcionMeta(p)
  assert.ok(d.length <= 160)
  assert.ok(d.endsWith('…'))
  assert.ok(!/palabr…$/.test(d))
})

test('disponibilidadSchema: InStock con stock y OutOfStock sin stock', () => {
  assert.equal(disponibilidadSchema(prod(base, 'tal-001')), 'https://schema.org/InStock')
  assert.equal(disponibilidadSchema(prod(base, 'llv-001')), 'https://schema.org/OutOfStock')
})

test('jsonLdProducto: campos obligatorios y oferta en ARS', () => {
  const p = prod(base, 'ama-001')
  const j = jsonLdProducto(p, SITIO)
  assert.equal(j['@type'], 'Product')
  assert.equal(j.name, p.nombre)
  assert.equal(j.sku, p.sku)
  assert.equal(j.brand.name, p.marca)
  assert.equal(j.url, `${SITIO}/producto/${p.slug}`)
  assert.equal(j.offers.priceCurrency, 'ARS')
  assert.equal(j.offers.price, p.precio)
  assert.equal(j.offers.url, j.url)
  assert.ok(j.image.every((u) => u.startsWith(`${SITIO}/img/`) && u.endsWith('.webp')))
})

test('jsonLdProducto: el precio es el vigente, no el anterior', () => {
  const p = prod(base, 'ama-001')
  assert.ok(p.precioAnterior > p.precio)
  assert.equal(jsonLdProducto(p, SITIO).offers.price, p.precio)
})

test('jsonLdProducto: un producto agotado declara OutOfStock', () => {
  assert.equal(jsonLdProducto(prod(base, 'llv-001'), SITIO).offers.availability, 'https://schema.org/OutOfStock')
})

test('jsonLdProducto: no inventa reseñas, calificaciones ni vigencia de precio', () => {
  const j = jsonLdProducto(prod(base, 'tal-001'), SITIO)
  for (const clave of ['aggregateRating', 'review']) assert.ok(!(clave in j), clave)
  assert.ok(!('priceValidUntil' in j.offers))
})

test('jsonLdProducto: los atributos visibles pasan a additionalProperty', () => {
  const j = jsonLdProducto(prod(base, 'tal-001'), SITIO)
  assert.deepEqual(j.additionalProperty.map((a) => a.name), ['Potencia', 'Mandril', 'Cable'])
  assert.equal(j.additionalProperty[0].value, '750 W')
})

test('jsonLdMigas: Inicio y Producto, con posiciones y URLs absolutas', () => {
  const j = jsonLdMigas(prod(base, 'tal-001'), SITIO)
  assert.equal(j['@type'], 'BreadcrumbList')
  assert.deepEqual(j.itemListElement.map((i) => i.position), [1, 2])
  assert.equal(j.itemListElement[0].item, `${SITIO}/`)
  assert.equal(j.itemListElement[1].item, `${SITIO}/producto/taladro-percutor-13mm`)
})

test('jsonLdSitio: WebSite con idioma es-AR', () => {
  const j = jsonLdSitio(SITIO, 'Mi Tienda')
  assert.equal(j['@type'], 'WebSite')
  assert.equal(j.inLanguage, 'es-AR')
  assert.equal(j.url, `${SITIO}/`)
})

test('serializarJsonLd: escapa "<" para que no cierre el <script>', () => {
  const t = serializarJsonLd({ nombre: '</script><b>x' })
  assert.ok(!t.includes('<'))
  assert.equal(JSON.parse(t).nombre, '</script><b>x')
})

test('generarSitemap: home y todos los productos activos, con URL absoluta', () => {
  const x = generarSitemap(base, SITIO)
  assert.ok(x.startsWith('<?xml'))
  assert.ok(x.includes(`<loc>${SITIO}/</loc>`))
  for (const p of base.productos) assert.ok(x.includes(`<loc>${urlProducto(SITIO, p)}</loc>`), p.id)
  assert.equal((x.match(/<loc>/g) ?? []).length, base.productos.length + 1)
})

test('generarSitemap: no incluye productos inactivos', () => {
  const c = copia()
  prod(c, 'tal-001').activo = false
  const x = generarSitemap(c, SITIO)
  assert.ok(!x.includes('taladro-percutor-13mm'))
  assert.equal((x.match(/<loc>/g) ?? []).length, base.productos.length)
})

test('generarSitemap: no inventa <lastmod>', () => {
  assert.ok(!generarSitemap(base, SITIO).includes('lastmod'))
})

test('generarRobots: permite el rastreo y apunta al sitemap absoluto', () => {
  const r = generarRobots(`${SITIO}/`)
  assert.ok(r.includes('User-agent: *\nAllow: /'))
  assert.ok(r.includes(`Sitemap: ${SITIO}/sitemap.xml`))
  assert.ok(!r.includes('Disallow: /\n'))
})

test('generarRobots: cada rastreador de IA tiene su bloque con Allow: /', () => {
  const r = generarRobots(SITIO)
  for (const bot of RASTREADORES_IA) {
    assert.ok(r.includes(`User-agent: ${bot}\nAllow: /`), bot)
  }
})

test('generarRobots: incluye a los asistentes que importan y mantiene el bloque general', () => {
  const r = generarRobots(SITIO)
  for (const bot of ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) {
    assert.ok(r.includes(`User-agent: ${bot}`), bot)
  }
  assert.ok(r.startsWith('User-agent: *\nAllow: /'))
  assert.ok(r.trimEnd().endsWith(`Sitemap: ${SITIO}/sitemap.xml`))
})

test('generarRobots: no bloquea nada', () => {
  assert.ok(!/^Disallow:/m.test(generarRobots(SITIO)))
})

test('generarLlms: formato llmstxt.org (título, resumen y secciones)', () => {
  const t = generarLlms(base, SITIO, TIENDA)
  const lineas = t.split('\n')
  assert.equal(lineas[0], `# ${TIENDA.nombre}`)
  assert.ok(lineas.some((l) => l.startsWith('> ')))
  assert.ok(lineas.some((l) => l.startsWith('## ')))
})

test('generarLlms: un enlace absoluto por cada producto activo', () => {
  const t = generarLlms(base, SITIO, TIENDA)
  for (const p of base.productos) assert.ok(t.includes(`](${urlProducto(SITIO, p)})`), p.id)
  assert.equal((t.match(/\]\(https?:\/\//g) ?? []).length, base.productos.length + 1)
})

test('generarLlms: no incluye productos inactivos', () => {
  const c = copia()
  prod(c, 'tal-001').activo = false
  const t = generarLlms(c, SITIO, TIENDA)
  assert.ok(!t.includes('Taladro percutor'))
})

test('generarLlms: agrupa por categoría y omite categorías sin productos activos', () => {
  const c = copia()
  for (const p of c.productos.filter((x) => x.categoria === 'seguridad')) p.activo = false
  const t = generarLlms(c, SITIO, TIENDA)
  assert.ok(t.includes('## Herramientas eléctricas'))
  assert.ok(!t.includes('## Seguridad'))
})

test('generarLlms: indica disponibilidad y precio de cada producto', () => {
  const t = generarLlms(base, SITIO, TIENDA)
  assert.ok(/Juego de llaves[^\n]*Sin stock\./.test(t))
  assert.ok(/Taladro percutor[^\n]*\$ 89\.900\. Disponible\./.test(t))
})
