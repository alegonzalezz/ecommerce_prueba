// Lógica pura del carrito. En el navegador solo se guardan ids y cantidades;
// nombre, precio y stock se leen siempre del catálogo (así nunca quedan viejos).
import type { Catalogo, Producto } from '../types/catalogo'

/** Tope por producto, además del stock. */
export const CANTIDAD_MAXIMA = 10

export interface LineaGuardada {
  id: string
  cantidad: number
}

export interface LineaCarrito {
  producto: Producto
  cantidad: number
  subtotal: number
  maximo: number
}

export interface Reconciliado {
  lineas: LineaCarrito[]
  guardadas: LineaGuardada[]
  avisos: string[]
  /** true si lo guardado difiere de lo que realmente corresponde (hay que volver a guardar). */
  cambio: boolean
}

/** Máximo que se puede llevar de un producto: el menor entre el stock y el tope. */
export function maximoPara(producto: Producto): number {
  return Math.max(0, Math.min(producto.stock, CANTIDAD_MAXIMA))
}

/** ¿Lo guardado tiene la forma esperada? (ids no vacíos y cantidades enteras positivas) */
export function validarLineas(datos: unknown): datos is LineaGuardada[] {
  return (
    Array.isArray(datos) &&
    datos.every(
      (l) =>
        typeof l === 'object' &&
        l !== null &&
        typeof l.id === 'string' &&
        l.id.length > 0 &&
        Number.isInteger(l.cantidad) &&
        l.cantidad > 0,
    )
  )
}

export function cantidadDe(lineas: LineaGuardada[], id: string): number {
  return lineas.find((l) => l.id === id)?.cantidad ?? 0
}

/** Suma `cantidad` unidades sin pasar de `maximo`. Si no hay lugar, devuelve las mismas líneas. */
export function agregar(lineas: LineaGuardada[], id: string, maximo: number, cantidad = 1): LineaGuardada[] {
  if (maximo <= 0 || cantidad <= 0) return lineas
  const i = lineas.findIndex((l) => l.id === id)
  if (i === -1) return [...lineas, { id, cantidad: Math.min(cantidad, maximo) }]
  const nueva = Math.min(lineas[i].cantidad + cantidad, maximo)
  return lineas.map((l, j) => (j === i ? { ...l, cantidad: nueva } : l))
}

export function quitar(lineas: LineaGuardada[], id: string): LineaGuardada[] {
  return lineas.filter((l) => l.id !== id)
}

/** Fija la cantidad (sin pasar de `maximo`); 0 o menos quita la línea. */
export function cambiarCantidad(lineas: LineaGuardada[], id: string, cantidad: number, maximo: number): LineaGuardada[] {
  if (!(cantidad > 0)) return quitar(lineas, id)
  return lineas.map((l) => (l.id === id ? { ...l, cantidad: Math.min(Math.floor(cantidad), maximo) } : l))
}

/**
 * Cruza lo guardado con el catálogo actual:
 * - une ids repetidos,
 * - quita los productos que ya no existen, están inactivos o sin stock,
 * - limita las cantidades al máximo permitido,
 * - toma nombre, precio y subtotal del catálogo.
 * Devuelve además los avisos para mostrarle a la persona.
 */
export function reconciliar(guardadas: LineaGuardada[], catalogo: Catalogo): Reconciliado {
  const porId = new Map(catalogo.productos.map((p) => [p.id, p]))

  const unificadas = new Map<string, number>()
  for (const l of guardadas) unificadas.set(l.id, (unificadas.get(l.id) ?? 0) + l.cantidad)

  const lineas: LineaCarrito[] = []
  const avisos: string[] = []
  let avisoNoDisponible = false

  for (const [id, cantidad] of unificadas) {
    const producto = porId.get(id)
    if (!producto || !producto.activo) {
      if (!avisoNoDisponible) {
        avisos.push('Un producto que tenías en el carrito ya no está disponible y lo quitamos.')
        avisoNoDisponible = true
      }
      continue
    }
    const maximo = maximoPara(producto)
    if (maximo === 0) {
      avisos.push(`${producto.nombre} está sin stock y lo quitamos del carrito.`)
      continue
    }
    let cantidadFinal = cantidad
    if (cantidad > maximo) {
      cantidadFinal = maximo
      avisos.push(`Ajustamos ${producto.nombre} a ${maximo} ${maximo === 1 ? 'unidad' : 'unidades'}, que es lo máximo disponible.`)
    }
    lineas.push({ producto, cantidad: cantidadFinal, subtotal: producto.precio * cantidadFinal, maximo })
  }

  const nuevasGuardadas = lineas.map((l) => ({ id: l.producto.id, cantidad: l.cantidad }))
  const cambio = JSON.stringify(nuevasGuardadas) !== JSON.stringify(guardadas.map((l) => ({ id: l.id, cantidad: l.cantidad })))
  return { lineas, guardadas: nuevasGuardadas, avisos, cambio }
}

export function totales(lineas: LineaCarrito[]): { unidades: number; subtotal: number } {
  return {
    unidades: lineas.reduce((suma, l) => suma + l.cantidad, 0),
    subtotal: lineas.reduce((suma, l) => suma + l.subtotal, 0),
  }
}
