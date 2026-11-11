# Tareas: <título>

**Spec:** [spec.md](spec.md) · **Plan:** [plan.md](plan.md) · **Estado general:** pendiente   <!-- pendiente | en curso | terminada -->

| ID | Tarea | Capa | Depende de | Estado |
|---|---|---|---|---|
| T01 | <...> | <...> | — | [ ] |

## Detalle

### T01 — <título>
- **Capa:** <Contenido | HTML | CSS | JS | Apps Script | SEO | Infra>
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
- [ ] Verificación manual hecha (no hay tests automáticos en el repo)
- [ ] Formularios probados de punta a punta (llega el mail; Sheet si aplica)
- [ ] PR mergeado a `main` (despliega a GitHub Pages)
- [ ] Si se tocó `apps-script-code.gs`: nueva versión de la implementación publicada
- [ ] Sitio publicado revisado en producción (no hay ambiente previo)
- [ ] SEO revisado si se tocaron metadatos (`sitemap.xml`, `robots.txt`, `llms.txt`, JSON-LD)
- [ ] Spec actualizada si algo cambió
