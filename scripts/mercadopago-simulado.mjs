// Mercado Pago SIMULADO para probar sin credenciales: npm run mercadopago:simulado
//
// ATENCIÓN: está escrito a partir de la documentación oficial de Checkout Pro vía Orders API
// (ver applications/ecommerce_prueba/integrations.md). Refleja cómo ENTENDEMOS la API,
// no cómo responde de verdad: no reemplaza la prueba con credenciales reales (fase 4).
//
// Qué simula:
//   POST /v1/orders          crea una orden (valida la forma del pedido; 401 si falta o sobra el token)
//   GET  /v1/orders/{id}     consulta una orden (404 si no existe)
//   GET  /checkout/v1/redirect?order_id=...   página de pago de mentira con 4 botones
//   GET  /simular?order_id=...&resultado=...  aplica el resultado y vuelve a la tienda
import http from 'node:http'
import { randomBytes } from 'node:crypto'

const json = (res, estado, cuerpo) => {
  res.writeHead(estado, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(cuerpo))
}

const ESTADOS = {
  aprobado: { status: 'processed', status_detail: 'accredited', retorno: 'success_url', query: 'approved' },
  rechazado: { status: 'failed', status_detail: 'bad_filled_card_data', retorno: 'failure_url', query: 'rejected' },
  pendiente: { status: 'processing', status_detail: 'in_process', retorno: 'pending_url', query: 'pending' },
  cancelado: { status: 'canceled', status_detail: 'canceled', retorno: 'failure_url', query: 'rejected' },
}

