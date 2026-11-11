# Proceso SDD — ecommerce_prueba

## Ciclo

`spec → plan → tasks → implement`

1. **spec** (`spec.md`): qué y por qué. Se aprueba antes de seguir.
2. **plan** (`plan.md`): cómo, por capa, verificando constraints.
3. **tasks** (`tasks.md`): pasos chicos, uno por PR.
4. **implement**: se toman las tareas de `tasks.md`; se marca `[x]`.

## Crear una spec nueva

1. Si no hay iniciativa, seguir "Cuando llega un pedido nuevo" en `CLAUDE.md`.
2. Fecha con `date +%F` (nunca inventada).
3. Nombre de fase: `YYYY-MM-DD-nombre-en-kebab-case`, de 2 a 5 palabras, sin acentos.
4. Copiar `applications/ecommerce_prueba/templates/` a `initiatives/<slug>/specs/<YYYY-MM-DD-fase>/ecommerce_prueba/`.
5. La spec nace en estado `borrador`.

## Documentos permanentes

| Documento | Qué lleva |
|---|---|
| `constitution/mission.md` | Qué hace la app y qué NO |
| `constitution/tech-stack.md` | Tecnología y versión por capa |
| `constitution/principles.md` | Reglas que el código ya sigue; candidatas a constraint |
| `constitution/constraints.md` | Reglas del equipo, verificables |
| `constitution/roadmap.md` | Épicas de la app |
| `architecture.md` | Módulos y flujo principal |
| `domain-glossary.md` | Términos tal como aparecen en el código |
| `integrations.md` | Servicios externos y contratos |
| `conventions.md` | Naming, branching, commits, cómo correr y testear |
| `open-questions.md` | Preguntas `Q-NN` sin responder |
| `decisions/` | ADRs |

## Reglas de mantenimiento

- Toda afirmación lleva etiqueta `[VERIFICADO]` / `[INFERIDO]` / `[PROPUESTA]` y su evidencia (ruta).
- Las constraints las define el equipo; no se infieren del código.
- Si cambia el código, se actualiza el documento permanente afectado en el mismo trabajo.
- `open-questions.md` se vacía respondiendo (la respuesta va al documento indicado), no borrando.

## Seguimiento

Este proyecto **no usa Jira**. El estado vive en `tasks.md` (por spec) y en los `roadmap.md` (central y de la app). Si más adelante se adopta un gestor de tickets, se documenta acá.
