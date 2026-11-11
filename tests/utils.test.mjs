import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatPrecio } from '../shared/utils/formatPrecio.ts'
import { calcularDescuento } from '../shared/utils/calcularDescuento.ts'
import { nombreCategoria } from '../shared/utils/nombreCategoria.ts'

// Intl usa un espacio no cortable entre el símbolo y el número; lo normalizamos para comparar.
const limpio = (s) => s.replace(/\u00a0/g, ' ')

test('formatPrecio: pesos argentinos sin decimales', () => {
  assert.equal(limpio(formatPrecio(89900)), '$ 89.900')
  assert.equal(limpio(formatPrecio(3200)), '$ 3.200')
  assert.equal(limpio(formatPrecio(0)), '$ 0')
})

test('calcularDescuento: sin precio anterior no hay descuento', () => {
  assert.equal(calcularDescuento(1000, null), null)
})

test('calcularDescuento: precio anterior igual o menor no es descuento', () => {
  assert.equal(calcularDescuento(1000, 1000), null)
  assert.equal(calcularDescuento(1000, 900), null)
})

test('calcularDescuento: porcentaje exacto', () => {
  assert.equal(calcularDescuento(75, 100), 25)
  assert.equal(calcularDescuento(50, 100), 50)
})

test('calcularDescuento: redondea al entero más cercano', () => {
  assert.equal(calcularDescuento(74500, 89900), 17) // 17,13 %
  assert.equal(calcularDescuento(8700, 9900), 12) // 12,12 %
  assert.equal(calcularDescuento(15800, 19500), 19) // 18,97 %
})

test('nombreCategoria: conocidas con acento y desconocidas por slug', () => {
  assert.equal(nombreCategoria('herramientas-electricas'), 'Herramientas eléctricas')
  assert.equal(nombreCategoria('jardin-y-riego'), 'Jardin y riego')
})
