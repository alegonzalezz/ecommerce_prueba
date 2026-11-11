// Valida data/catalogo.json: esquema + reglas cruzadas + imágenes .webp.
// Uso: npm run catalogo:validar
// Sale con código 1 si hay errores. Los avisos no frenan.
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv from 'ajv'
import sharp from 'sharp'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')

// Tamaños esperados y pesos objetivo (KB). Un desvío es aviso, no error:
// no queremos frenar el reemplazo de placeholders por fotos reales.
const ESPERADO = {
  card: { w: 480, h: 480, maxKB: 40 },
  mobile: { w: 800, h: 1000, maxKB: 120 },
  desktop: { w: 1200, h: 900, maxKB: 120 },
}
const ORDEN_CARRUSELES = ['mas-vendido', 'nuevo', 'con-descuento']

export async function validarCatalogo(catalogo, { esquema, raizPublic = join(raiz, 'public') } = {}) {
  const errores = []
  const avisos = []

  esquema ??= JSON.parse(await readFile(join(raiz, 'data', 'catalogo.schema.json'), 'utf8'))
  const validar = new Ajv({ allErrors: true }).compile(esquema)
  if (!validar(catalogo)) {
    for (const e of validar.errors) errores.push(`Esquema: ${e.instancePath || '/'} ${e.message}`)
    return { errores, avisos } // sin estructura válida no tiene sentido seguir
  }

  // ids y slugs únicos
  const ids = new Map()
  const slugs = new Set()
  for (const p of catalogo.productos) {
    if (ids.has(p.id)) errores.push(`Producto: id repetido "${p.id}"`)
    ids.set(p.id, p)
    if (slugs.has(p.slug)) errores.push(`Producto "${p.id}": slug repetido "${p.slug}"`)
    slugs.add(p.slug)
  }

  // carruseles
  const idsCarrusel = new Set()
  for (const c of catalogo.carruseles) {
    if (idsCarrusel.has(c.id)) errores.push(`Carrusel: id repetido "${c.id}"`)
    idsCarrusel.add(c.id)

    const vistos = new Set()
    for (const pid of c.productos) {
      if (!ids.has(pid)) errores.push(`Carrusel "${c.id}": el producto "${pid}" no existe`)
      if (vistos.has(pid)) errores.push(`Carrusel "${c.id}": el producto "${pid}" está repetido`)
      vistos.add(pid)
    }
    if (c.productos.length === 0) avisos.push(`Carrusel "${c.id}": no tiene productos (la landing no lo mostrará)`)

    if (c.id === 'con-descuento') {
      for (const pid of c.productos) {
        const p = ids.get(pid)
        if (p && !(p.precioAnterior !== null && p.precioAnterior > p.precio)) {
          errores.push(`Carrusel "con-descuento": "${pid}" no tiene precioAnterior mayor que precio`)
        }
      }
    }
  }
  const posiciones = ORDEN_CARRUSELES.map((id) => catalogo.carruseles.findIndex((c) => c.id === id))
  ORDEN_CARRUSELES.forEach((id, i) => {
    if (posiciones[i] === -1) errores.push(`Carrusel obligatorio ausente: "${id}"`)
  })
  if (posiciones.every((p) => p !== -1) && !posiciones.every((p, i) => i === 0 || p > posiciones[i - 1])) {
    errores.push(`Carruseles fuera de orden: deben ir ${ORDEN_CARRUSELES.join(' → ')}`)
  }

  // precios coherentes
  for (const p of catalogo.productos) {
    if (p.precioAnterior !== null && p.precioAnterior <= p.precio) {
      avisos.push(`Producto "${p.id}": precioAnterior (${p.precioAnterior}) no es mayor que precio (${p.precio}); no se mostrará como descuento`)
    }
  }

  // imágenes
  for (const p of catalogo.productos) {
    for (const [clave, img] of Object.entries(p.imagenes)) {
      const donde = `Producto "${p.id}" imagen ${clave}`
      if (!img.src.toLowerCase().endsWith('.webp')) {
        errores.push(`${donde}: "${img.src}" no es .webp`)
        continue
      }
      const ruta = join(raizPublic, img.src)
      let buf
      try {
        buf = await readFile(ruta)
      } catch {
        errores.push(`${donde}: no existe el archivo ${img.src}`)
        continue
      }
      let meta
      try {
        meta = await sharp(buf).metadata()
      } catch {
        errores.push(`${donde}: ${img.src} no se pudo leer como imagen`)
        continue
      }
      if (meta.format !== 'webp') {
        errores.push(`${donde}: ${img.src} tiene extensión .webp pero el formato real es ${meta.format}`)
        continue
      }
      const e = ESPERADO[clave]
      if (meta.width !== e.w || meta.height !== e.h) {
        avisos.push(`${donde}: mide ${meta.width}×${meta.height}, se esperaba ${e.w}×${e.h}`)
      }
      const kb = buf.length / 1024
      if (kb > e.maxKB) avisos.push(`${donde}: pesa ${kb.toFixed(1)} KB, el objetivo es ≤ ${e.maxKB} KB`)
    }
  }

  return { errores, avisos }
}

async function main() {
  const catalogo = JSON.parse(await readFile(join(raiz, 'data', 'catalogo.json'), 'utf8'))
  const { errores, avisos } = await validarCatalogo(catalogo)
  for (const a of avisos) console.warn(`AVISO  ${a}`)
  for (const e of errores) console.error(`ERROR  ${e}`)
  if (errores.length) {
    console.error(`\nCatálogo inválido: ${errores.length} error(es), ${avisos.length} aviso(s).`)
    process.exit(1)
  }
  console.log(`Catálogo válido: ${catalogo.productos.length} productos, ${catalogo.carruseles.length} carruseles, ${avisos.length} aviso(s).`)
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  await main()
}
