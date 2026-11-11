<script setup lang="ts">
const { tienda } = useAppConfig()
const carrito = useCarrito()

// El carrito es personal: no se indexa (y no está en el sitemap ni en llms.txt).
useSeoMeta({ title: `Tu carrito | ${tienda.nombre}`, robots: 'noindex, nofollow' })

const unidadesTexto = (n: number) => `${n} ${n === 1 ? 'unidad' : 'unidades'}`

// Mientras se use el sandbox (C-03) se avisa que no se cobra dinero real.
const modoPrueba = useRuntimeConfig().public.modoPrueba

// Pago con Mercado Pago: el servidor recalcula todo desde el catálogo; acá solo mandamos ids y cantidades.
const pagando = ref(false)
const errorPago = ref('')

async function finalizarCompra() {
  if (pagando.value || carrito.lineas.value.length === 0) return
  pagando.value = true
  errorPago.value = ''
  try {
    const { url } = await $fetch<{ url: string }>('/api/checkout', {
      method: 'POST',
      body: { lineas: carrito.lineas.value.map((l) => ({ id: l.producto.id, cantidad: l.cantidad })) },
    })
    // Seguimos en "pagando" mientras el navegador cambia de página (evita un segundo clic).
    window.location.href = url
  } catch (e) {
    const datos = (e as { data?: { error?: string } }).data
    errorPago.value = datos?.error ?? 'No pudimos iniciar el pago. Probá de nuevo en unos minutos.'
    pagando.value = false
  }
}

// Si se vuelve con "atrás" desde Mercado Pago, la página puede restaurarse con el botón bloqueado.
onMounted(() => {
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) pagando.value = false
  })
})
</script>

