# Tareas: Datos del catálogo (JSON, imágenes y validación)

**Spec:** [spec.md](spec.md) · **Plan:** [plan.md](plan.md) · **Estado general:** terminada   <!-- pendiente | en curso | terminada -->

> Spec `aprobada` el 2026-11-10.

| ID | Tarea | Capa | Depende de | Estado |
|---|---|---|---|---|
| T01 | Escribir el JSON Schema del catálogo | Data | — | [x] |
| T02 | Crear `data/catalogo.json` con ~12 productos y los 3 carruseles | Producto / Data | T01 | [x] |
| T03 | Generar los placeholders `.webp` (3 por producto) | Data | T02 | [x] |
| T04 | Script de validación `scripts/validar-catalogo.mjs` | Tooling | T01, T02 | [x] |
| T05 | Tests del validador (`node --test`) | Tests | T04 | [x] |
| T06 | Verificar el catálogo completo y cerrar | Tests | T03, T05 | [x] |
| T07 | Actualizar documentos permanentes (glosario e integraciones) | Docs | T06 | [x] |

Infra, Front, Server routes, Pagos, Mails y SEO: **sin cambios** en esta fase. DB: no aplica a este repo.

## Detalle

### T01 — JSON Schema del catálogo
- **Capa:** Data
- **Descripción:** Describir `productos` y `carruseles` con los campos de la spec; `precioAnterior` nullable; `moneda` fija `"ARS"`.
- **Criterio de hecho (verificable):** el schema rechaza un producto sin `id` o con `imagenes.card` ausente.
- **Constraints aplicables:** C-02
- **Archivos probables:** `data/catalogo.schema.json`
- **Depende de:** —

### T02 — Catálogo de ejemplo
- **Capa:** Producto / Data
- **Descripción:** ~12 productos de ferretería realistas (precios en ARS enteros) y 3 carruseles en orden `mas-vendido`, `nuevo`, `con-descuento`. Al menos 3 productos con `precioAnterior` mayor que `precio`.
- **Criterio de hecho (verificable):** el JSON valida contra el schema; el orden de carruseles coincide con la spec.
- **Constraints aplicables:** C-02
- **Archivos probables:** `data/catalogo.json`
- **Depende de:** T01

### T03 — Placeholders `.webp`
- **Capa:** Data
- **Descripción:** Generar `<id>-card.webp`, `<id>-mobile.webp` y `<id>-desktop.webp` por producto, con el nombre y el tamaño impresos. Dimensiones: 480×480, 800×1000 y 1200×900. Herramienta: `sharp` vía `scripts/generar-placeholders.mjs`.
- **Criterio de hecho (verificable):** 36 archivos `.webp` existen; `file` los reconoce como WebP.
- **Constraints aplicables:** C-02
- **Archivos probables:** `public/img/productos/*.webp`, script de generación si se usa Node
- **Depende de:** T02

### T04 — Script de validación
- **Capa:** Tooling
- **Descripción:** Node con `ajv` para el esquema. Valida: esquema, `id`/`slug` únicos, ids de carruseles existentes y sin repetir, `con-descuento` con descuento real, imágenes `.webp` existentes, precios numéricos y no negativos. Sale con código ≠ 0 y mensajes claros.
- **Criterio de hecho (verificable):** `node scripts/validar-catalogo.mjs` pasa con el catálogo de T02 y falla con un catálogo roto.
- **Constraints aplicables:** C-02
- **Archivos probables:** `scripts/validar-catalogo.mjs`
- **Depende de:** T01, T02

### T05 — Tests del validador
- **Capa:** Tests
- **Descripción:** Un caso válido y un caso inválido por cada regla de T04, con `node --test`, mutando el catálogo real en memoria.
- **Criterio de hecho (verificable):** `node --test` pasa; cada regla tiene al menos un test que falla si se la quita.
- **Constraints aplicables:** ninguna
- **Archivos probables:** `scripts/validar-catalogo.test.mjs`
- **Depende de:** T04

### T06 — Verificación y cierre
- **Capa:** Tests
- **Descripción:** Correr el validador sobre el catálogo real y revisar a mano el orden de carruseles.
- **Criterio de hecho (verificable):** validador y tests en verde; checklist de cierre completo.
- **Constraints aplicables:** C-02
- **Archivos probables:** —
- **Depende de:** T03, T05

### T07 — Documentos permanentes
- **Capa:** Docs
- **Descripción:** Pasar a `applications/ecommerce_prueba/domain-glossary.md` los términos reales (producto, carrusel, card…) y a `architecture.md` la estructura de `data/` y `public/img/`, con etiquetas y rutas. Mover a su lugar las preguntas respondidas de `open-questions.md`.
- **Criterio de hecho (verificable):** los documentos citan rutas existentes del repo; no quedan términos en `<pendiente>` que ya tengan respuesta.
- **Constraints aplicables:** ninguna
- **Archivos probables:** `applications/ecommerce_prueba/domain-glossary.md`, `applications/ecommerce_prueba/architecture.md`
- **Depende de:** T06

## Reglas

- Todas las capas que el `plan.md` marca como impactadas tienen tareas. Las que no aplican se dicen explícitamente: "Infra: sin cambios".
- Tareas chicas, completables en un PR acotado. Si una tarea no entra en un PR, es dos tareas.
- Ordenadas por dependencia. Deploy, monitoreo y rollback al final.
- Siempre hay tareas de tests (o de verificación manual si la app no tiene tests). Si aplica, también de feature flag y de eventos de analytics.
- Una tarea no está terminada si viola alguna constraint.
- Al implementar: marcar `[x]` y actualizar el estado general. Si cambia algo respecto de la spec, se actualiza la spec en el mismo trabajo.

## Checklist de cierre
- [x] Tests pasando (`node --test`)
- [ ] PR mergeado a la rama siguiente (`<pendiente: flujo de ramas>`)
- [ ] Desplegado y probado en el primer ambiente: **no aplica** (no hay despliegue en esta fase)
- [ ] Pago probado con Mercado Pago sandbox: **no aplica**
- [ ] Credenciales productivas: **no aplica**
- [ ] Feature flag: **no aplica**
- [x] Métricas observadas: validador en verde sobre el catálogo real
- [x] Spec actualizada si algo cambió
