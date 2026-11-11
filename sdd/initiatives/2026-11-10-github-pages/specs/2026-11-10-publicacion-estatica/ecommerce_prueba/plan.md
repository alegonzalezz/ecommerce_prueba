# Plan: Publicación estática en GitHub Pages

- **Spec:** [spec.md](spec.md)
- **Fecha:** 2026-11-10

## Enfoque
Construir con `nuxt generate` (el mismo renderizador, pero al construir) y subir `.output/public` con el flujo oficial de Actions para Pages. Lo que depende del destino se controla con variables de entorno que el workflow define; sin ellas, el comportamiento no cambia. Las rutas de imágenes se prefijan con `app.baseURL` mediante una función pura y un composable. `[PROPUESTA]`

**Alternativas descartadas:**
- *Rama `gh-pages` con la carpeta ya construida:* obliga a versionar artefactos; el flujo con Actions es el oficial.
- *Hash routing (`/#/producto/x`):* destruye el SEO y las URLs limpias.
- *Reescribir el JSON con el prefijo:* acopla los datos al destino de publicación.
- *Un segundo proyecto solo para Pages:* duplica código.

## Cambios por capa
- **Producto:** aviso "Versión de demostración: el pago online no está disponible." en carrito, ficha y resultado.
- **Front (Nuxt + PrimeVue):** `shared/utils/ruta.ts` (`conBase`), `app/composables/useBase.ts`; se usa en `HeroBanner`, `ProductCard`, `ProductCarousel`(no aplica), la ficha, el carrito, `index.vue` y `error.vue`; `app/pages/carrito.vue`, `app/pages/producto/[slug].vue` y `app/pages/compra/resultado.vue` respetan `pagoDisponible`.
- **Server routes de Nuxt (Nitro):** sin cambios; `sitemap.xml`, `robots.txt` y `llms.txt` se pregeneran. Las rutas de pago no existen en la versión estática.
- **Pagos (Mercado Pago):** no aplica en Pages.
- **SEO:** las URLs absolutas salen de `NUXT_PUBLIC_SITE_URL` con la subcarpeta; sin cambios de código.
- **Data:** sin cambios.
- **DB:** no aplica a este repo (C-02). No hay migraciones.
- **Infra:** `.github/workflows/deploy-pages.yml`, `nuxt.config.ts` (prerender de `/carrito`, `/compra/resultado` y páginas `.html` sin carpeta), `public/.nojekyll`, script `generate:pages`, `README.md`.
- **Observabilidad:** `scripts/servir-estatico.mjs` (imita a Pages) y `scripts/probar-pages.mjs` (navegador).

## Verificación de constraints
| Constraint | ¿Aplica? | Cómo se cumple |
|---|---|---|
| C-01 (SSR) | Sí | `ssr: true` se mantiene: el HTML sale del mismo renderizador, al construir. Aprobado por el usuario. |
| C-02 (sin backend ni DB) | Sí | Sitio estático; sin servicios nuevos. |
| C-03 (Mercado Pago, sandbox) | No en Pages | El pago queda deshabilitado en Pages; sigue disponible con servidor. Aprobado por el usuario. |
| C-04 (PrimeVue) | Sí | Sin cambios de componentes. |
| C-05 | Sin definir | `<pendiente>`. |

## Testing
- `node:test` de `conBase` (barra inicial, final, base `/`, rutas con hash o consulta, URLs absolutas que no se tocan).
- Construcción estática local con las variables de Pages, servida con el emulador, y: `verificar:seo`, `probar:pages` (navegador), Lighthouse.
- Contra el sitio real, tras publicar: los mismos controles.

## Feature flag
`NUXT_PUBLIC_PAGO_DISPONIBLE`.

## Rollout
Push a `main`; el workflow publica. Habilitar Pages con fuente "GitHub Actions" (una vez).

## Rollback
Desactivar Pages o revertir el commit.

