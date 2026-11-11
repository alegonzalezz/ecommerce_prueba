# Tareas: <título>

**Spec:** [spec.md](spec.md) · **Plan:** [plan.md](plan.md) · **Estado general:** pendiente   <!-- pendiente | en curso | terminada -->

| ID | Tarea | Capa | Depende de | Estado |
|---|---|---|---|---|
| T01 | <...> | <...> | — | [ ] |

## Detalle

### T01 — <título>
- **Capa:** <Producto | Front | Server routes | Pagos | Mails | SEO | Infra>
- **Descripción:** <1 a 3 líneas>
- **Criterio de hecho (verificable):** <...>
- **Constraints aplicables:** <C-xx o "ninguna">
- **Archivos probables:** <rutas>
- **Depende de:** —

## Reglas

- Todas las capas que el `plan.md` marca como impactadas tienen tareas. Las que no aplican se dicen explícitamente: "Infra: sin cambios".
- Tareas chicas, completables en un PR acotado. Si una tarea no entra en un PR, es dos tareas.
- Ordenadas por dependencia. Deploy, monitoreo y rollback al final.
- Siempre hay tareas de tests (o de verificación manual si la app no tiene tests). Si aplica, también de feature flag y de eventos de analytics.
- Una tarea no está terminada si viola alguna constraint.
- Al implementar: marcar `[x]` y actualizar el estado general. Si cambia algo respecto de la spec, se actualiza la spec en el mismo trabajo.

## Checklist de cierre
- [ ] Tests pasando (`<pendiente: herramienta de tests>`)
- [ ] PR mergeado a la rama siguiente (`<pendiente: flujo de ramas>`)
- [ ] Desplegado y probado en el primer ambiente
- [ ] Pago probado con Mercado Pago **sandbox** (usuarios de prueba) si se tocó checkout
- [ ] Producción: credenciales productivas de Mercado Pago configuradas solo en variables de entorno del servidor
- [ ] Feature flag (si aplica)
- [ ] Métricas observadas
- [ ] Spec actualizada si algo cambió
