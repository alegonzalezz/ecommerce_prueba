import { readFileSync } from 'node:fs'
import Mostrador from './app/theme/mostrador'

// Páginas de producto que se pregeneran en el build: una por producto activo del catálogo.
const catalogo = JSON.parse(readFileSync(new URL('./data/catalogo.json', import.meta.url), 'utf8'))
const rutasProducto: string[] = catalogo.productos
  .filter((p: { activo: boolean }) => p.activo)
  .map((p: { slug: string }) => `/producto/${p.slug}`)

// SSR activo (C-01). Sin backend propio (C-02): solo el servidor de render de Nuxt.
export default defineNuxtConfig({
  compatibilityDate: '2026-11-10',
  ssr: true,
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
    },
  },

  modules: ['@primevue/nuxt-module'],

  // Si el host corre Node, las rutas no pregeneradas se siguen resolviendo por pedido (SSR).
  nitro: {
    prerender: { routes: [...rutasProducto, '/sitemap.xml', '/robots.txt', '/llms.txt'], failOnError: true },
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
      title: 'Tu Ferretería',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Herramientas, fijaciones, plomería y pintura para tu obra.' },
      ],
    },
  },
})
