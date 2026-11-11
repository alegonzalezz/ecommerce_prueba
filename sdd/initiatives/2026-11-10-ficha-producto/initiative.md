---
slug: 2026-11-10-ficha-producto
title: Ficha de producto con SEO para buscadores y asistentes de IA
author: agonzalezz
status: en desarrollo                   # borrador | aprobada | en desarrollo | en QA | en producción | descartada
apps:
  - name: ecommerce_prueba
    why: Es la tienda; acá nacen la ruta /producto/<slug>, los datos estructurados y los archivos para buscadores
    depends_on: []
---

# Iniciativa: Ficha de producto con SEO para buscadores y asistentes de IA

> Spec funcional única. Cada app afectada recibe una porción en `specs/<YYYY-MM-DD-fase>/<app>/spec.md`.
> Los repos de código no llevan `.sdd/`: solo código. Las tareas viven en el `tasks.md` de cada spec.

Origen: pedido del usuario del 2026-11-10 (conversación), refinado con una ronda de preguntas. El usuario aprobó crear las specs y construir las 3 fases. Las decisiones siguen marcadas `[PROPUESTA]`.

## Contexto
- **Qué pasa si no hacemos nada:** las cards de la landing enlazan a `/producto/<slug>`, ruta que hoy no existe y da 404. `[VERIFICADO]` `app/components/ProductCard.vue` (comentario sobre el 404), iniciativa `2026-11-10-landing-ferreteria`.
- **Situación actual:** existen el catálogo (`data/catalogo.json`) y, por producto, tres `.webp` (`card`, `mobile`, `desktop`); las dos últimas no se usan todavía. `[VERIFICADO]` `docs`: `applications/ecommerce_prueba/architecture.md`.
- **Qué es:** una página de producto simple y fácil de leer, optimizada para que Google la indexe y para que asistentes de IA (ChatGPT, Gemini, Claude, Perplexity) puedan leerla y, con suerte, citarla.
- **Decisiones del usuario (2026-11-10) `[PROPUESTA]`:**
  - Sin carrito ni pagos: la ficha es informativa, con el aviso "Pronto podrás comprar online" y sin botón de compra.
  - Secciones: migas de pan (Inicio › Categoría › Producto) y tabla de características. No incluye productos relacionados.
  - URL pública del sitio: todavía no existe; vive en una variable de entorno con valor provisorio (`SITE_URL`).
  - robots.txt permite todos los rastreadores de IA, como `prueba_pagina`.
- **Decisiones del asistente (el usuario las puede vetar):**
  - Los datos estructurados solo incluyen lo que se ve en la página (lo exige Google). Por eso la ficha muestra marca, disponibilidad y SKU.
  - Un producto sin stock sigue indexable, marcado como agotado.
  - No se inventan reseñas ni calificaciones: no hay datos.

## User stories
- Como **visitante** quiero ver la imagen, el precio, la disponibilidad y las características de un producto en una página clara, desde el celular o la compu.
- Como **persona que busca en Google** quiero encontrar el producto con un título y una descripción que lo expliquen.
- Como **persona que le pregunta a un asistente de IA** quiero que pueda leer el producto con precio y disponibilidad.
- Como **quien administra el catálogo** quiero que agregar un producto al JSON cree su página, su entrada en el sitemap y en `llms.txt` sin tocar código.

## Criterios de aceptación
Todos `[EC]` (`ecommerce_prueba`).
- **Given** un producto activo, **When** se abre `/producto/<slug>`, **Then** responde 200 y el HTML ya trae (SSR, C-01) nombre, marca, precio, disponibilidad, descripción y tabla de características.
- **Given** un slug inexistente o de un producto con `activo: false`, **When** se lo pide, **Then** responde **404** (código HTTP real) con una página amable.
- **Given** un producto, **Then** tiene `title` y `description` propios, `canonical` absoluto, Open Graph y Twitter con imagen absoluta.
- **Given** un producto, **Then** el HTML trae JSON-LD `Product` (nombre, descripción, imagen, SKU, marca, oferta con precio ARS y disponibilidad) y `BreadcrumbList`, coherentes con lo visible.
- **Given** el sitio, **Then** existen `/sitemap.xml` (home + productos activos), `/robots.txt` (con la línea `Sitemap` y los rastreadores de IA permitidos) y `/llms.txt`, generados desde el catálogo.
- **Given** una ficha en mobile (390 px) y en desktop (1440 px), **Then** no hay desborde horizontal, se descarga la imagen del formato correspondiente y todas las imágenes son `.webp` con `width` y `height`.
- **Given** una ficha publicada (build con compresión), **Then** Lighthouse móvil: Performance ≥ 90, SEO 100, Accesibilidad 100.
- **Given** la landing, **When** se hace clic en una card, **Then** abre la ficha del producto.

