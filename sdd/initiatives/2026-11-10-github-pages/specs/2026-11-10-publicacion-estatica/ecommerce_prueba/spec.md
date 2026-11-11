# Spec: Publicación estática en GitHub Pages

- **Fecha:** 2026-11-10
- **Autor:** agonzalezz
- **Iniciativa:** `initiatives/2026-11-10-github-pages/initiative.md`
- **Estado:** aprobada   <!-- borrador | en revisión | aprobada | implementada | descartada -->
- **Plan:** [plan.md](plan.md) · **Tareas:** [tasks.md](tasks.md)

> Aprobada por el usuario el 2026-11-10 ("Versión estática en Pages, sin pago"). Ninguna tarea de código arranca con esta spec en estado `borrador`.

## Contexto
- **Qué pasa si no hacemos nada:** no hay sitio público.
- **Situación actual en el código:** rutas de imágenes y enlaces escritos desde la raíz (`/img/...`, `<a href="/">`), sin soporte de subcarpeta; el botón de pago siempre intenta llamar a `/api/checkout`; no hay workflow. `[VERIFICADO]` `app/components/HeroBanner.vue`, `ProductCard.vue`, `app/error.vue`, `app/pages/carrito.vue`.

## Criterios de aceptación
Los de la iniciativa (`../../initiative.md`), más:
- **Given** `NUXT_APP_BASE_URL=/ecommerce_prueba/`, **Then** toda ruta de imagen que escribe la tienda lleva ese prefijo (hero, cards, ficha, carrito, precargas).
- **Given** `NUXT_PUBLIC_PAGO_DISPONIBLE=false`, **Then** el carrito, la ficha y la página de resultado muestran el aviso de demostración y no llaman a `/api/*`.
- **Given** la construcción estática, **Then** se generan las 12 fichas, la home, `/carrito`, `/compra/resultado`, `sitemap.xml`, `robots.txt`, `llms.txt` y la página `404.html`.
- **Given** un servidor que imita a Pages (sirve `x.html` para `/x`, `index.html` para las carpetas y `404.html` con 404 para lo demás), **Then** `npm run verificar:seo` y la prueba de navegador pasan.
- **Given** el sitio real publicado, **Then** esas mismas comprobaciones pasan contra la URL de Pages.

### Casos borde
- Imágenes de productos con rutas del JSON (`/img/productos/x.webp`): se les agrega el prefijo al mostrarlas, sin tocar el JSON.
- Datos estructurados y Open Graph: la URL absoluta sale de `NUXT_PUBLIC_SITE_URL` (que ya incluye la subcarpeta) y no del prefijo.

### Comportamiento por país
Solo Argentina.

## Fuera de alcance
- Pago, dominio propio y host con servidor.

## Impacto en métricas
- **Qué medimos:** recursos con error, verificador de SEO, Lighthouse en el sitio publicado.
- **Cómo sabemos si salió mal:** cualquier recurso 404 de la propia tienda.

## Dependencias
- Repositorio en GitHub con Pages habilitado desde Actions.

## Preguntas abiertas de esta spec
- Si Pages resuelve bien las URLs sin barra final cuando existe `x.html`: se confirma contra el sitio real.
