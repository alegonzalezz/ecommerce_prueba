// Lógica pura de "vistos recientemente": una lista de ids, el más reciente primero.
import type { Catalogo, Producto } from '../types/catalogo'

export const MAXIMO_VISTOS = 8

export function validarIds(datos: unknown): datos is string[] {
  return Array.isArray(datos) && datos.every((id) => typeof id === 'string' && id.length > 0)
}

/** Pone `id` primero, sin repetirlo, y deja como mucho `maximo` ids. */
export function registrarVisto(ids: string[], id: string, maximo: number = MAXIMO_VISTOS): string[] {
  return [id, ...ids.filter((x) => x !== id)].slice(0, maximo)
}

/** Productos activos de la lista, en el mismo orden; ignora ids que ya no existen o están inactivos. */
export function resolverVistos(catalogo: Catalogo, ids: string[]): Producto[] {
  const activos = new Map(catalogo.productos.filter((p) => p.activo).map((p) => [p.id, p]))
  return ids.map((id) => activos.get(id)).filter((p): p is Producto => p !== undefined)
}
