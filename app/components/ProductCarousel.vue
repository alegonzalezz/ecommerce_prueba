<script setup lang="ts">
import type { CarruselResuelto } from '#shared/types/catalogo'

const props = defineProps<{ carrusel: CarruselResuelto; indice: number }>()

const pista = ref<HTMLElement | null>(null)
// En el servidor se asume que desborda y que se puede ir hacia adelante; el cliente corrige al montar.
const desborda = ref(true)
const puedeAnterior = ref(false)
const puedeSiguiente = ref(true)

const numero = computed(() => String(props.indice + 1).padStart(2, '0'))
const idTitulo = computed(() => `titulo-${props.carrusel.id}`)

function actualizar() {
  const el = pista.value
  if (!el) return
  desborda.value = el.scrollWidth > el.clientWidth + 2
  puedeAnterior.value = el.scrollLeft > 2
  puedeSiguiente.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 2
}

function mover(direccion: 1 | -1) {
  const el = pista.value
  if (!el) return
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollBy({ left: direccion * el.clientWidth * 0.85, behavior: reducido ? 'auto' : 'smooth' })
}

function alTeclear(e: KeyboardEvent) {
  if (e.target !== pista.value) return
  if (e.key === 'ArrowRight') { e.preventDefault(); mover(1) }
  if (e.key === 'ArrowLeft') { e.preventDefault(); mover(-1) }
}

let observador: ResizeObserver | undefined

onMounted(() => {
  actualizar()
  observador = new ResizeObserver(actualizar)
  if (pista.value) observador.observe(pista.value)
})

onBeforeUnmount(() => observador?.disconnect())
</script>

<template>
  <section :id="carrusel.id" class="carrusel" :class="{ 'carrusel--alterno': indice % 2 === 1 }" :aria-labelledby="idTitulo">
    <div class="contenedor">
      <header class="carrusel__cabecera">
        <div>
          <p class="carrusel__numero" aria-hidden="true">{{ numero }}</p>
          <h2 :id="idTitulo" class="carrusel__titulo">{{ carrusel.nombre }}</h2>
        </div>

        <div v-show="desborda" class="carrusel__controles">
          <Button
            outlined
            rounded
            class="carrusel__flecha"
            :disabled="!puedeAnterior"
            :aria-label="`Ver productos anteriores de ${carrusel.nombre}`"
            @click="mover(-1)"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
          </Button>
          <Button
            outlined
            rounded
            class="carrusel__flecha"
            :disabled="!puedeSiguiente"
            :aria-label="`Ver más productos de ${carrusel.nombre}`"
            @click="mover(1)"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
          </Button>
        </div>
      </header>

      <ul
        ref="pista"
        class="carrusel__pista"
        tabindex="0"
        :aria-label="`${carrusel.nombre}: ${carrusel.productos.length} productos`"
        @scroll.passive="actualizar"
        @keydown="alTeclear"
      >
        <li v-for="producto in carrusel.productos" :key="producto.id" class="carrusel__item">
          <ProductCard :producto="producto" />
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.carrusel {
  padding-block: clamp(2.5rem, 6vw, 4.5rem);
  scroll-margin-top: 7rem;
}

.carrusel--alterno {
  background-color: var(--kraft);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .35 0 0 0 0 .28 0 0 0 0 .15 0 0 0 .09 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E");
}

.carrusel__cabecera {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.carrusel__numero {
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--ladrillo);
  font-variant-numeric: tabular-nums;
}

.carrusel__numero::after {
  content: '';
  display: inline-block;
  width: 2.5rem;
  height: 2px;
  margin-left: 0.6rem;
  vertical-align: middle;
  background: var(--ladrillo);
}

.carrusel__titulo {
  font-size: clamp(1.75rem, 4.5vw, 2.6rem);
}

/* Flechas: solo en pantallas anchas; en mobile se desliza con el dedo. */
.carrusel__controles { display: none; gap: 0.5rem; }

@media (min-width: 768px) {
  .carrusel__controles { display: flex; }
}

.carrusel__flecha {
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  justify-content: center;
}

.carrusel__pista {
  display: flex;
  gap: 1rem;
  list-style: none;
  margin: 0;
  /* La pista llega hasta el borde de la pantalla para que se vea que hay más cards. */
  margin-inline: calc(var(--gutter) * -1);
  padding: 0.25rem var(--gutter) 0.75rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: var(--gutter);
  overscroll-behavior-x: contain;
  scrollbar-width: none;
}

.carrusel__pista::-webkit-scrollbar { display: none; }

.carrusel__item {
  flex: 0 0 min(72%, 17rem);
  scroll-snap-align: start;
}

@media (min-width: 768px) {
  .carrusel__pista { gap: 1.25rem; }
  .carrusel__item { flex-basis: calc((100% - 3 * 1.25rem) / 4); }
}
</style>
