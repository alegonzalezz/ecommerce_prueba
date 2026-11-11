# Tareas: SEO para asistentes de IA

**Spec:** [spec.md](spec.md) · **Plan:** [plan.md](plan.md) · **Estado general:** terminada   <!-- pendiente | en curso | terminada -->

> Spec `aprobada` el 2026-11-10.

| ID | Tarea | Capa | Depende de | Estado |
|---|---|---|---|---|
| T01 | `RASTREADORES_IA` y `generarRobots` extendido, con tests | Compartido / Tests | — | [x] |
| T02 | `generarLlms` y `server/routes/llms.txt.ts`, con tests | Server / Tests | T01 | [x] |
| T03 | Revisión de encabezados, tabla y `alt` de la ficha | Front | — | [x] |
| T04 | Extender `verificar-seo.mjs` a robots y llms | Observabilidad | T01, T02 | [x] |
| T05 | Verificación: verificador, Lighthouse Accesibilidad/SEO, `npm test`, `npm run build` | Tests | T02, T03, T04 | [x] |
| T06 | Documentos permanentes y preguntas abiertas | Docs | T05 | [x] |

Pagos, Mails e Infra: **sin cambios**. DB: no aplica a este repo.

## Detalle


### T01 — Rastreadores en robots
- **Capa:** Compartido / Tests
- **Descripción:** Constante `RASTREADORES_IA` y `generarRobots` con un bloque `Allow: /` por cada uno.
- **Criterio de hecho (verificable):** el test comprueba cada nombre y la línea `Sitemap`.
- **Constraints aplicables:** C-02
- **Archivos probables:** `shared/utils/seo.ts`, `tests/seo.test.mjs`
- **Depende de:** —

### T02 — `llms.txt`
- **Capa:** Server / Tests
- **Descripción:** `generarLlms` (formato llmstxt.org, agrupado por categoría, solo activos, URLs absolutas) y su server route pregenerada.
- **Criterio de hecho (verificable):** `/llms.txt` lista los 12 productos con enlaces absolutos.
- **Constraints aplicables:** C-02
- **Archivos probables:** `shared/utils/seo.ts`, `server/routes/llms.txt.ts`, `nuxt.config.ts`
- **Depende de:** T01

### T03 — HTML semántico
- **Capa:** Front
- **Descripción:** Revisar la ficha: un `h1`, `h2` por sección, tabla con `th scope="row"`, `alt` descriptivo en la imagen principal.
- **Criterio de hecho (verificable):** el verificador confirma un único `h1`; Lighthouse Accesibilidad 100.
- **Constraints aplicables:** C-01
- **Archivos probables:** `app/pages/producto/[slug].vue`, `app/components/ProductSpecs.vue`
- **Depende de:** —

### T04 — Verificador
- **Capa:** Observabilidad
- **Descripción:** El verificador comprueba robots (rastreadores y sitemap) y llms (formato y productos).
- **Criterio de hecho (verificable):** pasa con el catálogo real y falla si falta un rastreador o un producto.
- **Constraints aplicables:** ninguna
- **Archivos probables:** `scripts/verificar-seo.mjs`
- **Depende de:** T01, T02

### T05 — Verificación
- **Capa:** Tests
- **Descripción:** Correr verificador, Lighthouse y la suite.
- **Criterio de hecho (verificable):** todo en verde.
- **Constraints aplicables:** C-01, C-02
- **Archivos probables:** —
- **Depende de:** T02, T03, T04

### T06 — Documentos permanentes
- **Capa:** Docs
- **Descripción:** Actualizar arquitectura, integraciones, y registrar la pregunta de confirmar los rastreadores.
- **Criterio de hecho (verificable):** los documentos citan rutas existentes.
- **Constraints aplicables:** ninguna
- **Archivos probables:** `applications/ecommerce_prueba/{architecture,integrations,open-questions}.md`
- **Depende de:** T05


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
