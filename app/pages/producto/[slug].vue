<script setup lang="ts">
const route = useRoute()
const { tienda } = useAppConfig()
const ruta = useBase()
const pagoDisponible = useRuntimeConfig().public.pagoDisponible
const { buscar } = useCatalogo()

const producto = buscar(String(route.params.slug))

// 404 real: fatal hace que el servidor responda con ese código y muestre app/error.vue.
if (!producto) {
  throw createError({ statusCode: 404, statusMessage: 'Producto no encontrado', fatal: true })
}

const descuento = computed(() => calcularDescuento(producto.precio, producto.precioAnterior))
const sinStock = computed(() => producto.stock === 0)
const categoria = nombreCategoria(producto.categoria)

// Vistos recientemente: se registra al abrir la ficha, ya en el navegador (el servidor no guarda nada).
const vistos = useVistos()
onMounted(() => vistos.registrar(producto.id))

// Carrito: se recuerda en el navegador; en el servidor siempre arranca vacío.
const carrito = useCarrito()
const maximo = maximoPara(producto)
const enCarrito = computed(() => carrito.cantidadEnCarrito(producto.id))
const alMaximo = computed(() => maximo > 0 && enCarrito.value >= maximo)
const mensaje = ref('')
const etiquetaBoton = computed(() => (sinStock.value ? 'Sin stock' : alMaximo.value ? 'Máximo en tu carrito' : 'Agregar al carrito'))

function agregarAlCarrito() {
  mensaje.value = carrito.agregarProducto(producto)
    ? 'Agregado al carrito.'
    : 'Ya tenés el máximo disponible de este producto.'
}

const migas = [
  { nombre: 'Inicio', to: '/' },
  { nombre: categoria },
  { nombre: producto.nombre },
]

const filas = [
  { clave: 'Marca', valor: producto.marca },
  { clave: 'SKU', valor: producto.sku },
  { clave: 'Categoría', valor: categoria },
  ...Object.entries(producto.atributos).map(([clave, valor]) => ({ clave: etiquetaAtributo(clave), valor })),
]

// SEO (spec de la fase 2): todo se calcula en el servidor con funciones puras de shared/utils/seo.ts.
const siteUrl = useRuntimeConfig().public.siteUrl as string
const url = urlProducto(siteUrl, producto)
const titulo = tituloProducto(producto, tienda.nombre)
const descripcion = descripcionMeta(producto)
const imagenSocial = urlAbsoluta(siteUrl, producto.imagenes.desktop.src)

useSeoMeta({
  title: titulo,
  description: descripcion,
  ogTitle: titulo,
  ogDescription: descripcion,
  ogUrl: url,
  ogImage: imagenSocial,
  ogImageAlt: producto.imagenes.desktop.alt,
  ogImageWidth: 1200,
  ogImageHeight: 900,
  ogLocale: 'es_AR',
  ogSiteName: tienda.nombre,
  twitterCard: 'summary_large_image',
  twitterTitle: titulo,
  twitterDescription: descripcion,
  twitterImage: imagenSocial,
})

useHead({
  link: [
    { rel: 'canonical', href: url },
    // Precarga solo la imagen del formato que corresponde.
    { rel: 'preload', as: 'image', href: ruta(producto.imagenes.mobile.src), media: '(max-width: 767px)', fetchpriority: 'high' },
    { rel: 'preload', as: 'image', href: ruta(producto.imagenes.desktop.src), media: '(min-width: 768px)', fetchpriority: 'high' },
  ],
  meta: [
    { property: 'og:type', content: 'product' },
    { property: 'product:price:amount', content: String(producto.precio) },
    { property: 'product:price:currency', content: producto.moneda },
    { property: 'product:availability', content: sinStock.value ? 'out of stock' : 'in stock' },
  ],
  script: [
    { type: 'application/ld+json', innerHTML: serializarJsonLd(jsonLdProducto(producto, siteUrl)) },
    { type: 'application/ld+json', innerHTML: serializarJsonLd(jsonLdMigas(producto, siteUrl)) },
  ],
})
</script>

