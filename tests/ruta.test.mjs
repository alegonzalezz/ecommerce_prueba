import { test } from 'node:test'
import assert from 'node:assert/strict'
import { conBase } from '../shared/utils/ruta.ts'

const BASE = '/ecommerce_prueba/'

test('agrega la subcarpeta a una ruta de la tienda', () => {
  assert.equal(conBase(BASE, '/img/hero-mobile.webp'), '/ecommerce_prueba/img/hero-mobile.webp')
  assert.equal(conBase(BASE, '/'), '/ecommerce_prueba/')
})

test('con base "/" no cambia nada (comportamiento por defecto)', () => {
  assert.equal(conBase('/', '/img/x.webp'), '/img/x.webp')
  assert.equal(conBase('', '/img/x.webp'), '/img/x.webp')
})

test('funciona con la base con o sin barra final', () => {
  assert.equal(conBase('/ecommerce_prueba', '/img/x.webp'), '/ecommerce_prueba/img/x.webp')
  assert.equal(conBase('/ecommerce_prueba//', '/img/x.webp'), '/ecommerce_prueba/img/x.webp')
})

test('no duplica el prefijo si la ruta ya lo trae', () => {
  assert.equal(conBase(BASE, '/ecommerce_prueba/img/x.webp'), '/ecommerce_prueba/img/x.webp')
  assert.equal(conBase(BASE, '/ecommerce_prueba'), '/ecommerce_prueba')
})

test('una ruta que solo empieza parecido sí se prefija', () => {
  assert.equal(conBase(BASE, '/ecommerce_prueba2/x'), '/ecommerce_prueba/ecommerce_prueba2/x')
})

test('no toca URLs absolutas ni esquemas especiales', () => {
  for (const u of ['https://sitio.com/img/x.webp', 'http://localhost:3000/x', '//cdn.sitio.com/x', 'mailto:a@b.com', 'data:image/png;base64,AAA']) {
    assert.equal(conBase(BASE, u), u, u)
  }
})

test('rutas relativas o vacías no se tocan', () => {
  assert.equal(conBase(BASE, 'img/x.webp'), 'img/x.webp')
  assert.equal(conBase(BASE, ''), '')
})

test('conserva consulta y hash', () => {
  assert.equal(conBase(BASE, '/producto/x?a=1#b'), '/ecommerce_prueba/producto/x?a=1#b')
})
