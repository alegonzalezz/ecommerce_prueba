# Arquitectura — ecommerce_prueba

Estado al 2026-11-10: landing, ficha de producto con SEO para buscadores y asistentes de IA, y carrito con productos vistos recordados en el navegador por 2 horas (iniciativas `2026-11-10-landing-ferreteria`, `2026-11-10-ficha-producto` y `2026-11-10-carrito-persistente`, fases 1-3 cada una). Con pago por Mercado Pago en sandbox (probado contra un simulado; falta la prueba con credenciales reales).

## Módulos
| Ruta | Responsabilidad | Evidencia |
|---|---|---|
| `data/catalogo.json`, `data/catalogo.schema.json` | Catálogo (12 productos, 3 carruseles en orden) y su JSON Schema | `[VERIFICADO]` |
| `scripts/validar-catalogo.mjs` | Valida esquema, ids/slugs únicos, carruseles, `con-descuento` e imágenes `.webp` | `[VERIFICADO]` `npm run catalogo:validar` |
| `scripts/generar-placeholders.mjs` | Genera 38 `.webp` de relleno con `sharp` (36 de productos, 2 del hero) | `[VERIFICADO]` |
| `scripts/verificar-seo.mjs` | Revisa SEO de todas las fichas, home, sitemap, robots y `llms.txt` contra un servidor en marcha | `[VERIFICADO]` `npm run verificar:seo` |
| `shared/types/catalogo.ts` | Tipos del catálogo (compartidos por app y servidor) | `[VERIFICADO]` |
| `shared/utils/catalogo.ts` | `productosActivos`, `buscarProducto`, `carruselesVisibles`, `etiquetaAtributo` | `[VERIFICADO]` |
| `shared/utils/seo.ts` | Título, descripción, JSON-LD (`Product`, `BreadcrumbList`, `WebSite`), sitemap, robots, `llms.txt`, lista de rastreadores de IA | `[VERIFICADO]` |
| `shared/utils/{formatPrecio,calcularDescuento,nombreCategoria,tienda}.ts` | Utilidades puras y datos de la tienda (`TIENDA`) | `[VERIFICADO]` |
| `server/routes/{sitemap.xml,robots.txt,llms.txt}.ts` | Rutas de servidor que generan esos archivos desde el catálogo | `[VERIFICADO]` |
| `app/layouts/default.vue` | Header, `<main id="contenido">` y footer compartidos | `[VERIFICADO]` |
| `app/pages/index.vue` | Home: hero y carruseles; meta, canonical, Open Graph y JSON-LD `WebSite` | `[VERIFICADO]` |
| `app/pages/producto/[slug].vue` | Ficha: imagen por formato, datos, descripción, características, aviso; 404 real; meta y JSON-LD | `[VERIFICADO]` |
| `app/error.vue` | Página de error amable (404 y otros), con `noindex` | `[VERIFICADO]` |
| `app/components/*` | `AppHeader`, `AppFooter`, `HeroBanner`, `ProductCarousel`, `ProductCard`, `BreadcrumbNav`, `ProductSpecs` | `[VERIFICADO]` |
| `app/composables/useCatalogo.ts` | Lee el JSON y expone carruseles, categorías y `buscar(slug)` | `[VERIFICADO]` |
| `shared/utils/almacenamiento.ts` | Guardar en `localStorage` con vencimiento (2 h, renovado en cada escritura); no lanza errores si está bloqueado | `[VERIFICADO]` |
| `shared/utils/carrito.ts` | Lógica pura del carrito: agregar, cambiar, quitar, reconciliar con el catálogo, totales, tope por stock y de 10 | `[VERIFICADO]` |
| `shared/utils/vistos.ts` | Lista de los últimos 8 productos vistos, sin repetidos | `[VERIFICADO]` |
| `app/composables/useAlmacenado.ts` | Estado compartido que se lee recién al montar en el navegador; sincroniza pestañas y vuelve a leer al volver a la pestaña | `[VERIFICADO]` |
| `app/composables/{useCarrito,useVistos}.ts` | Conectan la lógica pura con el almacenamiento y el catálogo | `[VERIFICADO]` |
| `app/pages/carrito.vue`, `app/components/CarritoEnlace.vue` | Página `/carrito` (noindex) e ícono con cantidad en el header | `[VERIFICADO]` |
| `shared/utils/{pedido,mercadopago,mercadopago-cliente,limite}.ts` | Pedido recalculado desde el catálogo, cuerpo y estados de la orden de Mercado Pago, cliente `fetch`, limitador por IP | `[VERIFICADO]` |
| `server/api/checkout.post.ts`, `server/api/pago/estado.get.ts` | Crear la orden y devolver la URL de pago; consultar a Mercado Pago el estado real de la compra | `[VERIFICADO]` |
| `app/pages/compra/resultado.vue` | Página de vuelta de Mercado Pago (noindex): verifica el estado y vacía el carrito solo si se aprobó | `[VERIFICADO]` |
| `scripts/mercadopago-simulado.mjs` | Mercado Pago de mentira para probar sin credenciales (`npm run mercadopago:simulado`) | `[VERIFICADO]` |
| `scripts/probar-pago.mjs`, `scripts/probar-pago-navegador.mjs`, `scripts/lib/` | Pruebas de las rutas de pago (74) y del flujo en Chrome (53), con la app construida | `[VERIFICADO]` `npm run probar:pago`, `npm run probar:pago-navegador` |
| `shared/utils/ruta.ts`, `app/composables/useBase.ts` | Prefijan las rutas de imágenes con la subcarpeta de publicación (`app.baseURL`) | `[VERIFICADO]` |
| `.github/workflows/deploy-pages.yml`, `scripts/servir-estatico.mjs`, `scripts/probar-pages.mjs` | Despliegue en Pages, emulador de Pages y prueba de navegador de la versión estática | `[VERIFICADO]` |
| `scripts/probar-carrito.mjs` | Prueba en Chrome real: persistencia, vencimiento, corrupción, pestañas, almacenamiento bloqueado | `[VERIFICADO]` `npm run probar:carrito` |
| `app/theme/mostrador.ts`, `app/assets/css/base.css`, `app/app.config.ts` | Tema PrimeVue, tokens CSS y datos de la tienda | `[VERIFICADO]` |
| `tests/`, `scripts/*.test.mjs` | 173 tests con `node:test` | `[VERIFICADO]` `npm test` |

