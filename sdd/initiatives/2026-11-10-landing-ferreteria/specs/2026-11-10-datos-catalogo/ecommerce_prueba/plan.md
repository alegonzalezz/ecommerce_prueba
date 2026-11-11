# Plan: Datos del catálogo (JSON, imágenes y validación)

- **Spec:** [spec.md](spec.md)
- **Fecha:** 2026-11-10

## Enfoque
Un solo archivo `data/catalogo.json` (propuesto) con `productos` y `carruseles`, un JSON Schema que lo describe y un script de Node que lo valida con `ajv` (dependencia de desarrollo) para el esquema y chequeos propios para las reglas cruzadas. Los `.webp` van en `public/img/productos/`. Todo antes de que exista Nuxt, para que la fase 3 consuma datos ya estables.

Razón de la carpeta `data/`: `content/` es la carpeta de un módulo popular de Nuxt; aunque no lo usemos, `data/` evita confusión. `[PROPUESTA]`

**Alternativas descartadas:**
- *Un JSON por producto:* más difícil de revisar de un vistazo y de mantener el orden de carruseles. Descartado por simplicidad.
- *Guardar `descuentoPct`:* redundante con los precios y puede quedar inconsistente. Descartado (decisión del usuario).
- *Validar solo en runtime:* un catálogo roto llegaría a producción. Se valida antes del build.

No requiere ADR por ahora; si cambia el formato del catálogo después, sí.

## Cambios por capa
Si una capa no se toca se escribe "Sin cambios", no se borra.

- **Producto:** definir los campos de un producto de ferretería y el orden de los 3 carruseles. Contenido de ejemplo: ~12 productos (herramientas eléctricas, manuales, fijaciones, plomería, pintura, seguridad). `[PROPUESTA]`
- **Front (Nuxt + PrimeVue):** Sin cambios (el proyecto Nuxt se crea en la fase 2).
- **Server routes de Nuxt (Nitro):** Sin cambios.
- **Pagos (Mercado Pago):** Sin cambios.
- **Mails:** Sin cambios.
- **SEO:** Sin cambios. (Los campos `slug`, `descripcion` y `alt` quedan listos para fases posteriores.)
- **Data:** Se crean `data/catalogo.json`, `data/catalogo.schema.json` y el script `scripts/validar-catalogo.mjs`. Los `.webp` van en `public/img/productos/` (3 por producto). Los placeholders se generan con `sharp` desde un script Node (`scripts/generar-placeholders.mjs`): SVG con el nombre y el tamaño → `.webp`. Elegido el 2026-11-10 porque `cwebp` existe en esta máquina pero no dibuja texto y `sharp` funciona igual en cualquier equipo con Node. `[PROPUESTA]`
- **DB:** no aplica a este repo (decisión: sin backend ni base de datos propia, C-02). El catálogo es un archivo versionado. No hay migraciones.
- **Infra:** Sin cambios.
- **Observabilidad:** El script de validación escribe errores legibles con el carrusel o producto que falla y sale con código distinto de 0.

## Verificación de constraints
Una fila por constraint de `applications/ecommerce_prueba/constitution/constraints.md`. Ninguna sin evaluar.

| Constraint | ¿Aplica? | Cómo se cumple |
|---|---|---|
| C-01 (SSR) | No directamente | Esta fase no renderiza. El JSON es un archivo legible desde el servidor, compatible con SSR. |
| C-02 (sin backend ni DB) | Sí | El catálogo es un archivo del repo; el script corre local o en CI, no es un servicio. |
| C-03 (Mercado Pago) | No | No hay pagos en esta fase. |
| C-04 (PrimeVue) | No | No hay UI en esta fase. |
| C-05 | Sin definir | La fila sigue en `<pendiente>`. |

## Testing
- Pruebas del validador con el runner incorporado de Node (`node --test`), mutando el catálogo real en memoria (sin carpeta de fixtures): un catálogo válido y un caso inválido por cada regla (id inexistente, id repetido en carrusel, `con-descuento` sin descuento, imagen faltante, extensión no `.webp`, precio inválido). `[PROPUESTA]`
- Verificación manual: abrir el JSON y comprobar el orden de carruseles y que los 36 archivos `.webp` existan (12 productos × 3).

## Feature flag
No aplica.

## Rollout
Merge a `main` (rama configurada; el flujo de ramas está sin definir, Q-11). No hay despliegue: no existe host ni proyecto Nuxt todavía.

## Rollback
Revertir el commit. No hay efectos fuera del repo.

## Riesgos
- El esquema se congela antes de ver la landing real; puede necesitar campos nuevos. Mitigación: el cambio es chico y está en un solo repo; se actualiza la spec en el mismo trabajo.
- Los placeholders se confunden con fotos reales. Mitigación: llevan un texto visible (nombre del producto y tamaño) y el `alt` es descriptivo.
- Elegir una herramienta `.webp` que no esté disponible en otra máquina. Mitigación: documentar el comando exacto en la tarea.

## Cambios respecto del plan original (implementación, 2026-11-10)
- Se usa `ajv` para validar el esquema en lugar de escribir un validador de JSON Schema a mano. `[VERIFICADO]` `package.json`
- Los tests mutan el catálogo real en memoria; no hay `scripts/fixtures/`. Son 15 tests. `[VERIFICADO]` `scripts/validar-catalogo.test.mjs`
- El validador avisa (no falla) si una imagen no mide lo esperado o supera el peso objetivo. `[VERIFICADO]` `scripts/validar-catalogo.mjs`
- Resultado: 12 productos, 3 carruseles, 36 `.webp` de 5 a 16 KB, 0 avisos. `[VERIFICADO]` `npm run catalogo:validar`