<template>
  <section class="carrito contenedor" aria-labelledby="titulo-carrito">
    <h1 id="titulo-carrito" class="carrito__titulo">Tu carrito</h1>
    <p v-if="modoPrueba" class="modo-prueba" role="note">Modo de prueba: no se cobra dinero real.</p>

    <!-- Hasta leer lo guardado no sabemos si está vacío: no mostramos "vacío" por error. -->
    <p v-if="!carrito.cargado.value" class="carrito__cargando" role="status">Cargando tu carrito…</p>

    <template v-else>
      <div v-if="carrito.avisos.value.length" class="carrito__avisos" role="status">
        <p v-for="aviso in carrito.avisos.value" :key="aviso">{{ aviso }}</p>
      </div>

      <div v-if="carrito.lineas.value.length === 0" class="carrito__vacio">
        <p class="carrito__vacio-titulo">Tu carrito está vacío</p>
        <p>Cuando agregues productos, los vas a ver acá.</p>
        <NuxtLink to="/#mas-vendido" class="carrito__seguir">
          <Button label="Seguir mirando" tabindex="-1" />
        </NuxtLink>
      </div>

      <div v-else class="carrito__grid">
        <ul class="carrito__lista">
          <li v-for="linea in carrito.lineas.value" :key="linea.producto.id" class="linea">
            <img
              class="linea__imagen"
              :src="linea.producto.imagenes.card.src"
              alt=""
              width="96"
              height="96"
              loading="lazy"
              decoding="async"
            />

            <div class="linea__datos">
              <NuxtLink :to="`/producto/${linea.producto.slug}`" class="linea__nombre">{{ linea.producto.nombre }}</NuxtLink>
              <p class="linea__precio">{{ formatPrecio(linea.producto.precio) }} c/u</p>

              <div class="linea__acciones">
                <div class="cantidad" role="group" :aria-label="`Cantidad de ${linea.producto.nombre}`">
                  <Button
                    class="cantidad__boton"
                    text
                    rounded
                    :aria-label="`Quitar una unidad de ${linea.producto.nombre}`"
                    @click="carrito.cambiar(linea.producto.id, linea.cantidad - 1)"
                  >−</Button>
                  <output class="cantidad__valor" :aria-label="`${unidadesTexto(linea.cantidad)}`">{{ linea.cantidad }}</output>
                  <Button
                    class="cantidad__boton"
                    text
                    rounded
                    :disabled="linea.cantidad >= linea.maximo"
                    :aria-label="`Agregar una unidad de ${linea.producto.nombre}`"
                    @click="carrito.cambiar(linea.producto.id, linea.cantidad + 1)"
                  >+</Button>
                </div>
                <button type="button" class="linea__quitar" @click="carrito.quitarProducto(linea.producto.id)">
                  Quitar<span class="solo-lectores"> {{ linea.producto.nombre }}</span>
                </button>
              </div>
              <p v-if="linea.cantidad >= linea.maximo" class="linea__maximo">Es el máximo disponible.</p>
            </div>

            <p class="linea__subtotal">{{ formatPrecio(linea.subtotal) }}</p>
          </li>
        </ul>

        <aside class="resumen" aria-labelledby="titulo-resumen">
          <h2 id="titulo-resumen" class="resumen__titulo">Resumen</h2>
          <dl class="resumen__datos">
            <div><dt>Productos</dt><dd>{{ unidadesTexto(carrito.unidades.value) }}</dd></div>
            <div class="resumen__total"><dt>Subtotal</dt><dd>{{ formatPrecio(carrito.subtotal.value) }}</dd></div>
          </dl>
          <p class="resumen__nota">El total final se confirma al pagar.</p>

          <Button
            class="resumen__comprar"
            :label="pagando ? 'Redirigiendo a Mercado Pago…' : 'Finalizar compra'"
            :disabled="pagando || carrito.lineas.value.length === 0"
            @click="finalizarCompra"
          />
          <!-- role=alert: el lector de pantalla anuncia el error apenas aparece. -->
          <p v-if="errorPago" class="resumen__error" role="alert">{{ errorPago }}</p>
          <p class="resumen__aviso">Pagás de forma segura en Mercado Pago.</p>

          <button type="button" class="resumen__vaciar" @click="carrito.vaciar()">Vaciar carrito</button>
          <p class="resumen__guardado">Tu carrito se guarda en este navegador por 2 horas desde el último cambio.</p>
        </aside>
      </div>
    </template>
  </section>
</template>

<style scoped>
/* Alto mínimo: al reemplazar "Cargando…" por el contenido, el pie de página no salta (CLS). */
.carrito { padding-block: 1.5rem clamp(2.5rem, 6vw, 4rem); min-height: 70vh; }
.carrito__titulo { font-size: clamp(2rem, 5vw, 3rem); margin-bottom: 1.5rem; }
.carrito__cargando { color: var(--tinta-suave); }

.modo-prueba {
  display: inline-block;
  margin: -0.75rem 0 1.25rem;
  padding: 0.35rem 0.8rem;
  background: var(--kraft);
  border: 1.5px dashed var(--ladrillo);
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 700;
}

.carrito__avisos {
  margin-bottom: 1.25rem;
  padding: 0.9rem 1.1rem;
  background: var(--kraft);
  border-left: 4px solid var(--ladrillo);
  border-radius: 0 var(--radio-card) var(--radio-card) 0;
}
.carrito__avisos p { margin: 0; }
.carrito__avisos p + p { margin-top: 0.4rem; }

.carrito__vacio { max-width: 28rem; }
.carrito__vacio-titulo { font-family: var(--font-titulo); font-size: 1.6rem; font-weight: 650; margin: 0 0 0.4rem; }
.carrito__seguir { display: inline-block; margin-top: 1rem; text-decoration: none; }

.carrito__grid { display: grid; gap: 2rem; align-items: start; }

.carrito__lista { list-style: none; margin: 0; padding: 0; border-top: 1px solid rgb(34 32 28 / 0.16); }

