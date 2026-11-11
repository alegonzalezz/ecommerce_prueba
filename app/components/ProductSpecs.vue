<script setup lang="ts">
defineProps<{ titulo: string; filas: { clave: string; valor: string }[] }>()
</script>

<template>
  <table class="specs">
    <caption class="solo-lectores">{{ titulo }}</caption>
    <tbody>
      <tr v-for="fila in filas" :key="fila.clave">
        <th scope="row">{{ fila.clave }}</th>
        <td>{{ fila.valor }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.specs {
  position: relative;
  width: 100%;
  max-width: 40rem;
  border-collapse: collapse;
  font-size: 1rem;
}

.specs th,
.specs td {
  padding: 0.85rem 0;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid rgb(34 32 28 / 0.16);
}

.specs th {
  width: 40%;
  padding-right: 1rem;
  font-weight: 600;
  color: var(--tinta-suave);
}
</style>
