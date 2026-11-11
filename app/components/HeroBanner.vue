<script setup lang="ts">
defineProps<{
  primeraSeccion: string
  seccionOfertas: string | null
  categorias: string[]
}>()

const { tienda } = useAppConfig()
</script>

<template>
  <section class="hero" aria-labelledby="titulo-hero">
    <div class="contenedor hero__interior">
      <div class="hero__texto">
        <p class="hero__sobretitulo">Ferretería online</p>
        <h1 id="titulo-hero" class="hero__titulo">{{ tienda.eslogan }}</h1>
        <p class="hero__bajada">
          Herramientas, fijaciones, plomería, pintura y seguridad. Elegí lo que necesitás y compará precios en pesos.
        </p>
        <div class="hero__acciones">
          <a :href="`#${primeraSeccion}`" class="hero__enlace-boton">
            <Button label="Ver lo más vendido" tabindex="-1" />
          </a>
          <a v-if="seccionOfertas" :href="`#${seccionOfertas}`" class="hero__enlace-boton">
            <Button label="Ver ofertas" outlined tabindex="-1" />
          </a>
        </div>
      </div>

      <div class="hero__marco">
        <picture>
          <source media="(min-width: 768px)" srcset="/img/hero-desktop.webp" width="1200" height="1000" />
          <img
            src="/img/hero-mobile.webp"
            alt="Herramientas de ferretería sobre un mostrador"
            width="800"
            height="900"
            fetchpriority="high"
            decoding="async"
          />
        </picture>
      </div>
    </div>

    <ul class="hero__categorias" aria-label="Categorías de productos">
      <li v-for="categoria in categorias" :key="categoria">{{ categoria }}</li>
    </ul>
  </section>
</template>

<style scoped>
.hero { padding-top: clamp(1.75rem, 5vw, 4rem); }

.hero__interior {
  display: grid;
  gap: 2rem;
  align-items: center;
}

.hero__sobretitulo {
  margin: 0 0 0.9rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ladrillo);
}

.hero__titulo {
  font-size: clamp(2.4rem, 8vw, 4.6rem);
  line-height: 1.04;
  text-wrap: balance;
}

.hero__bajada {
  max-width: 34rem;
  margin: 1.1rem 0 0;
  font-size: clamp(1rem, 2.4vw, 1.15rem);
  color: var(--tinta-suave);
}

.hero__acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.75rem;
}

.hero__enlace-boton { text-decoration: none; }

/* Marco con un bloque desplazado detrás: borde duro y esquina suave, sin sombras difusas. */
.hero__marco {
  position: relative;
  margin: 0.5rem 0.9rem 0.9rem 0;
}

.hero__marco::before {
  content: '';
  position: absolute;
  inset: 0;
  transform: translate(0.9rem, 0.9rem);
  background: var(--verde);
  border-radius: var(--radio-card);
}

.hero__marco img {
  position: relative;
  width: 100%;
  height: auto;
  border: 2px solid var(--tinta);
  border-radius: var(--radio-card);
  background: var(--kraft);
}

.hero__categorias {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35rem 1.75rem;
  list-style: none;
  margin: clamp(2rem, 5vw, 3.5rem) 0 0;
  padding: 1rem var(--gutter);
  background: var(--verde);
  color: var(--crema);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

@media (min-width: 768px) {
  .hero__interior {
    grid-template-columns: 1.05fr 0.95fr;
    gap: 3.5rem;
  }

  .hero__marco { margin-right: 1.25rem; margin-bottom: 1.25rem; }
  .hero__marco::before { transform: translate(1.25rem, 1.25rem); }
}
</style>