/** Valida el cuerpo de POST /v1/orders según la documentación. Devuelve una lista de problemas. */
export function validarCuerpoOrden(c) {
  const e = []
  if (typeof c !== 'object' || c === null) return ['el cuerpo debe ser un objeto JSON']
  if (c.type !== 'online') e.push('type debe ser "online"')
  if (c.processing_mode !== 'manual') e.push('processing_mode debe ser "manual"')
  if (typeof c.total_amount !== 'string' || !/^\d+\.\d{2}$/.test(c.total_amount)) e.push('total_amount debe ser un texto con dos decimales, p. ej. "1000.00"')
  if ('external_reference' in c && typeof c.external_reference !== 'string') e.push('external_reference debe ser texto')
  if ('payer' in c && !(c.payer && typeof c.payer.email === 'string')) e.push('si se envía payer, payer.email es obligatorio')
  if (!Array.isArray(c.items) || c.items.length === 0) e.push('items es obligatorio en este simulado')
  else {
    let suma = 0
    c.items.forEach((it, i) => {
      if (typeof it.title !== 'string' || !it.title) e.push(`items[${i}].title es obligatorio`)
      if (typeof it.unit_price !== 'string' || !/^\d+\.\d{2}$/.test(it.unit_price)) e.push(`items[${i}].unit_price debe ser un texto con dos decimales`)
      if (typeof it.quantity !== 'number' || !Number.isInteger(it.quantity) || it.quantity < 1) e.push(`items[${i}].quantity debe ser un entero positivo`)
      suma += Math.round(Number(it.unit_price) * 100) * it.quantity
    })
    if (typeof c.total_amount === 'string' && Math.round(Number(c.total_amount) * 100) !== suma) e.push('total_amount debe ser igual a la suma de unit_price × quantity')
  }
  const online = c.config?.online
  if (c.config !== undefined && (typeof online !== 'object' || online === null)) e.push('config.online debe ser un objeto')
  for (const campo of ['success_url', 'failure_url', 'pending_url']) {
    if (online && online[campo] !== undefined && !/^https?:\/\//.test(String(online[campo]))) e.push(`config.online.${campo} debe ser una URL`)
  }
  if (online && online.auto_return !== undefined && !['approved', 'all'].includes(online.auto_return)) e.push('config.online.auto_return debe ser "approved" o "all"')
  return e
}

/**
 * Levanta el simulado. `puerto: 0` elige uno libre (para los tests).
 * `incluirOrderId`: si la URL de retorno debe traer `order_id` (la documentación lo lista pero no lo muestra en su ejemplo).
 * `checkoutUrlFalsa`: para probar que la tienda rechaza una URL de pago que no es de Mercado Pago.
 */
export function iniciarSimulado({ puerto = 3400, token = null, incluirOrderId = false, checkoutUrlFalsa = null } = {}) {
  const ordenes = new Map()
  const llamadas = []

  const servidor = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://simulado')
    llamadas.push({ metodo: req.method, ruta: url.pathname })

    // ---- API ----
    if (url.pathname.startsWith('/v1/')) {
      const auth = req.headers.authorization ?? ''
      if (!auth.startsWith('Bearer ') || auth.length < 12 || (token && auth !== `Bearer ${token}`)) {
        return json(res, 401, { message: 'Invalid access token', status: 401 })
      }
    }

    if (req.method === 'POST' && url.pathname === '/v1/orders') {
      if (!req.headers['x-idempotency-key']) return json(res, 400, { message: 'X-Idempotency-Key header is required', status: 400 })
      let cuerpo
      try {
        const partes = []
        for await (const p of req) partes.push(p)
        cuerpo = JSON.parse(Buffer.concat(partes).toString('utf8'))
      } catch {
        return json(res, 400, { message: 'invalid json', status: 400 })
      }
      const problemas = validarCuerpoOrden(cuerpo)
      if (problemas.length) return json(res, 400, { message: 'invalid request', errors: problemas, status: 400 })

      const id = `ORDTST${randomBytes(12).toString('hex').toUpperCase()}`
      const origen = `http://127.0.0.1:${servidor.address().port}`
      const orden = {
        id, type: 'online', processing_mode: 'manual', status: 'created', status_detail: 'created',
        external_reference: cuerpo.external_reference, description: cuerpo.description,
        total_amount: cuerpo.total_amount, total_paid_amount: '0.00',
        checkout_url: checkoutUrlFalsa ?? `${origen}/checkout/v1/redirect?order_id=${id}`,
        country_code: 'ARG', currency: 'ARS', items: cuerpo.items,
        created_date: new Date().toISOString(), last_updated_date: new Date().toISOString(),
        config: cuerpo.config ?? {},
      }
      ordenes.set(id, orden)
      return json(res, 201, orden)
    }

    const m = url.pathname.match(/^\/v1\/orders\/([^/]+)$/)
    if (req.method === 'GET' && m) {
      const orden = ordenes.get(decodeURIComponent(m[1]))
      return orden ? json(res, 200, orden) : json(res, 404, { message: 'Order not found', status: 404 })
    }

    // ---- "Sitio de pago" de mentira ----
    if (req.method === 'GET' && url.pathname === '/checkout/v1/redirect') {
      const id = url.searchParams.get('order_id')
      const orden = ordenes.get(id)
      if (!orden) { res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' }); return res.end('<h1>Orden no encontrada</h1>') }
      const enlace = (r, t) => `<p><a id="${r}" href="/simular?order_id=${id}&resultado=${r}">${t}</a></p>`
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
      return res.end(`<!doctype html><meta charset="utf-8"><title>Mercado Pago (simulado)</title>
<h1>Mercado Pago (simulado)</h1><p>Total: $ ${orden.total_amount}</p>
${enlace('aprobado', 'Pagar con tarjeta APRO (aprobar)')}${enlace('rechazado', 'Pagar con tarjeta OTHE (rechazar)')}${enlace('pendiente', 'Pagar con tarjeta CONT (pendiente)')}${enlace('cancelado', 'Cancelar el pago')}`)
    }

    if (req.method === 'GET' && url.pathname === '/simular') {
      const orden = ordenes.get(url.searchParams.get('order_id'))
      const resultado = ESTADOS[url.searchParams.get('resultado')]
      if (!orden || !resultado) { res.writeHead(400); return res.end('pedido inválido') }
      orden.status = resultado.status
      orden.status_detail = resultado.status_detail
      orden.total_paid_amount = resultado.status === 'processed' ? orden.total_amount : '0.00'
      orden.last_updated_date = new Date().toISOString()
      const destino = new URL(orden.config?.online?.[resultado.retorno] ?? `http://127.0.0.1:3000/compra/resultado`)
      const pagoId = String(Math.floor(Math.random() * 1e10))
      for (const [k, v] of Object.entries({
        collection_id: pagoId, collection_status: resultado.query, payment_id: pagoId, status: resultado.query,
        external_reference: orden.external_reference, payment_type: 'credit_card', merchant_order_id: String(Math.floor(Math.random() * 1e10)),
      })) destino.searchParams.set(k, v)
      if (incluirOrderId) destino.searchParams.set('order_id', orden.id)
      res.writeHead(302, { location: destino.toString() })
      return res.end()
    }

    json(res, 404, { message: 'not found' })
  })

  return new Promise((resolve) => {
    servidor.listen(puerto, '127.0.0.1', () => {
      const p = servidor.address().port
      resolve({
        url: `http://127.0.0.1:${p}`, puerto: p, ordenes, llamadas,
        cerrar: () => new Promise((r) => { servidor.closeAllConnections?.(); servidor.close(() => r()) }),
      })
    })
  })
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const sim = await iniciarSimulado({ puerto: Number(process.env.PUERTO ?? 3400), incluirOrderId: process.env.CON_ORDER_ID === '1' })
  console.log(`Mercado Pago SIMULADO escuchando en ${sim.url}`)
  console.log('Para usarlo: NUXT_MERCADOPAGO_ACCESS_TOKEN=TEST-simulado NUXT_MERCADOPAGO_API_URL=' + sim.url)
}
