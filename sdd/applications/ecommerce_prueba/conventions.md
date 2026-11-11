# Convenciones — ecommerce_prueba

- **Idioma del código:** datos, utilidades y variables en español (`precioAnterior`, `calcularDescuento`); componentes con nombres en inglés/español mixtos (`ProductCard`, `AppHeader`, `HeroBanner`). `[INFERIDO]` de `app/`; sin regla del equipo.
- **Carpetas:** `app/` (código Nuxt 4), `shared/` (tipos y funciones puras usadas por la app, el servidor y los tests), `server/` (rutas de servidor), `data/` (catálogo), `scripts/` (herramientas), `tests/`, `public/img/` (imágenes `.webp`). `sdd/` es documentación (ver Q-01). `[VERIFICADO]`
- **Estilos:** CSS con variables en `app/assets/css/base.css` y estilos `scoped` por componente; sin sombras difusas ni gradientes (dirección Mostrador). `[VERIFICADO]`
- **Cómo correr:** `npm install`, `npm run dev` (http://localhost:3000). `[VERIFICADO]`
- **Cómo compilar:** `npm run build`; `node .output/server/index.mjs` sirve el build. `[VERIFICADO]`
- **Cómo testear:** `npm test` (165 tests con `node:test`). Los tests de `tests/` importan archivos `.ts` directamente, lo que requiere Node con *type stripping* activo por defecto (22.18 o más); Nuxt 4.4.5 declara Node `^20.19.0 || >=22.12.0`. `[VERIFICADO]` en Node 25.2.1.
- **Antes de tocar el catálogo:** `npm run catalogo:validar`. **Para regenerar placeholders:** `npm run catalogo:placeholders` (sobrescribe los `.webp`; no usarlo con fotos reales). `[VERIFICADO]`
- **Branching, commits y PRs:** `<pendiente>` (Q-11). El repo no tiene commits.
- **Antes de publicar:** definir `NUXT_PUBLIC_SITE_URL` (ver `.env.example`) **antes** de `npm run build`, porque las páginas pregeneradas fijan la URL. Después, `npm run verificar:seo -- <url>` contra el sitio en marcha: revisa las 12 fichas, home, sitemap, robots y `llms.txt`. `[VERIFICADO]`
- **Imports en `shared/`:** las funciones puras importan con extensión (`./formatPrecio.ts`) para poder probarlas con `node:test`; `app/app.config.ts` usa el alias `#shared/...` (un import relativo rompe el build). `[VERIFICADO]`
- **El hosting tiene que comprimir las respuestas** (gzip o brotli): sin compresión la home pasa de Lighthouse 96 a 80. `[VERIFICADO]`
- **Estado en el navegador:** se guarda siempre con `useAlmacenado` (vencimiento de 2 h en `shared/utils/almacenamiento.ts`); nunca leer `localStorage` durante el render (rompe la hidratación). Claves con prefijo `ecommerce:` y `version`; si cambia el formato, se sube la versión y lo viejo se descarta. `[VERIFICADO]`
- **Probar el carrito:** `npm run probar:carrito -- http://localhost:3100` (Chrome real; necesita el build de producción levantado). En desarrollo, `@vue/devtools-kit` lanza errores propios si `localStorage` está bloqueado, así que esa parte se prueba contra el build. `[VERIFICADO]`
- **Secretos:** solo en `.env` (ignorado por git) o en variables del servidor; nunca en el repositorio, en `public` de `runtimeConfig` ni en un chat. La plantilla es `.env.example`. `[VERIFICADO]`
- **Probar el pago sin credenciales:** `npm run build`, después `npm run probar:pago` (rutas) y `npm run probar:pago-navegador` (flujo en Chrome). Para jugar a mano: `npm run mercadopago:simulado` y arrancar la app con `NUXT_MERCADOPAGO_ACCESS_TOKEN=TEST-simulado NUXT_MERCADOPAGO_API_URL=http://localhost:3400`. `[VERIFICADO]`
- **Probar contra el real:** seguir `guia-sandbox-mercadopago.md`. `[VERIFICADO]`
- **Lo que se cobra sale del catálogo:** nunca usar precios, nombres ni totales que mande el navegador. `[VERIFICADO]`

