// Datos de la tienda en un solo lugar. Los usan la app (app.config.ts) y el servidor (llms.txt).
// Valores provisorios hasta definir nombre y textos reales (ver Q-18).
export const TIENDA = {
  nombre: 'Tu Ferretería',
  eslogan: 'Todo para tu obra, sin vueltas.',
  descripcion: 'Ferretería online con herramientas eléctricas y manuales, fijaciones, plomería, pintura y seguridad. Precios en pesos argentinos (ARS).',
} as const
