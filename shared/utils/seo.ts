// Funciones puras de SEO: reciben el catálogo y la URL base, devuelven texto.
// Se usan en las páginas, en las rutas de servidor (sitemap, robots) y en los tests.
import type { Catalogo, Producto } from '../types/catalogo'
import { formatPrecio } from './formatPrecio.ts'
import { nombreCategoria } from './nombreCategoria.ts'
import { etiquetaAtributo, productosActivos } from './catalogo.ts'

/** Valor provisorio hasta que exista el dominio (ver NUXT_PUBLIC_SITE_URL). */
export const SITE_URL_DEFECTO = 'http://localhost:3000'

/** Sin espacios ni barras al final: "https://sitio.com/" → "https://sitio.com". */
export function normalizarUrlBase(siteUrl: string): string {
  return siteUrl.trim().replace(/\/+$/, '')
}

/** Une la URL base con una ruta que empieza con "/". */
export function urlAbsoluta(siteUrl: string, ruta: string): string {
  return normalizarUrlBase(siteUrl) + (ruta.startsWith('/') ? ruta : `/${ruta}`)
}

export function urlProducto(siteUrl: string, producto: Producto): string {
  return urlAbsoluta(siteUrl, `/producto/${producto.slug}`)
}

export function tituloProducto(producto: Producto, tienda: string): string {
  return `${producto.nombre} | ${tienda}`
}

/** Descripción para buscadores: máximo 160 caracteres, cortada en una palabra entera. */
export function descripcionMeta(producto: Producto): string {
  const precio = formatPrecio(producto.precio).replace(/ /g, ' ')
  const texto = `${producto.descripcionCorta} ${producto.marca}. ${precio}.`
  if (texto.length <= 160) return texto
  const corte = texto.slice(0, 159).replace(/\s+\S*$/, '')
  return `${corte}…`
}

export function disponibilidadSchema(producto: Producto): string {
  return producto.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
}

/** JSON-LD `Product`. Solo incluye datos que la página muestra; no inventa reseñas ni calificaciones. */
export function jsonLdProducto(producto: Producto, siteUrl: string): Record<string, unknown> {
  const url = urlProducto(siteUrl, producto)
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: producto.nombre,
    description: producto.descripcion,
    sku: producto.sku,
    brand: { '@type': 'Brand', name: producto.marca },
    category: nombreCategoria(producto.categoria),
    image: [urlAbsoluta(siteUrl, producto.imagenes.desktop.src), urlAbsoluta(siteUrl, producto.imagenes.mobile.src)],
    url,
    additionalProperty: Object.entries(producto.atributos).map(([clave, valor]) => ({
      '@type': 'PropertyValue',
      name: etiquetaAtributo(clave),
      value: valor,
    })),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: producto.moneda,
      price: producto.precio,
      availability: disponibilidadSchema(producto),
    },
  }
}

/** `BreadcrumbList`: la categoría no tiene página propia, por eso queda fuera. */
export function jsonLdMigas(producto: Producto, siteUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: urlAbsoluta(siteUrl, '/') },
      { '@type': 'ListItem', position: 2, name: producto.nombre, item: urlProducto(siteUrl, producto) },
    ],
  }
}

export function jsonLdSitio(siteUrl: string, nombre: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: nombre,
    url: urlAbsoluta(siteUrl, '/'),
    inLanguage: 'es-AR',
  }
}

/** Texto seguro para meter en un <script type="application/ld+json">: escapa "<" para que no cierre la etiqueta. */
export function serializarJsonLd(datos: unknown): string {
  return JSON.stringify(datos).replace(/</g, '\\u003c')
}

const escaparXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

/** sitemap.xml: la home y cada producto activo. Sin <lastmod>: no hay una fecha de modificación real. */
export function generarSitemap(catalogo: Catalogo, siteUrl: string): string {
  const urls = [urlAbsoluta(siteUrl, '/'), ...productosActivos(catalogo).map((p) => urlProducto(siteUrl, p))]
  const filas = urls.map((u) => `  <url><loc>${escaparXml(u)}</loc></url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${filas}\n</urlset>\n`
}

/**
 * Rastreadores de IA que se permiten de forma explícita (decisión del usuario: todos, como en prueba_pagina).
 * Los nombres salen de guías de terceros y de prueba_pagina/robots.txt; confirmarlos contra la
 * documentación de cada proveedor antes de publicar (ver Q-20).
 */
export const RASTREADORES_IA = [
  'GPTBot', // OpenAI: entrenamiento
  'OAI-SearchBot', // OpenAI: búsqueda de ChatGPT
  'ChatGPT-User', // OpenAI: visitas pedidas por una persona
  'ClaudeBot', // Anthropic: entrenamiento
  'Claude-SearchBot', // Anthropic: búsqueda
  'Claude-User', // Anthropic: visitas pedidas por una persona
  'anthropic-ai', // Anthropic: nombre anterior, ya presente en prueba_pagina
  'PerplexityBot', // Perplexity: búsqueda
  'Perplexity-User', // Perplexity: visitas pedidas por una persona
  'Google-Extended', // Google: control de uso en Gemini
] as const

/** robots.txt: permite el rastreo a todos, nombra a los rastreadores de IA y apunta al sitemap. */
export function generarRobots(siteUrl: string): string {
  const bloquesIa = RASTREADORES_IA.map((bot) => `User-agent: ${bot}\nAllow: /`).join('\n\n')
  return `User-agent: *\nAllow: /\n\n# Buscadores y asistentes de IA: permitidos de forma explícita.\n${bloquesIa}\n\nSitemap: ${urlAbsoluta(siteUrl, '/sitemap.xml')}\n`
}

/**
 * llms.txt (formato de llmstxt.org): resumen de la tienda y enlaces a cada producto activo,
 * agrupados por categoría. No hay garantía de que los asistentes lo usen.
 */
export function generarLlms(
  catalogo: Catalogo,
  siteUrl: string,
  tienda: { nombre: string; descripcion: string },
): string {
  const porCategoria = new Map<string, Producto[]>()
  for (const p of productosActivos(catalogo)) {
    porCategoria.set(p.categoria, [...(porCategoria.get(p.categoria) ?? []), p])
  }

  const secciones = [...porCategoria.entries()].map(([categoria, productos]) => {
    const lineas = productos.map((p) => {
      const precio = formatPrecio(p.precio).replace(/\u00a0/g, ' ')
      const estado = p.stock > 0 ? 'Disponible' : 'Sin stock'
      return `- [${p.nombre}](${urlProducto(siteUrl, p)}): ${p.descripcionCorta} ${p.marca}. ${precio}. ${estado}.`
    })
    return `## ${nombreCategoria(categoria)}\n\n${lineas.join('\n')}`
  })

  return [
    `# ${tienda.nombre}`,
    `> ${tienda.descripcion}`,
    'Todavía no se puede comprar online: cada producto tiene su página con precio, disponibilidad y características.',
    `## Inicio\n\n- [${tienda.nombre}](${urlAbsoluta(siteUrl, '/')}): Lo más vendido, lo nuevo y los productos con descuento.`,
    ...secciones,
  ].join('\n\n') + '\n'
}
