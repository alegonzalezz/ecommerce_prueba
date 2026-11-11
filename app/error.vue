<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const noEncontrado = computed(() => props.error.statusCode === 404)
const titulo = computed(() => (noEncontrado.value ? 'No encontramos esa página' : 'Algo salió mal'))
const mensaje = computed(() =>
  noEncontrado.value
    ? 'Puede que el producto ya no esté disponible o que el enlace tenga un error. Volvé al inicio y seguí mirando.'
    : 'Tuvimos un problema para mostrar esta página. Probá de nuevo en unos minutos.',
)

useSeoMeta({ title: titulo, robots: 'noindex, nofollow' })
</script>

<template>
  <NuxtLayout>
    <section class="error contenedor" aria-labelledby="titulo-error">
      <p class="error__codigo" aria-hidden="true">{{ error.statusCode }}</p>
      <h1 id="titulo-error" class="error__titulo">{{ titulo }}</h1>
      <p class="error__mensaje">{{ mensaje }}</p>
      <NuxtLink to="/" class="error__enlace">
        <Button label="Volver al inicio" tabindex="-1" />
      </NuxtLink>
    </section>
  </NuxtLayout>
</template>

<style scoped>
.error { padding-block: clamp(3rem, 10vw, 7rem); max-width: 40rem; }

.error__codigo {
  margin: 0 0 0.5rem;
  font-family: var(--font-titulo);
  font-size: clamp(4rem, 14vw, 7rem);
  font-weight: 700;
  line-height: 1;
  color: var(--ladrillo);
}

.error__titulo { font-size: clamp(1.9rem, 5vw, 2.8rem); }
.error__mensaje { margin: 1rem 0 1.75rem; font-size: 1.1rem; color: var(--tinta-suave); }
.error__enlace { text-decoration: none; }
</style>
