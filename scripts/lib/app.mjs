// Levanta copias de la app construida (`npm run build`) con la configuración que se pida, para las pruebas.
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dormir } from './cdp.mjs'

const raiz = new URL('../..', import.meta.url).pathname
const procesos = []

export function hayBuild() {
  return existsSync(new URL('../../.output/server/index.mjs', import.meta.url))
}

/** Devuelve `{ base, registro }`; `registro.salida` junta todo lo que la app escribió en consola. */
export async function lanzarApp(puerto, env = {}) {
  const registro = { salida: '' }
  const proceso = spawn('node', ['.output/server/index.mjs'], {
    cwd: raiz,
    env: { ...process.env, NODE_ENV: 'production', NITRO_PORT: String(puerto), NUXT_PUBLIC_SITE_URL: `http://localhost:${puerto}`, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  proceso.stdout.on('data', (d) => { registro.salida += d })
  proceso.stderr.on('data', (d) => { registro.salida += d })
  procesos.push(proceso)
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`http://localhost:${puerto}/`)).ok) break } catch {}
    await dormir(250)
  }
  return { base: `http://localhost:${puerto}`, registro, proceso }
}

export function detenerApps() {
  for (const p of procesos) p.kill()
}
