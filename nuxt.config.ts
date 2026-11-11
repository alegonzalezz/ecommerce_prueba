import { readFileSync } from 'node:fs'
import Mostrador from './app/theme/mostrador'

// Publicación estática (GitHub Pages): sin servidor. NUXT_ESTATICO=true agrega al prerender las páginas que
// normalmente se sirven por pedido y genera `x.html` (que Pages sirve como `/x`, sin barra final).
const estatico = process.env.NUXT_ESTATICO === 'true'

// Subcarpeta de publicación (GitHub Pages: "/ecommerce_prueba/"); por defecto, la raíz.
const subcarpeta = (process.env.NUXT_APP_BASE_URL ?? '/').replace(/\/+$/, '')

// Páginas de producto que se pregeneran en el build: una por producto activo del catálogo.
const catalogo = JSON.parse(readFileSync(new URL('./data/catalogo.json', import.meta.url), 'utf8'))
const rutasProducto: string[] = catalogo.productos
  .filter((p: { activo: boolean }) => p.activo)
  .map((p: { slug: string }) => `/producto/${p.slug}`)

// SSR activo (C-01). Sin backend propio (C-02): solo el servidor de render de Nuxt.
export default defineNuxtConfig({
  compatibilityDate: '2026-11-10',
  ssr: true,
  // Bug de Nuxt 4.4.5: al extraer el payload de la ruta raíz falla con `Invalid key: "/"` (ver Q-21).
  // En la versión estática el payload va dentro del HTML; en la versión con servidor no cambia nada.
  ...(estatico ? { experimental: { payloadExtraction: false } } : {}),
  devtools: { enabled: false },
  // sdd/ es la documentación del proyecto, no código de la app.
  ignore: ['sdd/**'],

  // Lo que está bajo `public` llega al navegador; lo demás es SOLO del servidor.
  // Las variables de entorno se cargan por nombre: NUXT_<RUTA_EN_MAYUSCULAS> (ver .env.example).
  runtimeConfig: {
    // Secreto de Mercado Pago: nunca va dentro de `public`.
    mercadopago: {
      accessToken: '', // NUXT_MERCADOPAGO_ACCESS_TOKEN
      apiUrl: 'https://api.mercadopago.com', // NUXT_MERCADOPAGO_API_URL (solo se cambia para el simulado)
    },
    public: {
      siteUrl: 'http://localhost:3000', // NUXT_PUBLIC_SITE_URL
      modoPrueba: true, // NUXT_PUBLIC_MODO_PRUEBA: muestra "Modo de prueba" (C-03: sandbox)
      pagoDisponible: true, // NUXT_PUBLIC_PAGO_DISPONIBLE: false en GitHub Pages (sin servidor no se puede pagar)
    },
  },

  modules: ['@primevue/nuxt-module'],

  // Si el host corre Node, las rutas no pregeneradas se siguen resolviendo por pedido (SSR).
  nitro: {
    prerender: {
      routes: [...rutasProducto, '/sitemap.xml', '/robots.txt', '/llms.txt', ...(estatico ? ['/carrito', '/compra/resultado'] : [])],
      failOnError: true,
      ...(estatico ? { autoSubfolderIndex: false } : {}),
    },
  },

  css: [
    '@fontsource-variable/fraunces',
    '@fontsource-variable/dm-sans',
    '~/assets/css/base.css',
  ],

  primevue: {
    options: {
      theme: {
        preset: Mostrador,
        options: {
          // La tienda no tiene modo oscuro: esta clase nunca se aplica.
          darkModeSelector: '.modo-oscuro',
          cssLayer: { name: 'primevue', order: 'theme, base, primevue' },
        },
      },
    },
    components: { include: ['Badge', 'Button', 'Carousel', 'Tag'] },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'es-AR' },
      // Ícono propio, declarado acá para que esté también en 404.html y 200.html (sin él, el navegador pide /favicon.ico).
      link: [{ rel: 'icon', type: 'image/svg+xml', href: `${subcarpeta}/favicon.svg` }],
      title: 'Tu Ferretería',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Herramientas, fijaciones, plomería y pintura para tu obra.' },
      ],
    },
  },
})
