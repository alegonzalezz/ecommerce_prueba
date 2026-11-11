# Integraciones — prueba_pagina

| Servicio | Para qué | Contrato / uso | Evidencia |
|---|---|---|---|
| Google Apps Script (Web App) | Recibe los formularios | POST JSON (`Content-Type: text/plain`) con `tipo`, `nombre`, `empresa`, `email`, `telefono`, `servicio`, `zona`, `mensaje`, `adjunto{base64,mimeType,filename}`. Respuesta JSON `{result: "success" \| "error", message?}`, que el navegador no lee. | `prueba_pagina/script.js`, `apps-script-code.gs` `[VERIFICADO]` |
| Gmail (`GmailApp`) | Envía el mail al `DESTINATARIO`; usa la cuenta de quien desplegó el script | Asunto: `Nueva cotización: ...` / `Nueva postulación: ...` | `prueba_pagina/apps-script-code.gs` `[VERIFICADO]` |
| Google Sheets (`SpreadsheetApp`) | Guarda leads (opcional) | Hoja `Consultas`, columnas: Fecha, Tipo, Nombre, Empresa, Email, Teléfono, Servicio/Zona, Mensaje, Adjunto | `prueba_pagina/apps-script-code.gs` `[VERIFICADO]` |
| Google Fonts | Tipografías | `<link>` en `<head>` | `prueba_pagina/index.html:30-34` `[VERIFICADO]` |
| WhatsApp (`wa.me`) | Botón flotante de contacto | Link con texto predefinido | `prueba_pagina/index.html:637` `[VERIFICADO]` |
| GitHub Pages / Actions | Hosting y despliegue | Ver `architecture.md` | `prueba_pagina/.github/workflows/deploy-pages.yml` `[VERIFICADO]` |
| Google Search Console | Indexación (manual) | Verificación y envío de `sitemap.xml` | `prueba_pagina/README.md` §5 `[VERIFICADO]` (proceso documentado, no hay código) |
| schema.org (JSON-LD) | Datos estructurados (`HomeAndConstructionBusiness`) | Dos bloques `application/ld+json` | `prueba_pagina/index.html:45,67`; `README.md` §5 `[VERIFICADO]` |

## Contratos con otras apps
Ninguno. `[VERIFICADO]` no hay referencias a otras apps en el repo.
