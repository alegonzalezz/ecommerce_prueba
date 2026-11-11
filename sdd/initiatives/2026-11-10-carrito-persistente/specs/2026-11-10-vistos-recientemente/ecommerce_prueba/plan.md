# Plan: Productos vistos recientemente

- **Spec:** [spec.md](spec.md)
- **Fecha:** 2026-11-10


## Enfoque
Funciones puras en `shared/utils/vistos.ts` (`registrarVisto`, `resolverVistos`, `validarIds`) y `useVistos` sobre `useAlmacenado` (clave `ecommerce:vistos`). La ficha registra al montar. La home agrega, después de los carruseles, un `ProductCarousel` con los vistos; solo se renderiza cuando hay datos y ya se cargó el almacén. `[PROPUESTA]`

**Alternativas descartadas:**
- *Sección arriba de los carruseles:* correría el contenido al aparecer; abajo no.
- *Componente nuevo de lista:* `ProductCarousel` ya resuelve cards, deslizamiento, flechas y teclado.

## Cambios por capa
- **Producto:** título "Vistos recientemente"; hasta 8; el plazo se renueva al abrir un producto.
- **Front (Nuxt + PrimeVue):** `app/composables/useVistos.ts`; registro en `app/pages/producto/[slug].vue`; sección en `app/pages/index.vue`.
- **Compartido (`shared/`):** `shared/utils/vistos.ts`.
- **Server routes de Nuxt (Nitro):** Sin cambios.
- **Pagos (Mercado Pago):** Sin cambios.
- **Mails:** Sin cambios.
- **SEO:** Sin cambios: el HTML del servidor no incluye la sección.
- **Data:** Sin cambios en el catálogo.
- **DB:** no aplica a este repo (C-02). No hay migraciones.
- **Infra:** Sin cambios.
- **Observabilidad:** Sin cambios.

## Verificación de constraints
| Constraint | ¿Aplica? | Cómo se cumple |
|---|---|---|
| C-01 (SSR) | Sí | La sección se agrega solo en el navegador; el HTML del servidor no cambia. |
| C-02 (sin backend ni DB) | Sí | Lista en el navegador; sin servicios ni base de datos. |
| C-03 (Mercado Pago) | No | Sin pago en esta iniciativa. |
| C-04 (PrimeVue) | Sí | Reutiliza las cards y el carrusel con el tema Mostrador. |
| C-05 | Sin definir | `<pendiente>`. |

## Testing
- `node:test` de `shared/utils/vistos.ts`: orden, repetidos, máximo de 8, ids inexistentes o inactivos, validación.
- Navegador (CDP): abrir 3 fichas y volver a la home; abrir una repetida; expirar; sección ausente sin datos; CLS.
- `verificar:seo` y Lighthouse de la home.

## Feature flag
No aplica.

## Rollout
Merge a la rama que se defina (Q-11).

## Rollback
Revertir el commit.

## Riesgos
- La sección aparece después de cargar y mueve el footer. Mitigación: está debajo de todo el contenido principal; se mide el CLS.
- Mostrar productos que cambiaron. Mitigación: se resuelven contra el catálogo en cada lectura.

## Cambios respecto del plan original (implementación, 2026-11-10)
- La sección reutiliza `ProductCarousel` con `indice = cantidad de carruseles`, así que se numera "04" y toma el fondo alterno. `[VERIFICADO]` `app/pages/index.vue`
- Se registra en `onMounted` de la ficha. `useVistos` lee primero lo guardado si todavía no cargó. `[VERIFICADO]`

## Resultados de verificación
- 11 tests nuevos de `shared/utils/vistos.ts` (orden, repetidos, máximo de 8, ids inexistentes o inactivos, validación). `[VERIFICADO]`
- Navegador: sin vistos la sección no aparece; con 3, aparece debajo de los tres carruseles con el más reciente primero; uno repetido pasa al frente sin duplicarse; nunca más de 8; vencidos se descartan y se elimina la clave; un id inexistente se ignora; con un solo producto se muestra. `[VERIFICADO]`
- El HTML del servidor de la home no incluye la sección y el verificador de SEO sigue en verde. `[VERIFICADO]`
- Home en Lighthouse móvil: 95, CLS 0,002. `[VERIFICADO]`
