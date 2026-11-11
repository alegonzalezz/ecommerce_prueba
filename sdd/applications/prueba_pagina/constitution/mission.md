# Misión — prueba_pagina

## Qué hace
Sitio institucional estático de **DUOMAN**, empresa de mantenimiento y obra para hogares, comercios y empresas en CABA y GBA. `[VERIFICADO]` `prueba_pagina/llms.txt`, `prueba_pagina/index.html:6`

## Flujos que soporta
- Navegar secciones: Nosotros, Servicios, FAQ, Cotizar, Trabajá con nosotros. `[VERIFICADO]` `prueba_pagina/index.html:189,247,441,483,558`
- Pedir una cotización (`form-cotizacion`). `[VERIFICADO]` `prueba_pagina/index.html:521`
- Postularse para trabajar, con adjunto opcional (`form-trabajo`). `[VERIFICADO]` `prueba_pagina/index.html:591`, `prueba_pagina/script.js`
- Ver el detalle de un servicio en un modal (`<dialog>`). `[VERIFICADO]` `prueba_pagina/index.html:643`, `prueba_pagina/script.js` (`setupServiceModal`)
- Contactar por WhatsApp (botón flotante). `[VERIFICADO]` `prueba_pagina/index.html:637`
- Cambiar entre tema claro y oscuro. `[VERIFICADO]` `prueba_pagina/script.js` (`setupThemeToggle`)

## Quiénes la usan
- Clientes potenciales (hogares, comercios, empresas). `[VERIFICADO]` `prueba_pagina/llms.txt`
- Postulantes a trabajar en la empresa. `[VERIFICADO]` `prueba_pagina/index.html:558`
- Quien recibe los mails (equipo de DUOMAN). `[INFERIDO]` `prueba_pagina/apps-script-code.gs` (`DESTINATARIO`)

## Qué NO hace
- No tiene backend propio, base de datos, login, carrito ni pagos. `[INFERIDO]` ausencia en `git ls-files`.
- No confirma al navegador si el mail salió (usa `no-cors`). `[VERIFICADO]` `prueba_pagina/README.md` (Notas de diseño), `prueba_pagina/script.js`
- No tiene analytics. `[INFERIDO]` no hay scripts de analytics en `prueba_pagina/index.html`.
