---
slug: 2026-11-10-mercadopago-sandbox
title: Pago con Mercado Pago (Checkout Pro, Orders API) en modo sandbox
author: agonzalezz
status: en desarrollo                   # borrador | aprobada | en desarrollo | en QA | en producción | descartada
apps:
  - name: ecommerce_prueba
    why: Es la tienda; acá viven las rutas de servidor que hablan con Mercado Pago y las páginas de retorno
    depends_on: []
---

# Iniciativa: Pago con Mercado Pago (Checkout Pro, Orders API) en modo sandbox

> Spec funcional única. Cada app afectada recibe una porción en `specs/<YYYY-MM-DD-fase>/<app>/spec.md`.
> Los repos de código no llevan `.sdd/`: solo código. Las tareas viven en el `tasks.md` de cada spec.

Origen: pedido del usuario del 2026-11-10 ("quiero una integración con Mercado Pago, por ahora con el sandbox"), refinado con una ronda de preguntas. El usuario aprobó crear las specs y construir las fases 1 a 3; la 4 espera credenciales. Las decisiones siguen marcadas `[PROPUESTA]`.

## Contexto
- **Qué pasa si no hacemos nada:** el carrito no puede cobrar: "Finalizar compra" está deshabilitado. `[VERIFICADO]` `app/pages/carrito.vue`.
- **Situación actual:** no hay rutas de servidor de negocio, ni variables de entorno secretas, ni `.env` ignorado por git. `[VERIFICADO]` `server/routes/` (solo sitemap, robots y llms.txt), `.gitignore` (no incluye `.env`).
- **Restricciones del equipo:** C-03 pide Mercado Pago y sandbox hasta que el equipo decida lo contrario; C-02 prohíbe un backend separado o una base de datos propia (se usan rutas de servidor de Nuxt). `[VERIFICADO]` `applications/ecommerce_prueba/constitution/constraints.md`.
- **Decisiones del usuario (2026-11-10) `[PROPUESTA]`:**
  - Integración con Mercado Pago **en sandbox**; las credenciales todavía no existen.
  - Los pedidos viven **solo en Mercado Pago** (no se registran en la tienda; no se descuenta stock).
  - **Sin envío:** se cobran solo los productos; la entrega queda como pregunta abierta.
  - Se confirma el pago **al volver a la tienda, consultando a Mercado Pago**; los webhooks quedan para después.
- **Decisiones del asistente (el usuario las puede vetar):**
  - **Checkout Pro vía Orders API** (`POST /v1/orders`), que Mercado Pago presenta como la recomendada para integraciones nuevas; Preferences quedó como "legacy". `[INFERIDO]` guías de terceros y páginas de la documentación; ver `integrations.md`.
  - `fetch` directo, sin SDK.
  - El servidor **recalcula todo desde el catálogo**; del navegador solo acepta ids y cantidades.
  - El id de la orden se recuerda en una cookie `httpOnly` del navegador que inició el pago (no hay base de datos).
  - Un aviso visible de "Modo de prueba" mientras se use el sandbox.
  - Las pruebas automáticas usan un **Mercado Pago simulado** escrito a partir de la documentación; no reemplaza la prueba con credenciales reales.

## User stories
- Como **comprador** quiero pagar mi carrito en el sitio de Mercado Pago y volver a la tienda sabiendo si el pago salió bien.
- Como **equipo** quiero que el precio que se cobra salga del catálogo y no de lo que mande el navegador.
- Como **equipo** quiero probar el flujo completo en sandbox sin cobrar dinero real.

