---
name: ecommerce_prueba
id_prefix: EC
path: ..
sdd_dir: applications/ecommerce_prueba
specs_dir: initiatives/<slug>/specs/<fase>/ecommerce_prueba
templates_dir: applications/ecommerce_prueba/templates
roadmap_file: applications/ecommerce_prueba/constitution/roadmap.md
constraints_file: applications/ecommerce_prueba/constitution/constraints.md
default_branch: main
touches_when: se construye o cambia la tienda online (catálogo, carrito, checkout, pagos, mails de pedido)
---

# ecommerce_prueba

- **Path:** `..`
- **SDD:** `applications/ecommerce_prueba/`
- **Rol:** tienda online de productos físicos. `[PROPUESTA]` dicho por el usuario el 2026-11-10; todavía no hay código
- **Habla con:** Mercado Pago (sandbox primero). Sin relación con `prueba_pagina`. `[PROPUESTA]`

## Se toca cuando…
- Se construye cualquier parte de la tienda: páginas, componentes PrimeVue, server routes de Nuxt, integración con Mercado Pago, envío de mails.
- `<pendiente>`: refinar cuando haya código.

## NO está acá
- **Backend separado y base de datos propia:** decisión del usuario, no habrá. Las server routes de Nuxt viven en este mismo repo. `[PROPUESTA]` (dicho el 2026-11-10)
- **Sitio institucional DUOMAN:** vive en `prueba_pagina`. Sin relación.
- `<pendiente>`: el resto, cuando haya código.

## Para tareas que dependen de otras apps
Ninguna app de este proyecto. Depende de Mercado Pago (externo). `[PROPUESTA]`

## Flujo de ramas / entornos
- La rama configurada es `main`, sin commits todavía. `[VERIFICADO]` `../.git/config` y `git log` ("does not have any commits yet").
- Ambientes y flujo de promoción: `<pendiente>` (ver `open-questions.md` Q-11).

## Cómo correr
`<pendiente>`: no hay código ni manifiesto.

## Fuentes (archivos leídos y fecha)
- `../.git/config`, `git log`, listado de `ecommerce_prueba/` (solo contiene `sdd/`) — leídos el 2026-11-10.
- Decisiones de stack y pagos: conversación con el usuario del 2026-11-10 (no hay archivo).
