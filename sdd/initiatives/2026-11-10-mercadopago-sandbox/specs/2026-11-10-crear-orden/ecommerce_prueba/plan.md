# Plan: Crear la orden y redirigir a Mercado Pago

- **Spec:** [spec.md](spec.md)
- **Fecha:** 2026-11-10


## Enfoque
Una ruta `server/api/checkout.post.ts` delgada que conecta las funciones de la fase 1: lee el cuerpo con límite de tamaño, valida, arma el pedido con el catálogo, crea la orden, valida la URL y guarda la cookie. Un límite de pedidos por IP en memoria protege la ruta. El botón del carrito llama a esa ruta con `$fetch` y redirige. `[PROPUESTA]`

**Alternativas descartadas:**
- *Enviar el total desde el navegador:* se podría manipular.
- *Redirigir desde el servidor (302):* se pierde el control de los mensajes de error en la interfaz.
- *Límite con base de datos o Redis:* choca con C-02; el límite en memoria es débil (se reinicia, no se comparte entre instancias) pero alcanza para el sandbox.

## Cambios por capa
- **Producto:** textos de estados del botón y de errores; aviso de modo de prueba.
- **Front (Nuxt + PrimeVue):** `app/pages/carrito.vue` (botón habilitado, estados, mensajes, aviso de prueba); `app/pages/producto/[slug].vue` (cambia el aviso).
- **Compartido (`shared/`):** `shared/utils/limite.ts` (limitador por clave y ventana).
- **Server routes de Nuxt (Nitro):** `server/api/checkout.post.ts`.
- **Pagos (Mercado Pago):** creación de la orden con la clave de idempotencia.
- **Mails:** Sin cambios.
- **SEO:** Sin cambios.
- **Data:** Sin cambios.
- **DB:** no aplica a este repo (C-02). No hay migraciones.
- **Infra:** `NUXT_PUBLIC_MODO_PRUEBA` (por defecto verdadero) para mostrar el aviso.
- **Observabilidad:** registro de errores de Mercado Pago en el servidor.

## Verificación de constraints
| Constraint | ¿Aplica? | Cómo se cumple |
|---|---|---|
| C-01 (SSR) | Sí | La ruta corre en el servidor; las páginas siguen sin conocer el carrito. |
| C-02 (sin backend ni DB) | Sí | Ruta de servidor en este repo; sin servicios ni base de datos. |
| C-03 (Mercado Pago, sandbox) | Sí | La orden se crea con el token cargado; sin credenciales, el pago responde "no configurado". |
| C-04 (PrimeVue) | Sí | `Button` de PrimeVue con el tema Mostrador. |
| C-05 | Sin definir | `<pendiente>`. |

## Testing
- `node:test`: el limitador (ventana, reinicio, claves distintas).
- Con el simulado: crear la orden desde la ruta, cada código (400, 409, 429, 502, 503), cookie, que el total coincida con el carrito, y que una URL de pago ajena se rechace.
- Navegador (CDP): botón habilitado, estados, mensajes, redirección al simulado.

## Feature flag
No aplica (sin token, el pago no está disponible).

## Rollout
Merge a la rama que se defina (Q-11).

## Rollback
Revertir el commit; el botón vuelve a quedar deshabilitado.

## Riesgos
- Que el total difiera del carrito. Mitigación: se calcula siempre en el servidor y se prueba.
- Abuso de la ruta pública. Mitigación: límite por IP y límite de tamaño del cuerpo.

## Cambios respecto del plan original (implementación, 2026-11-10)
- La ruta responde con un cuerpo propio `{ error }` y el código HTTP correspondiente (en vez de `createError`), para que el mensaje llegue igual en desarrollo y en producción. `[VERIFICADO]` `server/api/checkout.post.ts`
- El límite de 10 pedidos por minuto se aplica **después** de validar, es decir, solo cuenta los pedidos que llegarían a Mercado Pago. `[VERIFICADO]`
- El carrito restaura el botón con el evento `pageshow` si se vuelve con "atrás" desde Mercado Pago. `[VERIFICADO]` `app/pages/carrito.vue`
- Los textos de la ficha y del carrito cambiaron: "Pronto podrás comprar online" pasó a "Pagás de forma segura con/en Mercado Pago", y se agregó "Modo de prueba: no se cobra dinero real." (`NUXT_PUBLIC_MODO_PRUEBA`). Esto reemplaza lo decidido en la iniciativa `2026-11-10-carrito-persistente` (botón deshabilitado). `[VERIFICADO]`
- Sin credenciales, "Finalizar compra" sigue habilitado y, al tocarlo, muestra "El pago online todavía no está configurado." (el navegador no sabe si hay token). `[VERIFICADO]`
- `getRequestIP` no confía en `X-Forwarded-For`: detrás de un proxy habría que configurarlo para limitar por persona y no por proxy. `<pendiente>` ver Q-05.

## Resultados de verificación
- `scripts/probar-pago.mjs`, sobre el build real, 74 comprobaciones (con la fase 3): pedido válido (200, URL de pago, cookie `HttpOnly`/`SameSite=Lax`/`Secure`/`Path=/`), precios, nombres y totales inventados ignorados, 8 casos de 400, 409 (sin stock, cantidad excedida, inexistente), 413, 429 al pedido 11, 503 sin token, 502 con Mercado Pago caído, con URL de pago ajena y con token incorrecto, ninguna orden creada por pedidos inválidos y el token ausente de respuestas, cookies y registros. `[VERIFICADO]`
- `scripts/probar-pago-navegador.mjs`: botón, redirección al sitio de pago, mensaje de error y recuperación, doble clic con una sola orden, "atrás". `[VERIFICADO]`
- **No verificado contra el Mercado Pago real:** todo se probó contra el simulado, escrito a partir de la documentación. Pueden diferir los campos de la respuesta de `GET /v1/orders/{id}`, los parámetros de retorno, el formato de los errores, el comportamiento de `X-Idempotency-Key`, si acepta `localhost` en las URLs de retorno y el significado exacto de `auto_return: "all"`. `<pendiente>` fase 4.
