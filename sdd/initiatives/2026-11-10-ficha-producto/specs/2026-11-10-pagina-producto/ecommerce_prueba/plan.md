# Plan: Página de producto

- **Spec:** [spec.md](spec.md)
- **Fecha:** 2026-11-10


## Enfoque
Ruta dinámica `app/pages/producto/[slug].vue` que busca el producto en el catálogo (solo activos) y, si no existe, lanza un error 404 fatal para que el servidor responda con el código correcto. Una página `app/error.vue` en la línea visual Mostrador atiende los errores. Las páginas de los productos se pregeneran en el build (Nitro `prerender`) a partir del catálogo, y siguen disponibles por pedido si el host corre Node. `[PROPUESTA]`

Para que el servidor, el sitemap y las pruebas usen el mismo código, los tipos y las utilidades puras pasan a `shared/` (carpeta compartida de Nuxt 4).

**Alternativas descartadas:**
- *Modal o panel en la landing:* no tiene URL propia, así que no se puede indexar ni compartir.
- *Una página estática por producto escrita a mano:* se desactualiza con el JSON.
- *Solo SSR por pedido sin pregenerar:* funciona, pero depende del host (Q-05); pregenerar da HTML inmediato y no cuesta nada.

## Cambios por capa
- **Producto:** diseño de la ficha (ver spec); textos en español rioplatense.
- **Front (Nuxt + PrimeVue):** `app/pages/producto/[slug].vue`, `app/error.vue`, componentes `BreadcrumbNav.vue` y `ProductSpecs.vue`; `ProductCard` pasa a `NuxtLink`; `AppHeader`/`AppFooter` enlazan a `/#id`; `Tag` de PrimeVue para descuento y stock.
- **Compartido (`shared/`):** `shared/types/catalogo.ts` (movido desde `app/types/`), `shared/utils/{formatPrecio,calcularDescuento,nombreCategoria,catalogo}.ts` (las tres primeras, movidas desde `app/utils/`; `catalogo.ts` con `productosActivos`, `buscarProducto`, `carruselesVisibles`).
- **Server routes de Nuxt (Nitro):** Sin cambios en esta fase (el sitemap y robots llegan en la fase 2).
- **Pagos (Mercado Pago):** Sin cambios.
- **Mails:** Sin cambios.
- **SEO:** Sin cambios (fase 2); solo `<html lang="es-AR">` ya existente y un `<h1>` único por página.
- **Data:** Sin cambios en el JSON. `nuxt.config.ts` calcula las rutas a pregenerar leyendo el catálogo.
- **DB:** no aplica a este repo (C-02). No hay migraciones.
- **Infra:** Sin cambios (host: Q-05).
- **Observabilidad:** Sin cambios.

## Verificación de constraints
| Constraint | ¿Aplica? | Cómo se cumple |
|---|---|---|
| C-01 (SSR) | Sí | La ficha se renderiza en el servidor; 404 real con `createError({{ fatal: true }})`. Se prueba con `curl`. |
| C-02 (sin backend ni DB) | Sí | Datos desde el JSON; sin servicios nuevos. |
| C-03 (Mercado Pago) | No | Sin compra ni pagos en esta fase. |
| C-04 (PrimeVue) | Sí | `Tag` y `Button` de PrimeVue con el preset Mostrador. |
| C-05 | Sin definir | `<pendiente>`. |

## Testing
- `node:test` para `shared/utils/catalogo.ts` (activos, búsqueda por slug, slug inexistente, inactivos, carruseles) y para las utilidades movidas (los tests existentes cambian de ruta).
- Verificación en vivo: `curl` de cada producto (200) y de un slug falso (404); mediciones con Chrome DevTools Protocol en 390 y 1440 px (desborde, imagen elegida, consola).

## Feature flag
No aplica.

## Rollout
Merge a la rama que se defina (Q-11). Sin despliegue.

## Rollback
Revertir el commit; la landing queda como estaba (las cards vuelven al `<a>`).

## Riesgos
- Mover tipos y utilidades a `shared/` rompe imports. Mitigación: tests y build tras el cambio.
- El prerender usa la variable de entorno al construir: las URLs absolutas se fijan en el build (fase 2).
- Lector de pantalla y teclado no se prueban de forma real; se revisa el código y el HTML.

## Cambios respecto del plan original (implementación, 2026-11-10)
- Se agregó un **layout** (`app/layouts/default.vue`) con el header, `<main id="contenido">` y el footer, y `app/app.vue` usa `<NuxtLayout>`. Así la home, la ficha y la página de error comparten estructura sin repetirla. `[VERIFICADO]` `app/layouts/default.vue`
- `etiquetaAtributo` (capitaliza las claves de `atributos`) vive en `shared/utils/catalogo.ts` porque la usan la ficha y el JSON-LD. `[VERIFICADO]`
- **La home no se pregenera.** Al incluir `/` en `nitro.prerender.routes` el build falló con `[unstorage] Invalid key: "/"` (limitación de Nuxt 4.4.5 con la ruta raíz). Se pregeneran las 12 fichas y, desde las fases siguientes, `sitemap.xml`, `robots.txt` y `llms.txt`; la home se sigue sirviendo por pedido. `[VERIFICADO]` `npm run build`; ver Q-21.
- Las migas llevan el separador al final de cada ítem (en mobile, al cortarse en dos líneas, el separador quedaba huérfano al inicio). `[VERIFICADO]` captura a 390 px.

## Resultados de verificación
- 12 fichas responden 200 con un único `<h1>`; un slug falso, uno con mayúsculas y uno inactivo responden **404** (código HTTP real) con página propia y `noindex`. `[VERIFICADO]` `curl` sobre el build.
- La home enlaza a las 12 fichas con `NuxtLink`; desde la ficha, el menú y el pie llevan a `/#<sección>`. `[VERIFICADO]`
- 390 px y 1440 px: sin desborde horizontal, imagen `mobile` o `desktop` según el ancho, 0 imágenes no `.webp`, 0 sin dimensiones, consola sin errores. `[VERIFICADO]` Chrome DevTools Protocol.
- `npm test`: 29 tests en esta fase (8 nuevos de `shared/utils/catalogo.ts`). `[VERIFICADO]`
- No verificado: teclado y lector de pantalla reales.
