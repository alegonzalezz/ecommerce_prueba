# Tareas: Página de producto

**Spec:** [spec.md](spec.md) · **Plan:** [plan.md](plan.md) · **Estado general:** terminada   <!-- pendiente | en curso | terminada -->

> Spec `aprobada` el 2026-11-10.

| ID | Tarea | Capa | Depende de | Estado |
|---|---|---|---|---|
| T01 | Mover tipos y utilidades a `shared/` y agregar funciones puras del catálogo | Compartido | — | [x] |
| T02 | Tests de `shared/utils/catalogo.ts` y actualizar rutas de los tests existentes | Tests | T01 | [x] |
| T03 | Componentes `BreadcrumbNav` y `ProductSpecs` | Front | T01 | [x] |
| T04 | Página `app/pages/producto/[slug].vue` con 404 real | Front | T01, T03 | [x] |
| T05 | `app/error.vue` amable en la línea Mostrador | Front | T01 | [x] |
| T06 | `NuxtLink` en cards y enlaces `/#id` en header y footer | Front | T04 | [x] |
| T07 | Pregenerar las páginas de producto en el build | Front | T04 | [x] |
| T08 | Verificación: `curl` 200/404, 390 px y 1440 px, desborde, consola, `npm test`, `npm run build` | Tests | T05, T06, T07 | [x] |
| T09 | Documentos permanentes (arquitectura, glosario, convenciones) | Docs | T08 | [x] |

Server routes, Pagos, Mails, SEO, Infra y Observabilidad: **sin cambios**. DB: no aplica a este repo.

## Detalle


### T01 — `shared/`
- **Capa:** Compartido
- **Descripción:** Mover `app/types/catalogo.ts` a `shared/types/` y `app/utils/{formatPrecio,calcularDescuento,nombreCategoria}.ts` a `shared/utils/`. Agregar `shared/utils/catalogo.ts` con `productosActivos`, `buscarProducto`, `carruselesVisibles`. `useCatalogo` usa esas funciones.
- **Criterio de hecho (verificable):** la landing se ve igual y `npm run build` pasa.
- **Constraints aplicables:** C-01, C-02
- **Archivos probables:** `shared/types/catalogo.ts`, `shared/utils/*.ts`, `app/composables/useCatalogo.ts`
- **Depende de:** —

### T02 — Tests
- **Capa:** Tests
- **Descripción:** Tests de las funciones nuevas; actualizar las rutas de importación de `tests/utils.test.mjs`.
- **Criterio de hecho (verificable):** `npm test` en verde.
- **Constraints aplicables:** ninguna
- **Archivos probables:** `tests/catalogo.test.mjs`, `tests/utils.test.mjs`
- **Depende de:** T01

### T03 — Componentes
- **Capa:** Front
- **Descripción:** `BreadcrumbNav` (`<nav aria-label>` con lista ordenada, `aria-current="page"` en el último) y `ProductSpecs` (`<table>` con encabezados de fila).
- **Criterio de hecho (verificable):** se renderizan con y sin atributos.
- **Constraints aplicables:** C-04
- **Archivos probables:** `app/components/BreadcrumbNav.vue`, `app/components/ProductSpecs.vue`
- **Depende de:** T01

### T04 — Página de producto
- **Capa:** Front
- **Descripción:** Ruta `/producto/[slug]` con imagen por formato (`<picture>`), datos, aviso, y `createError` 404 fatal.
- **Criterio de hecho (verificable):** `curl -i` devuelve 200 para un producto y 404 para uno falso.
- **Constraints aplicables:** C-01, C-04
- **Archivos probables:** `app/pages/producto/[slug].vue`
- **Depende de:** T01, T03

### T05 — Página de error
- **Capa:** Front
- **Descripción:** `error.vue` con header, mensaje claro y enlace al inicio; `noindex`.
- **Criterio de hecho (verificable):** el 404 muestra la página propia con código 404.
- **Constraints aplicables:** C-04
- **Archivos probables:** `app/error.vue`
- **Depende de:** T01

### T06 — Enlaces
- **Capa:** Front
- **Descripción:** `ProductCard` con `NuxtLink`; header y footer con `/#id`.
- **Criterio de hecho (verificable):** desde la ficha, el menú lleva a la sección de la home.
- **Constraints aplicables:** ninguna
- **Archivos probables:** `app/components/{ProductCard,AppHeader,AppFooter}.vue`
- **Depende de:** T04

### T07 — Prerender
- **Capa:** Front
- **Descripción:** `nitro.prerender.routes` a partir de los productos activos del catálogo.
- **Criterio de hecho (verificable):** `.output/public/producto/<slug>/index.html` existe para cada producto activo.
- **Constraints aplicables:** C-01
- **Archivos probables:** `nuxt.config.ts`
- **Depende de:** T04

### T08 — Verificación
- **Capa:** Tests
- **Descripción:** `curl` de todos los productos y de un slug falso; mediciones en 390 y 1440 px.
- **Criterio de hecho (verificable):** 12 respuestas 200, 1 respuesta 404, sin desborde, consola limpia.
- **Constraints aplicables:** C-01, C-02, C-04
- **Archivos probables:** —
- **Depende de:** T05, T06, T07

### T09 — Documentos permanentes
- **Capa:** Docs
- **Descripción:** Actualizar arquitectura, glosario y convenciones.
- **Criterio de hecho (verificable):** los documentos citan rutas existentes.
- **Constraints aplicables:** ninguna
- **Archivos probables:** `applications/ecommerce_prueba/{architecture,domain-glossary,conventions}.md`
- **Depende de:** T08


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
