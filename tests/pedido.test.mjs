import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { MAXIMO_LINEAS, armarPedido, validarPedido } from '../shared/utils/pedido.ts'

const base = JSON.parse(await readFile(new URL('../data/catalogo.json', import.meta.url), 'utf8'))
const copia = () => structuredClone(base)
const prod = (c, id) => c.productos.find((p) => p.id === id)
const ok = (lineas) => ({ lineas })

test('validarPedido: acepta la forma correcta', () => {
  const r = validarPedido(ok([{ id: 'tal-001', cantidad: 2 }, { id: 'mar-001', cantidad: 1 }]))
  assert.equal(r.ok, true)
  assert.deepEqual(r.lineas, [{ id: 'tal-001', cantidad: 2 }, { id: 'mar-001', cantidad: 1 }])
})

test('validarPedido: ignora campos de más (precios, totales, nombres inventados)', () => {
  const r = validarPedido({ lineas: [{ id: 'tal-001', cantidad: 1, precio: 1, nombre: 'gratis' }], total: 1, descuento: 99 })
  assert.equal(r.ok, true)
  assert.deepEqual(r.lineas, [{ id: 'tal-001', cantidad: 1 }])
})

test('validarPedido: rechaza lo que no tiene forma de pedido', () => {
  for (const malo of [null, undefined, 'x', 5, [], {}, { lineas: 'a' }, { lineas: {} }]) {
    assert.equal(validarPedido(malo).ok, false, JSON.stringify(malo))
  }
})

test('validarPedido: carrito vacío', () => {
  const r = validarPedido(ok([]))
  assert.equal(r.ok, false)
  assert.match(r.error, /vacío/)
})

test('validarPedido: rechaza ids inválidos', () => {
  for (const id of ['', 'TAL-001', 'tal 001', '../x', 'a'.repeat(65), 5, null, undefined]) {
    assert.equal(validarPedido(ok([{ id, cantidad: 1 }])).ok, false, String(id))
  }
})

test('validarPedido: rechaza cantidades inválidas', () => {
  for (const cantidad of [0, -1, 1.5, 11, 999, '2', null, undefined, NaN, Infinity]) {
    assert.equal(validarPedido(ok([{ id: 'tal-001', cantidad }])).ok, false, String(cantidad))
  }
})

test('validarPedido: rechaza productos repetidos', () => {
  assert.equal(validarPedido(ok([{ id: 'tal-001', cantidad: 1 }, { id: 'tal-001', cantidad: 2 }])).ok, false)
})

test('validarPedido: rechaza demasiadas líneas', () => {
  const lineas = Array.from({ length: MAXIMO_LINEAS + 1 }, (_, i) => ({ id: `p-${i}`, cantidad: 1 }))
  assert.equal(validarPedido(ok(lineas)).ok, false)
})

test('validarPedido: rechaza líneas que no son objetos', () => {
  assert.equal(validarPedido(ok([null])).ok, false)
  assert.equal(validarPedido(ok(['tal-001'])).ok, false)
})

test('armarPedido: toma nombre y precio del catálogo y suma exacto', () => {
  const r = armarPedido([{ id: 'tal-001', cantidad: 2 }, { id: 'mar-001', cantidad: 3 }], base)
  assert.equal(r.ok, true)
  assert.equal(r.pedido.total, 89900 * 2 + 12900 * 3)
  assert.equal(r.pedido.totalAmount, '218500.00')
  assert.equal(r.pedido.unidades, 5)
  assert.deepEqual(r.pedido.items[0], { id: 'tal-001', title: 'Taladro percutor 13 mm 750 W', unit_price: '89900.00', quantity: 2 })
})

test('armarPedido: el total es la suma de unit_price × quantity de los ítems', () => {
  const r = armarPedido([{ id: 'ama-001', cantidad: 3 }, { id: 'des-001', cantidad: 2 }, { id: 'pin-001', cantidad: 1 }], base)
  const suma = r.pedido.items.reduce((s, i) => s + Math.round(Number(i.unit_price) * 100) * i.quantity, 0)
  assert.equal(Math.round(Number(r.pedido.totalAmount) * 100), suma)
})

test('armarPedido: usa el precio vigente, no el anterior', () => {
  const r = armarPedido([{ id: 'ama-001', cantidad: 1 }], base)
  assert.equal(r.pedido.items[0].unit_price, '74500.00')
})

test('armarPedido: si el precio cambia en el catálogo, cambia el total', () => {
  const c = copia()
  prod(c, 'tal-001').precio = 100000
  assert.equal(armarPedido([{ id: 'tal-001', cantidad: 2 }], c).pedido.totalAmount, '200000.00')
})

test('armarPedido: producto inexistente', () => {
  const r = armarPedido([{ id: 'zzz-999', cantidad: 1 }], base)
  assert.equal(r.ok, false)
  assert.match(r.error, /ya no está disponible/)
})

test('armarPedido: producto inactivo', () => {
  const c = copia()
  prod(c, 'tal-001').activo = false
  assert.equal(armarPedido([{ id: 'tal-001', cantidad: 1 }], c).ok, false)
})

test('armarPedido: producto sin stock, con su nombre en el motivo', () => {
  const r = armarPedido([{ id: 'llv-001', cantidad: 1 }], base)
  assert.equal(r.ok, false)
  assert.match(r.error, /Juego de llaves combinadas 8 a 22 mm está sin stock/)
})

test('armarPedido: cantidad mayor al stock', () => {
  const r = armarPedido([{ id: 'ama-001', cantidad: 10 }], base) // stock 9
  assert.equal(r.ok, false)
  assert.match(r.error, /hasta 9/)
})

test('armarPedido: no admite precios con decimales ni cero ni negativos', () => {
  for (const precio of [10.5, 0, -5, NaN, Infinity]) {
    const c = copia()
    prod(c, 'tal-001').precio = precio
    assert.equal(armarPedido([{ id: 'tal-001', cantidad: 1 }], c).ok, false, String(precio))
  }
})

test('armarPedido: sin líneas', () => {
  assert.equal(armarPedido([], base).ok, false)
})

test('armarPedido: un solo error rechaza todo el pedido', () => {
  assert.equal(armarPedido([{ id: 'tal-001', cantidad: 1 }, { id: 'llv-001', cantidad: 1 }], base).ok, false)
})
