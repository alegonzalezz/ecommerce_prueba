import type { LineaGuardada } from '#shared/utils/carrito'
import type { Producto } from '#shared/types/catalogo'

export const CLAVE_CARRITO = 'ecommerce:carrito'

/**
 * Carrito de compras recordado en el navegador por 2 horas (se renueva con cada cambio).
 * Se guardan solo ids y cantidades; precios, nombres y stock salen siempre del catálogo.
 */
export function useCarrito() {
  const { catalogo } = useCatalogo()
  const avisos = useState<string[]>('carrito:avisos', () => [])

  const almacen = useAlmacenado<LineaGuardada[]>(CLAVE_CARRITO, 1, () => [], validarLineas, {
    // Cada vez que se lee lo guardado se cruza con el catálogo actual.
    alCargar() {
      const r = reconciliar(almacen.datos.value, catalogo)
      if (r.avisos.length) avisos.value = r.avisos
      if (r.cambio) almacen.guardar(r.guardadas)
    },
  })

  const reconciliado = computed(() => reconciliar(almacen.datos.value, catalogo))
  const lineas = computed(() => reconciliado.value.lineas)
  const unidades = computed(() => totales(lineas.value).unidades)
  const subtotal = computed(() => totales(lineas.value).subtotal)

  /** Si alguien actúa antes de que se lea lo guardado, se lee primero para no pisarlo. */
  function asegurarCargado() {
    if (import.meta.client && !almacen.cargado.value) almacen.cargar()
  }

  function cantidadEnCarrito(id: string): number {
    return cantidadDe(almacen.datos.value, id)
  }

  /** Suma una unidad; devuelve true si se pudo (false si ya está en el máximo). */
  function agregarProducto(producto: Producto): boolean {
    asegurarCargado()
    avisos.value = []
    const antes = cantidadDe(almacen.datos.value, producto.id)
    const nuevas = agregar(almacen.datos.value, producto.id, maximoPara(producto))
    almacen.guardar(nuevas)
    return cantidadDe(nuevas, producto.id) > antes
  }

  function cambiar(id: string, cantidad: number) {
    asegurarCargado()
    avisos.value = []
    const maximo = lineas.value.find((l) => l.producto.id === id)?.maximo ?? 0
    almacen.guardar(cambiarCantidad(almacen.datos.value, id, cantidad, maximo))
  }

  function quitarProducto(id: string) {
    asegurarCargado()
    avisos.value = []
    almacen.guardar(quitar(almacen.datos.value, id))
  }

  function vaciar() {
    avisos.value = []
    almacen.limpiar()
  }

  return {
    lineas, unidades, subtotal, avisos,
    cargado: almacen.cargado,
    cantidadEnCarrito, agregarProducto, cambiar, quitarProducto, vaciar,
  }
}
