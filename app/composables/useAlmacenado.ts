import type { Almacen } from '#shared/utils/almacenamiento'

// Claves ya enganchadas a los eventos del navegador (se registran una sola vez por clave).
const escuchando = new Set<string>()

// localStorage se prueba una vez por carga de página; null si está bloqueado (modo privado, etc.).
let almacenado: Almacen | null | undefined
const almacen = (): Almacen | null => (almacenado === undefined ? (almacenado = obtenerAlmacen()) : almacenado)

interface Opciones {
  /** Se llama cada vez que se leen los datos guardados (al montar, al volver a la pestaña, al cambiar en otra). */
  alCargar?: () => void
}

/**
 * Estado compartido que se recuerda en el navegador con vencimiento (ver shared/utils/almacenamiento.ts).
 *
 * - En el servidor y durante la hidratación vale `inicial()`: el HTML no depende de lo guardado.
 * - Recién al montar en el navegador se lee lo guardado (`cargado` pasa a true).
 * - Si no hay almacenamiento, sigue funcionando en memoria durante la sesión.
 */
export function useAlmacenado<T>(
  clave: string,
  version: number,
  inicial: () => T,
  validar: (datos: unknown) => datos is T,
  opciones: Opciones = {},
) {
  const datos = useState<T>(`almacen:${clave}`, inicial)
  const cargado = useState<boolean>(`almacen:${clave}:cargado`, () => false)

  function cargar() {
    const disponible = almacen()
    // Sin almacenamiento no hay nada que releer: se conserva lo que haya en memoria.
    if (disponible) datos.value = leerConExpiracion<T>(disponible, clave, version, Date.now(), validar) ?? inicial()
    cargado.value = true
    opciones.alCargar?.()
  }

  /** Reemplaza los datos y renueva el vencimiento (2 horas desde ahora). */
  function guardar(nuevo: T) {
    datos.value = nuevo
    guardarConExpiracion(almacen(), clave, version, nuevo, Date.now())
  }

  function limpiar() {
    datos.value = inicial()
    borrarClave(almacen(), clave)
  }

  if (import.meta.client) {
    onMounted(() => {
      if (!cargado.value) cargar()
      if (escuchando.has(clave)) return
      escuchando.add(clave)
      // Otra pestaña cambió lo guardado.
      window.addEventListener('storage', (e) => {
        if (e.key === clave || e.key === null) cargar()
      })
      // Volver a una pestaña que estuvo mucho tiempo abierta: descartar lo vencido.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') cargar()
      })
    })
  }

  return { datos, cargado, cargar, guardar, limpiar }
}
