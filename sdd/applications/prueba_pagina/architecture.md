# Arquitectura — prueba_pagina

## Módulos
| Archivo | Responsabilidad | Evidencia |
|---|---|---|
| `index.html` | Página completa (una sola URL): secciones, formularios, modal, JSON-LD | `[VERIFICADO]` `prueba_pagina/index.html` (662 líneas) |
| `style.css` | Estilos, tema claro/oscuro, responsive | `[VERIFICADO]` `prueba_pagina/style.css` (882 líneas) |
| `script.js` | Formularios, tema, menú móvil, carrusel, modal, chips de servicios | `[VERIFICADO]` `prueba_pagina/script.js` (326 líneas) |
| `apps-script-code.gs` | Receptor de formularios; se despliega aparte en script.google.com | `[VERIFICADO]` `prueba_pagina/README.md` §1 |
| `robots.txt`, `sitemap.xml`, `llms.txt` | Indexación y descubrimiento por buscadores e IA | `[VERIFICADO]` |
| `images/servicios/*.webp` | 14 imágenes de servicios | `[VERIFICADO]` `git ls-files` |

Funciones de `script.js`: `fileToPayload`, `wireForm`, `setupThemeToggle`, `setupNavToggle`, `setupServiceCarousels`, `setupServiceModal`, `buildServiceGroupsFromDOM`, `setupServiceChips`. `[VERIFICADO]`

## Cómo se comunican
Todo corre en el navegador. La única llamada de red propia es el `fetch` POST a Google Apps Script. `[VERIFICADO]` `prueba_pagina/script.js` (`SCRIPT_URL`)

## Flujo principal de punta a punta (formulario)
1. El usuario completa `form-cotizacion` o `form-trabajo`. En cotización elige uno o más servicios con chips (campo oculto `servicio`). `[VERIFICADO]` `prueba_pagina/index.html`, `prueba_pagina/script.js`
2. `wireForm` intercepta `submit`, valida el tamaño del adjunto (5 MB) y arma un JSON con los campos más `tipo` (`cotizacion` | `trabajo`). El adjunto va como `{base64, mimeType, filename}`. `[VERIFICADO]` `prueba_pagina/script.js`
3. `fetch` POST, `mode: "no-cors"`, `Content-Type: text/plain;charset=utf-8`, a `SCRIPT_URL`. `[VERIFICADO]` `prueba_pagina/script.js`
4. `doPost` parsea el JSON, arma asunto y cuerpo según `tipo`, y llama a `GmailApp.sendEmail(DESTINATARIO, ...)` con `replyTo` = email del usuario y adjunto si vino. `[VERIFICADO]` `prueba_pagina/apps-script-code.gs`
5. Si `SHEET_ID` está definido, agrega una fila a la hoja `Consultas`. `[VERIFICADO]` `prueba_pagina/apps-script-code.gs` (`guardarEnSheet`)
6. El navegador no puede leer la respuesta; muestra éxito si el `fetch` no lanza excepción. `[VERIFICADO]` `prueba_pagina/script.js`

## Despliegue
Push a `main` → GitHub Action sube la raíz del repo como artefacto → GitHub Pages. `[VERIFICADO]` `prueba_pagina/.github/workflows/deploy-pages.yml` (`path: .`: se publica todo el repo, incluido `apps-script-code.gs`).
