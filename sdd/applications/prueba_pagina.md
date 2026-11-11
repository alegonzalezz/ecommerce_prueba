---
name: prueba_pagina
id_prefix: PP
path: ../../prueba_pagina
sdd_dir: applications/prueba_pagina
specs_dir: initiatives/<slug>/specs/<fase>/prueba_pagina
templates_dir: applications/prueba_pagina/templates
roadmap_file: applications/prueba_pagina/constitution/roadmap.md
constraints_file: applications/prueba_pagina/constitution/constraints.md
default_branch: main
touches_when: cambia el sitio institucional DUOMAN, sus formularios, su SEO o su despliegue
---

# prueba_pagina

- **Path:** `../../prueba_pagina`
- **SDD:** `applications/prueba_pagina/`
- **Rol:** sitio estático institucional de DUOMAN. `[VERIFICADO]` `prueba_pagina/README.md`
- **Habla con:** Google Apps Script (envío de formularios), Google Fonts, WhatsApp (`wa.me`). Ninguna otra app de este proyecto. `[VERIFICADO]` `prueba_pagina/script.js:3`, `prueba_pagina/index.html:637`

## Se toca cuando…
- Se modifican textos, servicios, FAQ o estilos del sitio (`index.html`, `style.css`).
- Se cambian los formularios de cotización o de postulación laboral (`index.html`, `script.js`) o el script que los recibe (`apps-script-code.gs`).
- Se toca SEO/GEO: `robots.txt`, `sitemap.xml`, `llms.txt`, JSON-LD en `index.html`.
- Se toca el despliegue (`.github/workflows/deploy-pages.yml`).

## NO está acá
- **Tienda, carrito, pagos o catálogo de productos:** no existen acá. Van en `ecommerce_prueba`. `[INFERIDO]` ausencia en el repo.
- **Backend, base de datos, login:** no hay. El único "servidor" es un Google Apps Script externo. `[VERIFICADO]` `prueba_pagina/README.md`.
- **Build o framework:** no hay (`prueba_pagina/README.md` "Sin frameworks ni build step").

## Para tareas que dependen de otras apps
Ninguna dependencia con otras apps de este proyecto. Sí depende del Apps Script desplegado: si cambia el contrato JSON (`apps-script-code.gs` ↔ `script.js`), se tocan ambos archivos en la misma spec. `[VERIFICADO]`

## Flujo de ramas / entornos
- Solo existe `main` (+ `OptimizacionSEO` en remoto, 1 commit adelantado). `[VERIFICADO]` `git branch -r` en `prueba_pagina`.
- Cada push a `main` despliega a GitHub Pages (producción). No hay ambiente de QA ni staging. `[VERIFICADO]` `prueba_pagina/.github/workflows/deploy-pages.yml`.

## Cómo correr
- Abrir `index.html` en el navegador o servir la carpeta con un servidor estático. `[INFERIDO]` (no hay script de arranque; el README no lo documenta).
- Para probar los formularios hace falta el Apps Script desplegado (`prueba_pagina/README.md` §1-2).

## Fuentes (archivos leídos y fecha)
- `prueba_pagina/README.md`, `llms.txt`, `robots.txt`, `sitemap.xml`, `index.html`, `script.js`, `apps-script-code.gs`, `.github/workflows/deploy-pages.yml` y `git log`/`git branch -r` — leídos el 2026-11-10.
