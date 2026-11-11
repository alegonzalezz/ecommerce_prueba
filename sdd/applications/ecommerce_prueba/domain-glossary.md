# Glosario — ecommerce_prueba

| Término | Significado | En el código |
|---|---|---|
| Producto | Artículo de ferretería a la venta | `Producto` en `app/types/catalogo.ts`; `productos[]` en `data/catalogo.json` `[VERIFICADO]` |
| Catálogo | El JSON único con productos y carruseles | `data/catalogo.json` `[VERIFICADO]` |
| Carrusel | Lista nombrada y ordenada de productos que se muestra como fila deslizable | `carruseles[]` (`id`, `nombre`, `productos`) `[VERIFICADO]` |
| Lo más vendido / Lo nuevo / Con descuento | Los 3 carruseles, ids `mas-vendido`, `nuevo`, `con-descuento`; curados a mano | `scripts/validar-catalogo.mjs` (`ORDEN_CARRUSELES`) `[VERIFICADO]` |
| Card | Tarjeta de un producto dentro de un carrusel | `app/components/ProductCard.vue` `[VERIFICADO]` |
| Hero | Banner principal de la landing | `app/components/HeroBanner.vue` `[VERIFICADO]` |
| Slug | Identificador legible para la URL (`/producto/<slug>`) | campo `slug` `[VERIFICADO]` |
| Imagen `card` / `mobile` / `desktop` | Las tres `.webp` de cada producto; hoy solo se muestra `card` | `imagenes` `[VERIFICADO]` |
| Placeholder | Imagen de relleno generada con `sharp` hasta tener fotos reales | `scripts/generar-placeholders.mjs` `[VERIFICADO]` |
| `precioAnterior` | Precio antes del descuento; el porcentaje **no** se guarda, se calcula | `app/utils/calcularDescuento.ts` `[VERIFICADO]` |
| Sin stock | Producto con `stock: 0`: se muestra con etiqueta y atenuado | `app/components/ProductCard.vue` `[VERIFICADO]` |
| Activo | `activo: false` oculta el producto de todos los carruseles | `app/composables/useCatalogo.ts` `[VERIFICADO]` |
| Mostrador | Nombre de la dirección visual (verde bosque, crema, kraft, ladrillo) | `app/theme/mostrador.ts` `[VERIFICADO]` |
| Ficha | Página de un producto en `/producto/<slug>` | `app/pages/producto/[slug].vue` `[VERIFICADO]` |
| Migas de pan | Ruta Inicio › Categoría › Producto | `app/components/BreadcrumbNav.vue` `[VERIFICADO]` |
| Datos estructurados (JSON-LD) | Datos de producto para buscadores y asistentes, en un `<script type="application/ld+json">` | `shared/utils/seo.ts` (`jsonLdProducto`, `jsonLdMigas`, `jsonLdSitio`) `[VERIFICADO]` |
| `SITE_URL` | URL pública del sitio; variable `NUXT_PUBLIC_SITE_URL`, se fija al construir | `nuxt.config.ts`, `.env.example` `[VERIFICADO]` |
| Sitemap | `sitemap.xml` con la home y los productos activos | `server/routes/sitemap.xml.ts` `[VERIFICADO]` |
| `llms.txt` | Resumen de la tienda en texto para asistentes de IA | `server/routes/llms.txt.ts` `[VERIFICADO]` |
| Rastreador de IA | Bot de un asistente (GPTBot, ClaudeBot, PerplexityBot…) que `robots.txt` permite | `RASTREADORES_IA` en `shared/utils/seo.ts` `[VERIFICADO]` |
| Pregenerar (prerender) | Generar el HTML de una página al construir | `nuxt.config.ts` `nitro.prerender` `[VERIFICADO]` |
| Carrito | Productos y cantidades que la persona eligió, guardados en su navegador | `app/composables/useCarrito.ts`, `shared/utils/carrito.ts` `[VERIFICADO]` |
| Línea de carrito | Un producto con su cantidad y subtotal | `LineaCarrito` en `shared/utils/carrito.ts` `[VERIFICADO]` |
| Reconciliar | Cruzar lo guardado con el catálogo actual (precios, stock, productos que ya no existen) | `reconciliar` en `shared/utils/carrito.ts` `[VERIFICADO]` |
| Tope por producto | Máximo que se puede llevar: el menor entre el stock y 10 | `maximoPara` en `shared/utils/carrito.ts` `[VERIFICADO]` |
| Vistos recientemente | Los últimos 8 productos abiertos | `shared/utils/vistos.ts`, `app/composables/useVistos.ts` `[VERIFICADO]` |
| Vencimiento | Hora hasta la que se recuerda lo guardado (2 h, se renueva al escribir) | `DURACION_MS` en `shared/utils/almacenamiento.ts` `[VERIFICADO]` |
| Pedido | Lo que se cobra: ítems y total recalculados desde el catálogo | `armarPedido` en `shared/utils/pedido.ts` `[VERIFICADO]` |
| Orden (de Mercado Pago) | Registro del cobro en Mercado Pago, con `id` y `checkout_url` | `crearOrden` en `shared/utils/mercadopago-cliente.ts` `[VERIFICADO]` |
| Referencia | Identificador propio de cada compra (`ec-…`), que va en `external_reference` | `referenciaNueva` en `shared/utils/mercadopago.ts` `[VERIFICADO]` |
| Checkout Pro | Forma de pagar redirigiendo al sitio de Mercado Pago | `server/api/checkout.post.ts` `[VERIFICADO]` |
| Estado del pago | aprobado, pendiente, rechazado, cancelado o desconocido | `interpretarOrden` en `shared/utils/mercadopago.ts` `[VERIFICADO]` |
| Modo de prueba | Aviso de que se usa el sandbox y no se cobra dinero real | `NUXT_PUBLIC_MODO_PRUEBA`, `app/pages/carrito.vue` `[VERIFICADO]` |
| Simulado | Mercado Pago de mentira para pruebas sin credenciales | `scripts/mercadopago-simulado.mjs` `[VERIFICADO]` |

