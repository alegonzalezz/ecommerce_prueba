# Stack — prueba_pagina

No hay manifiestos (`package.json`, etc.), por eso las versiones exactas **no se pueden determinar** salvo las de las acciones de CI.

| Capa | Tecnología | Versión | Evidencia |
|---|---|---|---|
| Marcado | HTML5, `lang="es"` | — | `prueba_pagina/index.html:2` `[VERIFICADO]` |
| Estilos | CSS plano, variables en `:root`, tema por `[data-theme]` | — | `prueba_pagina/style.css:4,26` `[VERIFICADO]` |
| Lógica | JavaScript vanilla, sin módulos ni bundler | — | `prueba_pagina/script.js`, `prueba_pagina/README.md` `[VERIFICADO]` |
| Tipografías | Google Fonts: Space Grotesk (500-700), IBM Plex Sans (400-600), IBM Plex Mono (400-500) | — | `prueba_pagina/index.html:32` `[VERIFICADO]` |
| Formularios (backend externo) | Google Apps Script (`GmailApp`, `SpreadsheetApp`, `ContentService`, `Utilities`) | `<pendiente>` runtime | `prueba_pagina/apps-script-code.gs` `[VERIFICADO]` |
| Hosting | GitHub Pages | — | `prueba_pagina/.github/workflows/deploy-pages.yml` `[VERIFICADO]` |
| CI/CD | GitHub Actions: `checkout@v4`, `configure-pages@v5`, `upload-pages-artifact@v3`, `deploy-pages@v4`, `ubuntu-latest` | ver col. 1 | `prueba_pagina/.github/workflows/deploy-pages.yml` `[VERIFICADO]` |
| Build / tests / linter | Ninguno | — | `git ls-files` (no hay archivos de config) `[VERIFICADO]` |
