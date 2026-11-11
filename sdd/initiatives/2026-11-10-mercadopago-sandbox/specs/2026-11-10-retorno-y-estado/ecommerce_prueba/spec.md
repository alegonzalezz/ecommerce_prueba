# Spec: Retorno de Mercado Pago y estado del pago

- **Fecha:** 2026-11-10
- **Autor:** agonzalezz
- **Iniciativa:** `initiatives/2026-11-10-mercadopago-sandbox/initiative.md`
- **Estado:** implementada   <!-- borrador | en revisión | aprobada | implementada | descartada -->
- **Plan:** [plan.md](plan.md) · **Tareas:** [tasks.md](tasks.md)

> Aprobada por el usuario el 2026-11-10 ("OK, creá las specs y construí las fases 1 a 3"). Ninguna tarea de código arranca con esta spec en estado `borrador`.


## Contexto
- **Qué pasa si no hacemos nada:** la persona paga y vuelve a una página inexistente, sin saber si se aprobó, y el carrito queda lleno.
- **Situación actual en el código:** no hay páginas de retorno ni ruta de estado. `[VERIFICADO]` `app/pages/`, `server/api/`.
- **Lo verificado:** Mercado Pago redirige a las URLs de `config.online` y agrega parámetros como `status`, `payment_id` y `external_reference`; `order_id` figura en la tabla de parámetros pero no en el ejemplo. `[VERIFICADO]` documentación "Configure return URLs" (Argentina).

## User stories
- Como comprador quiero ver, al volver, si mi pago se aprobó, quedó pendiente o falló.
- Como comprador quiero que mi carrito se vacíe solo si el pago se aprobó.

## Criterios de aceptación
- **Given** la ruta `GET /api/pago/estado`, **When** hay cookie `ecommerce_orden`, **Then** consulta `GET /v1/orders/{id}` y responde `{ estado, referencia, total }` con el estado ya traducido (aprobado, pendiente, rechazado, cancelado, desconocido).
- **Given** que no hay cookie pero la URL trae `order_id` con formato válido, **Then** se usa ese id, y solo se acepta si el `external_reference` de la orden coincide con el de la URL.
- **Given** que no hay forma de identificar la orden, **Then** responde 404 y la página dice que no encuentra una compra para verificar.
- **Given** una URL con `status=approved` y una orden que Mercado Pago no da por aprobada, **Then** la página muestra el estado real de la orden.
- **Given** un estado aprobado, **Then** la página muestra "Pago aprobado", la referencia y el total, vacía el carrito y borra la cookie.
- **Given** un estado pendiente (incluida una orden recién creada sin pago), **Then** explica que el pago no se completó o está en revisión y **conserva** el carrito, con enlaces a volver al carrito y a seguir mirando.
- **Given** un estado rechazado, cancelado o vencido, **Then** lo explica y conserva el carrito, con "Volver al carrito".
- **Given** un error al consultar a Mercado Pago, **Then** muestra "No pudimos verificar el estado de tu pago" y no vacía nada.
- **Given** `/compra/resultado`, **Then** lleva `noindex, nofollow`, no está en el sitemap ni en `llms.txt`, y muestra "Modo de prueba: no se cobra dinero real."
- **Given** que la página carga, **Then** muestra "Verificando tu pago…" hasta tener la respuesta (no un resultado provisorio).
- **Given** las pantallas en 390 y 1440 px, **Then** no hay desborde horizontal.

### Casos borde
- Volver a abrir la URL de un pago ya aprobado: el estado sigue aprobado; el carrito ya está vacío.
- Cookie de otra compra: se consulta la orden de la cookie; el `external_reference` de la URL, si existe, debe coincidir o se descarta.
- Orden de otra cuenta o inventada en `order_id`: Mercado Pago responde 404 y se trata como "no encontrada".

### Comportamiento por país
Solo Argentina.

## Fuera de alcance
- Webhooks, mails, reembolsos y registro propio del pedido.

## Impacto en métricas
- **Qué medimos:** estados correctos en cada caso (aprobado, pendiente, rechazado, manipulado, sin cookie).
- **Cómo sabemos si salió mal:** carrito vaciado sin pago aprobado, o un estado distinto del de Mercado Pago.

## Dependencias
- Fases 1 y 2 cerradas.

## Preguntas abiertas de esta spec
- Forma exacta de la respuesta de `GET /v1/orders/{id}` y de los parámetros reales de retorno: se confirman con credenciales (fase 4).

