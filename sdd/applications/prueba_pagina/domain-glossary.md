# Glosario — prueba_pagina

| Término | Significado | En el código |
|---|---|---|
| Cotización | Pedido de presupuesto de un servicio | `form-cotizacion`, `tipo: "cotizacion"` (`prueba_pagina/index.html:521`, `script.js`) `[VERIFICADO]` |
| Postulación / Trabajo | Candidatura laboral con CV opcional | `form-trabajo`, `tipo: "trabajo"` (`prueba_pagina/index.html:591`) `[VERIFICADO]` |
| Servicio | Oficio ofrecido (electricidad, plomería, etc.) | `.service-card`, `data-service` (`prueba_pagina/index.html`, `script.js`) `[VERIFICADO]` |
| Categoría de servicio | Grupo de servicios (3: Mantenimiento e Instalaciones Técnicas, Construcción y Mejoras de Oficina, Servicios Especiales) | `.service-category` (`prueba_pagina/index.html:254,343,420`; nombres en `llms.txt`) `[VERIFICADO]` |
| Chip | Opción seleccionable de servicio en el formulario | `.chip`, `.chip-option` (`prueba_pagina/script.js`) `[VERIFICADO]` |
| Adjunto | Archivo (PDF o imagen, hasta 5 MB) del formulario de trabajo | `adjunto`, `MAX_FILE_MB` (`prueba_pagina/script.js`, `index.html` `accept=".pdf,image/*"`) `[VERIFICADO]` |
| Zona | Zona de residencia del postulante | campo `zona` (`prueba_pagina/index.html`) `[VERIFICADO]` |
| Lead / Consulta | Registro guardado en la Sheet | `SHEET_NAME = "Consultas"`, `guardarEnSheet` (`prueba_pagina/apps-script-code.gs`) `[VERIFICADO]` |
| Destinatario | Mail que recibe los avisos | `DESTINATARIO` (`prueba_pagina/apps-script-code.gs`) `[VERIFICADO]` |
| Tema | Modo claro u oscuro | `data-theme` en `<html>`, `localStorage["theme"]` (`prueba_pagina/script.js`) `[VERIFICADO]` |
| CABA / GBA | Zona de cobertura | `prueba_pagina/llms.txt` `[VERIFICADO]` |
