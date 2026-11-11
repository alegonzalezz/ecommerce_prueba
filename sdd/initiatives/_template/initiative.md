---
slug: YYYY-MM-DD-nombre-en-kebab-case   # = nombre de carpeta, igual en todas las apps
title: <título corto>
author: <quién>
status: borrador                        # borrador | aprobada | en desarrollo | en QA | en producción | descartada
apps:                                   # una entrada por app afectada (nombre = applications/<name>.md)
  - name: <app-productora>
    why: <por qué se toca>
    depends_on: []                      # nombres de apps que deben ir antes
  - name: <app-consumidora>
    why: <por qué se toca>
    depends_on: [<app-productora>]
---

# Iniciativa: <título>

> Spec funcional única. Cada app afectada recibe una porción en `specs/<YYYY-MM-DD-fase>/<app>/spec.md`.
> Los repos de código no llevan `.sdd/`: solo código. Las tareas viven en el `tasks.md` de cada spec.

## Contexto
## User stories
## Criterios de aceptación
(cada criterio indica la app; en Given/When/Then)
## Casos borde y errores
## Comportamiento por país
## Fuera de alcance
## Impacto en métricas
## Contratos entre apps
| Contrato | Productor | Consumidor | Breaking |
|---|---|---|---|
## Orden de despliegue y rollback
## Preguntas abiertas