## Cómo se comunican
Todo ocurre en un proceso de Nuxt. El catálogo se importa en el servidor (y queda en el bundle del cliente). Las rutas de servidor (`sitemap.xml`, `robots.txt`, `llms.txt`) están en este mismo repo (C-02). No hay servicios propios ni base de datos. `[VERIFICADO]`

## Flujos principales
1. **Catálogo:** se edita `data/catalogo.json` → `npm run catalogo:validar` frena si hay errores. `[VERIFICADO]`
2. **Landing:** `/` se renderiza por pedido en el servidor con los 3 carruseles; cada card enlaza a su ficha con `NuxtLink`. `[VERIFICADO]`
3. **Ficha:** `/producto/<slug>` busca el producto activo; si no existe, lanza un 404 fatal y el servidor responde 404 con `app/error.vue`. Las 12 fichas se pregeneran en el build. `[VERIFICADO]`
4. **SEO:** cada ficha emite `title` y `description` propios, `canonical` absoluto, Open Graph/Twitter y dos bloques JSON-LD, todo calculado con funciones de `shared/utils/seo.ts` a partir de `NUXT_PUBLIC_SITE_URL`. `[VERIFICADO]`
5. **Archivos para rastreadores:** `sitemap.xml` (home + productos activos), `robots.txt` (permite todo y nombra 10 rastreadores de IA) y `llms.txt` (resumen y enlaces por categoría) se generan desde el catálogo y se pregeneran en el build. `[VERIFICADO]`
6. **Estado en el navegador:** el carrito (`ecommerce:carrito`) y los vistos (`ecommerce:vistos`) se guardan en `localStorage` como `{{ version, expiraEn, datos }}`. Vencen a las 2 horas desde la última escritura (cada cambio renueva el plazo; mirar no). Del carrito se guardan solo ids y cantidades; nombre, precio y stock salen del catálogo en cada lectura, y se quitan o ajustan con aviso los productos inexistentes, sin stock o con cantidad excedida. `[VERIFICADO]`
7. **El servidor no conoce el carrito:** el HTML llega sin contador, sin cantidades y sin la sección de vistos, y el navegador los completa al montar. Por eso el SEO y el verificador no cambian. `/carrito` tiene `noindex` y no está en el sitemap ni en `llms.txt`. `[VERIFICADO]`
8. **Pago:** en `/carrito`, "Finalizar compra" manda a `POST /api/checkout` solo ids y cantidades; el servidor recalcula todo desde el catálogo, crea la orden en Mercado Pago (`POST /v1/orders`), guarda el id de la orden en una cookie `httpOnly` y devuelve la `checkout_url`; el navegador va a pagar al sitio de Mercado Pago. `[VERIFICADO]` contra el simulado.
9. **Vuelta:** Mercado Pago redirige a `/compra/resultado`; la página le pide a `GET /api/pago/estado` el estado real (el servidor consulta `GET /v1/orders/{id}` con la orden de la cookie). Solo si está aprobado se vacía el carrito y se borra la cookie. Lo que diga la URL (`status=approved`) no cuenta. `[VERIFICADO]` contra el simulado.
10. **Publicación estática (GitHub Pages):** cada `push` a `main` corre `.github/workflows/deploy-pages.yml`: valida el catálogo, corre los tests, genera el sitio con `nuxt generate` (variables `NUXT_ESTATICO`, `NUXT_APP_BASE_URL`, `NUXT_PUBLIC_SITE_URL`, `NUXT_PUBLIC_PAGO_DISPONIBLE=false`) y publica `.output/public` en `https://alegonzalezz.github.io/ecommerce_prueba/`. Sin servidor, el pago no existe: el carrito, la ficha y el resultado muestran el aviso de demostración y no llaman a `/api/*`. `[VERIFICADO]` sitio real.

