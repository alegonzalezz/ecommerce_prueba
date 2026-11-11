# Plan: Retorno de Mercado Pago y estado del pago

- **Spec:** [spec.md](spec.md)
- **Fecha:** 2026-11-10


## Enfoque
Una sola página de retorno `/compra/resultado` para las tres URLs (éxito, fallo, pendiente), porque la decisión no sale de la URL sino de la consulta a Mercado Pago. La página, ya en el navegador, llama a `GET /api/pago/estado` (el servidor lee la cookie y consulta la orden). El estado se traduce con `interpretarOrden` (fase 1). `[PROPUESTA]`

**Alternativas descartadas:**
- *Tres páginas distintas según la URL:* se podría llegar a "aprobado" manipulando la URL.
- *Consultar en el render del servidor:* obliga a reenviar la cookie y ata la página al servidor; hacerlo en el navegador es más simple y la página no se indexa.
- *Guardar el pedido en una base de datos:* fuera de C-02.

## Cambios por capa
- **Producto:** textos de cada estado, en español rioplatense.
- **Front (Nuxt + PrimeVue):** `app/pages/compra/resultado.vue`; vaciado del carrito con `useCarrito().vaciar()`.
- **Compartido (`shared/`):** reutiliza `interpretarOrden` y `esIdOrdenValido`.
- **Server routes de Nuxt (Nitro):** `server/api/pago/estado.get.ts`.
- **Pagos (Mercado Pago):** consulta de la orden.
- **Mails:** Sin cambios.
- **SEO:** `noindex, nofollow`; fuera del sitemap y de `llms.txt`.
- **Data:** Sin cambios.
- **DB:** no aplica a este repo (C-02). No hay migraciones.
- **Infra:** Sin cambios.
- **Observabilidad:** registro en el servidor de las consultas fallidas.

## Verificación de constraints
| Constraint | ¿Aplica? | Cómo se cumple |
|---|---|---|
| C-01 (SSR) | Sí | El servidor responde el estado; la página es solo del navegador y no se indexa. |
| C-02 (sin backend ni DB) | Sí | Rutas de servidor en este repo; sin servicios ni base de datos. |
| C-03 (Mercado Pago, sandbox) | Sí | Se consulta el estado real a Mercado Pago; no se confía en la URL. |
| C-04 (PrimeVue) | Sí | `Button` y `Tag` de PrimeVue con el tema Mostrador. |
| C-05 | Sin definir | `<pendiente>`. |

## Testing
- Con el simulado, `node` contra la ruta: aprobado, pendiente, rechazado, cancelado, `status` manipulado, sin cookie, `order_id` inválido, `external_reference` que no coincide, orden inexistente, error de Mercado Pago.
- Navegador (CDP): flujo completo (carrito → simulado → retorno) con cada resultado; el carrito se vacía solo si se aprobó; 390 y 1440 px.
- `verificar:seo` (agrega `/compra/resultado`), Lighthouse.

## Feature flag
No aplica.

## Rollout
Merge a la rama que se defina (Q-11).

## Rollback
Revertir el commit.

## Riesgos
- Que los parámetros reales de retorno difieran de la documentación. Mitigación: la identificación principal es la cookie, no la URL.
- Cookie bloqueada por el navegador. Mitigación: respaldo con `order_id` validado, y un mensaje claro si no hay forma.

## Cambios respecto del plan original (implementación, 2026-11-10)
- La ruta de estado tiene su propio límite (60 consultas por minuto por IP), porque cada consulta usa el token. `[VERIFICADO]`
- Si la cookie y la URL hablan de compras distintas (la `external_reference` de la URL no coincide con la de la orden consultada), la respuesta es 404: no se mezclan. `[VERIFICADO]`
- "Aprobado" exige `status: processed` y, si vienen ambos montos, que lo pagado cubra el total. `[VERIFICADO]` `shared/utils/mercadopago.ts`
- Un estado `refunded` o `charged_back` se muestra como "no pudimos confirmar el estado". `[PROPUESTA]`
- `Cache-Control: no-store` en la respuesta de estado. `[VERIFICADO]`

## Resultados de verificación
- **Mutación:** al vaciar el carrito siempre (rompiendo la regla a propósito), la prueba del navegador falló en 7 comprobaciones; con el código restaurado, pasa. `[VERIFICADO]`
- `scripts/probar-pago-navegador.mjs`: 53 comprobaciones sobre el build real. Aprobado (referencia y total visibles, carrito vaciado, ícono vacío, cookie borrada, `noindex`); rechazado, pendiente y cancelado (carrito y cookie conservados, "Volver al carrito" y reintento posible); **URL con `status=approved` sin haber pagado: se muestra pendiente y el carrito no se vacía**; sin cookie: "No encontramos una compra"; doble clic con una sola orden; sin credenciales con `role="alert"`; el token no está en el HTML ni en ninguno de los archivos que recibe el navegador; 390 px sin desborde; consola limpia. `[VERIFICADO]`
- `scripts/probar-carrito.mjs` actualizado a los textos nuevos: 69 comprobaciones. `[VERIFICADO]`
- Lighthouse móvil (build, gzip): home 96, ficha 96, `/carrito` 97, `/compra/resultado` 100 en Performance; Accesibilidad 100 en todas; CLS ≤ 0,004. Mejores prácticas 96 en el resultado por el 404 esperado de la consulta sin cookie. `[VERIFICADO]`
- `npm run verificar:seo`: ahora también comprueba `/compra/resultado` (noindex, sin "Pago aprobado" desde el servidor) y que no esté en sitemap ni `llms.txt`. `[VERIFICADO]`
- **No verificado contra el Mercado Pago real:** todo se probó contra el simulado, escrito a partir de la documentación. Pueden diferir los campos de la respuesta de `GET /v1/orders/{id}`, los parámetros de retorno, el formato de los errores, el comportamiento de `X-Idempotency-Key`, si acepta `localhost` en las URLs de retorno y el significado exacto de `auto_return: "all"`. `<pendiente>` fase 4.
- No verificado: teclado y lector de pantalla reales, ni navegadores distintos de Chrome.
