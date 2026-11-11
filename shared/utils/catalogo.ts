import type { Catalogo, CarruselResuelto, Producto } from '../types/catalogo'

/** Productos con activo:true. */
export function productosActivos(catalogo: Catalogo): Producto[] {
  return catalogo.productos.filter((p) => p.activo)
}

/** Busca un producto activo por slug exacto (minúsculas); undefined si no existe o está inactivo. */
export function buscarProducto(catalogo: Catalogo, slug: string): Producto | undefined {
  return catalogo.productos.find((p) => p.activo && p.slug === slug)
}

/**
 * Carruseles con sus productos resueltos:
 * - ignora productos inactivos,
 * - conserva el orden del JSON,
 * - descarta los carruseles que quedan vacíos.
 */
export function carruselesVisibles(catalogo: Catalogo): CarruselResuelto[] {
  const activos = new Map(productosActivos(catalogo).map((p) => [p.id, p]))
  return catalogo.carruseles
    .map((c) => ({
      id: c.id,
      nombre: c.nombre,
      productos: c.productos.map((id) => activos.get(id)).filter((p): p is Producto => p !== undefined),
    }))
    .filter((c) => c.productos.length > 0)
}

/** "potencia" → "Potencia" (las claves de `atributos` van en minúscula en el JSON). */
export function etiquetaAtributo(clave: string): string {
  return clave.charAt(0).toUpperCase() + clave.slice(1)
}
