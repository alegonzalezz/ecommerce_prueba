# Roadmap

| Iniciativa | Objetivo | Prioridad | Estado | Apps | Avance | Carpeta |
|---|---|---|---|---|---|---|
| Landing de ferretería con carruseles desde JSON | Primera landing moderna (header, hero, 3 carruseles, footer) alimentada por un JSON versionado | <pendiente> | en desarrollo | `ecommerce_prueba` | EC 25/25 (fases 1-3; falta la fase 4) | `initiatives/2026-11-10-landing-ferreteria/` |
| Ficha de producto con SEO | Página `/producto/<slug>` y SEO para buscadores y asistentes de IA | <pendiente> | en desarrollo | `ecommerce_prueba` | EC 23/23 (fases 1-3) | `initiatives/2026-11-10-ficha-producto/` |
| Carrito y vistos recientemente en el navegador | Carrito persistente 2 h y productos vistos, guardados en `localStorage` con vencimiento | <pendiente> | en desarrollo | `ecommerce_prueba` | EC 19/19 (fases 1-3) | `initiatives/2026-11-10-carrito-persistente/` |
| Pago con Mercado Pago (sandbox) | Checkout Pro vía Orders API: crear la orden, pagar y verificar el estado | <pendiente> | en desarrollo | `ecommerce_prueba` | EC 23/25 (fases 1-3; la 4 espera credenciales) | `initiatives/2026-11-10-mercadopago-sandbox/` |

## Convenciones

- **Prioridad:** `P0` bloqueante · `P1` este trimestre · `P2` backlog comprometido · `P3` idea.
- **Estado:** `propuesta` · `spec en curso` · `en desarrollo` · `en QA` · `en producción` · `descartada`.
- **Avance:** `BE 4/6 · FE 1/5`, calculado leyendo los `tasks.md`; no se carga a mano. Una fila sin carpeta de iniciativa solo puede estar en `propuesta`.
- Cada app mantiene además su propio `constitution/roadmap.md`, con la misma carpeta (`slug`).
