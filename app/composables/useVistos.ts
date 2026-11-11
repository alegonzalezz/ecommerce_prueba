export const CLAVE_VISTOS = 'ecommerce:vistos'

/** Productos abiertos hace poco (hasta 8), recordados en el navegador por 2 horas desde el último. */
export function useVistos() {
  const { catalogo } = useCatalogo()
  const almacen = useAlmacenado<string[]>(CLAVE_VISTOS, 1, () => [], validarIds)

  const productos = computed(() => resolverVistos(catalogo, almacen.datos.value))

  function registrar(id: string) {
    // Si todavía no se leyó lo guardado, se lee primero para no pisarlo.
    if (import.meta.client && !almacen.cargado.value) almacen.cargar()
    almacen.guardar(registrarVisto(almacen.datos.value, id))
  }

  return { productos, cargado: almacen.cargado, registrar }
}