.linea {
  position: relative;
  display: grid;
  grid-template-columns: 5rem 1fr;
  gap: 0.25rem 1rem;
  padding: 1.1rem 0;
  border-bottom: 1px solid rgb(34 32 28 / 0.16);
}

.linea__imagen {
  width: 5rem;
  height: 5rem;
  grid-row: 1 / span 2;
  border: 1.5px solid rgb(34 32 28 / 0.2);
  border-radius: 10px;
  background: var(--kraft);
  object-fit: cover;
}

.linea__nombre { font-weight: 600; font-size: 1.05rem; text-decoration: none; }
.linea__nombre:hover { color: var(--verde); text-decoration: underline; text-underline-offset: 3px; }
.linea__precio { margin: 0.15rem 0 0; color: var(--tinta-suave); font-size: 0.92rem; }

.linea__acciones { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 1rem; margin-top: 0.7rem; }

.cantidad {
  display: inline-flex;
  align-items: center;
  border: 1.5px solid rgb(34 32 28 / 0.25);
  border-radius: 999px;
}
.cantidad__boton { width: 2.5rem; height: 2.5rem; padding: 0; justify-content: center; font-size: 1.25rem; }
.cantidad__valor { min-width: 2rem; text-align: center; font-weight: 700; font-variant-numeric: tabular-nums; }

.linea__quitar {
  padding: 0.4rem 0;
  border: 0;
  background: none;
  font: inherit;
  color: var(--tinta-suave);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}
.linea__quitar:hover { color: var(--ladrillo); }

.linea__maximo { margin: 0.4rem 0 0; font-size: 0.85rem; color: var(--tinta-suave); }

.linea__subtotal {
  grid-column: 2;
  margin: 0.5rem 0 0;
  font-family: var(--font-titulo);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--verde);
}

.resumen {
  padding: 1.4rem;
  background: #fffdf8;
  border: 1.5px solid rgb(34 32 28 / 0.2);
  border-radius: var(--radio-card);
}
.resumen__titulo { font-size: 1.4rem; margin-bottom: 1rem; }
.resumen__datos { margin: 0; display: grid; gap: 0.5rem; }
.resumen__datos div { display: flex; justify-content: space-between; gap: 1rem; }
.resumen__datos dt { color: var(--tinta-suave); }
.resumen__datos dd { margin: 0; font-weight: 600; }
.resumen__total { padding-top: 0.75rem; border-top: 1px solid rgb(34 32 28 / 0.16); }
.resumen__total dt { color: var(--tinta); font-weight: 600; }
.resumen__total dd { font-family: var(--font-titulo); font-size: 1.6rem; font-weight: 700; color: var(--verde); }
.resumen__nota { margin: 0.6rem 0 1.1rem; font-size: 0.88rem; color: var(--tinta-suave); }
.resumen__comprar { width: 100%; justify-content: center; }
.resumen__aviso { margin: 0.6rem 0 0; font-weight: 600; text-align: center; }
.resumen__error { margin: 0.75rem 0 0; padding: 0.7rem 0.9rem; background: #fbe9e4; border-left: 4px solid var(--ladrillo); border-radius: 0 10px 10px 0; font-weight: 600; }

.resumen__vaciar {
  display: block;
  margin: 1.1rem auto 0;
  border: 0;
  background: none;
  font: inherit;
  color: var(--tinta-suave);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}
.resumen__vaciar:hover { color: var(--ladrillo); }
.resumen__guardado { margin: 1rem 0 0; font-size: 0.82rem; color: var(--tinta-suave); text-align: center; }

@media (min-width: 900px) {
  .carrito__grid { grid-template-columns: 1fr 22rem; gap: 3rem; }
  .resumen { position: sticky; top: 6.5rem; }
  .linea { grid-template-columns: 6rem 1fr auto; align-items: start; }
  .linea__imagen { width: 6rem; height: 6rem; grid-row: 1; }
  .linea__subtotal { grid-column: 3; margin: 0; }
}
</style>
