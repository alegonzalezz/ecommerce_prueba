# Spec: SEO para asistentes de IA

- **Fecha:** 2026-11-10
- **Autor:** agonzalezz
- **Iniciativa:** `initiatives/2026-11-10-ficha-producto/initiative.md`
- **Estado:** implementada   <!-- borrador | en revisión | aprobada | implementada | descartada -->
- **Plan:** [plan.md](plan.md) · **Tareas:** [tasks.md](tasks.md)

> Aprobada por el usuario el 2026-11-10 ("OK, creá las specs y construí las 3 fases"). Ninguna tarea de código arranca con esta spec en estado `borrador`.


## Contexto
- **Qué pasa si no hacemos nada:** los asistentes de IA no tendrían una guía clara del sitio ni permiso explícito de sus rastreadores.
- **Situación actual en el código:** `prueba_pagina` ya declara los rastreadores de IA en `robots.txt` y tiene un `llms.txt`; esta tienda no tiene ninguno de los dos. `[VERIFICADO]` `prueba_pagina/robots.txt`, `prueba_pagina/llms.txt`.
- **Advertencia honesta:** no hay garantía de que ChatGPT, Gemini, Claude o Perplexity indexen o citen estas páginas, y no está confirmado que los principales proveedores usen `llms.txt`. Lo que más influye es que la página sea clara, esté bien indexada y tenga datos estructurados (fase 2). `[INFERIDO]` guías de terceros; no se consultaron las páginas oficiales de cada proveedor.

## User stories
- Como persona que le pregunta a un asistente de IA por una herramienta quiero que pueda leer el producto con su precio y disponibilidad.
- Como equipo quiero decidir qué rastreadores entran, en un solo archivo.

## Criterios de aceptación
- **Given** `/robots.txt`, **Then** permite explícitamente (con `Allow: /`) estos rastreadores: `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-SearchBot`, `Claude-User`, `anthropic-ai`, `PerplexityBot`, `Perplexity-User` y `Google-Extended`; mantiene `User-agent: *` y la línea `Sitemap`.
- **Given** `/llms.txt`, **Then** sigue el formato de llmstxt.org: un `# <tienda>`, una cita con el resumen, y secciones con enlaces absolutos a la home y a cada producto activo con una línea de descripción, agrupados por categoría.
- **Given** un producto nuevo en el JSON, **Then** aparece en `llms.txt` sin tocar código.
- **Given** una ficha, **Then** su HTML tiene una jerarquía clara (`h1` único, `h2` por sección), el texto principal está en el HTML del servidor (sin JavaScript), la tabla usa encabezados de fila y las imágenes tienen `alt` útil.
- **Given** el verificador, **Then** revisa también robots y llms.

### Casos borde
- Producto inactivo: no aparece en `llms.txt`.
- Categoría sin productos activos: no aparece.
- `SITE_URL` provisoria: las URLs de `llms.txt` apuntan a localhost hasta configurarla.

### Comportamiento por país
Solo Argentina.

## Fuera de alcance
- Versión Markdown de cada ficha, `llms-full.txt`, y cualquier medición de si los asistentes citan el sitio.

## Impacto en métricas
- **Qué medimos:** presencia y formato de `robots.txt` y `llms.txt`; jerarquía de encabezados.
- **Cómo sabemos si salió mal:** un rastreador ausente, un enlace relativo o un producto activo que falta en `llms.txt`.
- **No medible desde acá:** citas reales en asistentes.

## Dependencias
- Fase 2 (`seo-buscadores`) cerrada.

## Preguntas abiertas de esta spec
- Los nombres de los rastreadores salen de guías de terceros: confirmarlos contra la documentación de cada proveedor antes de publicar.
- Descripción de la tienda para el resumen de `llms.txt`: provisoria.

