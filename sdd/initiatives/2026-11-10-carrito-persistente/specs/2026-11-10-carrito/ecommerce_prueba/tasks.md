# Tareas: Carrito de compras

**Spec:** [spec.md](spec.md) · **Plan:** [plan.md](plan.md) · **Estado general:** terminada   <!-- pendiente | en curso | terminada -->

> Spec `aprobada` el 2026-11-10.

| ID | Tarea | Capa | Depende de | Estado |
|---|---|---|---|---|
| T01 | `shared/utils/carrito.ts` con sus tests | Compartido / Tests | — | [x] |
| T02 | Composable `useCarrito` (conecta almacenamiento, catálogo y avisos) | Front | T01 | [x] |
| T03 | Ícono con cantidad en el header (`CarritoEnlace`) | Front | T02 | [x] |
| T04 | Botón y estado del carrito en la ficha | Front | T02 | [x] |
| T05 | Página `/carrito` (líneas, cantidades, subtotal, avisos, vacío, cargando, botón deshabilitado) | Front | T02 | [x] |
| T06 | SEO de `/carrito`: noindex, fuera de sitemap y `llms.txt`, y chequeo en el verificador | SEO | T05 | [x] |
| T07 | Verificación en el navegador, `verificar:seo`, Lighthouse, `npm test`, `npm run build` | Tests | T03, T04, T05, T06 | [x] |
| T08 | Documentos permanentes y preguntas abiertas | Docs | T07 | [x] |

Server routes, Pagos, Mails, Data, Infra y Observabilidad: **sin cambios**. DB: no aplica a este repo.

## Detalle


### T01 — Lógica pura
- **Capa:** Compartido / Tests
- **Descripción:** `agregar`, `cambiarCantidad`, `quitar`, `reconciliar`, `totales`, `validarLineas`, tope por producto.
- **Criterio de hecho (verificable):** los tests pasan.
- **Constraints aplicables:** C-02
- **Archivos probables:** `shared/utils/carrito.ts`, `tests/carrito.test.mjs`
- **Depende de:** —

### T02 — Composable
- **Capa:** Front
- **Descripción:** Estado, operaciones, avisos y `cargado`; persiste con `useAlmacenado` (clave `ecommerce:carrito`).
- **Criterio de hecho (verificable):** agregar y recargar conserva el carrito.
- **Constraints aplicables:** C-01, C-02
- **Archivos probables:** `app/composables/useCarrito.ts`
- **Depende de:** T01

### T03 — Header
- **Capa:** Front
- **Descripción:** Enlace al carrito con `Badge`; espacio reservado; funciona en la fila superior del header mobile.
- **Criterio de hecho (verificable):** sin desborde a 390 px y CLS sin cambio.
- **Constraints aplicables:** C-04
- **Archivos probables:** `app/components/CarritoEnlace.vue`, `app/components/AppHeader.vue`, `nuxt.config.ts`
- **Depende de:** T02

### T04 — Ficha
- **Capa:** Front
- **Descripción:** Botón "Agregar al carrito", estados (agregado, en el carrito, máximo, sin stock) y mensaje accesible; se mantiene el aviso de compra.
- **Criterio de hecho (verificable):** cada estado se ve y el botón se deshabilita cuando corresponde.
- **Constraints aplicables:** C-04
- **Archivos probables:** `app/pages/producto/[slug].vue`
- **Depende de:** T02

### T05 — Página `/carrito`
- **Capa:** Front
- **Descripción:** Líneas con cantidades, quitar, vaciar, subtotal, avisos (`role="status"`), vacío, cargando, botón deshabilitado y aviso, nota de 2 horas, `noindex`.
- **Criterio de hecho (verificable):** todos los criterios de aceptación de `/carrito`.
- **Constraints aplicables:** C-01, C-04
- **Archivos probables:** `app/pages/carrito.vue`
- **Depende de:** T02

### T06 — SEO del carrito
- **Capa:** SEO
- **Descripción:** Confirmar que `/carrito` no entra en sitemap ni `llms.txt` y agregar al verificador el chequeo de `noindex`.
- **Criterio de hecho (verificable):** `npm run verificar:seo` comprueba `/carrito`.
- **Constraints aplicables:** ninguna
- **Archivos probables:** `scripts/verificar-seo.mjs`
- **Depende de:** T05

### T07 — Verificación
- **Capa:** Tests
- **Descripción:** Pruebas en el navegador, verificador, Lighthouse, suite y build.
- **Criterio de hecho (verificable):** todo en verde; Performance ≥ 90; CLS ≤ 0,05.
- **Constraints aplicables:** C-01, C-02, C-04
- **Archivos probables:** —
- **Depende de:** T03, T04, T05, T06

### T08 — Documentos permanentes
- **Capa:** Docs
- **Descripción:** Arquitectura, glosario, convenciones y preguntas abiertas (Q-23, Q-24).
- **Criterio de hecho (verificable):** los documentos citan rutas existentes.
- **Constraints aplicables:** ninguna
- **Archivos probables:** `applications/ecommerce_prueba/{architecture,domain-glossary,conventions,open-questions}.md`
- **Depende de:** T07


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
