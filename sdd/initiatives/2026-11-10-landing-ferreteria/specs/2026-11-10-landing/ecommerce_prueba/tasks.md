# Tareas: Landing de ferretería (header, hero, carruseles, footer)

**Spec:** [spec.md](spec.md) · **Plan:** [plan.md](plan.md) · **Estado general:** terminada   <!-- pendiente | en curso | terminada -->

> Spec `aprobada` el 2026-11-10. Depende de las fases 1 y 2.

| ID | Tarea | Capa | Depende de | Estado |
|---|---|---|---|---|
| T01 | Utilidades `formatPrecio` y `calcularDescuento` | Front | fases 1 y 2 | [x] |
| T02 | Composable `useCatalogo` (activos, orden, carruseles visibles) | Front | T01 | [x] |
| T03 | Placeholders `.webp` del hero (mobile y desktop) | Data | fase 1 | [x] |
| T04 | `ProductCard` | Front | T01 | [x] |
| T05 | `ProductCarousel` (PrimeVue Carousel, mobile con scroll-snap) | Front | T02, T04 | [x] |
| T06 | `AppHeader` y `AppFooter` | Front | T02 | [x] |
| T07 | `HeroBanner` con `<picture>` | Front | T03 | [x] |
| T08 | Página `index.vue` que arma todo | Front | T05, T06, T07 | [x] |
| T09 | Tests de utilidades | Tests | T01 | [x] |
| T10 | Verificación (SSR, 390 px, 1440 px, teclado, imágenes `.webp`) | Tests | T08, T09 | [x] |
| T11 | Actualizar documentos permanentes (glosario, arquitectura) | Docs | T10 | [x] |

Server routes, Pagos, Mails, Infra y Observabilidad: **sin cambios**. DB: no aplica a este repo.

## Detalle

### T01 — Utilidades
- **Capa:** Front
- **Descripción:** `formatPrecio(n)` → `$ 89.900` con `es-AR` y ARS sin decimales; `calcularDescuento(precio, precioAnterior)` → entero o `null`.
- **Criterio de hecho (verificable):** tests de T09 pasan.
- **Constraints aplicables:** ninguna
- **Archivos probables:** `app/utils/formatPrecio.ts`, `app/utils/calcularDescuento.ts`
- **Depende de:** fases 1 y 2

### T02 — Composable
- **Capa:** Front
- **Descripción:** Importa `data/catalogo.json`, filtra `activo`, resuelve ids de cada carrusel, descarta carruseles vacíos y conserva el orden del JSON.
- **Criterio de hecho (verificable):** devuelve los 3 carruseles en orden para el catálogo de la fase 1.
- **Constraints aplicables:** C-02
- **Archivos probables:** `app/composables/useCatalogo.ts`
- **Depende de:** T01

### T03 — Hero `.webp`
- **Capa:** Data
- **Descripción:** Extender `scripts/generar-placeholders.mjs` para producir `public/img/hero-mobile.webp` y `hero-desktop.webp`.
- **Criterio de hecho (verificable):** ambos archivos existen y son WebP.
- **Constraints aplicables:** ninguna
- **Archivos probables:** `scripts/generar-placeholders.mjs`, `public/img/hero-*.webp`
- **Depende de:** fase 1

### T04 — ProductCard
- **Capa:** Front
- **Descripción:** Imagen `card` (`width`/`height`, lazy), nombre, precio, tachado y % si hay descuento, etiqueta "Sin stock"; enlace a `/producto/<slug>`.
- **Criterio de hecho (verificable):** se ve bien con los 3 casos: normal, con descuento y sin stock.
- **Constraints aplicables:** C-04
- **Archivos probables:** `app/components/ProductCard.vue`
- **Depende de:** T01

### T05 — ProductCarousel
- **Capa:** Front
- **Descripción:** Título del carrusel + `Carousel` de PrimeVue; mobile deslizable (scroll-snap) y desktop con flechas. Si no rinde en SSR, plan B documentado en ADR.
- **Criterio de hecho (verificable):** sin errores de hidratación; navegable con teclado.
- **Constraints aplicables:** C-01, C-04
- **Archivos probables:** `app/components/ProductCarousel.vue`
- **Depende de:** T02, T04

