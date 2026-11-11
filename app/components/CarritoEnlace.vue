<script setup lang="ts">
const { unidades } = useCarrito()

const etiqueta = computed(() =>
  unidades.value > 0 ? `Carrito, ${unidades.value} ${unidades.value === 1 ? 'unidad' : 'unidades'}` : 'Carrito',
)
</script>

<template>
  <NuxtLink to="/carrito" class="carrito" :aria-label="etiqueta">
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
      <path d="M2 3h3l2.4 11.2a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.2L21 7H6" />
    </svg>
    <!-- El número va superpuesto: aparecer o cambiar no mueve nada del header. -->
    <Badge v-if="unidades > 0" :value="unidades" class="carrito__cantidad" aria-hidden="true" />
  </NuxtLink>
</template>

<style scoped>
.carrito {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1.5px solid rgb(34 32 28 / 0.2);
  border-radius: 999px;
  color: var(--tinta);
  text-decoration: none;
}

.carrito:hover { border-color: var(--verde); color: var(--verde); }

.carrito__cantidad {
  position: absolute;
  top: -0.35rem;
  right: -0.35rem;
  min-width: 1.35rem;
  height: 1.35rem;
  padding: 0 0.3rem;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.35rem;
  background: var(--ladrillo);
  color: #fffdf8;
  border-radius: 999px;
}
</style>
