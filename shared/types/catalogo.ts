export interface Imagen {
  src: string
  alt: string
}

export interface Producto {
  id: string
  slug: string
  nombre: string
  descripcionCorta: string
  descripcion: string
  precio: number
  precioAnterior: number | null
  moneda: 'ARS'
  categoria: string
  marca: string
  sku: string
  stock: number
  etiquetas: string[]
  atributos: Record<string, string>
  fechaAlta: string
  activo: boolean
  imagenes: { card: Imagen; mobile: Imagen; desktop: Imagen }
}

export interface Carrusel {
  id: string
  nombre: string
  productos: string[]
}

export interface Catalogo {
  productos: Producto[]
  carruseles: Carrusel[]
}

/** Carrusel con sus productos ya resueltos (solo activos). */
export interface CarruselResuelto {
  id: string
  nombre: string
  productos: Producto[]
}
