# Spec: SEO para buscadores

- **Fecha:** 2026-11-10
- **Autor:** agonzalezz
- **Iniciativa:** `initiatives/2026-11-10-ficha-producto/initiative.md`
- **Estado:** implementada   <!-- borrador | en revisión | aprobada | implementada | descartada -->
- **Plan:** [plan.md](plan.md) · **Tareas:** [tasks.md](tasks.md)

> Aprobada por el usuario el 2026-11-10 ("OK, creá las specs y construí las 3 fases"). Ninguna tarea de código arranca con esta spec en estado `borrador`.


## Contexto
- **Qué pasa si no hacemos nada:** las fichas tendrían el mismo título y descripción genéricos, sin `canonical`, sin datos estructurados ni sitemap; Google las indexaría peor y no mostraría precio ni disponibilidad.
- **Situación actual en el código:** solo la home tiene `title` y `description` (`useSeoMeta` en `app/pages/index.vue`); no hay `canonical`, Open Graph, JSON-LD, `sitemap.xml` ni `robots.txt`. `[VERIFICADO]` `app/pages/index.vue`, `public/`.

## User stories
- Como persona que busca en Google quiero ver un título y una descripción que expliquen el producto, y su precio y disponibilidad.
- Como persona que comparte un enlace quiero que se vea con imagen, título y descripción.
- Como equipo quiero cambiar la URL del sitio en un solo lugar.

## Criterios de aceptación
- **Given** `SITE_URL` definida, **When** pido una ficha, **Then** el HTML trae `<title>` único (`<nombre> | <tienda>`), `meta description` (≤ 160 caracteres), `link rel="canonical"` con URL absoluta, `og:title`, `og:description`, `og:url`, `og:image` absoluta (la imagen `desktop`), `og:locale="es_AR"` y `twitter:card="summary_large_image"`.
- **Given** una ficha, **Then** trae un único `<script type="application/ld+json">` con `Product` (`name`, `description`, `image`, `sku`, `brand`, `category`, `offers` con `price`, `priceCurrency: "ARS"`, `availability` y `url`) y `additionalProperty` con los atributos visibles.
- **Given** una ficha, **Then** trae `BreadcrumbList` con Inicio y Producto (la categoría, sin página, queda fuera).
- **Given** un producto agotado, **Then** `availability` es `https://schema.org/OutOfStock`; si hay stock, `InStock`.
- **Given** el JSON-LD de una ficha, **Then** precio, nombre y disponibilidad coinciden con lo que se ve en pantalla.
- **Given** la home, **Then** tiene `canonical`, Open Graph y JSON-LD `WebSite`.
- **Given** el sitio, **When** pido `/sitemap.xml`, **Then** lista la home y todos los productos activos con URL absoluta, y ningún inactivo.
- **Given** el sitio, **When** pido `/robots.txt`, **Then** permite el rastreo, apunta al sitemap con URL absoluta y no bloquea nada que deba indexarse.
- **Given** la ficha publicada, **Then** Lighthouse móvil da SEO 100.
- **Given** el comando de verificación, **When** lo corro contra el sitio, **Then** revisa todas las fichas del catálogo y falla si alguna incumple.

### Casos borde
- `SITE_URL` con barra final: se normaliza.
- Texto con comillas o `<` en nombre o descripción: el JSON-LD se escapa para no romper el HTML.
- Producto sin descuento: el JSON-LD solo declara el precio vigente.
- No se inventan `aggregateRating`, `review`, `priceValidUntil` ni `lastmod`: no hay datos.

### Comportamiento por país
Solo Argentina; `og:locale` `es_AR`, `priceCurrency` `ARS`.

## Fuera de alcance
- `llms.txt` y rastreadores de IA (fase 3), `Organization` (faltan datos reales), Search Console, verificación de indexación.

## Impacto en métricas
- **Qué medimos:** el verificador sobre las 12 fichas; Lighthouse SEO.
- **Cómo sabemos si salió mal:** títulos repetidos, `canonical` relativo, JSON-LD inválido, productos ausentes del sitemap.

## Dependencias
- Fase 1 (`pagina-producto`) cerrada.

## Preguntas abiertas de esta spec
- URL pública real: hasta entonces `http://localhost:3000` (provisoria).
- Si las URLs absolutas pregeneradas quedan fijas en el build: hay que construir con `SITE_URL` de producción.

