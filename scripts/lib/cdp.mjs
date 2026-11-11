// Utilidades para manejar un Chrome real por el protocolo de depuración (Chrome DevTools Protocol).
// Las usan las pruebas de navegador (probar-carrito.mjs, probar-pago-navegador.mjs).
// Variable opcional CHROME_PATH si Chrome no está en la ruta de macOS.
import { spawn } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export const dormir = (ms) => new Promise((r) => setTimeout(r, ms))
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

export class Pestana {
  constructor(ws, { base, salida }) { this.ws = ws; this.base = base; this.salida = salida; this.id = 0; this.pend = new Map(); this.consola = [] }

  static async abrir(wsUrl, opciones) {
    const t = new Pestana(new WebSocket(wsUrl), opciones)
    await new Promise((r) => t.ws.addEventListener('open', r, { once: true }))
    t.ws.addEventListener('message', (m) => {
      const msg = JSON.parse(m.data)
      if (msg.id && t.pend.has(msg.id)) { t.pend.get(msg.id)(msg); t.pend.delete(msg.id) }
      else if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type)) t.consola.push(`${msg.params.type}: ${msg.params.args.map((a) => a.value ?? a.description).join(' ')}`)
      else if (msg.method === 'Runtime.exceptionThrown') t.consola.push(`excepción: ${msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text}`)
      else if (msg.method === 'Log.entryAdded' && ['error', 'warning'].includes(msg.params.entry.level)) t.consola.push(`${msg.params.entry.level}: ${msg.params.entry.text} ${msg.params.entry.url ?? ''}`)
    })
    for (const m of ['Page.enable', 'Runtime.enable', 'Log.enable', 'Network.enable']) await t.enviar(m)
    return t
  }

  enviar(method, params = {}) { return new Promise((res) => { const i = ++this.id; this.pend.set(i, res); this.ws.send(JSON.stringify({ id: i, method, params })) }) }

  async ev(expresion) {
    const r = await this.enviar('Runtime.evaluate', { expression: expresion, returnByValue: true, awaitPromise: true })
    if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? 'error al evaluar')
    return r.result.result.value
  }

  async esperar(expresion, ms = 12000) {
    const fin = Date.now() + ms
    while (Date.now() < fin) { try { if (await this.ev(expresion)) return true } catch {} await dormir(150) }
    return false
  }

  /** Va a una ruta de la tienda y espera a que Vue haya montado. */
  async ir(ruta) {
    await this.enviar('Page.navigate', { url: this.base + ruta })
    await dormir(400)
    await this.esperar(`document.readyState === 'complete' && !!document.querySelector('#__nuxt')?.__vue_app__`)
    await dormir(250)
  }

  async dispositivo(width, height, mobile) { await this.enviar('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile }) }

  async captura(archivo, width) {
    const { result } = await this.enviar('Page.getLayoutMetrics')
    const alto = Math.min(Math.ceil(result.cssContentSize.height), 5000)
    const c = await this.enviar('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width, height: alto, scale: 1 }, captureBeyondViewport: true })
    writeFileSync(join(this.salida, archivo), Buffer.from(c.result.data, 'base64'))
  }

  clic(textoBoton) {
    return this.ev(`(() => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith(${JSON.stringify(textoBoton)})); if (!b) return false; b.click(); return true })()`)
  }
}

/** Lanza Chrome sin ventana y devuelve funciones para abrir pestañas. */
export async function lanzarNavegador({ base, salida = mkdtempSync(join(tmpdir(), 'capturas-')), puerto = 9344 }) {
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${puerto}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'cdp-'))}`, 'about:blank'], { stdio: 'ignore' })

  async function wsDePagina(nueva) {
    for (let i = 0; i < 60; i++) {
      try {
        if (nueva) return (await (await fetch(`http://127.0.0.1:${puerto}/json/new?about:blank`, { method: 'PUT' })).json()).webSocketDebuggerUrl
        const lista = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json()
        const p = lista.find((t) => t.type === 'page')
        if (p) return p.webSocketDebuggerUrl
      } catch {}
      await dormir(200)
    }
    throw new Error('Chrome no respondió')
  }

  return {
    salida,
    abrirPestana: async (nueva = false) => Pestana.abrir(await wsDePagina(nueva), { base, salida }),
    cerrar: () => chrome.kill(),
  }
}
