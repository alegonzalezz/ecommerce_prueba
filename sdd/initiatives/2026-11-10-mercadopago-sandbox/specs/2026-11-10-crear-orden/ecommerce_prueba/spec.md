# Spec: Crear la orden y redirigir a Mercado Pago

- **Fecha:** 2026-11-10
- **Autor:** agonzalezz
- **Iniciativa:** `initiatives/2026-11-10-mercadopago-sandbox/initiative.md`
- **Estado:** implementada   <!-- borrador | en revisión | aprobada | implementada | descartada -->
- **Plan:** [plan.md](plan.md) · **Tareas:** [tasks.md](tasks.md)

> Aprobada por el usuario el 2026-11-10 ("OK, creá las specs y construí las fases 1 a 3"). Ninguna tarea de código arranca con esta spec en estado `borrador`.


## Contexto
- **Qué pasa si no hacemos nada:** el carrito no puede cobrar.
- **Situación actual en el código:** "Finalizar compra" está deshabilitado y el aviso dice "Pronto podrás comprar online"; la ficha repite ese aviso. `[VERIFICADO]` `app/pages/carrito.vue`, `app/pages/producto/[slug].vue`.

## User stories
- Como comprador quiero tocar "Finalizar compra" y pasar a pagar en Mercado Pago.
- Como comprador quiero un mensaje claro si algo falla, sin perder mi carrito.

## Criterios de aceptación
- **Given** un carrito válido y credenciales, **When** toco "Finalizar compra", **Then** el botón muestra "Redirigiendo a Mercado Pago…", queda deshabilitado y el navegador va a la `checkout_url`.
- **Given** `POST /api/checkout` con `{ lineas: [{id, cantidad}] }`, **Then** el servidor valida, recalcula, crea la orden con `X-Idempotency-Key` nuevo y responde `{ url }`.
- **Given** un cuerpo malformado o demasiado grande, **Then** responde 400 sin llamar a Mercado Pago.
- **Given** un carrito con un producto sin stock, inexistente o con cantidad excedida, **Then** responde 409 con el motivo y no crea la orden; el carrito muestra el aviso.
- **Given** que no hay token configurado, **Then** responde 503 y el carrito muestra "El pago online todavía no está configurado."
- **Given** un error o tiempo agotado de Mercado Pago, **Then** responde 502 con un mensaje genérico y se registra el detalle solo en el servidor.
- **Given** una `checkout_url` que no es `https` de Mercado Pago, **Then** se rechaza (502) y no se redirige.
- **Given** una orden creada, **Then** el servidor guarda su id en la cookie `ecommerce_orden` (`httpOnly`, `sameSite=lax`, `secure` en producción, sin datos personales).
- **Given** más de 10 pedidos por minuto desde una misma IP, **Then** responde 429.
- **Given** el carrito y la ficha, **Then** ya no dicen "Pronto podrás comprar online"; el carrito muestra "Modo de prueba: no se cobra dinero real." y "Pagás de forma segura en Mercado Pago".
- **Given** el carrito vacío o cargando, **Then** "Finalizar compra" está deshabilitado.

### Casos borde
- Carrito modificado en otra pestaña durante el pago: se envía lo que había al tocar el botón.
- Volver atrás desde Mercado Pago: el carrito sigue como estaba.
- Doble clic: una sola orden por intento.

### Comportamiento por país
Solo Argentina.

## Fuera de alcance
- Webhooks, mails, registro de pedidos, envío.

## Impacto en métricas
- **Qué medimos:** que el total de la orden creada coincida con el subtotal del carrito; cada código de respuesta.
- **Cómo sabemos si salió mal:** un total distinto, o redirecciones a dominios ajenos.

## Dependencias
- Fase 1 cerrada.

## Preguntas abiertas de esta spec
- Ninguna nueva.

