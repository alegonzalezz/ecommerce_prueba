# Plan: SEO para buscadores

- **Spec:** [spec.md](spec.md)
- **Fecha:** 2026-11-10


## Enfoque
Funciones puras en `shared/utils/seo.ts` que reciben el catálogo y la URL base y devuelven título, descripción, JSON-LD, sitemap y robots. Las páginas las usan con `useSeoMeta` y `useHead`; el sitemap y robots son server routes de Nitro (dentro de este repo, C-02) que también se pregeneran. La URL base sale de `runtimeConfig.public.siteUrl` (variable `NUXT_PUBLIC_SITE_URL`). Un script `scripts/verificar-seo.mjs` comprueba cada ficha contra un servidor en marcha. `[PROPUESTA]`

**Alternativas descartadas:**
- *Módulo `@nuxtjs/seo`:* suma dependencias y comportamiento que no controlamos para algo que son ~150 líneas.
- *Microdatos en el HTML:* duplicarían el JSON-LD y se desincronizan.
- *`lastmod` desde `fechaAlta`:* no es la fecha de modificación; se omite para no mentir.

## Cambios por capa
- **Producto:** redacción de la descripción meta a partir de `descripcionCorta`, marca y precio.
- **Front (Nuxt + PrimeVue):** `useSeoMeta`/`useHead` en `app/pages/producto/[slug].vue` y `app/pages/index.vue`; precarga de la imagen principal con `media`.
- **Compartido (`shared/`):** `shared/utils/seo.ts` con `urlAbsoluta`, `tituloProducto`, `descripcionMeta`, `jsonLdProducto`, `jsonLdMigas`, `jsonLdSitio`, `generarSitemap`, `generarRobots`.
- **Server routes de Nuxt (Nitro):** `server/routes/sitemap.xml.ts` y `server/routes/robots.txt.ts`.
- **Pagos (Mercado Pago):** Sin cambios.
- **Mails:** Sin cambios.
- **SEO:** esta fase.
- **Data:** Sin cambios en el JSON.
- **DB:** no aplica a este repo (C-02). No hay migraciones.
- **Infra:** variable de entorno `NUXT_PUBLIC_SITE_URL` (documentada en `.env.example`); el host la define (Q-05).
- **Observabilidad:** `scripts/verificar-seo.mjs` (comando `npm run verificar:seo`).

## Verificación de constraints
| Constraint | ¿Aplica? | Cómo se cumple |
|---|---|---|
| C-01 (SSR) | Sí | Meta y JSON-LD se generan en el servidor; el verificador mira el HTML sin ejecutar JavaScript. |
| C-02 (sin backend ni DB) | Sí | Server routes dentro del mismo repo; sin servicios ni base de datos. |
| C-03 (Mercado Pago) | No | Sin compra ni pagos en esta fase. |
| C-04 (PrimeVue) | No | Sin cambios de UI. |
| C-05 | Sin definir | `<pendiente>`. |

## Testing
- `node:test` para cada función de `seo.ts`: JSON-LD (campos, disponibilidad, escape), sitemap (activos, URL absoluta), robots (línea `Sitemap`).
- `scripts/verificar-seo.mjs` contra el servidor: 12 fichas.
- Lighthouse móvil sobre una ficha (build, con gzip).

## Feature flag
No aplica.

## Rollout
Merge a la rama que se defina (Q-11). Al desplegar, construir con `NUXT_PUBLIC_SITE_URL` real.

## Rollback
Revertir el commit; las fichas siguen funcionando sin meta específica.

## Riesgos
- Construir con la URL provisoria y publicar así: las URLs absolutas apuntarían a localhost. Mitigación: el verificador avisa si `SITE_URL` es localhost; documentado en Q-09.
- Google puede ignorar los datos estructurados si no coinciden con lo visible. Mitigación: la prueba compara precio y disponibilidad.

## Cambios respecto del plan original (implementación, 2026-11-10)
- Además de lo previsto, la ficha declara `og:type=product` y `product:price:amount`, `product:price:currency` y `product:availability`. `[VERIFICADO]` `app/pages/producto/[slug].vue`
- `scripts/verificar-seo.mjs` también comprueba que el precio, la disponibilidad, el SKU y la marca del JSON-LD **se vean** en la página, que los títulos y descripciones no se repitan, y que los slugs inactivos o inexistentes den 404. `[VERIFICADO]`
- Dos falsos positivos del propio verificador, corregidos: comparaba el `<title>` sin decodificar entidades HTML (la canilla "1/2\"" salía como `&quot;`) y avisaba por la URL del servidor en vez de por el `canonical`.
- Se comprobó que el verificador **falla** contra un servidor deliberadamente roto (dos `<h1>`, sin canonical, sin JSON-LD, robots que bloquea todo).

## Resultados de verificación
- `npm run verificar:seo` sobre el build: 12 fichas, home, sitemap y robots correctos. `[VERIFICADO]`
- Construido con `NUXT_PUBLIC_SITE_URL=https://ferreteria.example/` (con barra final): `canonical`, `og:*`, JSON-LD, sitemap y robots usan `https://ferreteria.example`. `[VERIFICADO]`
- Lighthouse móvil sobre una ficha (build, gzip, Lighthouse 13.6.0): Performance 97-98, Accesibilidad 100, Mejores prácticas 100, **SEO 100**, CLS 0, LCP 2,4-2,6 s. `[VERIFICADO]`
- `npm test`: 47 tests en esta fase. `[VERIFICADO]`
- **No verificado:** que los datos estructurados cumplan los requisitos de Google para resultados enriquecidos (no se usó la Prueba de resultados enriquecidos ni Search Console), ni la indexación real. `<pendiente>` ver Q-22.
