# CLAUDE.md

Documentación SDD (Spec Driven Development) de **ecommerce**. **Los repos de código no tienen `.sdd/`**: todo vive acá, organizado por iniciativa. Los repos de código son `prueba_pagina` (`../../prueba_pagina`, carpeta hermana de `ecommerce_prueba/`) y `ecommerce_prueba` (`..`, el repo que contiene esta carpeta `sdd/`).

## Estructura

- `roadmap.md`: una fila por iniciativa.
- `applications/<app>.md`: ficha de cada app (qué es, cuándo se toca, qué NO está ahí).
- `applications/<app>/`: documentos permanentes de la app (`constitution/`, `architecture.md`, `domain-glossary.md`, `integrations.md`, `conventions.md`, `open-questions.md`, `decisions/`, `templates/`). El ciclo está en `sdd-process.md`.
- `initiatives/<YYYY-MM-DD-nombre>/`: `initiative.md` (spec funcional única) y `specs/<YYYY-MM-DD-fase>/<app>/{spec,plan,tasks}.md` (una carpeta por app, mismo nombre de fase en todas).

## Antes de cualquier tarea

Leer, de cada app que se vaya a tocar:

- `applications/<app>/constitution/*` (misión, stack, principios, constraints)
- `applications/<app>/domain-glossary.md`

Para entender cómo encaja algo: `architecture.md`, `integrations.md` y `conventions.md` de la misma carpeta.

## Reglas

1. **Las constraints de `applications/<app>/constitution/constraints.md` no se violan sin aprobación explícita del usuario.** Si un cambio las viola, frená y preguntá antes de escribir código.
2. **Ningún cambio de código se hace sin una spec aprobada** en `initiatives/<iniciativa>/specs/`. Si no hay spec, o está en `borrador`, decilo y ofrecé escribirla primero. Para un fix trivial, confirmá antes de saltearla.
3. **Las tareas se toman de `tasks.md`** de la spec de esa app, no se inventan. Al completar una, marcá `[x]` y actualizá el estado general del archivo.
4. **Si durante la implementación algo cambia respecto de la spec, se actualiza la spec** (en este proyecto) en el mismo trabajo. Una spec desactualizada es peor que no tener spec.
5. Las specs nuevas se crean copiando `applications/<app>/templates/` a `initiatives/<iniciativa>/specs/<YYYY-MM-DD-fase>/<app>/`. **La fecha se obtiene con `date +%F`, nunca se inventa.**
6. Si algo no se puede determinar, va a `applications/<app>/open-questions.md`. No se rellena con suposiciones.
7. **No se crea `.sdd/` ni documentación SDD dentro de los repos de código.** Las ramas de código llevan solo código. *(Excepción conocida: esta carpeta `sdd/` vive dentro del repo `ecommerce_prueba`; ver `applications/ecommerce_prueba/open-questions.md` Q-01.)*
8. Cuando una iniciativa se cierra, se borran sus ramas de documentación y de código asociadas. La documentación queda en este proyecto.

> Este proyecto **no usa Jira**: el estado del trabajo vive en los `tasks.md` y en los `roadmap.md`.

## Cuando llega un pedido nuevo (sin iniciativa todavía)

1. **No escribas código ni specs todavía.** Leé `roadmap.md` (por si ya existe algo parecido) y `applications/README.md` (qué apps pueden estar involucradas).
2. **Buscá lo que ya existe**: leé los glosarios y las fichas de las apps candidatas. Si la capacidad ya existe parcialmente, decilo y preguntá si se extiende o se reemplaza.
3. **Hacé las preguntas de ambigüedad antes de proponer nada**, agrupadas por tema y con una opción recomendada cuando la haya: alcance, usuarios afectados, países, dónde vive cada pieza (qué app), contratos entre apps, métricas de éxito, fechas y lo que queda fuera. Usá `AskUserQuestion` para decisiones cerradas.
4. **Verificá las constraints** de cada app candidata. Si el pedido toca una, frená y preguntá.
5. Recién con las respuestas: proponé la lista de apps con su orden (`depends_on`) y las fases. Con el OK del usuario, creá la iniciativa copiando `initiatives/_template/initiative.md` (fecha con `date +%F`) y las specs de la primera fase en estado `borrador`.
6. Lo que sigas sin saber va a `open-questions.md` de la app. Nunca se inventa.
