# Principios — ecommerce_prueba

## Reglas que el código ya sigue (al 2026-11-10)
- El catálogo se valida antes de usarlo y el validador falla si falta una imagen, hay ids repetidos o `con-descuento` no tiene descuento real. `[VERIFICADO]` `scripts/validar-catalogo.mjs`, `scripts/validar-catalogo.test.mjs`
- Todas las imágenes son `.webp` y llevan `width` y `height`. `[VERIFICADO]` medición con Chrome DevTools Protocol: 0 imágenes no `.webp`, 0 sin dimensiones.
- Las tipografías se sirven desde el propio sitio, sin Google Fonts. `[VERIFICADO]` `nuxt.config.ts`; 0 pedidos a `fonts.googleapis.com` / `fonts.gstatic.com`.
- Respeta `prefers-reduced-motion` (scroll y transiciones). `[VERIFICADO]` `app/components/ProductCarousel.vue`, `ProductCard.vue`, `app/assets/css/base.css`
- Accesibilidad básica: enlace "saltar al contenido", foco visible, carruseles con teclado, nombre accesible = texto visible. `[VERIFICADO]` Lighthouse Accesibilidad 100.
- El descuento nunca se guarda: se deriva de `precio` y `precioAnterior`. `[VERIFICADO]` `shared/utils/calcularDescuento.ts`
- Los datos estructurados solo dicen lo que la página muestra, y no se inventan reseñas, calificaciones ni fechas. `[VERIFICADO]` `scripts/verificar-seo.mjs`, `tests/seo.test.mjs`
- Un producto inexistente o inactivo responde 404 real, no una página vacía con 200. `[VERIFICADO]` `app/pages/producto/[slug].vue`
- El SEO se verifica con un comando repetible sobre todas las fichas. `[VERIFICADO]` `npm run verificar:seo`
- Lo que se recuerda en el navegador no incluye precios ni nombres: solo ids y cantidades, y se cruza con el catálogo al leer. `[VERIFICADO]` `shared/utils/carrito.ts`, `npm run probar:carrito`
- Lo recordado se lee solo al montar en el navegador y nunca cambia el HTML del servidor. `[VERIFICADO]` `curl` sobre el build
- El token de Mercado Pago es solo del servidor: 0 apariciones en el build, en el navegador y en los registros. `[VERIFICADO]` `npm run probar:pago-navegador`
- Lo que se cobra lo calcula el servidor desde el catálogo; del navegador solo se aceptan ids y cantidades. `[VERIFICADO]` `npm run probar:pago`
- El estado de un pago se le pregunta a Mercado Pago; la URL de retorno no es prueba de nada. `[VERIFICADO]` `npm run probar:pago-navegador`
- El carrito se vacía únicamente con un pago aprobado. `[VERIFICADO]` prueba de mutación
- Todo lo que la tienda escribe con una ruta propia respeta la subcarpeta de publicación; la prueba de navegador falla ante cualquier recurso propio con error. `[VERIFICADO]` `npm run probar:pages`
- Lo que no puede funcionar sin servidor (el pago) se desactiva con un aviso claro en vez de fingir que anda. `[VERIFICADO]` `NUXT_PUBLIC_PAGO_DISPONIBLE`
- Las páginas personales (`/carrito`, `/compra/resultado`) llevan `noindex` y quedan fuera del sitemap y de `llms.txt`. `[VERIFICADO]` `npm run verificar:seo`

## Candidatas a constraint (el equipo decide si pasan a `constraints.md`)
Todas `[PROPUESTA]`:

- El `access_token` de Mercado Pago vive solo en variables de entorno del servidor, nunca en el bundle del cliente ni en el repo. Motivo: con el token cualquiera puede operar la cuenta. `[PROPUESTA]` / `[INFERIDO]` del funcionamiento de Mercado Pago.
- Los montos y precios se calculan en el servidor, no se confía en el valor que manda el navegador. `[PROPUESTA]`
- Credenciales de sandbox y de producción separadas por ambiente. `[PROPUESTA]` (se desprende de C-03)
- No loguear datos personales ni de pago. `[PROPUESTA]` (desvío observado en `prueba_pagina/script.js`, ver `applications/prueba_pagina/constitution/principles.md`)
- Español rioplatense en UI y documentación. `[PROPUESTA]`