### T06 — Header y footer
- **Capa:** Front
- **Descripción:** Header con nombre de tienda y anclas a los carruseles visibles; footer con textos provisorios. Sin carrito.
- **Criterio de hecho (verificable):** las anclas llevan a cada carrusel; compacto en mobile.
- **Constraints aplicables:** C-04
- **Archivos probables:** `app/components/AppHeader.vue`, `app/components/AppFooter.vue`
- **Depende de:** T02

### T07 — Hero
- **Capa:** Front
- **Descripción:** `<picture>` con dos `.webp` por media query; layout apilado en mobile y dos columnas en desktop; imagen con `fetchpriority="high"`.
- **Criterio de hecho (verificable):** se descarga solo la imagen del formato activo.
- **Constraints aplicables:** C-04
- **Archivos probables:** `app/components/HeroBanner.vue`
- **Depende de:** T03

### T08 — Página
- **Capa:** Front
- **Descripción:** `index.vue` compone header, hero, un `ProductCarousel` por carrusel visible y footer; `useSeoMeta` provisorio.
- **Criterio de hecho (verificable):** `curl /` muestra los tres títulos de carrusel.
- **Constraints aplicables:** C-01, C-02
- **Archivos probables:** `app/pages/index.vue`
- **Depende de:** T05, T06, T07

### T09 — Tests de utilidades
- **Capa:** Tests
- **Descripción:** Casos de `formatPrecio` y `calcularDescuento`: sin descuento, descuento exacto, redondeo, `precioAnterior` ≤ `precio`.
- **Criterio de hecho (verificable):** los tests pasan.
- **Constraints aplicables:** ninguna
- **Archivos probables:** `app/utils/*.test.ts` o `tests/`
- **Depende de:** T01

### T10 — Verificación
- **Capa:** Tests
- **Descripción:** `curl` de `/`; revisión a 390 px y 1440 px; teclado; todas las imágenes `.webp`; Lighthouse móvil informativo.
- **Criterio de hecho (verificable):** checklist de la spec cumplido; resultados anotados.
- **Constraints aplicables:** C-01, C-02, C-04
- **Archivos probables:** —
- **Depende de:** T08, T09

### T11 — Documentos permanentes
- **Capa:** Docs
- **Descripción:** Glosario con términos reales (producto, carrusel, card, hero), arquitectura de `app/`, y preguntas respondidas.
- **Criterio de hecho (verificable):** documentos con etiquetas y rutas existentes.
- **Constraints aplicables:** ninguna
- **Archivos probables:** `applications/ecommerce_prueba/domain-glossary.md`, `applications/ecommerce_prueba/architecture.md`
- **Depende de:** T10

## Reglas

- Todas las capas que el `plan.md` marca como impactadas tienen tareas. Las que no aplican se dicen explícitamente: "Infra: sin cambios".
- Tareas chicas, completables en un PR acotado. Si una tarea no entra en un PR, es dos tareas.
- Ordenadas por dependencia. Deploy, monitoreo y rollback al final.
- Siempre hay tareas de tests (o de verificación manual si la app no tiene tests). Si aplica, también de feature flag y de eventos de analytics.
- Una tarea no está terminada si viola alguna constraint.
- Al implementar: marcar `[x]` y actualizar el estado general. Si cambia algo respecto de la spec, se actualiza la spec en el mismo trabajo.

## Checklist de cierre
- [x] Tests pasando (utilidades) y `npm run build` en verde
- [ ] PR mergeado a la rama siguiente (`<pendiente: flujo de ramas>`)
- [ ] Desplegado y probado en el primer ambiente: **no aplica** (se ve en local; host en fase 4)
- [ ] Pago probado con Mercado Pago sandbox: **no aplica**
- [ ] Credenciales productivas: **no aplica**
- [ ] Feature flag: **no aplica**
- [x] Métricas observadas: Lighthouse móvil informativo
- [x] Spec actualizada si algo cambió
