<script setup lang="ts">
const { carruseles } = useCatalogo()
const secciones = carruseles.map((c) => ({ id: c.id, nombre: c.nombre }))
</script>

<template>
  <div>
    <AppHeader :secciones="secciones" />
    <main id="contenido">
      <slot />
    </main>
    <AppFooter :secciones="secciones" />
  </div>
</template>
