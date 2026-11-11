---
slug: 2026-11-10-landing-ferreteria
title: Landing moderna de ferretería con carruseles desde JSON
author: agonzalezz
status: en desarrollo                   # borrador | aprobada | en desarrollo | en QA | en producción | descartada
apps:
  - name: ecommerce_prueba
    why: Es la tienda; acá nace la landing, el catálogo en JSON y el proyecto Nuxt
    depends_on: []
---

# Iniciativa: Landing moderna de ferretería con carruseles desde JSON

> Spec funcional única. Cada app afectada recibe una porción en `specs/<YYYY-MM-DD-fase>/<app>/spec.md`.
> Los repos de código no llevan `.sdd/`: solo código. Las tareas viven en el `tasks.md` de cada spec.

Origen: pedido del usuario del 2026-11-10 (conversación), refinado con dos rondas de preguntas. El usuario aprobó el avance el 2026-11-10 ("aprobar specs y construir hasta ver la landing"). Las decisiones siguen marcadas `[PROPUESTA]` porque salen de la conversación, no de una regla del equipo; las constraints son las de `constraints.md`.

## Contexto
- **Qué pasa si no hacemos nada:** `ecommerce_prueba` no tiene código (repo sin commits). No hay tienda ni catálogo.
- **Situación actual:** sin código. `[VERIFICADO]` `git log` de `ecommerce_prueba` ("does not have any commits yet").
- **Qué es:** primera pieza visible de una tienda de **productos de ferretería**: una landing con header, hero, tres carruseles de productos y footer. Los datos salen de un archivo JSON versionado en el repo.
- **Decisiones ya tomadas** `[PROPUESTA]` (dichas por el usuario el 2026-11-10):
  - Rubro: ferretería (da temática a la tienda).
  - Carruseles, en este orden: **Lo más vendido**, **Lo nuevo**, **Con descuento**.
  - Un único JSON con (1) el listado de productos y (2) la lista ordenada de carruseles, cada uno con su nombre y los ids de sus productos.
  - Imágenes siempre en `.webp`; tres por producto: `card` (carrusel), `mobile` y `desktop` (estas dos son para la ficha de producto).
  - Dos formatos de landing: desktop y mobile.
  - Aspecto moderno, que no parezca hecho por IA. PrimeVue con tema propio (C-04).
  - JSON e imágenes viven en el repo.
  - Dirección visual **B · Mostrador**: verde bosque, crema y rojo ladrillo; títulos en serif; esquinas suaves; texturas de papel kraft; fuentes autoalojadas.
  - Imágenes: `card` 480×480, `mobile` 800×1000, `desktop` 1200×900. Peso objetivo: card ≤ 40 KB; mobile y desktop ≤ 120 KB.
  - Cada card enlaza a `/producto/<slug>`. Como la ficha está fuera de alcance, ese enlace da 404 hasta que exista (aceptado por el usuario).
  - Producto con `stock: 0`: se muestra con etiqueta "Sin stock".
  - Header: logo y anclas a los 3 carruseles; sin carrito todavía.
- **Alcance:** solo landing + datos. Sin ficha de producto, carrito ni checkout.

## User stories
- Como **visitante** quiero ver de entrada los productos más vendidos, los nuevos y los que están en oferta para encontrar rápido qué comprar.
- Como **visitante desde el celular** quiero una landing pensada para pantalla chica que cargue rápido.
- Como **quien administra el catálogo** quiero cambiar productos y carruseles editando un solo JSON, sin tocar código de componentes.

## Criterios de aceptación
Cada criterio indica la app; todas son `[EC]` (`ecommerce_prueba`).

- **[EC]** Given el JSON válido, When se abre `/`, Then la página se renderiza en el servidor (SSR, C-01) con los 3 carruseles en el orden del JSON y con sus nombres.
- **[EC]** Given un carrusel con ids de producto, When se muestra, Then cada card usa la imagen `card` del producto, el nombre y el precio en ARS con formato es-AR, y enlaza a `/producto/<slug>`.
- **[EC]** Given un producto con `precioAnterior` mayor que `precio`, When aparece en una card, Then se muestra el precio tachado y el porcentaje de descuento **calculado** (no guardado).
- **[EC]** Given un viewport de celular, When se abre `/`, Then se muestra el formato mobile; Given un viewport de escritorio, Then se muestra el formato desktop.
- **[EC]** Given un id de carrusel que no existe en `productos`, When se valida el catálogo, Then la validación falla indicando el carrusel y el id.
- **[EC]** Given cualquier imagen de producto, When se valida, Then el archivo existe y es `.webp`.
- **[EC]** Given la landing publicada, When se mide con Lighthouse en móvil, Then Performance ≥ 90.
- **[EC]** Given la landing, Then no hay llamadas a servicios propios ni a una base de datos (C-02).

