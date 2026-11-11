# Plan: <título>

- **Spec:** [spec.md](spec.md)
- **Fecha:** AAAA-MM-DD (obtener con `date +%F`)

## Enfoque
<Qué vamos a hacer y por qué así.>

**Alternativas descartadas:** <...> (si la decisión es relevante, crear un ADR en `applications/prueba_pagina/decisions/`).

## Cambios por capa
Si una capa no se toca se escribe "Sin cambios", no se borra.

- **Producto / contenido:** <textos, servicios, FAQ>
- **HTML (`index.html`):** <secciones, formularios, atributos `data-*`>
- **CSS (`style.css`):** <variables, tema claro/oscuro, responsive>
- **JS (`script.js`):** <módulos `setup*`, validaciones>
- **Apps Script (`apps-script-code.gs`):** <contrato JSON, mail, Sheet> — se despliega a mano (nueva versión de la implementación)
- **SEO / GEO:** <title/description, JSON-LD, `sitemap.xml`, `robots.txt`, `llms.txt`>
- **Data:** <eventos de analytics, si aplica> (hoy no hay analytics en el repo `[INFERIDO]`)
- **DB:** no aplica a este repo. Los leads van, opcionalmente, a una Google Sheet (`SHEET_ID` en `apps-script-code.gs`); no hay migraciones.
- **Infra (`.github/workflows/deploy-pages.yml`):** <GitHub Pages>
- **Observabilidad:** <hoy: `console.log` en el navegador y `Logger.log` en Apps Script>

## Verificación de constraints
Una fila por constraint de `applications/prueba_pagina/constitution/constraints.md`. Ninguna sin evaluar.

| Constraint | ¿Aplica? | Cómo se cumple |
|---|---|---|
| C-01 | <...> | <...> |

## Testing
<Qué se prueba, cómo y dónde.>

## Feature flag
<Nombre y comportamiento, o "No aplica".>

## Rollout
<Orden y pasos de despliegue.>

## Rollback
<Cómo se revierte.>

## Riesgos
- <...>
