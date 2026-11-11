const formato = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

/** 89900 → "$ 89.900" (pesos argentinos, sin decimales). */
export function formatPrecio(valor: number): string {
  return formato.format(valor)
}
