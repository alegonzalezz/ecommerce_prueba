import catalogo from '../../data/catalogo.json'
import type { Catalogo } from '../../shared/types/catalogo'
import { crearLimitador } from '../../shared/utils/limite'
import { armarPedido, validarPedido } from '../../shared/utils/pedido'
import { COOKIE_ORDEN, construirOrden, referenciaNueva, urlDePagoSegura } from '../../shared/utils/mercadopago'
import { ErrorMercadoPago, crearOrden, estaConfigurado } from '../../shared/utils/mercadopago-cliente'
import { TIENDA } from '../../shared/utils/tienda'

// Como mucho 10 pagos iniciados por minuto desde una misma IP (en memoria; ver shared/utils/limite.ts).
const permitir = crearLimitador(10, 60_000)
const MAX_BYTES = 8 * 1024

/** Respuesta de error con cuerpo propio (no depende de cómo el servidor formatea los errores). */
function fallar(event: Parameters<typeof setResponseStatus>[0], estado: number, error: string) {
  setResponseStatus(event, estado)
  return { error }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const mp = { accessToken: String(config.mercadopago.accessToken ?? ''), apiUrl: String(config.mercadopago.apiUrl ?? '') }

  if (!estaConfigurado(mp)) return fallar(event, 503, 'El pago online todavía no está configurado.')

  // Del navegador solo aceptamos ids y cantidades, y con un tamaño máximo.
  if (Number(getRequestHeader(event, 'content-length') ?? 0) > MAX_BYTES) return fallar(event, 413, 'El pedido es demasiado grande.')
  const crudo = await readRawBody(event, 'utf8')
  if (crudo && crudo.length > MAX_BYTES) return fallar(event, 413, 'El pedido es demasiado grande.')
  let cuerpo: unknown
  try {
    cuerpo = crudo ? JSON.parse(crudo) : null
  } catch {
    return fallar(event, 400, 'El pedido no tiene el formato esperado.')
  }

  const validado = validarPedido(cuerpo)
  if (!validado.ok) return fallar(event, 400, validado.error)

  // El total y los precios salen SIEMPRE del catálogo.
  const armado = armarPedido(validado.lineas, catalogo as Catalogo)
  if (!armado.ok) return fallar(event, 409, armado.error)

  if (!permitir(getRequestIP(event) ?? 'desconocida')) return fallar(event, 429, 'Hiciste muchos intentos seguidos. Esperá un minuto y probá de nuevo.')

  const orden = construirOrden({
    pedido: armado.pedido,
    referencia: referenciaNueva(),
    siteUrl: String(config.public.siteUrl),
    tienda: TIENDA.nombre,
  })

  try {
    const creada = await crearOrden(mp, orden)
    if (!urlDePagoSegura(creada.checkout_url, mp.apiUrl)) {
      console.error('[mercadopago] checkout_url rechazada por no ser de Mercado Pago')
      return fallar(event, 502, 'No pudimos iniciar el pago. Probá de nuevo en unos minutos.')
    }
    // Sin base de datos, el id de la orden se recuerda en el navegador que inició el pago.
    setCookie(event, COOKIE_ORDEN, creada.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24,
    })
    return { url: creada.checkout_url }
  } catch (e) {
    // El detalle va solo al registro del servidor; al navegador, un mensaje genérico.
    if (e instanceof ErrorMercadoPago) console.error(`[mercadopago] crearOrden falló: ${e.tipo} ${e.estado ?? ''} ${e.detalle}`)
    else console.error('[mercadopago] error inesperado al crear la orden')
    return fallar(event, 502, 'No pudimos iniciar el pago. Probá de nuevo en unos minutos.')
  }
})
