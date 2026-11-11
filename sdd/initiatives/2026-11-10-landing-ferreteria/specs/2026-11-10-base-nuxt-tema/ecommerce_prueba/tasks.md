# Tareas: Base Nuxt SSR + PrimeVue con tema propio

**Spec:** [spec.md](spec.md) · **Plan:** [plan.md](plan.md) · **Estado general:** terminada   <!-- pendiente | en curso | terminada -->

> Spec `aprobada` el 2026-11-10. Depende de la fase 1 (`2026-11-10-datos-catalogo`).

| ID | Tarea | Capa | Depende de | Estado |
|---|---|---|---|---|
| T01 | Crear el proyecto Nuxt en la raíz y verificar que arranca (Node 25) | Front | fase 1 | [x] |
| T02 | Instalar PrimeVue (`@primevue/nuxt-module`, `@primeuix/themes`) | Front | T01 | [x] |
| T03 | Tipografías autoalojadas y variables CSS de Mostrador | Front | T01 | [x] |
| T04 | Preset PrimeVue propio con los tokens de Mostrador | Front | T02, T03 | [x] |
| T05 | Nombre de tienda en un solo lugar (`app.config.ts`) y `lang="es-AR"` | Front | T01 | [x] |
| T06 | Verificación: SSR por `curl`, `npm run build`, sin peticiones a Google Fonts | Tests | T04, T05 | [x] |
| T07 | Actualizar documentos permanentes (stack con versiones reales, arquitectura, Q-14) | Docs | T06 | [x] |

Server routes, Pagos, Mails, SEO, Data, Infra y Observabilidad: **sin cambios**. DB: no aplica a este repo.

## Detalle

### T01 — Proyecto Nuxt
- **Capa:** Front
- **Descripción:** Crear `package.json`, `nuxt.config.ts`, `app/app.vue`, `.gitignore` en la raíz de `ecommerce_prueba/`. Instalar con npm. Anotar si Node 25.2.1 genera advertencias o errores.
- **Criterio de hecho (verificable):** `npm run dev` responde 200 en `http://localhost:3000`.
- **Constraints aplicables:** C-01, C-02
- **Archivos probables:** `package.json`, `nuxt.config.ts`, `app/app.vue`, `.gitignore`
- **Depende de:** fase 1

### T02 — PrimeVue
- **Capa:** Front
- **Descripción:** Agregar los paquetes y registrar el módulo. Leer la documentación instalada antes de configurar.
- **Criterio de hecho (verificable):** un `Button` de PrimeVue se renderiza en `/`.
- **Constraints aplicables:** C-04
- **Archivos probables:** `package.json`, `nuxt.config.ts`
- **Depende de:** T01

### T03 — Tipografías y variables
- **Capa:** Front
- **Descripción:** Instalar `@fontsource-variable/fraunces` y `@fontsource-variable/dm-sans`; definir variables CSS con los tokens del plan.
- **Criterio de hecho (verificable):** la pestaña de red no pide `fonts.googleapis.com` ni `fonts.gstatic.com`.
- **Constraints aplicables:** ninguna
- **Archivos probables:** `app/assets/css/base.css`, `nuxt.config.ts`
- **Depende de:** T01

### T04 — Preset PrimeVue
- **Capa:** Front
- **Descripción:** Preset propio sobre `@primeuix/themes` con verde bosque, crema, ladrillo y radios de Mostrador; desactivar dark mode.
- **Criterio de hecho (verificable):** el `Button` se ve verde bosque con esquinas en pastilla.
- **Constraints aplicables:** C-04
- **Archivos probables:** `app/theme/mostrador.ts`, `nuxt.config.ts`
- **Depende de:** T02, T03

### T05 — Nombre de tienda y idioma
- **Capa:** Front
- **Descripción:** `app.config.ts` con `tienda.nombre` (valor `<pendiente>`); `lang="es-AR"` en el `<html>`.
- **Criterio de hecho (verificable):** cambiar el nombre en un solo archivo lo cambia en la página.
- **Constraints aplicables:** ninguna
- **Archivos probables:** `app/app.config.ts`, `nuxt.config.ts`
- **Depende de:** T01

### T06 — Verificación
- **Capa:** Tests
- **Descripción:** `curl http://localhost:3000/` muestra contenido en el HTML; `npm run build` en verde; revisar la red.
- **Criterio de hecho (verificable):** las tres comprobaciones pasan.
- **Constraints aplicables:** C-01, C-02, C-04
- **Archivos probables:** —
- **Depende de:** T04, T05

### T07 — Documentos permanentes
- **Capa:** Docs
- **Descripción:** Actualizar `constitution/tech-stack.md` con versiones instaladas (`[VERIFICADO]` con `package.json`), `architecture.md` y Q-14 con el resultado de Node.
- **Criterio de hecho (verificable):** los documentos citan `package.json` y rutas existentes.
- **Constraints aplicables:** ninguna
- **Archivos probables:** `applications/ecommerce_prueba/constitution/tech-stack.md`, `applications/ecommerce_prueba/architecture.md`, `applications/ecommerce_prueba/open-questions.md`
- **Depende de:** T06

## Reglas

- Todas las capas que el `plan.md` marca como impactadas tienen tareas. Las que no aplican se dicen explícitamente: "Infra: sin cambios".
- Tareas chicas, completables en un PR acotado. Si una tarea no entra en un PR, es dos tareas.
- Ordenadas por dependencia. Deploy, monitoreo y rollback al final.
- Siempre hay tareas de tests (o de verificación manual si la app no tiene tests). Si aplica, también de feature flag y de eventos de analytics.
- Una tarea no está terminada si viola alguna constraint.
- Al implementar: marcar `[x]` y actualizar el estado general. Si cambia algo respecto de la spec, se actualiza la spec en el mismo trabajo.

## Checklist de cierre
- [x] Tests pasando: no hay tests automáticos; `npm run build` en verde
- [ ] PR mergeado a la rama siguiente (`<pendiente: flujo de ramas>`)
- [ ] Desplegado y probado en el primer ambiente: **no aplica** (sin despliegue)
- [ ] Pago probado con Mercado Pago sandbox: **no aplica**
- [ ] Credenciales productivas: **no aplica**
- [ ] Feature flag: **no aplica**
- [x] Métricas observadas: SSR confirmado por `curl`
- [x] Spec actualizada si algo cambió
