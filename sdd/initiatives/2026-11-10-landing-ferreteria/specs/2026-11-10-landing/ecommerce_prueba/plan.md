# Plan: Landing de ferretería (header, hero, carruseles, footer)

- **Spec:** [spec.md](spec.md)
- **Fecha:** 2026-11-10

## Enfoque
Una sola página `app/pages/index.vue` que lee el catálogo en el servidor (SSR) y arma la landing con componentes chicos. El orden de los carruseles viene del JSON. Dos formatos con CSS responsive (no dos sitios): el layout cambia por breakpoint y el hero usa `<picture>` con dos `.webp`. `[PROPUESTA]`

Piezas: `AppHeader`, `HeroBanner`, `ProductCarousel` (+ `ProductCard`), `AppFooter`, composable `useCatalogo`, utilidades `formatPrecio` y `calcularDescuento`.

**Alternativas descartadas:**
- *Dos páginas, una por dispositivo:* duplica mantenimiento y complica SEO. Se usa un layout responsive.
- *Detectar el dispositivo en el servidor (User-Agent):* frágil y mal para caché. Descartado.
- *`Carousel` de PrimeVue:* era la preferencia inicial; se descartó (ver ADR-001).

## Cambios por capa
- **Producto:** textos provisorios del hero y del footer en español rioplatense; nombre de tienda desde `app.config`.
- **Front (Nuxt + PrimeVue):** `app/pages/index.vue`, `app/components/{AppHeader,HeroBanner,ProductCarousel,ProductCard,AppFooter}.vue`, `app/composables/useCatalogo.ts`, `app/utils/{formatPrecio,calcularDescuento}.ts`, estilos del tema. Rendimiento: imágenes con `width`/`height`, `loading="lazy"` salvo el hero, `fetchpriority="high"` en la imagen del hero.
- **Server routes de Nuxt (Nitro):** Sin cambios (el catálogo se importa en tiempo de build/SSR; no hay endpoint).
- **Pagos (Mercado Pago):** Sin cambios.
- **Mails:** Sin cambios.
- **SEO:** `title` y `description` provisorios; sin datos estructurados (fase 4).
- **Data:** 2 placeholders `.webp` del hero (`public/img/hero-mobile.webp`, `public/img/hero-desktop.webp`), generados con el mismo script de la fase 1.
- **DB:** no aplica a este repo (C-02). No hay migraciones.
- **Infra:** Sin cambios.
- **Observabilidad:** Sin cambios.

## Verificación de constraints
| Constraint | ¿Aplica? | Cómo se cumple |
|---|---|---|
| C-01 (SSR) | Sí | El HTML de `/` viene con los carruseles renderizados; se prueba con `curl`. |
| C-02 (sin backend ni DB) | Sí | Datos desde un JSON del repo; sin llamadas a servicios propios. |
| C-03 (Mercado Pago) | No | Sin checkout. |
| C-04 (PrimeVue) | Sí | `Carousel`, `Button`, `Tag` de PrimeVue con el preset Mostrador. |
| C-05 | Sin definir | `<pendiente>`. |

## Testing
- Pruebas unitarias de `formatPrecio` y `calcularDescuento` con `node --test` si no requieren el entorno de Nuxt; si lo requieren, se agrega Vitest como dependencia de desarrollo y se documenta. `[PROPUESTA]`
- Verificación manual en navegador: ancho mobile (390 px) y desktop (1440 px), teclado, SSR por `curl`.
- Lighthouse móvil: medición informativa aquí; el objetivo ≥ 90 se cierra en la fase 4.

## Feature flag
No aplica.

## Rollout
Sin despliegue (fase 4 define host). Se ve en local.

## Rollback
Revertir el commit; fases 1 y 2 quedan intactas.

## Riesgos
- Hidratación de `Carousel` de PrimeVue con SSR. Mitigación: probar temprano; plan B *scroll-snap* propio.
- Peso de la página por fuentes variables. Mitigación: cargar solo los ejes necesarios y precargar la fuente de títulos.
- Que el diseño caiga en lo genérico. Mitigación: respetar la lista "evitar" de la spec y revisar en navegador contra los tokens de Mostrador.

## Cambios respecto del plan original (implementación, 2026-11-10)
- **Carrusel con `scroll-snap` propio** en lugar del `Carousel` de PrimeVue: ese componente calcula los ítems visibles con `window.innerWidth` al montar, lo que choca con el SSR. PrimeVue se sigue usando para `Button` (flechas y CTAs) y `Tag` (descuento y "Sin stock"). `[VERIFICADO]` `node_modules/primevue/carousel/index.mjs:139-145,284-291`; `applications/ecommerce_prueba/decisions/ADR-001-carrusel-scroll-snap.md`.
- Las cards usan un `<a>` común y no `NuxtLink`: el router avisaba por cada enlace a `/producto/<slug>` inexistente. Pasa a `NuxtLink` cuando exista la ficha. `[VERIFICADO]` `app/components/ProductCard.vue`
- Tests de utilidades en `tests/utils.test.mjs` con `node:test` (no hizo falta Vitest): 6 tests. `[VERIFICADO]` `npm test` → 21 en total.
- Bug encontrado y corregido: el texto `.solo-lectores` ("Antes ") con `position:absolute` escapaba del carrusel y ensanchaba la página (1710 px en un viewport de 1440). Se contuvo con `position: relative` en `.card`. `[VERIFICADO]` medición con Chrome DevTools Protocol.
- El enlace del logo ya no lleva `aria-label` (no contenía el texto visible, WCAG 2.5.3). `[VERIFICADO]` Lighthouse `label-content-name-mismatch`.

## Resultados de verificación
- SSR: `curl /` trae los 3 títulos y 137 marcas de card. `[VERIFICADO]`
- Desktop 1440 px y mobile 390 px emulado: sin desborde horizontal, `hero-desktop.webp` / `hero-mobile.webp` según formato, 0 imágenes no `.webp`, 0 sin dimensiones, flechas solo en desktop, consola sin errores. `[VERIFICADO]`
- Lighthouse móvil (build, Lighthouse 13.6.0, simulado): con gzip Performance 95-96, Accesibilidad 100, Mejores prácticas 100, SEO 100, LCP 2,8-3,0 s, CLS 0,002, TBT 10 ms. Sin gzip: Performance 80 (HTML de 204 KB). `[VERIFICADO]` Ver Q-17.
- No verificado: navegación real con teclado (solo revisado el código), ni lectura con un lector de pantalla.