## Casos borde y errores
- Producto con `activo: false`: no aparece en ningún carrusel aunque su id esté listado. `[PROPUESTA]`
- Carrusel sin productos activos: no se muestra (ni título vacío). `[PROPUESTA]`
- Imagen faltante: la validación del catálogo lo frena antes del deploy; en runtime no se hace fallback silencioso. `[PROPUESTA]`
- Producto repetido dentro de un mismo carrusel: se rechaza en la validación. `[PROPUESTA]`
- Producto con `stock: 0`: se muestra con la etiqueta "Sin stock". `[PROPUESTA]`
- Clic en una card: navega a `/producto/<slug>`, que hoy no existe (404). Aceptado hasta la iniciativa de la ficha.
- Carrusel con pocos productos (menos de los que caben en pantalla): no se rompe el layout. `[PROPUESTA]`

## Comportamiento por país
Solo Argentina, moneda ARS, español rioplatense (dicho por el usuario el 2026-11-10). Multi-país y multi-moneda quedan fuera.

## Fuera de alcance
- Ficha de producto (las imágenes `mobile` y `desktop` se definen en el JSON pero **no se muestran** todavía).
- Carrito, checkout y Mercado Pago (C-03 no se toca).
- Búsqueda, filtros y páginas de categoría.
- Mails, cuentas de usuario, pedidos.
- Panel de administración: el catálogo se edita a mano en el JSON.
- Multi-país y multi-moneda.

## Impacto en métricas
- **Qué medimos:** Lighthouse móvil, Performance ≥ 90 (`[PROPUESTA]`, aceptado por el usuario).
- **Cómo sabemos si salió mal:** Performance < 90, imágenes sin `.webp`, o un carrusel que no coincide con el JSON.

## Contratos entre apps
| Contrato | Productor | Consumidor | Breaking |
|---|---|---|---|
| Esquema del catálogo (`productos` + `carruseles`) | datos (`ecommerce_prueba`) | landing (`ecommerce_prueba`) | Sí si cambia un campo; mismo repo, se resuelve en una spec |

Hoy no hay contratos entre apps distintas.

## Orden de despliegue y rollback
Fases, en orden (las fases 1, 2 y 3 tienen specs; la 4 se crea cuando se llegue):

| # | Fase | Contenido |
|---|---|---|
| 1 | `datos-catalogo` (implementada) | Esquema del JSON, ~12 productos de ferretería de ejemplo, placeholders `.webp` en 3 tamaños, validación del JSON |
| 2 | `base-nuxt-tema` (implementada) | Proyecto Nuxt SSR + PrimeVue con tema propio (tipografía, paleta, espaciados) |
| 3 | `landing` (implementada) | Header con navegación, hero, 3 carruseles, footer; layouts desktop y mobile |
| 4 | `rendimiento-cierre` | Lighthouse móvil ≥ 90, SEO básico y definición del host con Node |

Rollback: `<pendiente>` hasta definir el host (Q-05). Mientras no haya despliegue, revertir es revertir commits.

## Preguntas abiertas
- Nombre de la tienda: placeholder `<pendiente>`, centralizado en un solo lugar de la config.
- Qué muestran las anclas del header si algún carrusel queda oculto por no tener productos activos: se oculta también su ancla. `[PROPUESTA]`
- Host con Node para el SSR (Q-05), flujo de ramas (Q-11): en `applications/ecommerce_prueba/open-questions.md`.
- Node 25.2.1 con Nuxt 4.4.5: compatible. Las versiones 4.6.x de Nuxt no lo son y las ≤ 4.6.2 tienen avisos de seguridad (Q-16 de `applications/ecommerce_prueba/open-questions.md`).
- PrimeVue 5 pide licencia; se usa 4.5.5 (ADR-002). Rendimiento medido con gzip: 95-96 (ver Q-17).

Respondidas el 2026-11-10: tamaños de imagen, dirección visual, comportamiento al clic, stock 0 y enlaces del header.
