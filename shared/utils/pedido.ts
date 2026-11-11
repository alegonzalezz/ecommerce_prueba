// Arma el pedido que se cobra A PARTIR DEL CATÁLOGO. Del navegador solo se aceptan ids y cantidades:
// nombres, precios y totales que mande el navegador se ignoran (se podrían manipular).
import type { Catalogo } from '../types/catalogo'
import { CANTIDAD_MAXIMA, maximoPara } from './carrito.ts'
import type { LineaGuardada } from './carrito.ts'

export const MAXIMO_LINEAS = 50

export interface ItemPedido {
  id: string
  title: string
  /** Texto con dos decimales, como lo pide Mercado Pago: "89900.00". */
  unit_price: string
  quantity: number
}

export interface Pedido {
  items: ItemPedido[]
  /** Suma exacta de precio × cantidad, con dos decimales: "179800.00". */
  totalAmount: string
  total: number
  unidades: number
}

export type ResultadoValidacion = { ok: true; lineas: LineaGuardada[] } | { ok: false; error: string }
export type ResultadoPedido = { ok: true; pedido: Pedido } | { ok: false; error: string }

const fallo = (error: string): { ok: false; error: string } => ({ ok: false, error })

/** Valida la FORMA del cuerpo recibido: `{ lineas: [{ id, cantidad }] }`. Ignora cualquier otro campo. */
export function validarPedido(cuerpo: unknown): ResultadoValidacion {
  if (typeof cuerpo !== 'object' || cuerpo === null) return fallo('El pedido no tiene el formato esperado.')
  const lineas = (cuerpo as { lineas?: unknown }).lineas
  if (!Array.isArray(lineas) || lineas.length === 0) return fallo('Tu carrito está vacío.')
  if (lineas.length > MAXIMO_LINEAS) return fallo('El pedido tiene demasiados productos.')

  const limpias: LineaGuardada[] = []
  const vistos = new Set<string>()
  for (const l of lineas) {
    if (typeof l !== 'object' || l === null) return fallo('El pedido no tiene el formato esperado.')
    const { id, cantidad } = l as { id?: unknown; cantidad?: unknown }
    if (typeof id !== 'string' || !/^[a-z0-9-]{1,64}$/.test(id)) return fallo('El pedido tiene un producto inválido.')
    if (typeof cantidad !== 'number' || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > CANTIDAD_MAXIMA) {
      return fallo('El pedido tiene una cantidad inválida.')
    }
    if (vistos.has(id)) return fallo('El pedido repite un producto.')
    vistos.add(id)
    limpias.push({ id, cantidad })
  }
  return { ok: true, lineas: limpias }
}

/** Cruza las líneas con el catálogo y calcula el total en enteros (sin decimales flotantes). */
export function armarPedido(lineas: LineaGuardada[], catalogo: Catalogo): ResultadoPedido {
  const porId = new Map(catalogo.productos.map((p) => [p.id, p]))
  const items: ItemPedido[] = []
  let total = 0
  let unidades = 0

  for (const { id, cantidad } of lineas) {
    const producto = porId.get(id)
    if (!producto || !producto.activo) return fallo('Un producto de tu carrito ya no está disponible.')
    const maximo = maximoPara(producto)
    if (maximo === 0) return fallo(`${producto.nombre} está sin stock.`)
    if (cantidad > maximo) return fallo(`De ${producto.nombre} solo podés llevar hasta ${maximo}.`)
    if (!Number.isSafeInteger(producto.precio) || producto.precio <= 0) {
      return fallo(`No pudimos calcular el precio de ${producto.nombre}.`)
    }
    items.push({ id, title: producto.nombre.slice(0, 255), unit_price: `${producto.precio}.00`, quantity: cantidad })
    total += producto.precio * cantidad
    unidades += cantidad
  }

  if (items.length === 0) return fallo('Tu carrito está vacío.')
  if (!Number.isSafeInteger(total)) return fallo('El total del pedido es demasiado grande.')
  return { ok: true, pedido: { items, totalAmount: `${total}.00`, total, unidades } }
}
