# Registro de aplicaciones

| App | Repo (path) | Qué es | Se toca cuando… | Ficha |
|---|---|---|---|---|
| `prueba_pagina` | `../../prueba_pagina` | Sitio estático institucional de DUOMAN (mantenimiento y obra, CABA/GBA) con formularios que envían mail vía Google Apps Script. `[VERIFICADO]` `prueba_pagina/README.md` | Cambia el sitio institucional, sus formularios, su SEO o su despliegue en GitHub Pages | [prueba_pagina.md](prueba_pagina.md) |
| `ecommerce_prueba` | `..` | Tienda online de productos físicos: Nuxt SSR + PrimeVue, sin backend separado, pagos con Mercado Pago (sandbox primero). `[PROPUESTA]` dicho por el usuario el 2026-11-10; no hay código todavía | Se construye o cambia la tienda (catálogo, carrito, checkout, pagos, mails de pedido) | [ecommerce_prueba.md](ecommerce_prueba.md) |

## Aplicaciones conocidas sin ficha

- **Google Apps Script "recibe formularios"**: servicio externo, no es un repo. Su código vive en `prueba_pagina/apps-script-code.gs` y se despliega a mano en script.google.com. `[INFERIDO]` `prueba_pagina/README.md` §1. No lleva ficha: se documenta en `applications/prueba_pagina/integrations.md`.

## Cómo se relacionan

```
 prueba_pagina  ──POST JSON──▶  Google Apps Script ──▶ Gmail / Google Sheet (opcional)

 ecommerce_prueba  ──(sin relación con prueba_pagina)──  Mercado Pago (sandbox)   [PROPUESTA]
```

`prueba_pagina` y `ecommerce_prueba` **no tienen relación entre sí** (dicho por el usuario, 2026-11-10). Hoy no hay contratos entre apps.

## Cómo decidir dónde van las specs

1. Leer la ficha de cada app y su campo **Se toca cuando…**.
2. Si la feature cambia un contrato entre apps, involucra a **ambas** (el productor primero).
3. Si toca algo de la lista "NO está acá" de una ficha, el trabajo va en otra app.
4. Si la feature cae en una app sin ficha, primero se releva esa app y se agrega su ficha.
