import catalogoJson from '~~/data/catalogo.json'
import type { Catalogo, Producto } from '#shared/types/catalogo'

/**
 * Lee data/catalogo.json (validado antes del build con `npm run catalogo:validar`).
 * La lógica vive en shared/utils/catalogo.ts para que la usen también el servidor y los tests.
 */
export function useCatalogo() {
  const catalogo = catalogoJson as Catalogo
  const carruseles = carruselesVisibles(catalogo)
  const categorias = [...new Set(productosActivos(catalogo).map((p) => p.categoria))].map(nombreCategoria)
  const buscar = (slug: string): Producto | undefined => buscarProducto(catalogo, slug)

  return { catalogo, carruseles, categorias, buscar }
}
