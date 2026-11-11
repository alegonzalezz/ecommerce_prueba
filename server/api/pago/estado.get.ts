import { crearLimitador } from '../../../shared/utils/limite'
import { COOKIE_ORDEN, esIdOrdenValido, interpretarOrden } from '../../../shared/utils/mercadopago'
import { ErrorMercadoPago, estaConfigurado, obtenerOrden } from '../../../shared/utils/mercadopago-cliente'

// Cada consulta usa nuestro token contra Mercado Pago: se limita por IP (en memoria; ver shared/utils/limite.ts).
const permitir = crearLimitador(60, 60_000)

function fallar(event: Parameters<typeof setResponseStatus>[0], estado: number, error: string) {
  setResponseStatus(event, estado)
  return { error }
}

/**
 * Estado REAL de la compra: se lo pregunta a Mercado Pago. Lo que diga la URL de retorno
 * (`status=approved`, etc.) no cuenta, porque cualquiera la puede escribir a mano.
 * La orden se identifica con la cookie que dejó /api/pago de checkout, o con `order_id` si viene en la URL.
 */
export default defineEventHandler(async (event) => {
  setHeader(event, 'cache-control', 'no-store')
  const config = useRuntimeConfig(event)
  const mp = { accessToken: String(config.mercadopago.accessToken ?? ''), apiUrl: String(config.mercadopago.apiUrl ?? '') }

  if (!estaConfigurado(mp)) return fallar(event, 503, 'El pago online todavía no está configurado.')
  if (!permitir(getRequestIP(event) ?? 'desconocida')) return fallar(event, 429, 'Hiciste muchas consultas seguidas. Esperá un minuto y probá de nuevo.')

  const { order_id: idUrl, external_reference: refUrl } = getQuery(event)
  const idCookie = getCookie(event, COOKIE_ORDEN)
  const id = esIdOrdenValido(idCookie) ? idCookie : esIdOrdenValido(idUrl) ? idUrl : null
  if (!id) return fallar(event, 404, 'No encontramos una compra para verificar.')

  try {
    const orden = await obtenerOrden(mp, id)
    const lectura = interpretarOrden(orden)

    // La referencia de la URL, si viene, debe ser la de la orden consultada (si no, es de otra compra).
    if (typeof refUrl === 'string' && refUrl && lectura.referencia && refUrl !== lectura.referencia) {
      return fallar(event, 404, 'No encontramos una compra para verificar.')
    }
    if (typeof orden.id === 'string' && orden.id !== id) return fallar(event, 404, 'No encontramos una compra para verificar.')

    // Compra aprobada: la cookie ya cumplió su función.
    if (lectura.estado === 'aprobado') deleteCookie(event, COOKIE_ORDEN, { path: '/' })

    return { estado: lectura.estado, referencia: lectura.referencia ?? null, total: lectura.total ?? null }
  } catch (e) {
    if (e instanceof ErrorMercadoPago && e.tipo === 'no-encontrada') return fallar(event, 404, 'No encontramos una compra para verificar.')
    if (e instanceof ErrorMercadoPago) console.error(`[mercadopago] obtenerOrden falló: ${e.tipo} ${e.estado ?? ''} ${e.detalle}`)
    else console.error('[mercadopago] error inesperado al consultar la orden')
    return fallar(event, 502, 'No pudimos verificar el estado de tu pago.')
  }
})