## Criterios de aceptación
Todos `[EC]` (`ecommerce_prueba`).
- **Given** un carrito válido y credenciales cargadas, **When** toco "Finalizar compra", **Then** el servidor crea una orden en Mercado Pago por el total recalculado desde el catálogo y me redirige a la página de pago.
- **Given** un pedido con precios, nombres o totales inventados por el navegador, **Then** el servidor los ignora: solo usa ids y cantidades.
- **Given** un id inexistente o inactivo, un producto sin stock o una cantidad mayor al máximo, **When** inicio el pago, **Then** no se crea ninguna orden y veo un mensaje claro.
- **Given** que no hay credenciales cargadas, **When** inicio el pago, **Then** veo "El pago online todavía no está configurado." y mi carrito sigue intacto.
- **Given** un error de Mercado Pago, **Then** veo un mensaje genérico, el carrito sigue intacto y nada del token ni de la respuesta interna se filtra al navegador.
- **Given** que vuelvo de pagar, **When** el estado real en Mercado Pago es aprobado, **Then** la página lo muestra, vacía el carrito y muestra la referencia.
- **Given** un estado pendiente, rechazado, cancelado o vencido, **Then** la página lo explica y **conserva** el carrito, con un camino para reintentar.
- **Given** una URL de retorno manipulada (por ejemplo `status=approved`) cuando Mercado Pago dice otra cosa, **Then** la página muestra el estado real, no el de la URL.
- **Given** que no hay cookie ni orden verificable, **Then** la página dice que no encuentra una compra para verificar y no vacía nada.
- **Given** el código entregado al navegador y el HTML, **Then** no contienen el token de acceso; `.env` está ignorado por git.
- **Given** el sandbox, **Then** las pantallas de carrito y resultado muestran "Modo de prueba: no se cobra dinero real."
- **Given** la página de resultado, **Then** lleva `noindex` y no está en el sitemap ni en `llms.txt`.
- **Given** la home, la ficha y el carrito, **Then** Lighthouse móvil sigue sin bajar de 90 en Performance.

## Casos borde y errores
- Doble clic en "Finalizar compra": el botón se deshabilita mientras se procesa; cada intento usa su propia clave de idempotencia.
- La persona vuelve a pagar con otra pestaña: la cookie guarda siempre la última orden.
- Vuelve desde otro navegador o sin cookie: se usa `order_id` de la URL solo si tiene formato válido y la orden consultada coincide con `external_reference`; si no, "no encontramos una compra".
- La orden queda "creada" (la persona volvió sin pagar): se muestra como pendiente de pago, no como error.
- Mercado Pago tarda o no responde: tiempo máximo de espera, mensaje genérico, nada queda a medias.
- Demasiados pedidos seguidos desde una misma IP: se limitan.
- El total siempre es la suma exacta de precio × cantidad en enteros (sin decimales flotantes).

## Comportamiento por país
Solo Argentina: ARS, textos en español rioplatense. El dominio de `checkout_url` varía por país del vendedor.

## Fuera de alcance
- Webhooks (necesitan URL pública y algo donde registrar el resultado), envíos, descuento de stock, mails de confirmación, registro propio de pedidos, reembolsos y cancelaciones, datos del comprador, cuotas y medios de pago a medida.
- Pasar a producción (C-03: el equipo decide cuándo).
- Probar contra el Mercado Pago real: espera credenciales (fase 4).

## Impacto en métricas
- **Qué medimos:** que el total cobrado coincida con el catálogo; que cada estado se muestre bien; que el token no se filtre; Lighthouse.
- **Cómo sabemos si salió mal:** un total distinto al del catálogo, un carrito vaciado sin pago aprobado, o el token visible en el navegador.

## Contratos entre apps
| Contrato | Productor | Consumidor | Breaking |
|---|---|---|---|
| `POST /api/checkout` `{ lineas: [{ id, cantidad }] }` → `{ url }` | servidor | carrito | Mismo repo |
| `GET /api/pago/estado` → `{ estado, referencia, total }` | servidor | página de resultado | Mismo repo |
| Mercado Pago Orders API (`POST /v1/orders`, `GET /v1/orders/{id}`) | Mercado Pago | servidor | Externo; verificado solo contra documentación |
| Cookie `ecommerce_orden` (id de la orden) | servidor | servidor | No |

## Orden de despliegue y rollback
| # | Fase | Contenido |
|---|---|---|
| 1 | `base-mercadopago` (implementada) | Configuración y secretos, `.gitignore`, pedido recalculado, cliente de la API, Mercado Pago simulado |
| 2 | `crear-orden` (implementada) | Ruta `POST /api/checkout`, botón "Finalizar compra", aviso de modo de prueba |
| 3 | `retorno-y-estado` (implementada) | Ruta de estado, página de resultado, vaciado del carrito |
| 4 | `prueba-sandbox` (guía hecha; pruebas reales pendientes de credenciales) | Guía y lista de pruebas con credenciales reales (pendiente) |

Rollback: revertir por fase; sin credenciales el pago responde "no configurado" y el resto de la tienda no cambia.

## Preguntas abiertas
- Webhooks y dónde registrar pedidos y avisar (mails, base de datos): Q-28 y Q-04.
- ¿Acepta Mercado Pago `localhost` en las URLs de retorno? Se verifica con credenciales (Q-29).
- Stock que no baja tras una compra (Q-30), entrega y envíos (Q-31) y pase a producción (Q-32).
