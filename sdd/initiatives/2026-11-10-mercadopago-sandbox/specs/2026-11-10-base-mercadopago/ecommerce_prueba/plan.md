# Plan: Base de la integración con Mercado Pago

- **Spec:** [spec.md](spec.md)
- **Fecha:** 2026-11-10


## Enfoque
Lógica pura en `shared/utils/` (pedido, orden, estados, URL segura) y un cliente `fetch` que recibe la configuración como parámetro, para probar todo con `node:test` y con un servidor simulado, sin credenciales. La ruta de servidor (fase 2) solo conecta estas piezas. `[PROPUESTA]`

**Alternativas descartadas:**
- *SDK `mercadopago` de npm:* suma una dependencia y oculta el contrato; el cliente son ~60 líneas y se puede auditar.
- *Preferences API (clásica):* Mercado Pago la marca como legacy.
- *Confiar en precios del navegador:* permitiría pagar cualquier monto.

## Cambios por capa
- **Producto:** textos de los motivos de rechazo del pedido, en español rioplatense.
- **Front (Nuxt + PrimeVue):** Sin cambios.
- **Compartido (`shared/`):** `shared/utils/pedido.ts` (`validarPedido`, `armarPedido`), `shared/utils/mercadopago.ts` (`construirOrden`, `interpretarOrden`, `urlDePagoSegura`, `referenciaNueva`, `esIdOrdenValido`), `shared/utils/mercadopago-cliente.ts` (`crearOrden`, `obtenerOrden`, `ErrorMercadoPago`).
- **Server routes de Nuxt (Nitro):** Sin cambios en esta fase.
- **Pagos (Mercado Pago):** configuración privada y cliente.
- **Mails:** Sin cambios.
- **SEO:** Sin cambios.
- **Data:** Sin cambios.
- **DB:** no aplica a este repo (C-02). No hay migraciones.
- **Infra:** variables de entorno `NUXT_MERCADOPAGO_ACCESS_TOKEN` y `NUXT_MERCADOPAGO_API_URL`; `.env` en `.gitignore`; `.env.example`.
- **Observabilidad:** los errores de Mercado Pago se registran en el servidor sin incluir encabezados ni token.

## Verificación de constraints
| Constraint | ¿Aplica? | Cómo se cumple |
|---|---|---|
| C-01 (SSR) | No | Sin cambios de render. |
| C-02 (sin backend ni DB) | Sí | Todo corre en el mismo proyecto de Nuxt; sin servicios ni base de datos. |
| C-03 (Mercado Pago, sandbox) | Sí | Se integra Mercado Pago; sin credenciales de producción. El sandbox se decide por el token que se cargue. |
| C-04 (PrimeVue) | No | Sin cambios de UI. |
| C-05 | Sin definir | `<pendiente>`. |

## Testing
- `node:test`: `validarPedido`, `armarPedido` (precios del catálogo, total exacto, cada motivo de rechazo), `construirOrden` (forma del cuerpo, URLs desde `SITE_URL`), `interpretarOrden` (cada estado), `urlDePagoSegura`, `referenciaNueva`.
- Cliente contra el simulado: crea una orden, la consulta, orden inexistente, error 401, error 500, tiempo agotado, y que el token no aparezca en los errores.
- Revisión del build: buscar el token de prueba en `.output/public`.

## Feature flag
No aplica.

## Rollout
Merge a la rama que se defina (Q-11).

## Rollback
Revertir el commit.

## Riesgos
- El simulado refleja mi lectura de la documentación, no la API real: puede coincidir con ella o no. Mitigación: la fase 4 repite todo con credenciales.
- Que el token se filtre. Mitigación: configuración privada, `.env` ignorado y búsqueda del token en el build.

## Cambios respecto del plan original (implementación, 2026-11-10)
- Se agregó la opción `checkoutUrlFalsa` al simulado para probar que la tienda rechaza una URL de pago ajena. `[VERIFICADO]` `scripts/mercadopago-simulado.mjs`
- La clase `ErrorMercadoPago` declara sus campos de forma explícita (no usa propiedades en el constructor) para que Node pueda ejecutarla sin compilar. `[VERIFICADO]`
- `urlDePagoSegura` solo acepta el origen de la API configurada si **no** es la oficial, así una URL cualquiera de `localhost` no se acepta en producción. `[VERIFICADO]` `tests/mercadopago.test.mjs`
- El simulado exige el token en `Authorization`, la clave `X-Idempotency-Key` y valida el cuerpo según la documentación (incluido que `total_amount` sea la suma de los ítems). `[VERIFICADO]`

## Resultados de verificación
- `npm test`: 52 tests nuevos (20 de pedido, 16 de orden y estados, 16 del cliente contra el simulado). Cubren: ids, cantidades, repetidos y límites; precios y total exactos desde el catálogo (los inventados por el navegador no cuentan); cada estado de Mercado Pago; URLs de pago seguras y maliciosas; 401, 404, 500, tiempo agotado y red caída; claves de idempotencia distintas; y que el token no aparezca en errores, URL ni cuerpo. `[VERIFICADO]`
- **El token no está en el resultado del build:** construido con un token en el entorno, aparece 0 veces en `.output/public`, `.output/server` y `.nuxt`. Se lee recién al ejecutar. `[VERIFICADO]`
- `.env` y `.env.*` están ignorados por git y `.env.example` no. `[VERIFICADO]` `git check-ignore`.
- **No verificado contra el Mercado Pago real:** todo se probó contra el simulado, escrito a partir de la documentación. Pueden diferir los campos de la respuesta de `GET /v1/orders/{id}`, los parámetros de retorno, el formato de los errores, el comportamiento de `X-Idempotency-Key`, si acepta `localhost` en las URLs de retorno y el significado exacto de `auto_return: "all"`. `<pendiente>` fase 4.