<template>
  <article v-if="producto" class="ficha contenedor">
    <BreadcrumbNav :items="migas" />

    <div class="ficha__grid">
      <div class="ficha__marco" :class="{ 'ficha__marco--sin-stock': sinStock }">
        <picture>
          <source
            media="(min-width: 768px)"
            :srcset="ruta(producto.imagenes.desktop.src)"
            width="1200"
            height="900"
          />
          <img
            :src="ruta(producto.imagenes.mobile.src)"
            :alt="producto.imagenes.mobile.alt"
            width="800"
            height="1000"
            fetchpriority="high"
            decoding="async"
          />
        </picture>
      </div>

      <div class="ficha__info">
        <p class="ficha__marca">{{ producto.marca }}</p>
        <h1 class="ficha__titulo">{{ producto.nombre }}</h1>
        <p class="ficha__corta">{{ producto.descripcionCorta }}</p>

        <p class="ficha__precios">
          <span class="ficha__precio">{{ formatPrecio(producto.precio) }}</span>
          <s v-if="descuento && producto.precioAnterior" class="ficha__anterior">
            <span class="solo-lectores">Antes </span>{{ formatPrecio(producto.precioAnterior) }}
          </s>
          <Tag v-if="descuento" :value="`-${descuento}%`" class="ficha__descuento" />
        </p>

        <p class="ficha__stock" :class="sinStock ? 'ficha__stock--no' : 'ficha__stock--si'">
          <span class="ficha__punto" aria-hidden="true"></span>
          {{ sinStock ? 'Sin stock' : 'Disponible' }}
        </p>

        <div class="ficha__compra">
          <Button
            class="ficha__agregar"
            :label="etiquetaBoton"
            :disabled="sinStock || alMaximo"
            @click="agregarAlCarrito"
          />
          <!-- La región existe desde el servidor para que el lector de pantalla anuncie el mensaje al aparecer. -->
          <p class="ficha__estado" role="status" aria-live="polite">{{ mensaje }}</p>
          <p v-if="enCarrito > 0" class="ficha__en-carrito">
            Tenés {{ enCarrito }} {{ enCarrito === 1 ? 'unidad' : 'unidades' }} en tu carrito.
            <NuxtLink to="/carrito">Ver carrito</NuxtLink>
          </p>
          <p class="ficha__aviso">
            {{ pagoDisponible ? 'Pagás de forma segura con Mercado Pago.' : 'Versión de demostración: el pago online no está disponible.' }}
          </p>
        </div>
      </div>
    </div>

    <section class="ficha__seccion" aria-labelledby="titulo-descripcion">
      <h2 id="titulo-descripcion">Descripción</h2>
      <p class="ficha__texto">{{ producto.descripcion }}</p>
    </section>

    <section class="ficha__seccion" aria-labelledby="titulo-caracteristicas">
      <h2 id="titulo-caracteristicas">Características</h2>
      <ProductSpecs :titulo="`Características de ${producto.nombre}`" :filas="filas" />
    </section>
  </article>
</template>

<style scoped>
.ficha { padding-block: 1.25rem clamp(2rem, 5vw, 3.5rem); }

.ficha__grid {
  display: grid;
  gap: 2rem;
  margin-top: 1.25rem;
  align-items: start;
}

/* Marco con bloque desplazado detrás: el mismo recurso que el hero. */
.ficha__marco {
  position: relative;
  margin: 0 0.9rem 0.9rem 0;
}

.ficha__marco::before {
  content: '';
  position: absolute;
  inset: 0;
  transform: translate(0.9rem, 0.9rem);
  background: var(--verde);
  border-radius: var(--radio-card);
}

.ficha__marco img {
  position: relative;
  width: 100%;
  height: auto;
  border: 2px solid var(--tinta);
  border-radius: var(--radio-card);
  background: var(--kraft);
}

.ficha__marco--sin-stock img { filter: grayscale(0.85); opacity: 0.7; }

.ficha__marca {
  margin: 0 0 0.6rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ladrillo);
}

.ficha__titulo {
  font-size: clamp(1.9rem, 5vw, 3rem);
  line-height: 1.08;
  text-wrap: balance;
}

.ficha__corta {
  margin: 1rem 0 0;
  font-size: 1.1rem;
  color: var(--tinta-suave);
  max-width: 34rem;
}

.ficha__precios {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.35rem 0.9rem;
  margin: 1.5rem 0 0;
}

.ficha__precio {
  font-family: var(--font-titulo);
  font-size: clamp(2.3rem, 6vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--verde);
}

.ficha__anterior { font-size: 1.1rem; color: var(--tinta-suave); }

.ficha__descuento {
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  background: var(--ladrillo);
  color: #fffdf8;
}

.ficha__stock {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0 0;
  font-weight: 600;
}

.ficha__punto { width: 0.7rem; height: 0.7rem; border-radius: 50%; }
.ficha__stock--si .ficha__punto { background: #2e7d4f; }
.ficha__stock--no .ficha__punto { background: var(--ladrillo); }

.ficha__compra {
  display: grid;
  gap: 0.6rem;
  margin-top: 1.5rem;
  max-width: 24rem;
}

.ficha__agregar { width: 100%; justify-content: center; }
.ficha__estado { min-height: 1.4em; margin: 0; font-weight: 600; color: var(--verde); }
.ficha__en-carrito { margin: 0; }
.ficha__en-carrito a { font-weight: 600; text-underline-offset: 3px; }

.ficha__aviso {
  margin: 0.25rem 0 0;
  padding: 0.9rem 1.1rem;
  background: var(--kraft);
  border-left: 4px solid var(--verde);
  border-radius: 0 var(--radio-card) var(--radio-card) 0;
  font-weight: 600;
}

.ficha__seccion { margin-top: clamp(2rem, 5vw, 3.5rem); }
.ficha__seccion h2 { font-size: clamp(1.4rem, 3.5vw, 1.9rem); margin-bottom: 1rem; }

.ficha__texto {
  max-width: 65ch;
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.75;
}

@media (min-width: 768px) {
  .ficha__grid {
    grid-template-columns: 1.1fr 0.9fr;
    gap: 3.5rem;
  }

  .ficha__marco { margin-right: 1.25rem; margin-bottom: 1.25rem; }
  .ficha__marco::before { transform: translate(1.25rem, 1.25rem); }
  .ficha__info { position: sticky; top: 6.5rem; }
}
</style>