## Decisiones de diseño relevantes
- Un solo layout responsive con breakpoint en 768 px; el hero y la ficha usan `<picture>` con la imagen del formato. `[VERIFICADO]`
- Carrusel con `scroll-snap` propio: `decisions/ADR-001-carrusel-scroll-snap.md`. PrimeVue 4: `decisions/ADR-002-primevue-4-por-licencia.md`.
- Los datos estructurados solo declaran lo que la página muestra (precio, disponibilidad, SKU, marca). No hay reseñas ni calificaciones porque no existen datos. `[VERIFICADO]` `scripts/verificar-seo.mjs`
- **La URL base se fija al construir:** las páginas pregeneradas llevan `NUXT_PUBLIC_SITE_URL` del momento del build. Hay que definirla antes de `npm run build`. `[VERIFICADO]`
- **El carrito del navegador no es fuente de verdad:** el servidor recalcula precios y total y valida stock antes de cobrar. `[VERIFICADO]` `server/api/checkout.post.ts`
- **Sin base de datos, los pedidos viven solo en Mercado Pago:** la tienda no registra pedidos, no descuenta stock y no manda mails; el estado se pregunta a Mercado Pago. `[VERIFICADO]` decisión del usuario; ver Q-30.
- La categoría no tiene página: en las migas es texto y queda fuera del `BreadcrumbList`. `[VERIFICADO]`

## Rendimiento medido (build, Lighthouse 13.6.0, móvil, red simulada, con compresión gzip)
| Página | Performance | Accesibilidad | Mejores prácticas | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
| Ficha | 98 | 100 | 100 | 100 | 2,4 s | 0 |
| Home | 96 | 100 | 100 | 100 | 2,9 s | 0,002 |

`[VERIFICADO]` Con el carrito: home 95, ficha 96-98, `/carrito` 97 (CLS 0-0,002). Sin compresión la home da 80, porque el HTML pesa 204 KB (27 KB con gzip): el host tiene que comprimir (Q-17). Son números locales con placeholders livianos; con fotos reales pueden empeorar. `[INFERIDO]`
