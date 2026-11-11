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
