# Preguntas abiertas — ecommerce_prueba

Formato: pregunta · por qué importa · a qué documento va la respuesta.

| ID | Pregunta | Por qué importa | Va a |
|---|---|---|---|
| Q-01 | `sdd/` vive dentro del repo `ecommerce_prueba`, que es el repo de la app. ¿Se queda ahí, o se mueve a un repo aparte? | La regla 7 de `CLAUDE.md` dice que los repos de código no llevan documentación SDD | `CLAUDE.md`, `conventions.md` |
| Q-03 | ¿Dónde se guardan los pedidos y cómo se confirma el pago? (webhooks de Mercado Pago requieren un endpoint público) | C-02 prohíbe backend separado; las server routes de Nuxt lo cubrirían, pero no hay persistencia | `architecture.md`, ADR |
| Q-04 | ¿Cómo se mandan los mails de pedido? Apps Script/Gmail (como `prueba_pagina`) tiene endpoint público sin autenticación, `no-cors` sin confirmación de entrega y cuota diaria de Gmail; sirve para avisos internos, pero queda corto para confirmaciones de pedido al comprador | Fiabilidad y abuso. Mailflare se evaluó el 2026-11-10 y se descartó por ahora; la opción a explorar es Resend, que desde una server route de Nuxt mantiene la key en el servidor | `integrations.md`, ADR |
| Q-05 | ¿En qué host con Node se despliega (SSR no corre en GitHub Pages)? | Infra, variables de entorno, costos | `constitution/tech-stack.md` |
| Q-06 | ¿Qué integración de Mercado Pago se usa (Checkout Pro, Bricks, otra) y cómo se pasa de sandbox a producción? | Define flujo de pago y seguridad | `integrations.md`, ADR |
| Q-07 | ¿Países, moneda, impuestos/facturación y envíos? | Alcance funcional | `constitution/mission.md` |
| Q-08 | ¿Se maneja stock? ¿Dónde vive? | Sin DB no hay fuente de verdad | `architecture.md` |
| Q-09 | ¿Cuál es el dominio? Hoy `NUXT_PUBLIC_SITE_URL` es provisoria (`http://localhost:3000`). Falta además dar de alta el sitio en Google Search Console (y Bing) y decidir analytics. El SEO técnico ya está hecho (ver `architecture.md`) | Sin dominio, `canonical`, sitemap y Open Graph apuntan a localhost | `integrations.md`, `conventions.md` |
| Q-10 | ¿Quién es el referente de la app? | Escalamiento | `applications/ecommerce_prueba.md` |
| Q-11 | ¿Flujo de ramas y ambientes? (el default del brief era `qa-e` → `dev` → `main`, no verificable acá) | Rollout | `applications/ecommerce_prueba.md`, `conventions.md` |
| Q-13 | ¿Constraints adicionales del equipo (además de C-01 a C-04)? | Reglas verificables | `constitution/constraints.md` |
| Q-15 | ¿Se migra a PrimeVue 5 más adelante? Requiere clave de licencia PrimeUI (Community: gratis si la organización cumple los límites). Hoy se usa 4.5.5 (MIT). ¿La línea 4.x seguirá recibiendo correcciones de seguridad? | Licencia y mantenimiento | `decisions/ADR-002-primevue-4-por-licencia.md` |
| Q-16 | `npm audit` marca avisos en Nuxt ≤ 4.6.2 (rutas `__nuxt_island`, `routeRules` con rutas en otra capitalización). La app usa 4.4.5 porque las 4.6.x exigen Node `^22.22.3 \|\| ^24.15.0 \|\| >=26` y esta máquina tiene Node 25.2.1. ¿Se fija Node 24 LTS y se sube a 4.6.x antes de publicar? | Seguridad antes de desplegar | `constitution/tech-stack.md`, `conventions.md` |
| Q-17 | El HTML pesa 204 KB sin comprimir (el tema de PrimeVue va inline) y 27 KB con gzip; Lighthouse móvil da 80 sin compresión y 95-96 con ella. ¿El host elegido comprime respuestas SSR? | Cumplir Lighthouse ≥ 90 | `architecture.md`, `constitution/tech-stack.md` |
| Q-18 | Textos del hero y del footer, nombre de la tienda ("Tu Ferretería", provisorio) e imágenes (placeholders) son provisorios. ¿Quién los define y cuándo hay fotos reales? | Contenido real | `architecture.md` |
| Q-19 | Los nombres de categoría se arman con un diccionario en `app/utils/nombreCategoria.ts`. ¿Se agregan al JSON como lista de categorías cuando haya páginas de categoría? | Evitar duplicar datos | `domain-glossary.md`, `architecture.md` |
| Q-20 | Los nombres de los rastreadores de IA de `robots.txt` salen de guías de terceros. ¿Se confirman contra la documentación oficial de OpenAI, Anthropic, Perplexity y Google antes de publicar? Y ¿se mantiene permitir los de entrenamiento? | Un nombre incorrecto no tiene efecto; una política equivocada expone los textos | `integrations.md` |
| Q-21 | La home no se pregenera: incluir `/` en `nitro.prerender.routes` rompe el build con `[unstorage] Invalid key: "/"` en Nuxt 4.4.5. ¿Se reintenta al actualizar Nuxt (Q-16)? | La home se sirve por pedido; si el host no corre Node, no tendría HTML estático | `architecture.md` |
| Q-22 | Los datos estructurados no se validaron con las herramientas de Google (Prueba de resultados enriquecidos, Search Console). ¿Quién los revisa una vez publicado el sitio? | Cumplir el formato no asegura elegibilidad para resultados enriquecidos; la indexación y las citas en asistentes no se pueden medir desde el repo | `integrations.md` |
| Q-23 | El carrito y los vistos se guardan en el navegador sin pedir consentimiento (solo ids y cantidades, sin datos personales ni seguimiento). ¿Hace falta un aviso o un banner? No es asesoramiento legal | Cumplimiento en Argentina y otros países si se amplía el alcance | `integrations.md`, `constitution/principles.md` |
| Q-24 | El tope de 10 unidades por producto (además del stock) es una propuesta. ¿Es correcto o varía por producto? | Compras al por mayor | `domain-glossary.md`, `shared/utils/carrito.ts` |
| Q-25 | Cuando haya pago, el servidor debe recalcular precios y validar stock: el carrito del navegador no es fuente de verdad. ¿Dónde vive esa validación (server route de Nuxt, C-02)? | Seguridad del cobro | `architecture.md`, ADR |
| Q-26 | Filtros, búsqueda, listado y páginas de categoría quedaron para otra iniciativa. ¿Cuándo? Además mejorarían el SEO (hoy la categoría no tiene página) | Continuación natural | `constitution/roadmap.md` |
| Q-27 | El carrito y los vistos se probaron solo en Chrome. ¿Se prueban Safari y Firefox (en Safari el modo privado tiene límites distintos de almacenamiento)? | Compatibilidad | `conventions.md` |
| Q-28 | Los avisos automáticos de Mercado Pago (webhooks) quedaron fuera: necesitan URL pública y algo donde registrar el resultado (no hay base de datos ni mails). Hoy, si la persona cierra la pestaña tras pagar, la tienda no se entera. ¿Cuándo y con qué respaldo (C-02)? | Fiabilidad del cobro | `integrations.md`, ADR |
| Q-29 | ¿Mercado Pago acepta `localhost` en `config.online.*_url`? ¿Qué parámetros agrega realmente al volver (¿viene `order_id`?) y cómo es la respuesta real de `GET /v1/orders/{id}` y de los errores? Todo se probó solo contra un simulado | El simulado puede coincidir con la API real o no | `integrations.md` (fase 4) |
| Q-30 | La tienda no registra pedidos ni descuenta stock: el stock del JSON no baja tras una compra, y el único registro es Mercado Pago. Antes de cobrar de verdad hay que decidir dónde vive el pedido (Q-08) | Sobreventa y falta de comprobante propio | `architecture.md`, ADR |
| Q-31 | Entrega y envío: se cobra solo el subtotal y la entrega "se coordina aparte". ¿Cómo se entrega, se cobra envío, y cómo se le avisa a la persona (mails, Q-04)? | Alcance funcional | `constitution/mission.md` |
| Q-32 | Pasar a producción: ¿cuándo y quién decide (C-03)? Implica credenciales productivas, `NUXT_PUBLIC_MODO_PRUEBA=false`, host con HTTPS y compresión (Q-05, Q-17), webhooks (Q-28) y revisar los límites por IP detrás de un proxy | Salida a producción | `constitution/constraints.md`, `conventions.md` |
| Q-33 | El límite de pedidos y de consultas es en memoria: se reinicia con el servidor, no se comparte entre instancias y no confía en `X-Forwarded-For`. ¿Se complementa con un límite del host o del CDN? | Abuso de las rutas de pago | `conventions.md` |
| Q-34 | Las tarjetas de prueba y los datos que exige el sandbox de Argentina salen de resultados de búsqueda, no de la página vigente. ¿Se confirman al probar? | Datos de prueba correctos | `guia-sandbox-mercadopago.md` |

## Respondidas (movidas a su documento)
- Q-02 (catálogo sin backend): sale de `data/catalogo.json`; ver `architecture.md`.
- Q-12 (versiones, TypeScript, gestor): ver `constitution/tech-stack.md`.
- Q-14 (Node 25 con Nuxt): Nuxt 4.4.5 declara `^20.19.0 || >=22.12.0`, compatible con 25.2.1; las 4.6.x no. Ver Q-16.
- Q-04 (parcial) y la ficha de producto: ver `initiatives/2026-11-10-ficha-producto/`.
