/**
 * Porcentaje de descuento entero (redondeado), o null si no hay descuento real.
 * El JSON no guarda el porcentaje: se deriva de precio y precioAnterior.
 */
export function calcularDescuento(precio: number, precioAnterior: number | null): number | null {
  if (precioAnterior === null || precioAnterior <= precio) return null
  return Math.round((1 - precio / precioAnterior) * 100)
}
