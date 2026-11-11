<script setup lang="ts">
defineProps<{ items: { nombre: string; to?: string }[] }>()
</script>

<template>
  <nav class="migas" aria-label="Migas de pan">
    <ol class="migas__lista">
      <li v-for="(item, i) in items" :key="item.nombre">
        <NuxtLink v-if="item.to && i < items.length - 1" :to="item.to">{{ item.nombre }}</NuxtLink>
        <span v-else :aria-current="i === items.length - 1 ? 'page' : undefined">{{ item.nombre }}</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.migas { font-size: 0.88rem; color: var(--tinta-suave); }

.migas__lista {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.6rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

/* Separador al final de cada ítem: si las migas se cortan en dos líneas, no queda uno huérfano al inicio. */
.migas__lista li:not(:last-child)::after {
  content: '›' / '';
  margin-left: 0.6rem;
  opacity: 0.6;
}

.migas a { text-decoration: underline; text-underline-offset: 3px; text-decoration-color: rgb(34 32 28 / 0.3); }
.migas a:hover { color: var(--verde); text-decoration-color: currentColor; }
.migas [aria-current='page'] { color: var(--tinta); font-weight: 600; }
</style>
