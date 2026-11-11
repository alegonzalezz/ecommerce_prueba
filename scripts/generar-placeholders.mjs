// Genera imágenes .webp de relleno (placeholders) para el catálogo.
// Uso: npm run catalogo:placeholders
// Cuando haya fotos reales, se reemplazan los archivos con el mismo nombre y tamaño.
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')

export const TAMANOS = {
  card: { w: 480, h: 480 },
  mobile: { w: 800, h: 1000 },
  desktop: { w: 1200, h: 900 },
}

// Paleta "Mostrador" (ver sdd/.../2026-11-10-base-nuxt-tema/plan.md)
const PALETA = {
  verde: '#1F3D2B', crema: '#F6F0E4', kraft: '#E7DAC0', ladrillo: '#B5432A', tinta: '#22201C',
}
const POR_CATEGORIA = {
  'herramientas-electricas': { fondo: PALETA.verde, texto: PALETA.crema, acento: PALETA.kraft },
  'herramientas-manuales': { fondo: PALETA.ladrillo, texto: PALETA.crema, acento: PALETA.kraft },
  fijaciones: { fondo: PALETA.kraft, texto: PALETA.tinta, acento: PALETA.ladrillo },
  plomeria: { fondo: '#2F5A41', texto: PALETA.crema, acento: PALETA.kraft },
  pintura: { fondo: '#D9C7A3', texto: PALETA.tinta, acento: PALETA.verde },
  seguridad: { fondo: '#7A2E1D', texto: PALETA.crema, acento: PALETA.kraft },
}
const POR_DEFECTO = { fondo: PALETA.kraft, texto: PALETA.tinta, acento: PALETA.verde }

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function envolver(texto, maxCaracteres) {
  const lineas = []
  let actual = ''
  for (const palabra of texto.split(' ')) {
    if ((actual + ' ' + palabra).trim().length > maxCaracteres && actual) {
      lineas.push(actual)
      actual = palabra
    } else {
      actual = (actual + ' ' + palabra).trim()
    }
  }
  if (actual) lineas.push(actual)
  return lineas
}

export function svgPlaceholder({ titulo, etiqueta, w, h, colores }) {
  const lado = Math.min(w, h)
  const fuente = Math.round(lado * 0.075)
  const lineas = envolver(titulo, Math.max(10, Math.floor((w * 0.8) / (fuente * 0.52))))
  const altoBloque = lineas.length * fuente * 1.2
  const y0 = h / 2 - altoBloque / 2 + fuente
  const texto = lineas
    .map((l, i) => `<tspan x="${w / 2}" dy="${i === 0 ? 0 : fuente * 1.2}">${esc(l)}</tspan>`)
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${colores.fondo}"/>
  <circle cx="${w * 0.82}" cy="${h * 0.16}" r="${lado * 0.22}" fill="${colores.acento}" opacity="0.22"/>
  <rect x="${lado * 0.06}" y="${lado * 0.06}" width="${w - lado * 0.12}" height="${h - lado * 0.12}" rx="${lado * 0.04}" fill="none" stroke="${colores.texto}" stroke-opacity="0.35" stroke-width="${Math.max(2, lado * 0.006)}"/>
  <text x="${w / 2}" y="${y0}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${fuente}" font-weight="700" fill="${colores.texto}">${texto}</text>
  <text x="${w / 2}" y="${h - lado * 0.11}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${Math.round(fuente * 0.5)}" letter-spacing="3" fill="${colores.texto}" fill-opacity="0.75">${esc(etiqueta)}</text>
</svg>`
}

export async function escribirWebp(rutaAbsoluta, svg) {
  await mkdir(dirname(rutaAbsoluta), { recursive: true })
  const buf = await sharp(Buffer.from(svg)).webp({ quality: 70, effort: 6 }).toBuffer()
  await writeFile(rutaAbsoluta, buf)
  return buf.length
}

async function main() {
  const catalogo = JSON.parse(await readFile(join(raiz, 'data', 'catalogo.json'), 'utf8'))
  let total = 0
  for (const p of catalogo.productos) {
    const colores = POR_CATEGORIA[p.categoria] ?? POR_DEFECTO
    for (const [clave, { w, h }] of Object.entries(TAMANOS)) {
      const img = p.imagenes[clave]
      const svg = svgPlaceholder({ titulo: p.nombre, etiqueta: `PLACEHOLDER · ${clave.toUpperCase()} ${w}×${h}`, w, h, colores })
      const bytes = await escribirWebp(join(raiz, 'public', img.src), svg)
      total++
      console.log(`${img.src}  ${(bytes / 1024).toFixed(1)} KB`)
    }
  }
  for (const [nombre, { w, h }] of Object.entries(HERO)) {
    const bytes = await escribirWebp(join(raiz, 'public', 'img', `hero-${nombre}.webp`), svgHero({ w, h, etiqueta: `IMAGEN DEL HERO · ${nombre.toUpperCase()} ${w}×${h}` }))
    total++
    console.log(`/img/hero-${nombre}.webp  ${(bytes / 1024).toFixed(1)} KB`)
  }
  console.log(`\n${total} archivos .webp generados.`)
}

// Imágenes del hero: un formato por dispositivo (ver spec de la fase 3).
export const HERO = {
  mobile: { w: 800, h: 900 },
  desktop: { w: 1200, h: 1000 },
}

export function svgHero({ w, h, etiqueta }) {
  const lado = Math.min(w, h)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${PALETA.kraft}"/>
  <circle cx="${w * 0.68}" cy="${h * 0.42}" r="${lado * 0.34}" fill="${PALETA.verde}"/>
  <circle cx="${w * 0.68}" cy="${h * 0.42}" r="${lado * 0.15}" fill="${PALETA.kraft}"/>
  <rect x="${w * 0.14}" y="${h * 0.5}" width="${lado * 0.26}" height="${lado * 0.26}" fill="${PALETA.ladrillo}" transform="rotate(-12 ${w * 0.14 + lado * 0.13} ${h * 0.5 + lado * 0.13})"/>
  <rect x="${w * 0.08}" y="${h * 0.08}" width="${w * 0.84}" height="${h * 0.84}" fill="none" stroke="${PALETA.tinta}" stroke-opacity="0.35" stroke-width="3" rx="${lado * 0.03}"/>
  <text x="${w / 2}" y="${h - lado * 0.06}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${Math.round(lado * 0.035)}" letter-spacing="3" fill="${PALETA.tinta}" fill-opacity="0.75">${esc(etiqueta)}</text>
</svg>`
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  await main()
}