## Riesgos
- Pages podría no resolver `/x` hacia `x.html` como se espera. Mitigación: se verifica contra el sitio real y el plan B es volver a `autoSubfolderIndex`.
- `robots.txt` bajo subcarpeta no lo leen los buscadores. Mitigación: documentado (Q-35).
- Una ruta que olvide el prefijo. Mitigación: la prueba de navegador falla ante cualquier recurso 404.

## Cambios respecto del plan original (implementación, 2026-11-10)
- **Bug de Nuxt al generar la ruta raíz:** `Invalid key: "/"` (el mismo de la Q-21). Se resolvió desactivando `experimental.payloadExtraction` **solo en la versión estática**; la versión con servidor no cambia. `[VERIFICADO]` `nuxt.config.ts`
- **Ícono propio (`public/favicon.svg`)** declarado en `nuxt.config.ts` (`app.head.link`) con la subcarpeta: sin él, el navegador pedía `/favicon.ico` a la raíz del dominio y recibía un 404. Declararlo en `app.vue` no alcanzaba, porque `404.html` y `200.html` son cascarones sin la app. `[VERIFICADO]` hallazgo de la prueba de navegador.
- `nuxt generate` crea un enlace `dist` hacia `.output/public`, con la ruta absoluta de la máquina: casi entra en el commit. Se quitó y se agregó `dist` al `.gitignore`. `[VERIFICADO]`
- **El primer despliegue falló** en `npm ci`: `Missing: @emnapi/runtime@1.11.3 from lock file` (el lock generado en macOS no trae esos dos paquetes opcionales que npm exige en Linux). Se fijaron `@emnapi/core` y `@emnapi/runtime` como dependencias de desarrollo con versión exacta. **No se pudo reproducir el error en local** (otra versión de npm); la corrección se confirmó solo con la segunda corrida en GitHub. `[VERIFICADO]`
- Se agregó `README.md`, `scripts/lib/cdp.mjs` registra las respuestas de red, y `package.json` suma `generate:pages`, `pages:build`, `pages:servir` y `probar:pages`.
- Node 24 en el workflow (Nuxt 4.4.5 acepta `>=22.12`; los tests importan `.ts` y necesitan que Node los ejecute sin compilar). `[VERIFICADO]`

## Resultados de verificación
- **Local (emulador de Pages):** 39 comprobaciones del navegador, `verificar:seo` correcto, y la versión con servidor intacta: 173 tests, 74 + 53 + 69 comprobaciones de pago y carrito. `[VERIFICADO]`
- **Despliegue real:** el workflow valida el catálogo, corre los 173 tests, genera y publica en menos de 1 minuto. `[VERIFICADO]`
- **Sitio real (https://alegonzalezz.github.io/ecommerce_prueba/):** `/` 200; `/producto/<slug>` 200; `/producto/no-existe` 404 con la página de la tienda; `/producto/<slug>/` (con barra final) 404; `sitemap.xml`, `robots.txt`, `llms.txt`, ícono e imágenes 200; `canonical`, sitemap y robots con la URL real. `[VERIFICADO]` `curl`.
- `npm run verificar:seo` contra el sitio real: correcto (12 fichas, home, sitemap, robots con 10 rastreadores de IA y `llms.txt`), ya sin el aviso de `localhost`. `[VERIFICADO]`
- `npm run probar:pages` contra el sitio real: 39 de 39 (imágenes, subcarpeta, navegación sin recargar, enlace directo, 404, carrito sin pago y sin llamadas a `/api/`, resultado, vistos, SEO, 390 px sin desborde, consola limpia). `[VERIFICADO]`
- **Lighthouse móvil, sitio real:** home 100; ficha 99-100; carrito 100. Accesibilidad y Mejores prácticas 100 en las tres; SEO 100 en home y ficha, y 60 en el carrito **a propósito** (tiene `noindex`). CLS 0. `[VERIFICADO]`
- `cache-control: max-age=600`: un cambio publicado puede tardar hasta 10 minutos en verse en un navegador que ya tenía la página. `[VERIFICADO]` cabeceras.
- **No verificado:** que Google indexe el sitio de Pages ni que los asistentes de IA lo citen; teclado y lector de pantalla reales; navegadores distintos de Chrome.

