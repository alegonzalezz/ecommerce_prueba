// Sirve una carpeta estática como lo hace GitHub Pages (según nuestro entendimiento):
//   /x            -> x.html            (URLs sin extensión)
//   /carpeta/     -> carpeta/index.html
//   /carpeta      -> 301 a /carpeta/   (si es una carpeta)
//   lo demás      -> 404.html con estado 404
// Uso: node scripts/servir-estatico.mjs <carpeta> <subcarpeta-base> <puerto>
//   p. ej. node scripts/servir-estatico.mjs .output/public /ecommerce_prueba 4173
// ATENCIÓN: es una imitación; el comportamiento real se verifica contra el sitio publicado.
import http from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { gzipSync } from 'node:zlib'
import { readFileSync } from 'node:fs'

const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
}
const COMPRIMIBLES = /\.(html|js|mjs|css|json|xml|txt|svg)$/

export function iniciarEstatico({ carpeta, base = '', puerto = 4173 }) {
  const raiz = normalize(carpeta)
  const archivo = (ruta) => { const p = join(raiz, ruta); return p.startsWith(raiz) && existsSync(p) && statSync(p).isFile() ? p : null }
  const esCarpeta = (ruta) => { const p = join(raiz, ruta); return p.startsWith(raiz) && existsSync(p) && statSync(p).isDirectory() }

  const servidor = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://estatico')
    let ruta = decodeURIComponent(url.pathname)
    const enviar = (estado, ruta404) => {
      const p = ruta404
      const ext = extname(p)
      const cabeceras = { 'content-type': TIPOS[ext] ?? 'application/octet-stream' }
      if (COMPRIMIBLES.test(p) && /gzip/.test(req.headers['accept-encoding'] ?? '')) {
        const cuerpo = gzipSync(readFileSync(p))
        res.writeHead(estado, { ...cabeceras, 'content-encoding': 'gzip', 'content-length': cuerpo.length })
        return res.end(cuerpo)
      }
      res.writeHead(estado, cabeceras)
      createReadStream(p).pipe(res)
    }

    if (base && ruta === base) { res.writeHead(301, { location: `${base}/${url.search}` }); return res.end() }
    if (base && !ruta.startsWith(`${base}/`)) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('404 (fuera de la subcarpeta del sitio)') }
    const rel = ruta.slice(base.length) || '/'

    let p = null
    if (rel.endsWith('/')) p = archivo(`${rel}index.html`)
    else if (archivo(rel)) p = archivo(rel)
    else if (esCarpeta(rel)) { res.writeHead(301, { location: `${base}${rel}/${url.search}` }); return res.end() }
    else if (!extname(rel)) p = archivo(`${rel}.html`)

    if (p) return enviar(200, p)
    const nf = archivo('/404.html')
    if (nf) return enviar(404, nf)
    res.writeHead(404, { 'content-type': 'text/plain' })
    res.end('404')
  })

  return new Promise((resolve) => servidor.listen(puerto, '127.0.0.1', () => resolve({
    puerto: servidor.address().port,
    cerrar: () => new Promise((r) => { servidor.closeAllConnections?.(); servidor.close(() => r()) }),
  })))
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const [carpeta = '.output/public', base = '/ecommerce_prueba', puerto = '4173'] = process.argv.slice(2)
  const s = await iniciarEstatico({ carpeta, base: base === '/' ? '' : base, puerto: Number(puerto) })
  console.log(`Sitio estático (imitando GitHub Pages) en http://localhost:${s.puerto}${base === '/' ? '' : base}/`)
}
