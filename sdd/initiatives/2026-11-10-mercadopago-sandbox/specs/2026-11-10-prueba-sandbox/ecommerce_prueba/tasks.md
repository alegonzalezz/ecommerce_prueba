# Tareas: Prueba con credenciales reales del sandbox

**Spec:** [spec.md](spec.md) · **Plan:** [plan.md](plan.md) · **Estado general:** en curso   <!-- pendiente | en curso | terminada -->

> Spec en `borrador`: esta fase espera credenciales de prueba.

| ID | Tarea | Capa | Depende de | Estado |
|---|---|---|---|---|
| T01 | Guía de credenciales y pasos de prueba | Docs | — | [x] |
| T02 | Prueba aprobado, rechazado, pendiente y cancelado contra el sandbox real | Tests | T01 | [ ] |
| T03 | Tabla "esperado vs real" y correcciones | Docs / Front / Server | T02 | [ ] |

Todo lo demás: **sin cambios**. DB: no aplica a este repo.

## Detalle


### T01 — Guía
- **Capa:** Docs
- **Descripción:** Cómo crear la aplicación, cargar el token en `.env` y recorrer cada escenario.
- **Criterio de hecho (verificable):** una persona sin contexto puede seguirla.
- **Constraints aplicables:** C-03
- **Archivos probables:** `applications/ecommerce_prueba/guia-sandbox-mercadopago.md`
- **Depende de:** —

### T02 — Pruebas reales
- **Capa:** Tests
- **Descripción:** Recorrer los escenarios y anotar los resultados.
- **Criterio de hecho (verificable):** cada escenario con su resultado.
- **Constraints aplicables:** C-03
- **Archivos probables:** —
- **Depende de:** T01 y credenciales

### T03 — Diferencias y correcciones
- **Capa:** Docs / Front / Server
- **Descripción:** Documentar cada diferencia con lo asumido y corregir el código y las specs.
- **Criterio de hecho (verificable):** no quedan supuestos sin confirmar en `integrations.md`.
- **Constraints aplicables:** C-03
- **Archivos probables:** `applications/ecommerce_prueba/integrations.md`
- **Depende de:** T02


## Reglas

- Todas las capas que el `plan.md` marca como impactadas tienen tareas. Las que no aplican se dicen explícitamente: "Infra: sin cambios".
- Tareas chicas, completables en un PR acotado. Si una tarea no entra en un PR, es dos tareas.
- Ordenadas por dependencia. Deploy, monitoreo y rollback al final.
- Siempre hay tareas de tests (o de verificación manual si la app no tiene tests). Si aplica, también de feature flag y de eventos de analytics.
- Una tarea no está terminada si viola alguna constraint.
- Al implementar: marcar `[x]` y actualizar el estado general. Si cambia algo respecto de la spec, se actualiza la spec en el mismo trabajo.

## Checklist de cierre
- [ ] Tests pasando (`npm test`) y `npm run build` en verde
- [ ] PR mergeado a la rama siguiente (`<pendiente: flujo de ramas>`)
- [ ] Desplegado y probado en el primer ambiente: **no aplica** (se prueba en local; host en Q-05)
- [ ] Pago probado con Mercado Pago sandbox: **pendiente de credenciales** (fase 4); antes, contra el simulado
- [ ] Credenciales productivas: **no aplica** (C-03: sandbox)
- [ ] Feature flag: **no aplica**
- [ ] Métricas observadas
- [ ] Spec actualizada si algo cambió
