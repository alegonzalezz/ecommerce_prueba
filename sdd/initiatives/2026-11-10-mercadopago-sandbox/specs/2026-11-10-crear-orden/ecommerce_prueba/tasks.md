# Tareas: Crear la orden y redirigir a Mercado Pago

**Spec:** [spec.md](spec.md) · **Plan:** [plan.md](plan.md) · **Estado general:** terminada   <!-- pendiente | en curso | terminada -->

> Spec `aprobada` el 2026-11-10.

| ID | Tarea | Capa | Depende de | Estado |
|---|---|---|---|---|
| T01 | `shared/utils/limite.ts` con tests | Compartido / Tests | — | [x] |
| T02 | `server/api/checkout.post.ts` | Server | T01 | [x] |
| T03 | Botón "Finalizar compra" activo, estados y mensajes en `/carrito` | Front | T02 | [x] |
| T04 | Aviso de modo de prueba y retiro de "Pronto podrás comprar online" | Front | T03 | [x] |
| T05 | Pruebas de la ruta contra el simulado (todos los códigos) | Tests | T02 | [x] |
| T06 | Verificación en el navegador, verificador de SEO, Lighthouse, `npm test`, `npm run build` | Tests | T03, T04, T05 | [x] |
| T07 | Documentos permanentes | Docs | T06 | [x] |

Mails, SEO, Data e Infra (salvo variables de entorno): **sin cambios**. DB: no aplica a este repo.

## Detalle


### T01 — Limitador
- **Capa:** Compartido / Tests
- **Descripción:** Contador por clave con ventana de tiempo.
- **Criterio de hecho (verificable):** tests de ventana y reinicio.
- **Constraints aplicables:** C-02
- **Archivos probables:** `shared/utils/limite.ts`, `tests/limite.test.mjs`
- **Depende de:** —

### T02 — Ruta de checkout
- **Capa:** Server
- **Descripción:** Validación, armado, creación de la orden, URL segura, cookie y códigos de error.
- **Criterio de hecho (verificable):** responde `{ url }` contra el simulado y cada error con su código.
- **Constraints aplicables:** C-02, C-03
- **Archivos probables:** `server/api/checkout.post.ts`
- **Depende de:** T01

### T03 — Botón y mensajes
- **Capa:** Front
- **Descripción:** Habilitar el botón, estado "Redirigiendo…", mensajes accesibles (`role="status"`), redirección.
- **Criterio de hecho (verificable):** en el navegador se llega al simulado y los errores se ven.
- **Constraints aplicables:** C-04
- **Archivos probables:** `app/pages/carrito.vue`
- **Depende de:** T02

### T04 — Textos y modo de prueba
- **Capa:** Front
- **Descripción:** Aviso "Modo de prueba", "Pagás de forma segura en Mercado Pago", y quitar "Pronto podrás comprar online" del carrito y la ficha.
- **Criterio de hecho (verificable):** textos correctos en ambas pantallas.
- **Constraints aplicables:** C-04
- **Archivos probables:** `app/pages/carrito.vue`, `app/pages/producto/[slug].vue`, `nuxt.config.ts`
- **Depende de:** T03

### T05 — Pruebas de la ruta
- **Capa:** Tests
- **Descripción:** Contra el simulado: éxito, 400, 409, 429, 502, 503, cookie y total.
- **Criterio de hecho (verificable):** todos los códigos y el total confirmados.
- **Constraints aplicables:** C-02, C-03
- **Archivos probables:** `scripts/probar-pago.mjs`
- **Depende de:** T02

### T06 — Verificación
- **Capa:** Tests
- **Descripción:** Navegador, `verificar:seo`, Lighthouse, suite y build.
- **Criterio de hecho (verificable):** todo en verde; Performance ≥ 90.
- **Constraints aplicables:** C-01, C-02, C-03, C-04
- **Archivos probables:** —
- **Depende de:** T03, T04, T05

### T07 — Documentos permanentes
- **Capa:** Docs
- **Descripción:** Arquitectura, glosario y convenciones.
- **Criterio de hecho (verificable):** documentos con rutas existentes.
- **Constraints aplicables:** ninguna
- **Archivos probables:** `applications/ecommerce_prueba/{architecture,domain-glossary,conventions}.md`
- **Depende de:** T06


## Reglas

- Todas las capas que el `plan.md` marca como impactadas tienen tareas. Las que no aplican se dicen explícitamente: "Infra: sin cambios".
- Tareas chicas, completables en un PR acotado. Si una tarea no entra en un PR, es dos tareas.
- Ordenadas por dependencia. Deploy, monitoreo y rollback al final.
- Siempre hay tareas de tests (o de verificación manual si la app no tiene tests). Si aplica, también de feature flag y de eventos de analytics.
- Una tarea no está terminada si viola alguna constraint.
- Al implementar: marcar `[x]` y actualizar el estado general. Si cambia algo respecto de la spec, se actualiza la spec en el mismo trabajo.

## Checklist de cierre
- [x] Tests pasando (`npm test`) y `npm run build` en verde
- [ ] PR mergeado a la rama siguiente (`<pendiente: flujo de ramas>`)
- [ ] Desplegado y probado en el primer ambiente: **no aplica** (se prueba en local; host en Q-05)
- [ ] Pago probado con Mercado Pago sandbox: **pendiente de credenciales** (fase 4); antes, contra el simulado
- [ ] Credenciales productivas: **no aplica** (C-03: sandbox)
- [ ] Feature flag: **no aplica**
- [x] Métricas observadas
- [x] Spec actualizada si algo cambió
