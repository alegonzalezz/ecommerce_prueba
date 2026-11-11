# Tu Ferretería (`ecommerce_prueba`)

Tienda online de ferretería hecha con **Nuxt 4** (SSR) y **PrimeVue 4**. Catálogo en un JSON, carrito que se recuerda 2 horas en el navegador, SEO para buscadores y asistentes de IA, y pago con **Mercado Pago** (sandbox).

**Sitio publicado (versión de demostración, sin pago):** https://alegonzalezz.github.io/ecommerce_prueba/

> GitHub Pages solo sirve archivos estáticos, así que el pago online no está disponible ahí. Con un host que ejecute Node (y un token de Mercado Pago) el mismo código sí cobra.

## Cómo correrlo

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # tests unitarios
npm run build        # versión con servidor (SSR)
```

## Pago con Mercado Pago (sandbox)

1. Copiá `.env.example` a `.env` y completá `NUXT_MERCADOPAGO_ACCESS_TOKEN` con el token **de prueba** (nunca lo subas al repositorio).
2. Seguí `sdd/applications/ecommerce_prueba/guia-sandbox-mercadopago.md`.
3. Sin credenciales podés probar todo contra un Mercado Pago simulado: `npm run mercadopago:simulado`.

## Versión estática (GitHub Pages)

```bash
npm run pages:build   # genera .output/public con la subcarpeta /ecommerce_prueba/
npm run pages:servir  # http://localhost:4173/ecommerce_prueba/ (imita a Pages)
npm run probar:pages -- http://localhost:4173/ecommerce_prueba
```

Cada `push` a `main` corre el catálogo y los tests y publica con `.github/workflows/deploy-pages.yml`.

## Comandos útiles

| Comando | Qué hace |
|---|---|
| `npm run catalogo:validar` | Valida `data/catalogo.json` |
| `npm run verificar:seo -- <url>` | Revisa el SEO de todas las fichas, sitemap, robots y `llms.txt` |
| `npm run probar:pago` | Prueba las rutas de pago (necesita `npm run build`) |
| `npm run probar:pago-navegador` | Flujo de pago completo en Chrome, contra el simulado |
| `npm run probar:carrito -- <url>` | Carrito y vistos recientes en Chrome |

## Estructura

- `app/`: páginas, componentes y tema de Nuxt · `shared/`: lógica pura (carrito, pedido, SEO, Mercado Pago) · `server/`: rutas de servidor
- `data/`: catálogo · `public/img/`: imágenes `.webp` · `scripts/` y `tests/`: herramientas y pruebas
- `sdd/`: documentación del proyecto (specs, decisiones y preguntas abiertas)
