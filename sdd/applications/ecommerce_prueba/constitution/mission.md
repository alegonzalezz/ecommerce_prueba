# Misión — ecommerce_prueba

> Todavía no hay código. Todo lo de abajo viene de lo dicho por el usuario el 2026-11-10, salvo lo marcado.

## Qué hace
Tienda online de **productos físicos**. `[PROPUESTA]` dicho por el usuario el 2026-11-10.

## Flujos que soporta
- Hoy: ver una landing con header, hero y tres carruseles de productos (lo más vendido, lo nuevo, con descuento) abrir la ficha de cada producto (con SEO para buscadores y asistentes de IA), agregarlo a un carrito que se recuerda 2 horas en el navegador y volver a los productos vistos recientemente. `[VERIFICADO]` `app/pages/index.vue`, `app/pages/producto/[slug].vue`
- Candidatos futuros (no confirmados): ficha de producto, carrito, checkout con Mercado Pago, confirmación de pedido por mail. `[PROPUESTA]`

## Quiénes la usan
`<pendiente>` (compradores, y quien administra el catálogo y los pedidos).

## Qué NO hace
- No tiene backend separado ni base de datos propia. `[PROPUESTA]` dicho por el usuario el 2026-11-10 (ver `constraints.md` C-02).
- No tiene relación con `prueba_pagina`. `[PROPUESTA]` dicho por el usuario el 2026-11-10.

## Estado actual del repo
El repo git no tiene commits. Contiene `sdd/` (documentación) y, desde el 2026-11-10, el código de la landing de ferretería (Nuxt + PrimeVue, catálogo en JSON). pagar el carrito con Mercado Pago en sandbox (probado contra un simulado; falta la prueba con credenciales reales). No hay envíos, mails de confirmación, registro de pedidos ni descuento de stock. `[VERIFICADO]` `git log`; listado de `app/`, `data/`, `scripts/`.
