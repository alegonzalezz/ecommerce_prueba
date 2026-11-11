import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, mkdtemp, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validarCatalogo } from './validar-catalogo.mjs'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const base = JSON.parse(await readFile(join(raiz, 'data', 'catalogo.json'), 'utf8'))
const copia = () => structuredClone(base)
const producto = (c, id) => c.productos.find((p) => p.id === id)
const carrusel = (c, id) => c.carruseles.find((x) => x.id === id)
const hayError = (r, texto) => r.errores.some((e) => e.includes(texto))

test('el catálogo real es válido', async () => {
  const r = await validarCatalogo(base)
  assert.deepEqual(r.errores, [])
})

test('falla si un carrusel lista un id que no existe', async () => {
  const c = copia()
  carrusel(c, 'nuevo').productos.push('no-existe-999')
  const r = await validarCatalogo(c)
  assert.ok(hayError(r, 'Carrusel "nuevo": el producto "no-existe-999" no existe'), r.errores.join('\n'))
})

test('falla si un id se repite dentro de un carrusel', async () => {
  const c = copia()
  carrusel(c, 'nuevo').productos.push('tar-001')
  const r = await validarCatalogo(c)
  assert.ok(hayError(r, 'está repetido'), r.errores.join('\n'))
})

test('falla si con-descuento tiene un producto sin descuento real', async () => {
  const c = copia()
  producto(c, 'ama-001').precioAnterior = null
  const r = await validarCatalogo(c)
  assert.ok(hayError(r, 'no tiene precioAnterior mayor que precio'), r.errores.join('\n'))
})

test('falla si falta el archivo de una imagen', async () => {
  const c = copia()
  producto(c, 'tal-001').imagenes.card.src = '/img/productos/no-existe-card.webp'
  const r = await validarCatalogo(c)
  assert.ok(hayError(r, 'no existe el archivo'), r.errores.join('\n'))
})

test('falla si la extensión no es .webp', async () => {
  const c = copia()
  producto(c, 'tal-001').imagenes.card.src = '/img/productos/tal-001-card.png'
  const r = await validarCatalogo(c)
  assert.ok(hayError(r, 'no es .webp'), r.errores.join('\n'))
})

test('falla si el archivo termina en .webp pero no es WebP', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'catalogo-'))
  await mkdir(join(dir, 'img'), { recursive: true })
  await writeFile(join(dir, 'img', 'falso.webp'), 'esto no es una imagen')
  const c = copia()
  producto(c, 'tal-001').imagenes.card.src = '/img/falso.webp'
  const r = await validarCatalogo(c, { raizPublic: dir })
  assert.ok(r.errores.some((e) => e.includes('tal-001') && e.includes('card')), r.errores.join('\n'))
})

test('falla con precio no numérico', async () => {
  const c = copia()
  producto(c, 'tal-001').precio = '89900'
  const r = await validarCatalogo(c)
  assert.ok(hayError(r, 'Esquema: /productos/0/precio'), r.errores.join('\n'))
})

test('falla con precio negativo', async () => {
  const c = copia()
  producto(c, 'tal-001').precio = -1
  const r = await validarCatalogo(c)
  assert.ok(hayError(r, 'Esquema: /productos/0/precio'), r.errores.join('\n'))
})

test('falla si falta una de las tres imágenes de un producto', async () => {
  const c = copia()
  delete producto(c, 'tal-001').imagenes.mobile
  const r = await validarCatalogo(c)
  assert.ok(hayError(r, 'Esquema'), r.errores.join('\n'))
})

test('falla con id de producto repetido', async () => {
  const c = copia()
  c.productos[1].id = c.productos[0].id
  const r = await validarCatalogo(c)
  assert.ok(hayError(r, 'id repetido'), r.errores.join('\n'))
})

test('falla con slug repetido', async () => {
  const c = copia()
  c.productos[1].slug = c.productos[0].slug
  const r = await validarCatalogo(c)
  assert.ok(hayError(r, 'slug repetido'), r.errores.join('\n'))
})

test('falla si los carruseles no respetan el orden pedido', async () => {
  const c = copia()
  c.carruseles.reverse()
  const r = await validarCatalogo(c)
  assert.ok(hayError(r, 'fuera de orden'), r.errores.join('\n'))
})

test('falla si falta un carrusel obligatorio', async () => {
  const c = copia()
  c.carruseles = c.carruseles.filter((x) => x.id !== 'nuevo')
  const r = await validarCatalogo(c)
  assert.ok(hayError(r, 'ausente: "nuevo"'), r.errores.join('\n'))
})

test('un carrusel vacío es aviso, no error', async () => {
  const c = copia()
  carrusel(c, 'nuevo').productos = []
  const r = await validarCatalogo(c)
  assert.deepEqual(r.errores, [])
  assert.ok(r.avisos.some((a) => a.includes('no tiene productos')))
})
