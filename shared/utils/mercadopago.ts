// Piezas puras de la integración con Mercado Pago (Checkout Pro vía Orders API).
// Contrato leído de la documentación oficial; ver applications/ecommerce_prueba/integrations.md.
import type { Pedido } from './pedido.ts'
import { urlAbsoluta } from './seo.ts'

export const API_URL_DEFECTO = 'https://api.mercadopago.com'
export const RUTA_RESULTADO = '/compra/resultado'
export const COOKIE_ORDEN = 'ecommerce_orden'

export type EstadoPago = 'aprobado' | 'pendiente' | 'rechazado' | 'cancelado' | 'desconocido'

/** Identificador propio de cada compra (va en `external_reference`). */
export function referenciaNueva(): string {
  return `ec-${globalThis.crypto.randomUUID()}`
}

/** Formato razonable de un id de orden (p. ej. "ORDTST01KS5AJ6HTK2HRQ3XJ3C2JCKP9"); no prueba que exista. */
export function esIdOrdenValido(id: unknown): id is string {
  return typeof id === 'string' && /^ORD[A-Z0-9]{8,64}$/.test(id)
}

/**
 * Cuerpo de `POST /v1/orders` para Checkout Pro. Las tres URLs de retorno salen de `siteUrl`
 * (configuración del servidor), nunca del pedido ni de los encabezados de la petición.
 */
export function construirOrden(datos: { pedido: Pedido; referencia: string; siteUrl: string; tienda: string }) {
  const retorno = urlAbsoluta(datos.siteUrl, RUTA_RESULTADO)
  return {
    type: 'online',
    processing_mode: 'manual',
    total_amount: datos.pedido.totalAmount,
    external_reference: datos.referencia,
    description: `Compra en ${datos.tienda}`.slice(0, 150),
    items: datos.pedido.items.map(({ title, unit_price, quantity }) => ({ title, unit_price, quantity })),
    config: {
      online: {
        success_url: retorno,
        failure_url: retorno,
        pending_url: retorno,
        // "all": volvemos a la tienda con cualquier resultado; el estado real se consulta a Mercado Pago.
        auto_return: 'all',
      },
    },
  }
}

/**
 * Traduce una orden de Mercado Pago a un estado simple. Solo se declara "aprobado" si la orden está
 * `processed` y, cuando vienen ambos montos, lo pagado cubre el total.
 */
export function interpretarOrden(orden: unknown): { estado: EstadoPago; referencia?: string; total?: string } {
  if (typeof orden !== 'object' || orden === null) return { estado: 'desconocido' }
  const o = orden as Record<string, unknown>
  const referencia = typeof o.external_reference === 'string' ? o.external_reference : undefined
  const total = typeof o.total_amount === 'string' ? o.total_amount : undefined
  const con = (estado: EstadoPago) => ({ estado, referencia, total })

  switch (o.status) {
    case 'processed': {
      const pagado = Number(o.total_paid_amount)
      const debido = Number(o.total_amount)
      const cubre = Number.isNaN(pagado) || Number.isNaN(debido) || o.total_paid_amount === undefined || pagado >= debido
      return con(cubre ? 'aprobado' : 'pendiente')
    }
    case 'created':
    case 'action_required':
    case 'processing':
      return con('pendiente')
    case 'failed':
      return con('rechazado')
    case 'canceled':
    case 'expired':
      return con('cancelado')
    default:
      return con('desconocido')
  }
}

/**
 * ¿Es seguro redirigir a esta URL de pago? Solo https hacia un dominio de Mercado Pago, o, para el
 * simulado de pruebas, el mismo origen que la API configurada.
 */
export function urlDePagoSegura(url: unknown, apiUrl: string = API_URL_DEFECTO): boolean {
  if (typeof url !== 'string') return false
  let u: URL
  try {
    u = new URL(url)
  } catch {
    return false
  }
  if (u.username || u.password) return false
  if (u.protocol === 'https:' && /(^|\.)mercadopago\.[a-z]+(\.[a-z]+)?$/.test(u.hostname)) return true
  try {
    const api = new URL(apiUrl)
    return api.hostname !== new URL(API_URL_DEFECTO).hostname && u.origin === api.origin
  } catch {
    return false
  }
}
