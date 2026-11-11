# Convenciones — prueba_pagina

- **Naming HTML/CSS:** ids y clases en kebab-case (`form-cotizacion`, `service-card`); atributos `data-*` para enganchar JS (`data-status`, `data-service`). `[VERIFICADO]` `prueba_pagina/index.html`, `script.js`
- **Naming JS:** funciones en camelCase, inicializadores `setupX`. `[VERIFICADO]` `prueba_pagina/script.js`
- **Estructura:** todo en la raíz del repo; imágenes en `images/servicios/`. `[VERIFICADO]` `git ls-files`
- **Branching:** `main` + ramas de trabajo (`OptimizacionSEO` en remoto). Push a `main` despliega. `[VERIFICADO]` `git branch -r`, `.github/workflows/deploy-pages.yml`
- **Commits:** en español, imperativo, sin prefijo formal (ej. "Agregar botón flotante de WhatsApp abajo a la derecha"). `[INFERIDO]` `git log` (20 commits)
- **PRs:** sin plantilla en el repo. `[INFERIDO]` no hay `.github/pull_request_template.md`.
- **Cómo correr:** abrir `index.html` o servir la carpeta con cualquier servidor estático. `[INFERIDO]` (no documentado)
- **Cómo testear:** no hay tests; verificación manual, incluyendo el envío de formularios (el README sugiere ejecutar `testEnvio` en el editor de Apps Script). `[VERIFICADO]` `prueba_pagina/README.md` §1.5
- **Al cambiar de dominio:** actualizar `canonical`, `og:url`, `Sitemap:` en `robots.txt` y `<loc>` en `sitemap.xml`. `[VERIFICADO]` `prueba_pagina/README.md` §5
- **Al editar el Apps Script:** publicar una nueva versión de la implementación. `[VERIFICADO]` `prueba_pagina/README.md` §4
