# Tareas: Publicación estática en GitHub Pages

**Spec:** [spec.md](spec.md) · **Plan:** [plan.md](plan.md) · **Estado general:** terminada   <!-- pendiente | en curso | terminada -->

> Spec `aprobada` el 2026-11-10.

| ID | Tarea | Capa | Depende de | Estado |
|---|---|---|---|---|
| T01 | `conBase` y `useBase`, con tests | Compartido / Tests | — | [x] |
| T02 | Usar el prefijo en hero, cards, ficha, carrito, precargas y página de error | Front | T01 | [x] |
| T03 | `pagoDisponible`: carrito, ficha y resultado en modo demostración | Front | T01 | [x] |
| T04 | Configuración de generación estática, `.nojekyll` y script `generate:pages` | Infra | T02, T03 | [x] |
| T05 | Emulador de Pages y prueba de navegador (`probar:pages`) | Tests | T04 | [x] |
| T06 | Verificar en local: `verificar:seo`, `probar:pages`, Lighthouse | Tests | T05 | [x] |
| T07 | Workflow de despliegue y `README.md` | Infra / Docs | T04 | [x] |
| T08 | Commit, push, habilitar Pages y verificar el sitio real | Infra / Tests | T06, T07 | [x] |
| T09 | Documentos permanentes y preguntas abiertas | Docs | T08 | [x] |

Server routes, Pagos, Mails, SEO (sin cambios de código) y Data: **sin cambios**. DB: no aplica a este repo.

## Detalle
Cada tarea tiene como criterio de hecho lo indicado en la spec; el detalle de archivos está en `plan.md`.

## Reglas

- Todas las capas que el `plan.md` marca como impactadas tienen tareas. Las que no aplican se dicen explícitamente: "Infra: sin cambios".
- Tareas chicas, completables en un PR acotado. Si una tarea no entra en un PR, es dos tareas.
- Ordenadas por dependencia. Deploy, monitoreo y rollback al final.
- Siempre hay tareas de tests (o de verificación manual si la app no tiene tests). Si aplica, también de feature flag y de eventos de analytics.
- Una tarea no está terminada si viola alguna constraint.
- Al implementar: marcar `[x]` y actualizar el estado general. Si cambia algo respecto de la spec, se actualiza la spec en el mismo trabajo.

## Checklist de cierre
- [x] Tests pasando (`npm test`) y `npm run build` en verde
- [x] PR mergeado a la rama siguiente: se publica por `push` a `main`
- [x] Desplegado y probado en el primer ambiente (Pages)
- [ ] Pago probado con Mercado Pago sandbox: **no aplica** en Pages
- [ ] Credenciales productivas: **no aplica**
- [x] Feature flag (`NUXT_PUBLIC_PAGO_DISPONIBLE`) verificado en ambos valores
- [x] Métricas observadas
- [x] Spec actualizada si algo cambió
