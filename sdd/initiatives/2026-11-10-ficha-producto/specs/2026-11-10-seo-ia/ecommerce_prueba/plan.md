# Plan: SEO para asistentes de IA

- **Spec:** [spec.md](spec.md)
- **Fecha:** 2026-11-10


## Enfoque
Se extienden `generarRobots` y se agrega `generarLlms` en `shared/utils/seo.ts`; el server route `server/routes/llms.txt.ts` lo sirve y se pregenera. La lista de rastreadores es una constante en un solo lugar. La ficha ya es HTML semántico; esta fase lo revisa y lo mide. `[PROPUESTA]`

**Alternativas descartadas:**
- *Bloquear los rastreadores de entrenamiento:* el usuario eligió permitirlos todos (más visibilidad; los textos pueden usarse para entrenar).
- *Páginas `.md` por producto:* sin evidencia de que aporten; fuera de alcance.

## Cambios por capa
- **Producto:** descripción de la tienda para el resumen de `llms.txt` (provisoria).
- **Front (Nuxt + PrimeVue):** revisión de encabezados y `alt` en la ficha; sin cambios visuales.
- **Compartido (`shared/utils/seo.ts`):** `RASTREADORES_IA`, `generarRobots` extendido, `generarLlms`.
- **Server routes de Nuxt (Nitro):** `server/routes/llms.txt.ts` y su pregenerado.
- **Pagos (Mercado Pago):** Sin cambios.
- **Mails:** Sin cambios.
- **SEO:** esta fase.
- **Data:** Sin cambios en el JSON.
- **DB:** no aplica a este repo (C-02). No hay migraciones.
- **Infra:** Sin cambios.
- **Observabilidad:** `verificar-seo.mjs` revisa robots y llms.

## Verificación de constraints
| Constraint | ¿Aplica? | Cómo se cumple |
|---|---|---|
| C-01 (SSR) | Sí | Todo se genera en el servidor y se pregenera. |
| C-02 (sin backend ni DB) | Sí | Server routes dentro del mismo repo. |
| C-03 (Mercado Pago) | No | Sin compra ni pagos en esta fase. |
| C-04 (PrimeVue) | No | Sin cambios de UI. |
| C-05 | Sin definir | `<pendiente>`. |

## Testing
- `node:test`: `generarRobots` incluye cada rastreador y la línea `Sitemap`; `generarLlms` incluye solo activos, con URLs absolutas y agrupados por categoría.
- Verificador en vivo y Lighthouse (Accesibilidad y SEO) sobre una ficha.

## Feature flag
No aplica.

## Rollout
Merge a la rama que se defina (Q-11).

## Rollback
Revertir el commit.

## Riesgos
- Que un nombre de rastreador sea incorrecto o cambie. Mitigación: lista en una constante y pregunta abierta para confirmarla.
- Expectativas: `llms.txt` y `robots.txt` no aseguran citas. Mitigación: se documenta.

## Cambios respecto del plan original (implementación, 2026-11-10)
- Los datos de la tienda (nombre, eslogan, descripción) pasaron a `shared/utils/tienda.ts` (`TIENDA`) para que la ruta de servidor de `llms.txt` pueda leerlos. `app/app.config.ts` los toma de ahí con el alias `#shared`: un import relativo rompía el build (`Could not resolve "../shared/utils/tienda.ts"`). `[VERIFICADO]`
- `llms.txt` incluye precio y disponibilidad de cada producto, además de la descripción corta. `[VERIFICADO]` `shared/utils/seo.ts` (`generarLlms`)
- Revisión del HTML semántico: sin cambios necesarios, ya cumplía (un `h1`, `h2` por sección, `<table>` con `<caption>` y `th scope="row"`, `alt` en la imagen principal). `[VERIFICADO]` `app/pages/producto/[slug].vue`, `app/components/ProductSpecs.vue`

## Resultados de verificación
- `npm run verificar:seo` sobre el build: 12 fichas, home, sitemap, robots (con **10 rastreadores de IA**) y `llms.txt` correctos; falla contra un servidor roto. `[VERIFICADO]`
- Lighthouse móvil (build, gzip): ficha Performance 98, home 96; Accesibilidad, Mejores prácticas y SEO 100 en ambas. `[VERIFICADO]`
- `npm test`: 55 tests en total. `[VERIFICADO]`
- **No verificable desde acá:** que ChatGPT, Gemini, Claude o Perplexity indexen o citen el sitio, ni que usen `llms.txt`. Los nombres de los rastreadores salen de guías de terceros: confirmarlos contra cada proveedor (Q-20). `[INFERIDO]`
