# Plan: Prueba con credenciales reales del sandbox

- **Spec:** [spec.md](spec.md)
- **Fecha:** 2026-11-10


## Enfoque
Una guía paso a paso (`applications/ecommerce_prueba/guia-sandbox-mercadopago.md`) para crear la aplicación, cargar las credenciales y recorrer los escenarios, y una tabla "esperado vs real" que se completa al probar. Si algo difiere, se corrige el código y las specs en el mismo trabajo. `[PROPUESTA]`

## Cambios por capa
- **Producto:** Sin cambios.
- **Front (Nuxt + PrimeVue):** Sin cambios (salvo correcciones que surjan).
- **Server routes de Nuxt (Nitro):** Sin cambios (salvo correcciones).
- **Pagos (Mercado Pago):** prueba real.
- **Mails, SEO, Data, Infra:** Sin cambios.
- **DB:** no aplica a este repo (C-02). No hay migraciones.
- **Observabilidad:** revisar los registros del servidor durante la prueba.

## Verificación de constraints
| Constraint | ¿Aplica? | Cómo se cumple |
|---|---|---|
| C-01 (SSR) | Sí | Sin cambios de render. |
| C-02 (sin backend ni DB) | Sí | Todo en el mismo proyecto. |
| C-03 (Mercado Pago, sandbox) | Sí | Solo credenciales de prueba; ninguna de producción. |
| C-04 (PrimeVue) | No | Sin cambios de UI. |
| C-05 | Sin definir | `<pendiente>`. |

## Testing
- Escenarios con tarjetas de prueba: aprobado, rechazado, pendiente; cancelar el pago; volver sin pagar; cerrar la pestaña y volver desde el mismo navegador.

## Feature flag
No aplica.

## Rollout
No aplica.

## Rollback
No aplica.

## Riesgos
- Diferencias entre el simulado y la API real. Mitigación: esta fase existe para encontrarlas.
- Pegar credenciales en un lugar equivocado. Mitigación: solo en `.env`, ignorado por git.

## Estado (2026-11-10)
- T01 hecha: `applications/ecommerce_prueba/guia-sandbox-mercadopago.md` explica cómo crear la aplicación, cargar el token y recorrer cada escenario, con una tabla "esperado vs real" para completar.
- T02 y T03 esperan las credenciales de prueba del usuario.
