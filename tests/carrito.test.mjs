import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import {
  CANTIDAD_MAXIMA, agregar, cambiarCantidad, cantidadDe, maximoPara, quitar, reconciliar, totales, validarLineas,
} from '../shared/utils/carrito.ts'

const base = JSON.parse(await readFile(new URL('../data/catalogo.json', import.meta.url), 'utf8'))
const copia = () => structuredClone(base)
const prod = (c, id) => c.productos.find((p) => p.id === id)

test('maximoPara: el menor entre el stock y el tope de 10', () => {
  assert.equal(CANTIDAD_MAXIMA, 10)
  assert.equal(maximoPara(prod(base, 'ama-001')), 9) // stock 9
  assert.equal(maximoPara(prod(base, 'tal-001')), 10) // stock 14 → tope
  assert.equal(maximoPara(prod(base, 'llv-001')), 0) // sin stock
})

test('validarLineas: acepta la forma correcta y rechaza lo demás', () => {
  assert.equal(validarLineas([]), true)
  assert.equal(validarLineas([{ id: 'a', cantidad: 2 }]), true)
  for (const malo of [null, {}, 'x', [null], [{ id: '', cantidad: 1 }], [{ id: 'a', cantidad: 0 }], [{ id: 'a', cantidad: -1 }], [{ id: 'a', cantidad: 1.5 }], [{ id: 'a', cantidad: '2' }], [{ cantidad: 1 }], [{ id: 5, cantidad: 1 }]]) {
    assert.equal(validarLineas(malo), false, JSON.stringify(malo))
  }
})

test('agregar: producto nuevo entra con 1 unidad', () => {
  assert.deepEqual(agregar([], 'a', 5), [{ id: 'a', cantidad: 1 }])
})

test('agregar: producto existente suma una unidad', () => {
  assert.deepEqual(agregar([{ id: 'a', cantidad: 2 }], 'a', 5), [{ id: 'a', cantidad: 3 }])
})

test('agregar: no pasa del máximo', () => {
  assert.deepEqual(agregar([{ id: 'a', cantidad: 5 }], 'a', 5), [{ id: 'a', cantidad: 5 }])
  assert.deepEqual(agregar([], 'a', 2, 9), [{ id: 'a', cantidad: 2 }])
})

test('agregar: sin lugar (máximo 0) o cantidad inválida no cambia nada', () => {
  const l = [{ id: 'b', cantidad: 1 }]
  assert.equal(agregar(l, 'a', 0), l)
  assert.equal(agregar(l, 'a', 5, 0), l)
  assert.equal(agregar(l, 'a', 5, -2), l)
})

test('agregar: no modifica el arreglo original', () => {
  const l = [{ id: 'a', cantidad: 1 }]
  agregar(l, 'a', 5)
  assert.deepEqual(l, [{ id: 'a', cantidad: 1 }])
})

test('quitar: saca la línea indicada', () => {
  assert.deepEqual(quitar([{ id: 'a', cantidad: 1 }, { id: 'b', cantidad: 2 }], 'a'), [{ id: 'b', cantidad: 2 }])
})

test('cambiarCantidad: fija la cantidad y la limita al máximo', () => {
  const l = [{ id: 'a', cantidad: 1 }]
  assert.deepEqual(cambiarCantidad(l, 'a', 4, 5), [{ id: 'a', cantidad: 4 }])
  assert.deepEqual(cambiarCantidad(l, 'a', 99, 5), [{ id: 'a', cantidad: 5 }])
})

test('cambiarCantidad: 0, negativa o inválida quita la línea', () => {
  const l = [{ id: 'a', cantidad: 3 }]
  assert.deepEqual(cambiarCantidad(l, 'a', 0, 5), [])
  assert.deepEqual(cambiarCantidad(l, 'a', -1, 5), [])
  assert.deepEqual(cambiarCantidad(l, 'a', NaN, 5), [])
})

test('cantidadDe: 0 si no está', () => {
  assert.equal(cantidadDe([{ id: 'a', cantidad: 3 }], 'a'), 3)
  assert.equal(cantidadDe([], 'a'), 0)
})

