// Etiquetas legibles de las categorías conocidas. Si aparece una nueva, se arma
// una a partir del slug (sin acentos). Ver preguntas abiertas de la spec de la fase 3.
const NOMBRES: Record<string, string> = {
  'herramientas-electricas': 'Herramientas eléctricas',
  'herramientas-manuales': 'Herramientas manuales',
  fijaciones: 'Fijaciones',
  plomeria: 'Plomería',
  pintura: 'Pintura',
  seguridad: 'Seguridad',
}

export function nombreCategoria(slug: string): string {
  if (NOMBRES[slug]) return NOMBRES[slug]
  const texto = slug.replace(/-/g, ' ')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
