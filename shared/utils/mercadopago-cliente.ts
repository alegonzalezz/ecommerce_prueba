// Cliente mínimo de la Orders API de Mercado Pago, con `fetch` (sin SDK).
// Recibe la configuración como parámetro, así se prueba contra el simulado.
import { API_URL_DEFECTO } from './mercadopago.ts'

export interface ConfigMercadoPago {
  accessToken: string
  apiUrl?: string
  timeoutMs?: number
  fetch?: typeof fetch
}

export type TipoError = 'sin-configurar' | 'no-autorizado' | 'no-encontrada' | 'respuesta' | 'red'

/** Error de la integración. Nunca incluye el token ni los encabezados. `detalle` es solo para el registro del servidor. */
export class ErrorMercadoPago extends Error {
  tipo: TipoError
  estado: number | null
  detalle: string

  constructor(tipo: TipoError, mensaje: string, estado: number | null = null, detalle = '') {
    super(mensaje)
    this.name = 'ErrorMercadoPago'
    this.tipo = tipo
    this.estado = estado
    this.detalle = detalle
  }
}

export interface OrdenCreada {
  id: string
  checkout_url: string
  [campo: string]: unknown
}

export function estaConfigurado(config: Pick<ConfigMercadoPago, 'accessToken'>): boolean {
  return typeof config.accessToken === 'string' && config.accessToken.trim().length > 0
}

async function pedir(config: ConfigMercadoPago, metodo: 'GET' | 'POST', ruta: string, opciones: { cuerpo?: unknown; idempotencia?: string } = {}) {
  if (!estaConfigurado(config)) throw new ErrorMercadoPago('sin-configurar', 'Mercado Pago no está configurado.')
  const base = (config.apiUrl || API_URL_DEFECTO).replace(/\/+$/, '')
  const cabeceras: Record<string, string> = {
    accept: 'application/json',
    Authorization: `Bearer ${config.accessToken.trim()}`,
  }
  if (opciones.cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json'
  if (opciones.idempotencia) cabeceras['X-Idempotency-Key'] = opciones.idempotencia

  let respuesta: Response
  try {
    respuesta = await (config.fetch ?? fetch)(`${base}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: opciones.cuerpo !== undefined ? JSON.stringify(opciones.cuerpo) : undefined,
      signal: AbortSignal.timeout(config.timeoutMs ?? 15000),
    })
  } catch (e) {
    const motivo = e instanceof Error ? e.name : 'error'
    throw new ErrorMercadoPago('red', 'No pudimos comunicarnos con Mercado Pago.', null, motivo)
  }

  const texto = await respuesta.text()
  let datos: unknown = null
  try {
    datos = texto ? JSON.parse(texto) : null
  } catch {
    datos = null
  }

  if (!respuesta.ok) {
    const detalle = texto.slice(0, 300)
    if (respuesta.status === 401 || respuesta.status === 403) throw new ErrorMercadoPago('no-autorizado', 'Mercado Pago rechazó las credenciales.', respuesta.status, detalle)
    if (respuesta.status === 404) throw new ErrorMercadoPago('no-encontrada', 'Mercado Pago no encontró la orden.', 404, detalle)
    throw new ErrorMercadoPago('respuesta', 'Mercado Pago respondió con un error.', respuesta.status, detalle)
  }
  return datos
}

/** `POST /v1/orders`. Cada intento lleva su propia clave de idempotencia. */
export async function crearOrden(config: ConfigMercadoPago, cuerpo: unknown, idempotencia: string = globalThis.crypto.randomUUID()): Promise<OrdenCreada> {
  const datos = (await pedir(config, 'POST', '/v1/orders', { cuerpo, idempotencia })) as Record<string, unknown> | null
  if (!datos || typeof datos.id !== 'string' || typeof datos.checkout_url !== 'string') {
    throw new ErrorMercadoPago('respuesta', 'La respuesta de Mercado Pago no tiene el formato esperado.', null, 'falta id o checkout_url')
  }
  return datos as OrdenCreada
}

/** `GET /v1/orders/{id}`. */
export async function obtenerOrden(config: ConfigMercadoPago, id: string): Promise<Record<string, unknown>> {
  const datos = await pedir(config, 'GET', `/v1/orders/${encodeURIComponent(id)}`)
  if (typeof datos !== 'object' || datos === null) throw new ErrorMercadoPago('respuesta', 'La respuesta de Mercado Pago no tiene el formato esperado.', null, 'no es un objeto')
  return datos as Record<string, unknown>
}
