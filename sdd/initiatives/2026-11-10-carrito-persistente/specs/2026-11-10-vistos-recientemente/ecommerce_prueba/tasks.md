# Tareas: Productos vistos recientemente

**Spec:** [spec.md](spec.md) · **Plan:** [plan.md](plan.md) · **Estado general:** terminada   <!-- pendiente | en curso | terminada -->

> Spec `aprobada` el 2026-11-10.

| ID | Tarea | Capa | Depende de | Estado |
|---|---|---|---|---|
| T01 | `shared/utils/vistos.ts` con sus tests | Compartido / Tests | — | [x] |
| T02 | Composable `useVistos` | Front | T01 | [x] |
| T03 | Registrar el producto al abrir la ficha | Front | T02 | [x] |
| T04 | Sección "Vistos recientemente" en la home | Front | T02 | [x] |
| T05 | Verificación en el navegador, `verificar:seo`, Lighthouse, `npm test`, `npm run build` | Tests | T03, T04 | [x] |
| T06 | Documentos permanentes | Docs | T05 | [x] |

Server routes, Pagos, Mails, SEO, Data, Infra y Observabilidad: **sin cambios**. DB: no aplica a este repo.

## Detalle


### T01 — Lógica pura
- **Capa:** Compartido / Tests
- **Descripción:** `registrarVisto(ids, id, max=8)`, `resolverVistos(catalogo, ids)`, `validarIds`.
- **Criterio de hecho (verificable):** los tests pasan.
- **Constraints aplicables:** C-02
- **Archivos probables:** `shared/utils/vistos.ts`, `tests/vistos.test.mjs`
- **Depende de:** —

### T02 — Composable
- **Capa:** Front
- **Descripción:** `useVistos` con `cargar`, `registrar` y los productos resueltos.
- **Criterio de hecho (verificable):** registrar y recargar conserva la lista.
- **Constraints aplicables:** C-01, C-02
- **Archivos probables:** `app/composables/useVistos.ts`
- **Depende de:** T01

### T03 — Registro en la ficha
- **Capa:** Front
- **Descripción:** Llamar a `registrar(producto.id)` al montar la ficha.
- **Criterio de hecho (verificable):** abrir una ficha deja su id en `ecommerce:vistos`.
- **Constraints aplicables:** C-01
- **Archivos probables:** `app/pages/producto/[slug].vue`
- **Depende de:** T02

### T04 — Sección en la home
- **Capa:** Front
- **Descripción:** `ProductCarousel` con los vistos debajo de los carruseles, solo si hay datos y el almacén está cargado.
- **Criterio de hecho (verificable):** aparece con 3 vistos, en orden, y no aparece sin datos.
- **Constraints aplicables:** C-01, C-04
- **Archivos probables:** `app/pages/index.vue`
- **Depende de:** T02

### T05 — Verificación
- **Capa:** Tests
- **Descripción:** Pruebas en el navegador, verificador, Lighthouse, suite y build.
- **Criterio de hecho (verificable):** todo en verde; CLS sin cambio.
- **Constraints aplicables:** C-01, C-02, C-04
- **Archivos probables:** —
- **Depende de:** T03, T04

### T06 — Documentos permanentes
- **Capa:** Docs
- **Descripción:** Arquitectura y glosario.
- **Criterio de hecho (verificable):** los documentos citan rutas existentes.
- **Constraints aplicables:** ninguna
- **Archivos probables:** `applications/ecommerce_prueba/{architecture,domain-glossary}.md`
- **Depende de:** T05


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
- [ ] Desplegado y probado en el primer ambiente: **no aplica** (se ve en local; host en Q-05)
- [ ] Pago probado con Mercado Pago sandbox: **no aplica**
- [ ] Credenciales productivas: **no aplica**
- [ ] Feature flag: **no aplica**
- [x] Métricas observadas
- [x] Spec actualizada si algo cambió
