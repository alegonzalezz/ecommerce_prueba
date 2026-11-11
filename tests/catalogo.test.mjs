import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { buscarProducto, carruselesVisibles, productosActivos } from '../shared/utils/catalogo.ts'

const base = JSON.parse(await readFile(new URL('../data/catalogo.json', import.meta.url), 'utf8'))
const copia = () => structuredClone(base)

test('productosActivos: devuelve solo los activos', () => {
  const c = copia()
  c.productos[0].activo = false
  assert.equal(productosActivos(c).length, base.productos.length - 1)
  assert.ok(!productosActivos(c).some((p) => p.id === c.productos[0].id))
})

test('buscarProducto: encuentra un producto activo por slug', () => {
  const p = buscarProducto(base, 'taladro-percutor-13mm')
  assert.equal(p?.id, 'tal-001')
})

test('buscarProducto: slug inexistente devuelve undefined', () => {
  assert.equal(buscarProducto(base, 'no-existe'), undefined)
})

test('buscarProducto: producto inactivo se trata como no encontrado', () => {
  const c = copia()
  c.productos.find((p) => p.id === 'tal-001').activo = false
  assert.equal(buscarProducto(c, 'taladro-percutor-13mm'), undefined)
})

test('buscarProducto: distingue mayúsculas y barra final (el slug es exacto)', () => {
  assert.equal(buscarProducto(base, 'Taladro-Percutor-13mm'), undefined)
  assert.equal(buscarProducto(base, 'taladro-percutor-13mm/'), undefined)
})

test('carruselesVisibles: conserva el orden del JSON', () => {
  assert.deepEqual(carruselesVisibles(base).map((c) => c.id), ['mas-vendido', 'nuevo', 'con-descuento'])
})

test('carruselesVisibles: ignora productos inactivos', () => {
  const c = copia()
  c.productos.find((p) => p.id === 'tal-001').activo = false
  const masVendido = carruselesVisibles(c).find((x) => x.id === 'mas-vendido')
  assert.ok(!masVendido.productos.some((p) => p.id === 'tal-001'))
})

test('carruselesVisibles: descarta un carrusel que queda sin productos', () => {
  const c = copia()
  c.carruseles.find((x) => x.id === 'nuevo').productos = []
  assert.ok(!carruselesVisibles(c).some((x) => x.id === 'nuevo'))
})
