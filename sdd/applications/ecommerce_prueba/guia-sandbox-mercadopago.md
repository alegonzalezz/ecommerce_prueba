# Guía: probar Mercado Pago en sandbox

Creada el 2026-11-10 (iniciativa `2026-11-10-mercadopago-sandbox`, fase 4, T01). Hasta tener credenciales, todo se probó contra un **Mercado Pago simulado** escrito a partir de la documentación; esta guía sirve para probar contra el **real**.

## 1. Conseguir las credenciales de prueba
Los nombres del panel pueden variar un poco.
1. Tené una cuenta de Mercado Pago (la normal, gratuita).
2. En el Panel de desarrolladores, en **"Tus integraciones"**, creá una aplicación (de pagos online / Checkout Pro).
3. Dentro de la aplicación, buscá las **credenciales de prueba** y copiá el **Access Token** de prueba. La documentación indica la ruta "Tus integraciones > Datos de la integración > Credenciales de prueba". `[INFERIDO]` búsquedas en la documentación; confirmar en el panel.
4. **No hace falta una cuenta de comprador de prueba**: la documentación de Checkout Pro dice que se compra como invitado, por ejemplo desde una ventana de incógnito. `[VERIFICADO]` página "Realizar compras de prueba" de Checkout Pro.

## 2. Cargarlas (nunca en el repositorio ni en un chat)
1. Copiá `.env.example` a `.env` en `ecommerce_prueba/` (está ignorado por git).
2. Completá `NUXT_MERCADOPAGO_ACCESS_TOKEN=` con el token de **prueba**.
3. Dejá `NUXT_PUBLIC_MODO_PRUEBA=true`.
4. Reiniciá el servidor (`npm run dev`).

## 3. URLs de retorno y `localhost`
La tienda le pide a Mercado Pago volver a `NUXT_PUBLIC_SITE_URL` + `/compra/resultado`. **No sabemos si Mercado Pago acepta `localhost` en esas URLs con Orders** (la documentación de Preferences para Colombia lo desaconseja). Si rechaza la orden:
- usá un túnel (por ejemplo `cloudflared` o `ngrok`) y poné su URL en `NUXT_PUBLIC_SITE_URL`, o
- usá un dominio de prueba.
Anotá lo que pase en la tabla de abajo.

## 4. Recorrer los escenarios
Con un carrito con productos, tocá **"Finalizar compra"**. En el sitio de Mercado Pago pagá con una tarjeta de prueba. La documentación de Argentina indica que **el nombre del titular decide el resultado** `[INFERIDO]` (verificar en la página vigente):

| Resultado buscado | Nombre del titular | Documento |
|---|---|---|
| Aprobado | `APRO` | DNI `12345678` |
| Rechazado (error general) | `OTHE` | DNI `12345678` |
| Pendiente | `CONT` | DNI `12345678` |

Tarjetas citadas por la documentación: Mastercard `5031 7557 3453 0604` y Visa `4509 9535 6623 3704`, CVV `123`, vencimiento `11/30`. `[INFERIDO]` resultados de búsqueda; las fechas pueden cambiar, usá la lista oficial.

## 5. Tabla "esperado vs real" (completar al probar)
| Escenario | Esperado | Real |
|---|---|---|
| Crear la orden (`POST /v1/orders`) con el cuerpo que armamos | 201 con `id` y `checkout_url` | |
| URLs de retorno con `localhost` | Aceptadas | |
| Pago aprobado | Vuelve a `/compra/resultado`; el estado dice "Pago aprobado"; el carrito se vacía | |
| Pago rechazado | "No se pudo completar el pago"; el carrito se conserva | |
| Pago pendiente | "Tu pago está pendiente"; el carrito se conserva | |
| Cancelar y volver | "El pago se canceló o venció" o pendiente | |
| Parámetros que agrega Mercado Pago a la URL de retorno | `status`, `payment_id`, `external_reference` (y quizá `order_id`) | |
| `GET /v1/orders/{id}` | `status` `processed` si se aprobó, con `external_reference` y `total_amount` | |
| Estado de una orden creada y no pagada | `created` (se muestra pendiente) | |
| Formato de los errores (401, 400) | Texto con `message` | |
| La orden aparece en el panel de Mercado Pago | Con la referencia `ec-…` y el total | |
| Dominio de `checkout_url` | `mercadopago.com.ar` (la tienda solo acepta dominios `mercadopago.*`) | |

Si algo difiere: corregir el código y las specs en el mismo trabajo, y anotar la diferencia en `integrations.md`.

## 6. Qué mirar si algo falla
- Registros del servidor: las líneas `[mercadopago] …` explican el tipo de error (`no-autorizado`, `red`, `respuesta`) sin mostrar el token.
- "El pago online todavía no está configurado": falta el token o no se reinició el servidor.
- "No pudimos iniciar el pago": revisar el registro; suele ser el cuerpo de la orden, las URLs de retorno o el token.
