<script setup lang="ts">
const { tienda } = useAppConfig()
const { carruseles, categorias } = useCatalogo()

// Vistos recientemente: aparece al montar, solo si la persona abrió productos (el servidor no la incluye).
const vistos = useVistos()
const carruselVistos = computed(() => ({ id: 'vistos', nombre: 'Vistos recientemente', productos: vistos.productos.value }))

const primeraSeccion = carruseles[0]?.id ?? 'contenido'
const seccionOfertas = carruseles.find((c) => c.id === 'con-descuento')?.id ?? null

const siteUrl = useRuntimeConfig().public.siteUrl as string
const titulo = `${tienda.nombre} · Ferretería online`
const descripcion = 'Herramientas eléctricas y manuales, fijaciones, plomería, pintura y seguridad. Mirá lo más vendido, lo nuevo y las ofertas.'
const imagenSocial = urlAbsoluta(siteUrl, '/img/hero-desktop.webp')

useSeoMeta({
  title: titulo,
  description: descripcion,
  ogTitle: titulo,
  ogDescription: descripcion,
  ogUrl: urlAbsoluta(siteUrl, '/'),
  ogType: 'website',
  ogImage: imagenSocial,
  ogImageWidth: 1200,
  ogImageHeight: 1000,
  ogLocale: 'es_AR',
  ogSiteName: tienda.nombre,
  twitterCard: 'summary_large_image',
})

useHead({
  link: [
    { rel: 'canonical', href: urlAbsoluta(siteUrl, '/') },
    // Precarga solo la imagen del hero que corresponde al formato.
    { rel: 'preload', as: 'image', href: '/img/hero-mobile.webp', media: '(max-width: 767px)', fetchpriority: 'high' },
    { rel: 'preload', as: 'image', href: '/img/hero-desktop.webp', media: '(min-width: 768px)', fetchpriority: 'high' },
  ],
  script: [{ type: 'application/ld+json', innerHTML: serializarJsonLd(jsonLdSitio(siteUrl, tienda.nombre)) }],
})
</script>

<template>
  <div>
    <HeroBanner :primera-seccion="primeraSeccion" :seccion-ofertas="seccionOfertas" :categorias="categorias" />
    <ProductCarousel v-for="(carrusel, i) in carruseles" :key="carrusel.id" :carrusel="carrusel" :indice="i" />
    <ProductCarousel
      v-if="vistos.cargado.value && vistos.productos.value.length"
      :carrusel="carruselVistos"
      :indice="carruseles.length"
    />
  </div>
</template>
