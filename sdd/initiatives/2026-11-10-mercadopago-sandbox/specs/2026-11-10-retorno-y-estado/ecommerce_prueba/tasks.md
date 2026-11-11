# Tareas: Retorno de Mercado Pago y estado del pago

**Spec:** [spec.md](spec.md) · **Plan:** [plan.md](plan.md) · **Estado general:** terminada   <!-- pendiente | en curso | terminada -->

> Spec `aprobada` el 2026-11-10.

| ID | Tarea | Capa | Depende de | Estado |
|---|---|---|---|---|
| T01 | `server/api/pago/estado.get.ts` | Server | — | [x] |
| T02 | Página `app/pages/compra/resultado.vue` (cargando, aprobado, pendiente, rechazado, cancelado, error, sin compra) | Front | T01 | [x] |
| T03 | Vaciar el carrito y la cookie solo si está aprobado | Front | T02 | [x] |
| T04 | `noindex`, fuera de sitemap y `llms.txt`, y chequeo en el verificador | SEO | T02 | [x] |
| T05 | Pruebas de la ruta de estado contra el simulado | Tests | T01 | [x] |
| T06 | Flujo completo en el navegador contra el simulado (`npm run probar:pago`) | Tests | T02, T03, T05 | [x] |
| T07 | Lighthouse, `verificar:seo`, `npm test`, `npm run build` | Tests | T04, T06 | [x] |
| T08 | Documentos permanentes | Docs | T07 | [x] |

Mails, Data e Infra: **sin cambios**. DB: no aplica a este repo.

## Detalle


### T01 — Ruta de estado
- **Capa:** Server
- **Descripción:** Cookie u `order_id` válido, consulta a Mercado Pago, traducción de estado y comprobación de `external_reference`.
- **Criterio de hecho (verificable):** cada caso de los criterios responde lo esperado contra el simulado.
- **Constraints aplicables:** C-02, C-03
- **Archivos probables:** `server/api/pago/estado.get.ts`
- **Depende de:** —

### T02 — Página de resultado
- **Capa:** Front
- **Descripción:** Estados con textos claros, "Verificando…", aviso de modo de prueba y enlaces para seguir.
- **Criterio de hecho (verificable):** cada estado se ve correcto en 390 y 1440 px.
- **Constraints aplicables:** C-04
- **Archivos probables:** `app/pages/compra/resultado.vue`
- **Depende de:** T01

### T03 — Vaciado del carrito
- **Capa:** Front
- **Descripción:** Vaciar carrito y cookie únicamente con estado aprobado.
- **Criterio de hecho (verificable):** en cualquier otro estado el carrito queda intacto.
- **Constraints aplicables:** ninguna
- **Archivos probables:** `app/pages/compra/resultado.vue`, `server/api/pago/estado.get.ts`
- **Depende de:** T02

### T04 — SEO
- **Capa:** SEO
- **Descripción:** `noindex`, comprobar que no está en sitemap ni `llms.txt` y agregarlo al verificador.
- **Criterio de hecho (verificable):** `verificar:seo` lo comprueba.
- **Constraints aplicables:** ninguna
- **Archivos probables:** `app/pages/compra/resultado.vue`, `scripts/verificar-seo.mjs`
- **Depende de:** T02

### T05 — Pruebas de la ruta
- **Capa:** Tests
- **Descripción:** Casos de la ruta contra el simulado, incluidos los de manipulación.
- **Criterio de hecho (verificable):** todos los casos confirmados.
- **Constraints aplicables:** C-03
- **Archivos probables:** `scripts/probar-pago.mjs`
- **Depende de:** T01

### T06 — Flujo completo en el navegador
- **Capa:** Tests
- **Descripción:** Carrito → pago simulado → retorno con aprobado, pendiente, rechazado y cancelado.
- **Criterio de hecho (verificable):** vaciado solo con aprobado; estados correctos.
- **Constraints aplicables:** C-01, C-03, C-04
- **Archivos probables:** `scripts/probar-pago.mjs`
- **Depende de:** T02, T03, T05

### T07 — Verificación final
- **Capa:** Tests
- **Descripción:** Lighthouse, verificador, suite y build.
- **Criterio de hecho (verificable):** todo en verde; Performance ≥ 90.
- **Constraints aplicables:** C-01, C-02, C-03, C-04
- **Archivos probables:** —
- **Depende de:** T04, T06

### T08 — Documentos permanentes
- **Capa:** Docs
- **Descripción:** Arquitectura, glosario, convenciones y preguntas abiertas.
- **Criterio de hecho (verificable):** documentos con rutas existentes.
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
- [ ] Desplegado y probado en el primer ambiente: **no aplica** (se prueba en local; host en Q-05)
- [ ] Pago probado con Mercado Pago sandbox: **pendiente de credenciales** (fase 4); antes, contra el simulado
- [ ] Credenciales productivas: **no aplica** (C-03: sandbox)
- [ ] Feature flag: **no aplica**
- [x] Métricas observadas
- [x] Spec actualizada si algo cambió
