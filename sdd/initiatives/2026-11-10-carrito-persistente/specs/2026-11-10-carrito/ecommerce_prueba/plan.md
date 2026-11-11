# Plan: Carrito de compras

- **Spec:** [spec.md](spec.md)
- **Fecha:** 2026-11-10


## Enfoque
La lógica del carrito es pura y vive en `shared/utils/carrito.ts` (agregar, cambiar cantidad, quitar, reconciliar con el catálogo, totales), para probarla sin navegador. `useCarrito` la conecta con `useAlmacenado` y con el catálogo. Se guarda `[{ id, cantidad }]`; todo lo demás se deriva del catálogo en cada lectura. `[PROPUESTA]`

La cantidad del header y la página `/carrito` no dependen del servidor: el HTML llega sin carrito y el navegador lo completa al montar.

**Alternativas descartadas:**
- *Guardar también precio y nombre:* quedarían viejos si el catálogo cambia.
- *Panel lateral (Drawer):* no se eligió; la página es más simple y accesible.
- *Pinia:* sin necesidad; `useState` alcanza.

## Cambios por capa
- **Producto:** textos del carrito y de los avisos en español rioplatense; tope de 10 por producto.
- **Front (Nuxt + PrimeVue):** `app/composables/useCarrito.ts`; `app/pages/carrito.vue`; `app/components/CarritoEnlace.vue` (ícono y cantidad) en `AppHeader`; botón y estado en `app/pages/producto/[slug].vue`; `Badge` de PrimeVue para la cantidad.
- **Compartido (`shared/`):** `shared/utils/carrito.ts`.
- **Server routes de Nuxt (Nitro):** Sin cambios.
- **Pagos (Mercado Pago):** Sin cambios (el botón de compra queda deshabilitado).
- **Mails:** Sin cambios.
- **SEO:** `/carrito` con `noindex, nofollow`; fuera del sitemap y de `llms.txt`. El HTML del servidor de home y ficha no cambia.
- **Data:** Sin cambios en el catálogo.
- **DB:** no aplica a este repo (C-02). No hay migraciones.
- **Infra:** Sin cambios.
- **Observabilidad:** Sin cambios.

## Verificación de constraints
| Constraint | ¿Aplica? | Cómo se cumple |
|---|---|---|
| C-01 (SSR) | Sí | El servidor renderiza sin carrito; el navegador lo carga al montar. `/carrito` muestra "Cargando…" hasta tener los datos. |
| C-02 (sin backend ni DB) | Sí | Carrito en el navegador; sin servicios ni base de datos. |
| C-03 (Mercado Pago) | No | Sin pago en esta iniciativa. |
| C-04 (PrimeVue) | Sí | `Button` y `Badge` de PrimeVue con el preset Mostrador. |
| C-05 | Sin definir | `<pendiente>`. |

## Testing
- `node:test` de `shared/utils/carrito.ts`: agregar nuevo y existente, topes (stock y 10), cambiar a 0, quitar, reconciliar (inexistente, inactivo, sin stock, cantidad excedida, precio actualizado, sin cambios), totales y validación de lo guardado.
- Navegador (CDP): agregar desde la ficha, ver el ícono, ir a `/carrito`, cambiar cantidades, recargar, vencimiento adelantado, datos corruptos, producto inexistente en lo guardado, dos pestañas, 390 y 1440 px.
- `verificar:seo`, Lighthouse de home y ficha.

## Feature flag
No aplica.

## Rollout
Merge a la rama que se defina (Q-11).

## Rollback
Revertir el commit; la ficha vuelve a mostrar solo el aviso.

## Riesgos
- El ícono aparece tarde y mueve el header. Mitigación: se reserva su espacio.
- Que el carrito del navegador se tome como fuente de verdad al cobrar. Mitigación: documentado; el servidor deberá recalcular.
- Una acción antes de la hidratación no hace nada. Mitigación: aceptado; la hidratación es rápida.

## Cambios respecto del plan original (implementación, 2026-11-10)
- `useCarrito` lee primero lo guardado si alguien actúa antes de que termine de cargar (`asegurarCargado`), para no pisar un carrito existente con uno vacío. `[VERIFICADO]` `app/composables/useCarrito.ts`
- El número del header es un `Badge` de PrimeVue superpuesto (posición absoluta): aparecer o cambiar no mueve el header. Se oculta a los lectores de pantalla porque el enlace ya lleva el nombre accesible con la cantidad ("Carrito, 3 unidades"). `[VERIFICADO]` `app/components/CarritoEnlace.vue`
- En mobile, el carrito va en la fila de arriba junto a la marca y el menú queda en la segunda fila. `[VERIFICADO]` captura a 390 px.
- La ficha mantiene el aviso "Pronto podrás comprar online" debajo del botón, y suma el texto "Tenés N unidades en tu carrito" con enlace. `[VERIFICADO]`
- `/carrito` tiene `min-height: 70vh`: sin eso el pie saltaba al reemplazar "Cargando…" por el contenido (CLS 0,083); con eso, 0. `[VERIFICADO]` Lighthouse.

## Resultados de verificación
- 24 tests nuevos de `shared/utils/carrito.ts` (topes, reconciliación, precios, avisos, totales, validación). `[VERIFICADO]`
- Navegador: agregar desde la ficha (id y cantidad guardados, sin precios ni nombres, vence en ~2 h), el ícono y su nombre accesible, `/carrito` con subtotal correcto, `+`/`−`/quitar/vaciar, tope por stock (9) y por 10, recarga, renovación, vencimiento, datos corruptos (4 variantes), reconciliación con producto inexistente / sin stock / cantidad excedida con sus avisos, producto sin stock con botón deshabilitado, dos pestañas, almacenamiento bloqueado, 390 px sin desborde. `[VERIFICADO]` 68 comprobaciones.
- El HTML del servidor no trae el contador, la cantidad ni la sección de vistos (el elemento `p-badge` no está en el HTML del servidor). `[VERIFICADO]` `curl`.
- Lighthouse móvil (build, gzip): home 95, ficha 96-98, `/carrito` 97; CLS 0-0,002; Accesibilidad y Mejores prácticas 100. `/carrito` da SEO 63 **a propósito**: tiene `noindex` y Lighthouse lo marca como no rastreable. `[VERIFICADO]`
- `npm run verificar:seo`: ahora también comprueba que `/carrito` tenga `noindex`, que no esté en sitemap ni en `llms.txt` y que el servidor no lo declare "vacío". `[VERIFICADO]`
- No verificado: teclado y lector de pantalla reales, ni navegadores distintos de Chrome (Safari y Firefox). `<pendiente>`

## Actualización posterior (2026-11-10)
El botón "Finalizar compra" ya no está deshabilitado ni dice "Pronto podrás comprar online": la iniciativa `2026-11-10-mercadopago-sandbox` lo habilitó para pagar con Mercado Pago. Ver `initiatives/2026-11-10-mercadopago-sandbox/`.
