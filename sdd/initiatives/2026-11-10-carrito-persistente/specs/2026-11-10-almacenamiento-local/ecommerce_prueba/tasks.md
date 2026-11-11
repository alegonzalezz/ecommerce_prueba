# Tareas: Almacenamiento local con vencimiento

**Spec:** [spec.md](spec.md) · **Plan:** [plan.md](plan.md) · **Estado general:** terminada   <!-- pendiente | en curso | terminada -->

> Spec `aprobada` el 2026-11-10.

| ID | Tarea | Capa | Depende de | Estado |
|---|---|---|---|---|
| T01 | `shared/utils/almacenamiento.ts` con sus tests | Compartido / Tests | — | [x] |
| T02 | Composable `useAlmacenado` (estado compartido, respaldo en memoria) | Front | T01 | [x] |
| T03 | Carga al montar, `storage` y `visibilitychange` (dentro de `useAlmacenado`; no hizo falta un plugin, ver plan) | Front | T02 | [x] |
| T04 | Verificación en el navegador: recarga, vencimiento, corrupto, dos pestañas | Tests | T03 | [x] |
| T05 | Documentos permanentes | Docs | T04 | [x] |

Server routes, Pagos, Mails, SEO, Infra y Observabilidad: **sin cambios**. DB: no aplica a este repo.

## Detalle


### T01 — Utilidad con vencimiento
- **Capa:** Compartido / Tests
- **Descripción:** Funciones puras con un almacén inyectable y `ahora` explícito. Escritura que falla devuelve `false`, sin lanzar.
- **Criterio de hecho (verificable):** los tests con almacén falso pasan.
- **Constraints aplicables:** C-02
- **Archivos probables:** `shared/utils/almacenamiento.ts`, `tests/almacenamiento.test.mjs`
- **Depende de:** —

### T02 — Composable
- **Capa:** Front
- **Descripción:** `useAlmacenado(clave, version, inicial, validar)` con `useState`; `cargar`, `guardar`, `limpiar`; respaldo en memoria si no hay almacenamiento.
- **Criterio de hecho (verificable):** con el almacén bloqueado, `guardar` actualiza el estado sin error.
- **Constraints aplicables:** C-01, C-02
- **Archivos probables:** `app/composables/useAlmacenado.ts`
- **Depende de:** T01

### T03 — Plugin cliente
- **Capa:** Front
- **Descripción:** Plugin `.client` que, en `app:mounted`, carga los almacenes y registra `storage` y `visibilitychange`.
- **Criterio de hecho (verificable):** el HTML del servidor no cambia y no hay errores de hidratación.
- **Constraints aplicables:** C-01
- **Archivos probables:** `app/plugins/almacenamiento.client.ts`
- **Depende de:** T02

### T04 — Verificación
- **Capa:** Tests
- **Descripción:** Probar en Chrome: persistencia tras recargar, vencimiento adelantado, JSON corrupto y sincronización entre pestañas (se completa con las fases 2 y 3 que usan el almacén).
- **Criterio de hecho (verificable):** comportamientos confirmados con las claves reales.
- **Constraints aplicables:** C-01, C-02
- **Archivos probables:** —
- **Depende de:** T03

### T05 — Documentos permanentes
- **Capa:** Docs
- **Descripción:** Arquitectura, glosario y convenciones.
- **Criterio de hecho (verificable):** los documentos citan rutas existentes.
- **Constraints aplicables:** ninguna
- **Archivos probables:** `applications/ecommerce_prueba/{architecture,domain-glossary,conventions}.md`
- **Depende de:** T04


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
