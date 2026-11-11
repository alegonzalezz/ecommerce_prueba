import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { MAXIMO_VISTOS, registrarVisto, resolverVistos, validarIds } from '../shared/utils/vistos.ts'

const base = JSON.parse(await readFile(new URL('../data/catalogo.json', import.meta.url), 'utf8'))

test('el máximo es 8', () => assert.equal(MAXIMO_VISTOS, 8))

test('registrarVisto: el primero queda al frente', () => {
  assert.deepEqual(registrarVisto([], 'a'), ['a'])
})

test('registrarVisto: el último visto va primero', () => {
  assert.deepEqual(registrarVisto(['b', 'a'], 'c'), ['c', 'b', 'a'])
})

test('registrarVisto: uno repetido pasa al frente sin duplicarse', () => {
  assert.deepEqual(registrarVisto(['c', 'b', 'a'], 'a'), ['a', 'c', 'b'])
})

test('registrarVisto: nunca pasa de 8', () => {
  let ids = []
  for (let i = 1; i <= 12; i++) ids = registrarVisto(ids, `p${i}`)
  assert.equal(ids.length, 8)
  assert.deepEqual(ids, ['p12', 'p11', 'p10', 'p9', 'p8', 'p7', 'p6', 'p5'])
})

test('registrarVisto: no modifica la lista original', () => {
  const l = ['a']
  registrarVisto(l, 'b')
  assert.deepEqual(l, ['a'])
})

test('validarIds: acepta lista de textos y rechaza lo demás', () => {
  assert.equal(validarIds([]), true)
  assert.equal(validarIds(['a', 'b']), true)
  for (const malo of [null, {}, 'a', [1], [''], ['a', null]]) assert.equal(validarIds(malo), false, JSON.stringify(malo))
})

test('resolverVistos: devuelve los productos en el mismo orden', () => {
  assert.deepEqual(resolverVistos(base, ['mar-001', 'tal-001']).map((p) => p.id), ['mar-001', 'tal-001'])
})

test('resolverVistos: ignora ids inexistentes', () => {
  assert.deepEqual(resolverVistos(base, ['x', 'tal-001']).map((p) => p.id), ['tal-001'])
})

test('resolverVistos: ignora productos inactivos', () => {
  const c = structuredClone(base)
  c.productos.find((p) => p.id === 'tal-001').activo = false
  assert.deepEqual(resolverVistos(c, ['tal-001', 'mar-001']).map((p) => p.id), ['mar-001'])
})

test('resolverVistos: lista vacía', () => assert.deepEqual(resolverVistos(base, []), []))
