# Spec: Base de la integración con Mercado Pago

- **Fecha:** 2026-11-10
- **Autor:** agonzalezz
- **Iniciativa:** `initiatives/2026-11-10-mercadopago-sandbox/initiative.md`
- **Estado:** implementada   <!-- borrador | en revisión | aprobada | implementada | descartada -->
- **Plan:** [plan.md](plan.md) · **Tareas:** [tasks.md](tasks.md)

> Aprobada por el usuario el 2026-11-10 ("OK, creá las specs y construí las fases 1 a 3"). Ninguna tarea de código arranca con esta spec en estado `borrador`.


## Contexto
- **Qué pasa si no hacemos nada:** no hay dónde guardar el token de forma segura ni cómo hablar con Mercado Pago, y el riesgo de poner el token en el repo o en el navegador es alto.
- **Situación actual en el código:** el `.gitignore` no excluye `.env`; no hay configuración privada en `nuxt.config.ts`; el carrito guarda ids y cantidades pero ningún código arma un pedido cobrable. `[VERIFICADO]` `.gitignore`, `nuxt.config.ts`, `shared/utils/carrito.ts`.
- **Lo verificado de la API (documentación leída el 2026-11-10):** `POST https://api.mercadopago.com/v1/orders` con `Authorization: Bearer <token>`, `X-Idempotency-Key` (un UUID por intento), cuerpo con `type: "online"`, `processing_mode: "manual"`, `total_amount` (texto, `"1000.00"`, igual a la suma de `unit_price` × `quantity`), `external_reference`, `items[]` con `title`, `unit_price` (texto) y `quantity`, y `config.online.{success_url, failure_url, pending_url, auto_return}`; responde con `id` y `checkout_url`. `GET /v1/orders/{order_id}` consulta la orden. Estados: `created`, `processed`, `action_required`, `processing`, `failed`, `refunded`, `canceled`, `expired`, `charged_back`. `[VERIFICADO]` páginas de la documentación de Mercado Pago (ver `integrations.md`); la forma exacta de la respuesta de `GET` y los errores **no** se pudo leer.

## User stories
- Como equipo quiero que el token viva solo en el servidor y no pueda llegar al repo ni al navegador.
- Como equipo quiero que el total se calcule en el servidor desde el catálogo, con tests.

## Criterios de aceptación
- **Given** el repositorio, **Then** `.env` y sus variantes están ignorados por git y existe `.env.example` con los nombres de las variables (sin valores).
- **Given** la configuración, **Then** el token es `runtimeConfig.mercadopago.accessToken` (privado), cargado desde `NUXT_MERCADOPAGO_ACCESS_TOKEN`, y la URL de la API desde `NUXT_MERCADOPAGO_API_URL` (por defecto la oficial).
- **Given** el build del navegador y el HTML de cualquier página, **Then** no contienen el token ni el nombre de la variable.
- **Given** líneas `[{id, cantidad}]`, **When** se arma el pedido, **Then** se toman nombre y precio del catálogo y el total es la suma exacta en enteros, con formato `"179800.00"`.
- **Given** un id inexistente, un producto inactivo, sin stock, una cantidad mayor al máximo, un pedido vacío o con más de 50 líneas, **Then** se rechaza con un motivo concreto y no se llama a Mercado Pago.
- **Given** un pedido válido, **Then** se construye el cuerpo de la orden con `type: "online"`, `processing_mode: "manual"`, `external_reference` propia, los ítems y las tres URLs de retorno armadas desde `SITE_URL` (nunca desde el pedido ni los encabezados) con `auto_return: "all"`.
- **Given** una respuesta de Mercado Pago, **Then** se traduce el estado a uno de: aprobado, pendiente, rechazado, cancelado, desconocido.
- **Given** una URL de pago, **Then** solo se acepta si es `https` en un dominio `mercadopago.*` (o el de la API configurada para pruebas).
- **Given** un error o un tiempo de espera agotado de la API, **Then** el cliente lanza un error propio sin incluir el token.
- **Given** el comando del simulado, **Then** levanta un Mercado Pago de prueba que valida la forma del pedido según la documentación y permite aprobar, rechazar o dejar pendiente.

### Casos borde
- Precio con decimales en el catálogo: el esquema exige enteros; si apareciera uno, el armado lo rechaza.
- Nombres con comillas o caracteres especiales: se envían tal cual en JSON.
- Referencia repetida: cada pedido genera una nueva.

### Comportamiento por país
Solo Argentina (ARS).

## Fuera de alcance
- Las rutas y pantallas (fases 2 y 3).

## Impacto en métricas
- **Qué medimos:** tests del armado del pedido y del cliente contra el simulado.
- **Cómo sabemos si salió mal:** un total distinto de la suma, o el token en el navegador.

## Dependencias
- Catálogo y carrito existentes.

## Preguntas abiertas de esta spec
- Si Mercado Pago acepta `localhost` en las URLs de retorno (Q-29).
- Formato exacto de errores y de `GET /v1/orders/{id}`: a confirmar con credenciales (fase 4).

