<script setup lang="ts">
defineProps<{ secciones: { id: string; nombre: string }[] }>()

const { tienda } = useAppConfig()
</script>

<template>
  <header class="cabecera">
    <a href="#contenido" class="saltar">Saltar al contenido</a>

    <div class="contenedor cabecera__interior">
      <!-- Sin aria-label: el nombre visible ya es el nombre accesible (WCAG 2.5.3). -->
      <NuxtLink to="/" class="marca">
        <svg class="marca__logo" viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
          <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" fill="currentColor" />
          <circle cx="16" cy="16" r="5.5" fill="#f6f0e4" />
        </svg>
        <span class="marca__nombre">{{ tienda.nombre }}</span>
      </NuxtLink>

      <nav class="menu" aria-label="Secciones de la tienda">
        <ul class="menu__lista">
          <li v-for="s in secciones" :key="s.id">
            <NuxtLink :to="`/#${s.id}`" class="menu__enlace">{{ s.nombre }}</NuxtLink>
          </li>
        </ul>
      </nav>

      <CarritoEnlace class="cabecera__carrito" />
    </div>
  </header>
</template>

<style scoped>
.cabecera {
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--crema);
  border-bottom: 1px solid rgb(34 32 28 / 0.14);
}

.saltar {
  position: absolute;
  left: 1rem;
  top: -4rem;
  padding: 0.6rem 1rem;
  background: var(--verde);
  color: #fffdf8;
  border-radius: 8px;
  z-index: 30;
}

.saltar:focus { top: 0.75rem; }

.cabecera__interior {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.25rem 1.5rem;
  padding-block: 0.7rem;
}

.marca {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: var(--verde);
}

.marca__nombre {
  font-family: var(--font-titulo);
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--tinta);
}

/* Mobile: el menú va en una segunda fila deslizable, sin hamburguesa ni JavaScript. */
/* Mobile: marca y carrito en la fila de arriba; el menú, en una segunda fila. */
.cabecera__carrito { order: 1; margin-left: auto; }
.menu { width: 100%; order: 2; }

.menu__lista {
  display: flex;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0.15rem 0 0.25rem;
  overflow-x: auto;
  scrollbar-width: none;
}

.menu__lista::-webkit-scrollbar { display: none; }

.menu__enlace {
  display: block;
  white-space: nowrap;
  padding: 0.4rem 0.85rem;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  border: 1.5px solid rgb(34 32 28 / 0.2);
  border-radius: 999px;
}

.menu__enlace:hover { border-color: var(--verde); color: var(--verde); }

@media (min-width: 768px) {
  .cabecera__interior { flex-wrap: nowrap; padding-block: 0.9rem; }
  .menu { width: auto; order: 1; margin-left: auto; }
  .cabecera__carrito { order: 2; margin-left: 0; }
  .menu__lista { overflow: visible; gap: 0.25rem; }
  .menu__enlace { border-color: transparent; font-size: 0.95rem; padding: 0.5rem 0.9rem; }
  .menu__enlace:hover { background: var(--kraft); border-color: transparent; color: var(--tinta); }
}
</style>
