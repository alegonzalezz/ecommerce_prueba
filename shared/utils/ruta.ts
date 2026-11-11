/**
 * Antepone la subcarpeta de publicación (`app.baseURL`, p. ej. "/ecommerce_prueba/" en GitHub Pages)
 * a una ruta de la propia tienda que empieza con "/". No toca URLs absolutas ni rutas ya prefijadas.
 * Con base "/" devuelve la ruta tal cual (comportamiento por defecto).
 */
export function conBase(base: string, ruta: string): string {
  if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(ruta)) return ruta // URL absoluta, mailto:, //host
  if (!ruta.startsWith('/')) return ruta
  const prefijo = base.replace(/\/+$/, '')
  if (prefijo === '') return ruta
  return ruta === prefijo || ruta.startsWith(`${prefijo}/`) ? ruta : `${prefijo}${ruta}`
}
