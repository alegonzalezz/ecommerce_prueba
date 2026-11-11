# Plan: Almacenamiento local con vencimiento

- **Spec:** [spec.md](spec.md)
- **Fecha:** 2026-11-10


## Enfoque
Funciones puras en `shared/utils/almacenamiento.ts` que reciben un "almacén" (`getItem`/`setItem`/`removeItem`) y la hora actual, para probarlas con un almacén falso. Un composable `useAlmacenado` envuelve el estado compartido (`useState`) y un plugin solo-cliente lo carga al montar la app y escucha `storage` y `visibilitychange`. `[PROPUESTA]`

Formato guardado: `{ "version": 1, "expiraEn": <ms>, "datos": ... }`. Claves con prefijo `ecommerce:`.

**Alternativas descartadas:**
- *Cookie con `max-age`:* sirve para que el servidor la lea, pero acá no queremos que el servidor dependa del carrito (SEO y HTML estable) y viaja en cada pedido.
- *`sessionStorage`:* se pierde al cerrar la pestaña; se pidió 2 horas.
- *Librería (`@vueuse/core`, Pinia + plugin):* suma dependencias para ~80 líneas.
- *Leer durante el render:* provoca diferencias entre servidor y navegador (error de hidratación).

## Cambios por capa
- **Producto:** duración de 2 horas, renovada en cada cambio.
- **Front (Nuxt + PrimeVue):** `app/composables/useAlmacenado.ts`; `app/plugins/almacenamiento.client.ts` (carga al montar, `storage`, `visibilitychange`).
- **Compartido (`shared/`):** `shared/utils/almacenamiento.ts` con `DURACION_MS`, `obtenerAlmacen`, `leerConExpiracion`, `guardarConExpiracion`, `borrarClave`.
- **Server routes de Nuxt (Nitro):** Sin cambios.
- **Pagos (Mercado Pago):** Sin cambios.
- **Mails:** Sin cambios.
- **SEO:** Sin cambios (el HTML del servidor no cambia).
- **Data:** Sin cambios en el catálogo.
- **DB:** no aplica a este repo (C-02). No hay migraciones.
- **Infra:** Sin cambios.
- **Observabilidad:** Sin cambios (los errores de almacenamiento se ignoran a propósito).

## Verificación de constraints
| Constraint | ¿Aplica? | Cómo se cumple |
|---|---|---|
| C-01 (SSR) | Sí | La lectura ocurre solo en el navegador, después de montar; el HTML del servidor no cambia. |
| C-02 (sin backend ni DB) | Sí | Todo queda en el navegador; no hay servicios ni base de datos. |
| C-03 (Mercado Pago) | No | Sin pago en esta iniciativa. |
| C-04 (PrimeVue) | No | Sin cambios de UI. |
| C-05 | Sin definir | `<pendiente>`. |

## Testing
- `node:test` con un almacén falso: lectura, vencimiento, renovación solo al escribir, versión distinta, JSON corrupto, validación fallida, almacén nulo, escritura que lanza.
- En el navegador (Chrome DevTools Protocol): recarga, vencimiento adelantado, JSON corrupto, dos pestañas.

## Feature flag
No aplica.

## Rollout
Merge a la rama que se defina (Q-11).

## Rollback
Revertir el commit; lo guardado vence solo.

## Riesgos
- Errores de hidratación si algún componente lee antes de montar. Mitigación: solo el plugin cliente carga, y se mide la consola.
- Modo privado o bloqueo de almacenamiento. Mitigación: respaldo en memoria y pruebas con un almacén que lanza.

## Cambios respecto del plan original (implementación, 2026-11-10)
- **No hay plugin.** `useAlmacenado` carga lo guardado en `onMounted` y registra una sola vez por clave los eventos `storage` y `visibilitychange`; se cargan solos al usarse. Menos piezas que el plugin previsto. `[VERIFICADO]` `app/composables/useAlmacenado.ts`
- Opción `alCargar`: el carrito la usa para cruzar lo guardado con el catálogo cada vez que se lee. `[VERIFICADO]`
- Si no hay almacenamiento, `cargar()` **conserva lo que haya en memoria** (releer lo borraría). Sin esto, volver a la pestaña vaciaba el carrito. `[VERIFICADO]` prueba "Almacenamiento bloqueado".
- El almacén se prueba una sola vez por carga de página (se escribe y borra una clave de prueba). `[VERIFICADO]`

## Resultados de verificación
- `npm test`: 19 tests nuevos de `shared/utils/almacenamiento.ts` (vencimiento exacto, renovación solo al escribir, versión, JSON corrupto, formas inválidas, validación del llamador, almacén nulo, escritura y lectura que lanzan). `[VERIFICADO]`
- En Chrome, sobre el build de producción: persiste tras recargar, vence a las 2 h, se renueva con un cambio y **no** con solo mirar, descarta lo corrupto sin errores de consola, se sincroniza entre pestañas y funciona en memoria con el almacenamiento bloqueado (68 comprobaciones). `[VERIFICADO]` `npm run probar:carrito`
- **Hallazgo:** en desarrollo, `@vue/devtools-kit` lanza `SecurityError` si `localStorage` está bloqueado (no es código nuestro y no existe en producción), por eso esa prueba se corre contra el build. `[VERIFICADO]`
