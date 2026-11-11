<script setup lang="ts">
defineProps<{ secciones: { id: string; nombre: string }[] }>()

const { tienda } = useAppConfig()
</script>

<template>
  <footer class="pie">
    <div class="contenedor pie__interior">
      <div class="pie__marca">
        <p class="pie__nombre">{{ tienda.nombre }}</p>
        <p class="pie__eslogan">{{ tienda.eslogan }}</p>
      </div>

      <nav aria-label="Secciones al pie">
        <p class="pie__titulo">Comprar</p>
        <ul class="pie__lista">
          <li v-for="s in secciones" :key="s.id"><NuxtLink :to="`/#${s.id}`">{{ s.nombre }}</NuxtLink></li>
        </ul>
      </nav>
    </div>

    <p class="contenedor pie__legal">Sitio en construcción · Precios en pesos argentinos (ARS).</p>
  </footer>
</template>

<style scoped>
.pie {
  margin-top: clamp(2.5rem, 6vw, 4.5rem);
  padding-block: clamp(2rem, 5vw, 3.5rem) 1.5rem;
  background: var(--verde);
  color: var(--crema);
}

.pie__interior {
  display: grid;
  gap: 2rem;
}

.pie__nombre {
  margin: 0;
  font-family: var(--font-titulo);
  font-size: 1.6rem;
  font-weight: 700;
}

.pie__eslogan { margin: 0.4rem 0 0; opacity: 0.8; max-width: 22rem; }

.pie__titulo {
  margin: 0 0 0.6rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.7;
}

.pie__lista { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.4rem; }
.pie__lista a { text-decoration: none; }
.pie__lista a:hover { text-decoration: underline; text-underline-offset: 4px; }

.pie__legal {
  margin-top: 2rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgb(246 240 228 / 0.25);
  font-size: 0.85rem;
  opacity: 0.75;
}

@media (min-width: 768px) {
  .pie__interior { grid-template-columns: 1fr auto; gap: 4rem; }
}
</style>