## Casos borde y errores
- Producto agotado (`stock: 0`): se muestra "Sin stock" y el JSON-LD declara `OutOfStock`.
- Producto con descuento: se muestra el precio anterior tachado y el porcentaje calculado; el JSON-LD usa el precio vigente.
- Categoría sin página: la miga de pan la muestra como texto, sin enlace, y queda fuera del `BreadcrumbList`.
- `SITE_URL` sin definir: se usa el valor provisorio (`http://localhost:3000`); las URLs absolutas apuntan ahí hasta que se configure.
- Producto sin atributos: la tabla de características no se muestra.

## Comportamiento por país
Solo Argentina: `es-AR`, moneda ARS, `<html lang="es-AR">`. Sin `hreflang` (un solo idioma).

## Fuera de alcance
- Carrito, compra, pagos (C-03 no se toca).
- Páginas de categoría y buscador interno.
- Productos relacionados, reseñas, calificaciones y galería de varias fotos.
- Alta en Google Search Console y Bing Webmaster, y verificación de que efectivamente se indexe o se cite.
- Versiones alternativas de cada ficha en Markdown.

## Impacto en métricas
- **Qué medimos:** Lighthouse móvil en la ficha (Performance, SEO, Accesibilidad); validez del JSON-LD; presencia de `sitemap.xml`, `robots.txt` y `llms.txt`.
- **Cómo sabemos si salió mal:** una ficha sin `title` propio, JSON-LD que no coincide con lo visible, 200 en lugar de 404, o un producto del JSON que no aparece en el sitemap.
- **No medible desde acá:** posicionamiento, indexación real y citas en asistentes de IA.

## Contratos entre apps
| Contrato | Productor | Consumidor | Breaking |
|---|---|---|---|
| Esquema del catálogo (`slug`, `precio`, `imagenes`, `atributos`, `stock`) | datos | ficha, sitemap, `llms.txt` | Sí si cambia un campo; mismo repo |
| `SITE_URL` | configuración | canonical, sitemap, robots, JSON-LD, Open Graph | No |

## Orden de despliegue y rollback
| # | Fase | Contenido |
|---|---|---|
| 1 | `pagina-producto` (implementada) | Ruta `/producto/<slug>`, 404 real, migas, tabla, aviso, enlaces de header/footer/cards |
| 2 | `seo-buscadores` (implementada) | `SITE_URL`, meta, canonical, Open Graph/Twitter, JSON-LD, `sitemap.xml`, `robots.txt`, verificador |
| 3 | `seo-ia` (implementada) | Rastreadores de IA en `robots.txt`, `llms.txt`, HTML semántico |

Rollback: revertir commits por fase. No hay despliegue todavía (host: Q-05).

## Preguntas abiertas
- URL pública real del sitio (`SITE_URL`) y si hay dominio (Q-09).
- Datos de la organización (nombre legal, contacto, logo) para un JSON-LD `Organization`: no se incluye hasta tener datos reales.
- Si las páginas de producto se pregeneran en el build o se renderizan por pedido depende del host (Q-05); se pregeneran las 12 fichas y los archivos de SEO. La home no (Q-21).
- Validar los datos estructurados con las herramientas de Google y dar de alta el sitio (Q-22, Q-09).
- Confirmar los nombres de los rastreadores de IA (Q-20).
- Alta en Search Console y quién la administra (Q-09).
