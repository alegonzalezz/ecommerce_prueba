// Almacenamiento en el navegador con vencimiento. Funciones puras: reciben el "almacén" y la hora,
// así se prueban con un almacén falso. El navegador no vence solo los datos de localStorage:
// el vencimiento se guarda junto con los datos y se comprueba al leer.

/** Cuánto se recuerda lo guardado, contado desde la última escritura (se renueva en cada cambio). */
export const DURACION_MS = 2 * 60 * 60 * 1000

/** Lo mínimo que usamos de `localStorage` (permite pasar uno falso en los tests). */
export interface Almacen {
  getItem(clave: string): string | null
  setItem(clave: string, valor: string): void
  removeItem(clave: string): void
}

interface Envoltorio {
  version: number
  expiraEn: number
  datos: unknown
}

/** Devuelve `localStorage` si se puede usar; null si no existe, está bloqueado o lanza error (modo privado). */
export function obtenerAlmacen(): Almacen | null {
  try {
    const almacen = globalThis.localStorage
    if (!almacen) return null
    const prueba = '__ecommerce:prueba__'
    almacen.setItem(prueba, '1')
    almacen.removeItem(prueba)
    return almacen
  } catch {
    return null
  }
}

function esEnvoltorio(valor: unknown): valor is Envoltorio {
  if (typeof valor !== 'object' || valor === null) return false
  const v = valor as Record<string, unknown>
  return typeof v.version === 'number' && typeof v.expiraEn === 'number' && Number.isFinite(v.expiraEn) && 'datos' in v
}

export function borrarClave(almacen: Almacen | null, clave: string): void {
  try {
    almacen?.removeItem(clave)
  } catch {
    // sin almacenamiento disponible: no hay nada que borrar
  }
}

/**
 * Lee lo guardado. Devuelve null (y borra la clave) si venció, tiene otra versión,
 * no es JSON válido o no pasa la validación. Leer NO renueva el vencimiento.
 */
export function leerConExpiracion<T>(
  almacen: Almacen | null,
  clave: string,
  version: number,
  ahora: number,
  validar?: (datos: unknown) => datos is T,
): T | null {
  if (!almacen) return null

  let crudo: string | null
  try {
    crudo = almacen.getItem(clave)
  } catch {
    return null
  }
  if (crudo === null) return null

  let envoltorio: unknown
  try {
    envoltorio = JSON.parse(crudo)
  } catch {
    borrarClave(almacen, clave)
    return null
  }

  if (!esEnvoltorio(envoltorio) || envoltorio.version !== version || envoltorio.expiraEn <= ahora) {
    borrarClave(almacen, clave)
    return null
  }
  if (validar && !validar(envoltorio.datos)) {
    borrarClave(almacen, clave)
    return null
  }
  return envoltorio.datos as T
}

/** Guarda con vencimiento = ahora + duración (renueva el plazo). Devuelve false si no se pudo, sin lanzar. */
export function guardarConExpiracion(
  almacen: Almacen | null,
  clave: string,
  version: number,
  datos: unknown,
  ahora: number,
  duracion: number = DURACION_MS,
): boolean {
  if (!almacen) return false
  try {
    const envoltorio: Envoltorio = { version, expiraEn: ahora + duracion, datos }
    almacen.setItem(clave, JSON.stringify(envoltorio))
    return true
  } catch {
    return false
  }
}
