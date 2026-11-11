import { test } from 'node:test'
import assert from 'node:assert/strict'
import { crearLimitador } from '../shared/utils/limite.ts'

test('permite hasta el máximo y rechaza el siguiente', () => {
  const permitir = crearLimitador(3, 1000)
  assert.deepEqual([1, 2, 3, 4, 5].map(() => permitir('a', 0)), [true, true, true, false, false])
})

test('al terminar la ventana vuelve a permitir', () => {
  const permitir = crearLimitador(2, 1000)
  permitir('a', 0); permitir('a', 10)
  assert.equal(permitir('a', 500), false)
  assert.equal(permitir('a', 1000), true)
})

test('cada clave tiene su propio contador', () => {
  const permitir = crearLimitador(1, 1000)
  assert.equal(permitir('a', 0), true)
  assert.equal(permitir('a', 1), false)
  assert.equal(permitir('b', 1), true)
})

test('limpia registros viejos cuando el mapa crece', () => {
  const permitir = crearLimitador(1, 1000)
  for (let i = 0; i < 1500; i++) permitir(`ip-${i}`, 0)
  assert.equal(permitir('nueva', 5000), true)
  assert.equal(permitir('ip-1', 5000), true) // su ventana ya venció
})
