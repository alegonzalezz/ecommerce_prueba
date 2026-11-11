# Plan: <título>

- **Spec:** [spec.md](spec.md)
- **Fecha:** AAAA-MM-DD (obtener con `date +%F`)

## Enfoque
<Qué vamos a hacer y por qué así.>

**Alternativas descartadas:** <...> (si la decisión es relevante, crear un ADR en `applications/ecommerce_prueba/decisions/`).

## Cambios por capa
Si una capa no se toca se escribe "Sin cambios", no se borra.

- **Producto:** <catálogo, carrito, checkout, mails de pedido>
- **Front (Nuxt + PrimeVue):** <páginas, componentes, estado, SSR/hidratación> `<pendiente: estructura de carpetas>`
- **Server routes de Nuxt (Nitro):** <endpoints propios en este mismo repo; secretos solo acá, nunca en el cliente>
- **Pagos (Mercado Pago):** <preferencia, retorno, webhook, sandbox vs producción>
- **Mails:** <mecanismo elegido; ver `open-questions.md`>
- **SEO:** <metadatos SSR, sitemap, datos estructurados de producto>
- **Data:** <eventos de analytics, si aplica>
- **DB:** no aplica a este repo (decisión: sin backend ni base de datos propia). Dónde se guardan pedidos y catálogo: `<pendiente>` (ver `open-questions.md`). No hay migraciones.
- **Infra:** <host con Node para SSR, variables de entorno> `<pendiente>`
- **Observabilidad:** <logs de server routes, errores de pago> `<pendiente>`

## Verificación de constraints
Una fila por constraint de `applications/ecommerce_prueba/constitution/constraints.md`. Ninguna sin evaluar.

| Constraint | ¿Aplica? | Cómo se cumple |
|---|---|---|
| C-01 | <...> | <...> |

## Testing
<Qué se prueba, cómo y dónde.>

## Feature flag
<Nombre y comportamiento, o "No aplica".>

## Rollout
<Orden y pasos de despliegue.>

## Rollback
<Cómo se revierte.>

## Riesgos
- <...>
