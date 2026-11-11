# Tareas: Base de la integración con Mercado Pago

**Spec:** [spec.md](spec.md) · **Plan:** [plan.md](plan.md) · **Estado general:** terminada   <!-- pendiente | en curso | terminada -->

> Spec `aprobada` el 2026-11-10.

| ID | Tarea | Capa | Depende de | Estado |
|---|---|---|---|---|
| T01 | `.gitignore` con `.env`, `.env.example` y configuración privada en `nuxt.config.ts` | Infra | — | [x] |
| T02 | `shared/utils/pedido.ts` con tests | Compartido / Tests | — | [x] |
| T03 | `shared/utils/mercadopago.ts` con tests | Compartido / Tests | T02 | [x] |
| T04 | `shared/utils/mercadopago-cliente.ts` | Compartido | T03 | [x] |
| T05 | Mercado Pago simulado (`scripts/mercadopago-simulado.mjs`) y tests del cliente contra él | Tests | T04 | [x] |
| T06 | Comprobar que el token no está en el build | Tests | T05 | [x] |
| T07 | Documentos permanentes (integraciones con lo leído de la API, preguntas abiertas) | Docs | T06 | [x] |

Front, Server routes, Mails, SEO y Data: **sin cambios**. DB: no aplica a este repo.

## Detalle


### T01 — Configuración y secretos
- **Capa:** Infra
- **Descripción:** `.env*` en `.gitignore` (salvo `.env.example`), `runtimeConfig.mercadopago` privado, `.env.example`.
- **Criterio de hecho (verificable):** `git check-ignore .env` confirma que se ignora.
- **Constraints aplicables:** C-02, C-03
- **Archivos probables:** `.gitignore`, `.env.example`, `nuxt.config.ts`
- **Depende de:** —

### T02 — Pedido
- **Capa:** Compartido / Tests
- **Descripción:** `validarPedido` y `armarPedido` con precios del catálogo y total entero.
- **Criterio de hecho (verificable):** los tests cubren cada motivo de rechazo y el total exacto.
- **Constraints aplicables:** C-02
- **Archivos probables:** `shared/utils/pedido.ts`, `tests/pedido.test.mjs`
- **Depende de:** —

### T03 — Orden y estados
- **Capa:** Compartido / Tests
- **Descripción:** `construirOrden`, `interpretarOrden`, `urlDePagoSegura`, `referenciaNueva`, `esIdOrdenValido`.
- **Criterio de hecho (verificable):** los tests confirman la forma del cuerpo y la traducción de estados.
- **Constraints aplicables:** C-03
- **Archivos probables:** `shared/utils/mercadopago.ts`, `tests/mercadopago.test.mjs`
- **Depende de:** T02

### T04 — Cliente
- **Capa:** Compartido
- **Descripción:** `crearOrden` y `obtenerOrden` con `fetch`, clave de idempotencia, tiempo máximo y `ErrorMercadoPago` sin datos sensibles.
- **Criterio de hecho (verificable):** funciona contra el simulado (T05).
- **Constraints aplicables:** C-02, C-03
- **Archivos probables:** `shared/utils/mercadopago-cliente.ts`
- **Depende de:** T03

### T05 — Simulado y tests del cliente
- **Capa:** Tests
- **Descripción:** Servidor de prueba que valida el cuerpo según la documentación y simula aprobar, rechazar y pendiente; tests del cliente contra él.
- **Criterio de hecho (verificable):** `npm test` en verde, incluidos 401, 404, 500 y tiempo agotado.
- **Constraints aplicables:** C-03
- **Archivos probables:** `scripts/mercadopago-simulado.mjs`, `tests/mercadopago-cliente.test.mjs`
- **Depende de:** T04

### T06 — Token fuera del build
- **Capa:** Tests
- **Descripción:** Construir con un token de prueba y buscarlo en `.output/public` y en el HTML.
- **Criterio de hecho (verificable):** cero apariciones.
- **Constraints aplicables:** C-03
- **Archivos probables:** —
- **Depende de:** T05

### T07 — Documentos permanentes
- **Capa:** Docs
- **Descripción:** `integrations.md` con lo leído de la API y sus fuentes; preguntas Q-28 a Q-32.
- **Criterio de hecho (verificable):** los documentos citan rutas y fuentes.
- **Constraints aplicables:** ninguna
- **Archivos probables:** `applications/ecommerce_prueba/{integrations,open-questions,architecture}.md`
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
