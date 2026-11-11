# Principios — prueba_pagina

## Reglas que el código ya sigue
- **Sin build ni dependencias:** se edita y se sube directo. `[VERIFICADO]` `prueba_pagina/README.md` (Notas de diseño)
- **Tema:** respeta `prefers-color-scheme`, persiste la elección en `localStorage` y un script inline en `<head>` evita el flash. `[VERIFICADO]` `prueba_pagina/index.html:36-44`, `prueba_pagina/script.js` (`setupThemeToggle`)
- **Accesibilidad básica:** `aria-label` en botones de ícono, `aria-expanded` en el menú, `aria-pressed` en los chips, `prefers-reduced-motion` desactiva el autoplay del carrusel. `[VERIFICADO]` `prueba_pagina/script.js` (`setupNavToggle`, `setupServiceChips`, `setupServiceCarousels`), `prueba_pagina/index.html:637`
- **Salida al DOM con `textContent`** para datos de usuario o de la card; `innerHTML` solo se usa para vaciar contenedores. `[VERIFICADO]` `prueba_pagina/script.js` (18 usos de `textContent`/`innerHTML`)
- **Enlaces externos con `rel="noopener"`.** `[VERIFICADO]` `prueba_pagina/index.html:637`
- **Errores de formulario:** `try/catch/finally`, botón deshabilitado durante el envío, mensaje al usuario. `[VERIFICADO]` `prueba_pagina/script.js` (`wireForm`)
- **Validación en cliente:** adjunto máximo 5 MB, servicio obligatorio (chips), `required` en campos clave. `[VERIFICADO]` `prueba_pagina/script.js` (`MAX_FILE_MB`, `setupServiceChips`), `prueba_pagina/index.html:521-634`
- **Lista de servicios sin duplicar:** el selector del formulario se arma leyendo el DOM de `#servicios`. `[VERIFICADO]` `prueba_pagina/script.js` (`buildServiceGroupsFromDOM`)
- **SEO/GEO:** canonical, Open Graph, JSON-LD, `robots.txt` que permite bots de IA, `sitemap.xml`, `llms.txt`. `[VERIFICADO]` `prueba_pagina/index.html:13-67`, `prueba_pagina/robots.txt`, `prueba_pagina/llms.txt`
- **Idioma:** español rioplatense (voseo) en UI y README. `[VERIFICADO]` `prueba_pagina/README.md`, `prueba_pagina/script.js`
- **Testing:** no hay tests ni linter; el único workflow es el de despliegue. `[VERIFICADO]` `git ls-files`

## Desvíos observados (no son reglas; para que el equipo decida)
- `console.log` del payload completo (incluye datos personales) en el navegador. `[VERIFICADO]` `prueba_pagina/script.js` (`console.log(... payload a enviar ...)`)
- `apps-script-code.gs` está versionado aunque el README dice que no se sube a GitHub. `[VERIFICADO]` `git ls-files`, `prueba_pagina/README.md` §3
- `SCRIPT_URL` está hardcodeada en el repo y el comentario dice "Reemplazá esta URL". `[VERIFICADO]` `prueba_pagina/script.js:1-3`

## Candidatas a constraint (el equipo decide)
- No introducir build step ni framework. `[PROPUESTA]`
- No loguear datos personales en consola. `[PROPUESTA]`
- Mantener `canonical`, `og:url`, `robots.txt` y `sitemap.xml` sincronizados al cambiar de dominio. `[PROPUESTA]` (el README ya lo pide: `prueba_pagina/README.md` §5)
