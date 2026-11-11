# Integraciones — ecommerce_prueba

> Sin código todavía.

| Servicio | Para qué | Contrato | Evidencia |
|---|---|---|---|
| Mercado Pago (sandbox) | Cobros | `<pendiente>` | `[PROPUESTA]` pedido por el usuario el 2026-11-10 |
| Mails | Notificaciones de pedido | `<pendiente>` | ver Q-04 |

Contratos con otras apps: ninguno (sin relación con `prueba_pagina`). `[PROPUESTA]`

## Buscadores y asistentes de IA (SEO)
| Servicio | Para qué | Contrato / uso | Evidencia |
|---|---|---|---|
| Google (Googlebot) y otros buscadores | Indexar fichas y mostrar precio y disponibilidad | `sitemap.xml`, `robots.txt`, `canonical`, JSON-LD `Product` y `BreadcrumbList` | `server/routes/`, `shared/utils/seo.ts` `[VERIFICADO]` que se generan; la indexación `<pendiente>` (Q-22) |
| OpenAI, Anthropic, Perplexity, Google (Gemini) | Que sus rastreadores puedan leer el sitio | `robots.txt` con `Allow: /` para `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-SearchBot`, `Claude-User`, `anthropic-ai`, `PerplexityBot`, `Perplexity-User`, `Google-Extended`; y `llms.txt` | `shared/utils/seo.ts` `[VERIFICADO]`; nombres `[INFERIDO]` de guías de terceros (Q-20) |
| Open Graph / Twitter Cards | Vista previa al compartir un enlace | `og:*`, `twitter:*`, imagen `desktop` absoluta | `app/pages/producto/[slug].vue` `[VERIFICADO]` |

## Mercado Pago (Checkout Pro vía Orders API, sandbox)
Estado al 2026-11-10: integrado y probado contra un **simulado**; **sin probar contra el Mercado Pago real** (faltan credenciales; ver `guia-sandbox-mercadopago.md`).

### Qué se leyó de la documentación (y de dónde)
| Dato | Fuente |
|---|---|
| `POST https://api.mercadopago.com/v1/orders` crea la orden; devuelve `id` y `checkout_url` | https://www.mercadopago.com.br/developers/en/docs/checkout-pro-orders/create-order `[VERIFICADO]` |
| Encabezados: `Authorization: Bearer <Access Token de prueba>`, `X-Idempotency-Key` (un UUID por intento), `Content-Type: application/json` | misma página `[VERIFICADO]` |
| Cuerpo: `type: "online"`, `processing_mode: "manual"`, `total_amount` (texto, igual a la suma de `unit_price` × `quantity`), `external_reference`, `items[]` (`title`, `unit_price` texto, `quantity`), `description`; `payer.email` solo si se envía `payer` | misma página `[VERIFICADO]` |
| URLs de retorno en `config.online.success_url`, `failure_url`, `pending_url` y `config.online.auto_return` (`"approved"` o `"all"`) | https://www.mercadopago.com.ar/developers/en/docs/checkout-pro-orders/web-integration/configure-back-urls `[VERIFICADO]` |
| Parámetros que Mercado Pago agrega al volver: `collection_id`, `collection_status`, `payment_id`, `status` (`approved`, `rejected`, `pending`), `external_reference`, `payment_type`, `merchant_order_id`, y `order_id` (en la tabla, no en el ejemplo) | misma página `[VERIFICADO]`; `order_id` queda como no confirmado |
| `GET /v1/orders/{order_id}` consulta una orden con el mismo token | resultados de búsqueda sobre la referencia de la API `[INFERIDO]` (no se pudo abrir la página) |
| Estados de la orden: `created`, `processed`, `action_required`, `processing`, `failed`, `refunded`, `canceled`, `expired`, `charged_back` | resultados de búsqueda sobre "Order status" `[INFERIDO]`; las fuentes discrepan en `canceled` vs `expired` |
| La Orders API es la recomendada para integraciones nuevas; Preferences quedó como "legacy" y se sigue soportando | resultados de búsqueda sobre la referencia de Checkout Pro `[INFERIDO]` |
| No hace falta una cuenta de comprador de prueba para Checkout Pro | https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/integration-test `[VERIFICADO]` |

### Qué no se pudo leer (supuestos del simulado)
- Forma exacta de la respuesta de `GET /v1/orders/{id}` (se asume el mismo objeto que devuelve la creación).
- Formato de los errores y de las notificaciones.
- Comportamiento de `X-Idempotency-Key` ante repeticiones.
- Si Mercado Pago acepta `localhost` en las URLs de retorno con Orders.
- Qué hace exactamente `auto_return: "all"`.
- Dominio de `checkout_url` para una cuenta argentina (la documentación dice que varía por país).

### Cómo está integrado en el código
| Pieza | Archivo |
|---|---|
| Armado del pedido desde el catálogo (ids y cantidades; precios y total del servidor) | `shared/utils/pedido.ts` |
| Cuerpo de la orden, estados, URL de pago segura, referencia propia | `shared/utils/mercadopago.ts` |
| Cliente `fetch` (sin SDK), con clave de idempotencia y tiempo máximo | `shared/utils/mercadopago-cliente.ts` |
| Crear la orden y redirigir | `server/api/checkout.post.ts` |
| Consultar el estado real al volver | `server/api/pago/estado.get.ts` |
| Página de resultado | `app/pages/compra/resultado.vue` |
| Simulado de Mercado Pago | `scripts/mercadopago-simulado.mjs` |

Variables: `NUXT_MERCADOPAGO_ACCESS_TOKEN` (secreto, solo servidor), `NUXT_MERCADOPAGO_API_URL` (solo para el simulado), `NUXT_PUBLIC_MODO_PRUEBA`.

### Seguridad
- Los datos de la tarjeta se ingresan en el sitio de Mercado Pago y nunca pasan por la tienda. `[VERIFICADO]` por el flujo de redirección.
- El token no está en el build (0 apariciones con un token puesto en el entorno) ni en el navegador ni en los registros. `[VERIFICADO]`
- El servidor ignora precios y totales del navegador, rechaza URLs de pago que no sean de Mercado Pago y limita los pedidos por IP. `[VERIFICADO]`
- El estado del pago se consulta a Mercado Pago; lo que diga la URL de retorno no cuenta. `[VERIFICADO]`

