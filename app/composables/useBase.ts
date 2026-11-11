/** Devuelve una función que prefija las rutas de imágenes y archivos con la subcarpeta de publicación. */
export function useBase() {
  const base = useRuntimeConfig().app.baseURL
  return (ruta: string) => conBase(base, ruta)
}
