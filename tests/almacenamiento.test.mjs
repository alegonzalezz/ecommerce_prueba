import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  DURACION_MS, borrarClave, guardarConExpiracion, leerConExpiracion, obtenerAlmacen,
} from '../shared/utils/almacenamiento.ts'

class AlmacenFalso {
  datos = new Map()
  getItem(k) { return this.datos.has(k) ? this.datos.get(k) : null }
  setItem(k, v) { this.datos.set(k, String(v)) }
  removeItem(k) { this.datos.delete(k) }
}
const esLista = (d) => Array.isArray(d)
const AHORA = 1_000_000

test('la duración es de 2 horas', () => {
  assert.equal(DURACION_MS, 2 * 60 * 60 * 1000)
})

test('guarda y lee antes de vencer', () => {
  const a = new AlmacenFalso()
  assert.equal(guardarConExpiracion(a, 'k', 1, [1, 2], AHORA), true)
  assert.deepEqual(leerConExpiracion(a, 'k', 1, AHORA + 1000), [1, 2])
})

test('vencido: devuelve null y elimina la clave', () => {
  const a = new AlmacenFalso()
  guardarConExpiracion(a, 'k', 1, [1], AHORA)
  assert.equal(leerConExpiracion(a, 'k', 1, AHORA + DURACION_MS + 1), null)
  assert.equal(a.getItem('k'), null)
})

test('justo en el instante de vencimiento ya está vencido', () => {
  const a = new AlmacenFalso()
  guardarConExpiracion(a, 'k', 1, [1], AHORA)
  assert.equal(leerConExpiracion(a, 'k', 1, AHORA + DURACION_MS), null)
})

test('un minuto antes de vencer todavía se lee', () => {
  const a = new AlmacenFalso()
  guardarConExpiracion(a, 'k', 1, [1], AHORA)
  assert.deepEqual(leerConExpiracion(a, 'k', 1, AHORA + DURACION_MS - 60_000), [1])
})

test('escribir renueva el vencimiento desde ese momento', () => {
  const a = new AlmacenFalso()
  guardarConExpiracion(a, 'k', 1, [1], AHORA)
  const mas = AHORA + DURACION_MS - 1000 // casi vencido
  guardarConExpiracion(a, 'k', 1, [1, 2], mas)
  assert.deepEqual(leerConExpiracion(a, 'k', 1, mas + DURACION_MS - 1000), [1, 2])
})

test('leer NO renueva el vencimiento', () => {
  const a = new AlmacenFalso()
  guardarConExpiracion(a, 'k', 1, [1], AHORA)
  const antes = a.getItem('k')
  leerConExpiracion(a, 'k', 1, AHORA + 5000)
  assert.equal(a.getItem('k'), antes)
})

test('otra versión: se descarta y se borra', () => {
  const a = new AlmacenFalso()
  guardarConExpiracion(a, 'k', 1, [1], AHORA)
  assert.equal(leerConExpiracion(a, 'k', 2, AHORA + 1), null)
  assert.equal(a.getItem('k'), null)
})

test('JSON corrupto: null, sin lanzar, y se borra', () => {
  const a = new AlmacenFalso()
  a.setItem('k', '{esto no es json')
  assert.equal(leerConExpiracion(a, 'k', 1, AHORA), null)
  assert.equal(a.getItem('k'), null)
})

test('formas inválidas: se descartan', () => {
  for (const crudo of ['null', '123', '"texto"', '[]', '{}', '{"version":1}', '{"version":1,"expiraEn":"mañana","datos":[]}', '{"version":1,"expiraEn":9999999999999}']) {
    const a = new AlmacenFalso()
    a.setItem('k', crudo)
    assert.equal(leerConExpiracion(a, 'k', 1, AHORA), null, crudo)
    assert.equal(a.getItem('k'), null, `no se borró: ${crudo}`)
  }
})

test('validación del llamador: si falla, se descarta y se borra', () => {
  const a = new AlmacenFalso()
  guardarConExpiracion(a, 'k', 1, { no: 'es lista' }, AHORA)
  assert.equal(leerConExpiracion(a, 'k', 1, AHORA + 1, esLista), null)
  assert.equal(a.getItem('k'), null)
})

test('validación del llamador: si pasa, devuelve los datos', () => {
  const a = new AlmacenFalso()
  guardarConExpiracion(a, 'k', 1, [{ id: 'x' }], AHORA)
  assert.deepEqual(leerConExpiracion(a, 'k', 1, AHORA + 1, esLista), [{ id: 'x' }])
})

test('clave inexistente: null sin error', () => {
  assert.equal(leerConExpiracion(new AlmacenFalso(), 'nada', 1, AHORA), null)
})

test('sin almacén (null): leer devuelve null y guardar devuelve false', () => {
  assert.equal(leerConExpiracion(null, 'k', 1, AHORA), null)
  assert.equal(guardarConExpiracion(null, 'k', 1, [1], AHORA), false)
  assert.doesNotThrow(() => borrarClave(null, 'k'))
})

test('escritura que lanza (cuota llena o bloqueado): devuelve false sin lanzar', () => {
  const a = { getItem: () => null, removeItem() {}, setItem() { throw new Error('QuotaExceededError') } }
  assert.equal(guardarConExpiracion(a, 'k', 1, [1], AHORA), false)
})

test('lectura que lanza: devuelve null sin lanzar', () => {
  const a = { getItem() { throw new Error('SecurityError') }, setItem() {}, removeItem() {} }
  assert.equal(leerConExpiracion(a, 'k', 1, AHORA), null)
})

test('borrar que lanza: no propaga el error', () => {
  const a = { getItem: () => null, setItem() {}, removeItem() { throw new Error('x') } }
  assert.doesNotThrow(() => borrarClave(a, 'k'))
})

test('obtenerAlmacen: en Node (sin localStorage) devuelve null', () => {
  assert.equal(obtenerAlmacen(), null)
})

test('obtenerAlmacen: si localStorage lanza al escribir, devuelve null', () => {
  const original = globalThis.localStorage
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { setItem() { throw new Error('bloqueado') }, removeItem() {}, getItem: () => null } })
  try { assert.equal(obtenerAlmacen(), null) } finally {
    if (original === undefined) delete globalThis.localStorage
    else Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: original })
  }
})
