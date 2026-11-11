// Limitador simple en memoria: como mucho `maximo` usos por clave dentro de cada ventana.
// Es débil a propósito (se reinicia con el servidor y no se comparte entre instancias):
// alcanza para frenar abusos accidentales en el sandbox. No sustituye a un límite del host.
export function crearLimitador(maximo: number, ventanaMs: number) {
  const registros = new Map<string, { inicio: number; cuenta: number }>()

  return function permitir(clave: string, ahora: number = Date.now()): boolean {
    // Limpieza oportunista para que el mapa no crezca sin fin.
    if (registros.size > 1000) {
      for (const [k, r] of registros) if (ahora - r.inicio >= ventanaMs) registros.delete(k)
    }
    const r = registros.get(clave)
    if (!r || ahora - r.inicio >= ventanaMs) {
      registros.set(clave, { inicio: ahora, cuenta: 1 })
      return true
    }
    if (r.cuenta >= maximo) return false
    r.cuenta += 1
    return true
  }
}