test('reconciliar: toma nombre, precio y subtotal del catálogo', () => {
  const r = reconciliar([{ id: 'tal-001', cantidad: 2 }], base)
  assert.equal(r.lineas[0].producto.nombre, 'Taladro percutor 13 mm 750 W')
  assert.equal(r.lineas[0].subtotal, 89900 * 2)
  assert.deepEqual(r.avisos, [])
  assert.equal(r.cambio, false)
})

test('reconciliar: si el precio cambió en el catálogo, usa el nuevo', () => {
  const c = copia()
  prod(c, 'tal-001').precio = 100000
  const r = reconciliar([{ id: 'tal-001', cantidad: 3 }], c)
  assert.equal(r.lineas[0].subtotal, 300000)
})

test('reconciliar: el subtotal usa el precio vigente, no el anterior', () => {
  const p = prod(base, 'ama-001')
  const r = reconciliar([{ id: 'ama-001', cantidad: 2 }], base)
  assert.equal(r.lineas[0].subtotal, p.precio * 2)
  assert.ok(p.precioAnterior > p.precio)
})

test('reconciliar: producto inexistente se quita con aviso', () => {
  const r = reconciliar([{ id: 'no-existe', cantidad: 1 }, { id: 'tal-001', cantidad: 1 }], base)
  assert.equal(r.lineas.length, 1)
  assert.equal(r.avisos.length, 1)
  assert.ok(r.avisos[0].includes('ya no está disponible'))
  assert.equal(r.cambio, true)
})

test('reconciliar: varios inexistentes dan un solo aviso', () => {
  const r = reconciliar([{ id: 'x', cantidad: 1 }, { id: 'y', cantidad: 1 }], base)
  assert.equal(r.avisos.length, 1)
})

test('reconciliar: producto inactivo se quita con aviso', () => {
  const c = copia()
  prod(c, 'tal-001').activo = false
  const r = reconciliar([{ id: 'tal-001', cantidad: 1 }], c)
  assert.equal(r.lineas.length, 0)
  assert.ok(r.avisos[0].includes('ya no está disponible'))
})

test('reconciliar: producto sin stock se quita y el aviso dice su nombre', () => {
  const r = reconciliar([{ id: 'llv-001', cantidad: 1 }], base)
  assert.equal(r.lineas.length, 0)
  assert.ok(r.avisos[0].includes('Juego de llaves combinadas 8 a 22 mm'))
  assert.ok(r.avisos[0].includes('sin stock'))
})

test('reconciliar: cantidad mayor que el stock se ajusta con aviso', () => {
  const r = reconciliar([{ id: 'ama-001', cantidad: 50 }], base) // stock 9
  assert.equal(r.lineas[0].cantidad, 9)
  assert.ok(r.avisos[0].includes('9 unidades'))
  assert.deepEqual(r.guardadas, [{ id: 'ama-001', cantidad: 9 }])
  assert.equal(r.cambio, true)
})

test('reconciliar: cantidad mayor que el tope de 10 se ajusta', () => {
  const r = reconciliar([{ id: 'tal-001', cantidad: 11 }], base) // stock 14
  assert.equal(r.lineas[0].cantidad, 10)
})

test('reconciliar: une ids repetidos sumando y respetando el máximo', () => {
  const r = reconciliar([{ id: 'tal-001', cantidad: 2 }, { id: 'tal-001', cantidad: 3 }], base)
  assert.equal(r.lineas.length, 1)
  assert.equal(r.lineas[0].cantidad, 5)
  assert.equal(r.cambio, true)
})

test('reconciliar: conserva el orden de las líneas', () => {
  const r = reconciliar([{ id: 'mar-001', cantidad: 1 }, { id: 'tal-001', cantidad: 1 }], base)
  assert.deepEqual(r.lineas.map((l) => l.producto.id), ['mar-001', 'tal-001'])
})

test('reconciliar: carrito vacío', () => {
  const r = reconciliar([], base)
  assert.deepEqual(r, { lineas: [], guardadas: [], avisos: [], cambio: false })
})

test('totales: suma unidades y subtotal', () => {
  const r = reconciliar([{ id: 'tal-001', cantidad: 2 }, { id: 'mar-001', cantidad: 3 }], base)
  assert.deepEqual(totales(r.lineas), { unidades: 5, subtotal: 89900 * 2 + 12900 * 3 })
  assert.deepEqual(totales([]), { unidades: 0, subtotal: 0 })
})
