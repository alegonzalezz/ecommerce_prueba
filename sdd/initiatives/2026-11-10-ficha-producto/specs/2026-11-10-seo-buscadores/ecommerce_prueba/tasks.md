# Tareas: SEO para buscadores

**Spec:** [spec.md](spec.md) · **Plan:** [plan.md](plan.md) · **Estado general:** terminada   <!-- pendiente | en curso | terminada -->

> Spec `aprobada` el 2026-11-10.

| ID | Tarea | Capa | Depende de | Estado |
|---|---|---|---|---|
| T01 | `runtimeConfig.public.siteUrl` y `.env.example` | Infra | — | [x] |
| T02 | Funciones puras de `shared/utils/seo.ts` con sus tests | Compartido / Tests | T01 | [x] |
| T03 | Meta, canonical, Open Graph, Twitter y JSON-LD en la ficha | SEO | T02 | [x] |
| T04 | Meta, canonical, Open Graph y JSON-LD `WebSite` en la home | SEO | T02 | [x] |
| T05 | Server routes `sitemap.xml` y `robots.txt`, y su pregenerado | Server | T02 | [x] |
| T06 | `scripts/verificar-seo.mjs` y `npm run verificar:seo` | Observabilidad | T03, T05 | [x] |
| T07 | Verificación: verificador, Lighthouse SEO, `npm test`, `npm run build` | Tests | T03, T04, T05, T06 | [x] |
| T08 | Documentos permanentes (arquitectura, integraciones, conventions, preguntas) | Docs | T07 | [x] |

Pagos, Mails y Front visual: **sin cambios** de UI. DB: no aplica a este repo.

## Detalle


### T01 — `SITE_URL`
- **Capa:** Infra
- **Descripción:** `runtimeConfig.public.siteUrl` con valor por defecto `http://localhost:3000`; `.env.example` con `NUXT_PUBLIC_SITE_URL`.
- **Criterio de hecho (verificable):** cambiar la variable cambia las URLs absolutas.
- **Constraints aplicables:** C-02
- **Archivos probables:** `nuxt.config.ts`, `.env.example`
- **Depende de:** —

### T02 — Funciones de SEO
- **Capa:** Compartido / Tests
- **Descripción:** Implementar las funciones puras y sus tests (escape de `<` en JSON-LD, normalización de URL, disponibilidad).
- **Criterio de hecho (verificable):** `npm test` en verde.
- **Constraints aplicables:** C-02
- **Archivos probables:** `shared/utils/seo.ts`, `tests/seo.test.mjs`
- **Depende de:** T01

### T03 — Ficha
- **Capa:** SEO
- **Descripción:** Aplicar meta, canonical, Open Graph, Twitter, JSON-LD y precarga de imagen en la ficha.
- **Criterio de hecho (verificable):** el HTML de una ficha trae todas las etiquetas y el JSON-LD se parsea.
- **Constraints aplicables:** C-01
- **Archivos probables:** `app/pages/producto/[slug].vue`
- **Depende de:** T02

### T04 — Home
- **Capa:** SEO
- **Descripción:** Agregar `canonical`, Open Graph y `WebSite` a la home.
- **Criterio de hecho (verificable):** la home tiene `canonical` absoluto y JSON-LD `WebSite`.
- **Constraints aplicables:** C-01
- **Archivos probables:** `app/pages/index.vue`
- **Depende de:** T02

### T05 — Sitemap y robots
- **Capa:** Server
- **Descripción:** Server routes que generan `sitemap.xml` y `robots.txt` desde el catálogo y se pregeneran.
- **Criterio de hecho (verificable):** el sitemap lista la home y 12 productos; robots apunta al sitemap.
- **Constraints aplicables:** C-02
- **Archivos probables:** `server/routes/sitemap.xml.ts`, `server/routes/robots.txt.ts`, `nuxt.config.ts`
- **Depende de:** T02

### T06 — Verificador
- **Capa:** Observabilidad
- **Descripción:** Script que, para cada ficha del catálogo, comprueba 200, un solo `<h1>`, `title` único, `canonical` absoluto, `og:image` absoluta, JSON-LD válido y coherente con el precio visible; y revisa sitemap y robots.
- **Criterio de hecho (verificable):** pasa con el catálogo real y falla si se rompe una condición.
- **Constraints aplicables:** ninguna
- **Archivos probables:** `scripts/verificar-seo.mjs`, `package.json`
- **Depende de:** T03, T05

### T07 — Verificación
- **Capa:** Tests
- **Descripción:** Correr el verificador, Lighthouse móvil sobre una ficha (con gzip) y `npm test`/`npm run build`.
- **Criterio de hecho (verificable):** todo en verde; SEO 100.
- **Constraints aplicables:** C-01, C-02
- **Archivos probables:** —
- **Depende de:** T03, T04, T05, T06

### T08 — Documentos permanentes
- **Capa:** Docs
- **Descripción:** Actualizar arquitectura, integraciones, convenciones y preguntas abiertas (Q-09, `SITE_URL`).
- **Criterio de hecho (verificable):** los documentos citan rutas existentes.
- **Constraints aplicables:** ninguna
- **Archivos probables:** `applications/ecommerce_prueba/{architecture,integrations,conventions,open-questions}.md`
- **Depende de:** T07


## Reglas

- Todas las capas que el `plan.md` marca como impactadas tienen tareas. Las que no aplican se dicen explícitamente: "Infra: sin cambios".
- Tareas chicas, completables en un PR acotado. Si una tarea no entra en un PR, es dos tareas.
- Ordenadas por dependencia. Deploy, monitoreo y rollback al final.
- Siempre hay tareas de tests (o de verificación manual si la app no tiene tests). Si aplica, también de feature flag y de eventos de analytics.
- Una tarea no está terminada si viola alguna constraint.
- Al implementar: marcar `[x]` y actualizar el estado general. Si cambia algo respecto de la spec, se actualiza la spec en el mismo trabajo.

## Checklist de cierre
- [x] Tests pasando (`npm test`) y `npm run build` en verde
- [ ] PR mergeado a la rama siguiente (`<pendiente: flujo de ramas>`)
- [ ] Desplegado y probado en el primer ambiente: **no aplica** (se ve en local; host en Q-05)
- [ ] Pago probado con Mercado Pago sandbox: **no aplica**
- [ ] Credenciales productivas: **no aplica**
- [ ] Feature flag: **no aplica**
- [x] Métricas observadas
- [x] Spec actualizada si algo cambió
