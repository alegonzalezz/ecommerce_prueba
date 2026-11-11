<script setup lang="ts">
import type { Producto } from '#shared/types/catalogo'

const props = defineProps<{ producto: Producto }>()

const descuento = computed(() => calcularDescuento(props.producto.precio, props.producto.precioAnterior))
const sinStock = computed(() => props.producto.stock === 0)
</script>

<template>
  <article class="card" :class="{ 'card--sin-stock': sinStock }">
    <NuxtLink :to="`/producto/${producto.slug}`" class="card__enlace">
      <div class="card__imagen">
        <!-- alt vacío: el nombre ya está en el texto del enlace, repetirlo duplicaría la lectura. -->
        <img
          :src="producto.imagenes.card.src"
          alt=""
          width="480"
          height="480"
          loading="lazy"
          decoding="async"
        />
        <Tag v-if="descuento" :value="`-${descuento}%`" class="etiqueta etiqueta--descuento" />
        <Tag v-if="sinStock" value="Sin stock" class="etiqueta etiqueta--stock" />
      </div>

      <div class="card__cuerpo">
        <p class="card__marca">{{ producto.marca }}</p>
        <h3 class="card__nombre">{{ producto.nombre }}</h3>
        <p class="card__precios">
          <span class="card__precio">{{ formatPrecio(producto.precio) }}</span>
          <s v-if="descuento && producto.precioAnterior" class="card__anterior">
            <span class="solo-lectores">Antes </span>{{ formatPrecio(producto.precioAnterior) }}
          </s>
        </p>
      </div>
    </NuxtLink>
  </article>
</template>

<style scoped>
.card {
  /* position:relative contiene el texto .solo-lectores (absolute); sin esto escapa del
     carrusel y ensancha toda la página (desborde horizontal). */
  position: relative;
  height: 100%;
  background: #fffdf8;
  border: 1.5px solid rgb(34 32 28 / 0.14);
  border-radius: var(--radio-card);
  overflow: hidden;
  transition: border-color 0.15s ease, transform 0.15s ease;
}

.card:hover,
.card:focus-within {
  border-color: var(--verde);
  transform: translateY(-3px);
}

@media (prefers-reduced-motion: reduce) {
  .card { transition: none; }
  .card:hover, .card:focus-within { transform: none; }
}

.card__enlace {
  display: flex;
  flex-direction: column;
  height: 100%;
  text-decoration: none;
  color: inherit;
}

.card__imagen {
  position: relative;
  aspect-ratio: 1 / 1;
  background: var(--kraft);
}

.card__imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card--sin-stock .card__imagen img {
  filter: grayscale(0.85);
  opacity: 0.7;
}

.etiqueta {
  position: absolute;
  top: 0.65rem;
  left: 0.65rem;
  font-family: var(--font-texto);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  color: #fffdf8;
}

.etiqueta--descuento { background: var(--ladrillo); }
.etiqueta--stock { background: var(--tinta); left: auto; right: 0.65rem; }

.card__cuerpo {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.9rem 1rem 1.1rem;
}

.card__marca {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--tinta-suave);
}

.card__nombre {
  font-family: var(--font-texto);
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.6em;
}

.card__precios {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.2rem 0.6rem;
  margin: 0.35rem 0 0;
}

.card__precio {
  font-family: var(--font-titulo);
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--verde);
}

.card__anterior {
  font-size: 0.85rem;
  color: var(--tinta-suave);
}
</style>
