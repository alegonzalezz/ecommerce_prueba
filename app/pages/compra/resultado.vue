<script setup lang="ts">
const { tienda } = useAppConfig()
const route = useRoute()
const carrito = useCarrito()
const { modoPrueba, pagoDisponible } = useRuntimeConfig().public
const aviso = computed(() => (pagoDisponible ? (modoPrueba ? 'Modo de prueba: no se cobra dinero real.' : '') : 'Versión de demostración: el pago online no está disponible.'))

// Página personal y sin contenido propio: no se indexa.
useSeoMeta({ title: `Resultado de tu pago | ${tienda.nombre}`, robots: 'noindex, nofollow' })

type Estado = 'verificando' | 'aprobado' | 'pendiente' | 'rechazado' | 'cancelado' | 'desconocido' | 'sin-compra' | 'error'

const estado = ref<Estado>('verificando')
const referencia = ref('')
const total = ref<number | null>(null)

async function verificar() {
  // Sin servidor (GitHub Pages) no hay a quién consultar: no hay compra para verificar.
  if (!pagoDisponible) {
    estado.value = 'sin-compra'
    return
  }
  estado.value = 'verificando'
  try {
    // El estado NO sale de la URL: se le pregunta a Mercado Pago a través de nuestro servidor.
    const r = await $fetch<{ estado: Exclude<Estado, 'verificando' | 'sin-compra' | 'error'>; referencia: string | null; total: string | null }>(
      '/api/pago/estado',
      { query: { order_id: route.query.order_id, external_reference: route.query.external_reference } },
    )
    referencia.value = r.referencia ?? ''
    total.value = r.total !== null ? Number(r.total) : null
    estado.value = r.estado
    // El carrito se vacía únicamente cuando el pago está aprobado.
    if (r.estado === 'aprobado') carrito.vaciar()
  } catch (e) {
    const codigo = (e as { statusCode?: number; response?: { status?: number } }).statusCode ?? (e as { response?: { status?: number } }).response?.status
    estado.value = codigo === 404 ? 'sin-compra' : 'error'
  }
}

onMounted(verificar)

const textos: Record<Estado, { titulo: string; detalle: string }> = {
  verificando: { titulo: 'Verificando tu pago…', detalle: 'Estamos consultando a Mercado Pago. No cierres esta página.' },
  aprobado: { titulo: '¡Pago aprobado!', detalle: 'Recibimos tu pago. Guardá este número de referencia por cualquier consulta.' },
  pendiente: { titulo: 'Tu pago está pendiente', detalle: 'Todavía no se completó o se está revisando. Tu carrito sigue guardado: podés volver y reintentar.' },
  rechazado: { titulo: 'No se pudo completar el pago', detalle: 'Mercado Pago no aprobó el pago. Tu carrito sigue guardado: podés volver y probar con otro medio de pago.' },
  cancelado: { titulo: 'El pago se canceló o venció', detalle: 'La operación no se completó. Tu carrito sigue guardado: podés volver y reintentar.' },
  desconocido: { titulo: 'No pudimos confirmar el estado', detalle: 'Mercado Pago nos dio un estado que no reconocemos. Tu carrito sigue guardado. Si llegaste a pagar, guardá el comprobante de Mercado Pago.' },
  'sin-compra': { titulo: 'No encontramos una compra para verificar', detalle: 'Si acabás de pagar, abrí esta página desde el mismo navegador donde iniciaste la compra.' },
  error: { titulo: 'No pudimos verificar tu pago', detalle: 'Hubo un problema al consultar a Mercado Pago. Probá de nuevo en unos minutos. No tocamos tu carrito.' },
}
const texto = computed(() => textos[estado.value])
const volverAlCarrito = computed(() => ['pendiente', 'rechazado', 'cancelado', 'desconocido'].includes(estado.value))
</script>

<template>
  <section class="resultado contenedor" aria-labelledby="titulo-resultado">
    <p v-if="aviso" class="modo-prueba" role="note">{{ aviso }}</p>

    <!-- aria-live: el lector de pantalla anuncia el resultado cuando reemplaza a "Verificando…". -->
    <div role="status" aria-live="polite">
      <h1 id="titulo-resultado" class="resultado__titulo" :class="`resultado__titulo--${estado}`">{{ texto.titulo }}</h1>
      <p class="resultado__detalle">{{ texto.detalle }}</p>
    </div>

    <dl v-if="estado === 'aprobado'" class="resultado__datos">
      <div v-if="referencia"><dt>Referencia</dt><dd><code>{{ referencia }}</code></dd></div>
      <div v-if="total !== null"><dt>Total</dt><dd>{{ formatPrecio(total) }}</dd></div>
    </dl>
    <p v-if="estado === 'aprobado'" class="resultado__nota">Por ahora no hay envíos automáticos: la entrega se coordina aparte.</p>

    <div v-if="estado !== 'verificando'" class="resultado__acciones">
      <NuxtLink v-if="volverAlCarrito" to="/carrito" class="resultado__enlace"><Button label="Volver al carrito" tabindex="-1" /></NuxtLink>
      <NuxtLink to="/" class="resultado__enlace"><Button label="Seguir mirando" :outlined="volverAlCarrito" tabindex="-1" /></NuxtLink>
      <Button v-if="estado === 'error'" label="Reintentar" outlined @click="verificar" />
    </div>
  </section>
</template>

<style scoped>
.resultado { max-width: 40rem; padding-block: clamp(2rem, 6vw, 4.5rem); min-height: 60vh; }

.modo-prueba {
  display: inline-block;
  margin: 0 0 1.25rem;
  padding: 0.35rem 0.8rem;
  background: var(--kraft);
  border: 1.5px dashed var(--ladrillo);
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 700;
}

.resultado__titulo { font-size: clamp(2rem, 6vw, 3rem); text-wrap: balance; }
.resultado__titulo--aprobado { color: var(--verde); }
.resultado__titulo--rechazado, .resultado__titulo--cancelado, .resultado__titulo--error { color: var(--ladrillo); }
.resultado__detalle { margin: 1rem 0 0; font-size: 1.1rem; color: var(--tinta-suave); }

.resultado__datos { margin: 1.5rem 0 0; display: grid; gap: 0.75rem; max-width: 28rem; }
.resultado__datos div { display: flex; justify-content: space-between; gap: 1rem; padding-bottom: 0.6rem; border-bottom: 1px solid rgb(34 32 28 / 0.16); }
.resultado__datos dt { color: var(--tinta-suave); }
.resultado__datos dd { margin: 0; font-weight: 700; word-break: break-all; text-align: right; }
.resultado__nota { margin: 1.25rem 0 0; font-size: 0.95rem; color: var(--tinta-suave); }

.resultado__acciones { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 2rem; }
.resultado__enlace { text-decoration: none; }
</style>
