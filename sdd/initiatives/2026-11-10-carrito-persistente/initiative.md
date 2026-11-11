---
slug: 2026-11-10-carrito-persistente
title: Carrito y productos vistos recientemente, recordados en el navegador por 2 horas
author: agonzalezz
status: en desarrollo                   # borrador | aprobada | en desarrollo | en QA | en producción | descartada
apps:
  - name: ecommerce_prueba
    why: Es la tienda; el carrito y los productos vistos viven en el navegador de quien compra
    depends_on: []
---

# Iniciativa: Carrito y productos vistos recientemente, recordados en el navegador por 2 horas

> Spec funcional única. Cada app afectada recibe una porción en `specs/<YYYY-MM-DD-fase>/<app>/spec.md`.
> Los repos de código no llevan `.sdd/`: solo código. Las tareas viven en el `tasks.md` de cada spec.

Origen: pregunta del usuario del 2026-11-10 ("¿podemos persistir por 1 o 2 horas en el navegador lo que va seleccionando el usuario?"), refinada con dos rondas de preguntas. El usuario aprobó crear las specs y construir las 3 fases. Las decisiones siguen marcadas `[PROPUESTA]`.

## Contexto
- **Qué pasa si no hacemos nada:** no hay forma de elegir productos: la tienda es solo vitrina, y no se puede avanzar a Mercado Pago sin un carrito.
- **Situación actual:** `ecommerce_prueba` no usa `localStorage`, `sessionStorage`, cookies ni ningún estado persistente. La ficha muestra "Pronto podrás comprar online" y no tiene botón. `[VERIFICADO]` `grep` de `app/`, `shared/`, `server/` (sin resultados), `app/pages/producto/[slug].vue`.
- **Decisiones del usuario (2026-11-10) `[PROPUESTA]`:**
  - Se recuerda en el navegador: **carrito** y **productos vistos recientemente**. Duración: **2 horas**.
  - **Filtros y búsqueda se separan** en otra iniciativa (necesitan un listado y páginas de categoría que no existen).
  - Carrito como **página `/carrito`** más un **ícono con la cantidad en el header**.
  - "Finalizar compra" va **deshabilitado** con el aviso "Pronto podrás comprar online".
  - Productos vistos: sección en la **home, debajo de los carruseles**.
- **Decisiones del asistente (el usuario las puede vetar):**
  - Persistencia en `localStorage` con hora de vencimiento; el plazo de 2 h **se renueva con cada cambio**.
  - Del carrito se guardan solo **ids y cantidades**; precios, nombres y stock se leen siempre del catálogo.
  - Tope de 10 unidades por producto, además del stock.
  - Se sincroniza entre pestañas; si el navegador bloquea el almacenamiento, funciona en memoria sin guardar.
  - Productos vistos: los últimos 8.
  - Nada de esto es seguridad: cuando haya pago, el servidor volverá a calcular los montos.

## User stories
- Como **visitante** quiero agregar productos a un carrito y encontrarlos al volver, aunque recargue la página o cierre y abra el navegador.
- Como **visitante** quiero ver cuántos productos llevo en cualquier página.
- Como **visitante** quiero volver a los productos que miré hace un rato.
- Como **visitante** quiero que, si un precio cambió o un producto se agotó, el carrito me lo diga en vez de mostrarme datos viejos.

## Criterios de aceptación
Todos `[EC]` (`ecommerce_prueba`).
- **Given** una ficha con stock, **When** hago clic en "Agregar al carrito", **Then** el ícono del header muestra la cantidad y el producto queda en `/carrito`.
- **Given** un carrito con productos, **When** recargo la página o la cierro y la abro dentro de las 2 horas, **Then** el carrito sigue igual.
- **Given** un carrito guardado, **When** pasan más de 2 horas **sin cambios**, **Then** al abrir la tienda el carrito está vacío y la clave se elimina.
- **Given** un carrito, **When** lo modifico, **Then** el plazo de 2 horas se renueva desde ese momento.
- **Given** dos pestañas de la tienda, **When** cambio el carrito en una, **Then** la otra lo refleja sin recargar.
- **Given** un carrito que guarda solo ids y cantidades, **When** cambia un precio en el catálogo, **Then** `/carrito` muestra el precio nuevo.
- **Given** un producto del carrito que ya no existe, está inactivo o quedó sin stock, **When** abro el carrito, **Then** se quita y se muestra un aviso.
- **Given** una cantidad mayor que el stock o que el tope de 10, **When** agrego o cargo el carrito, **Then** se limita al máximo permitido y se avisa.
- **Given** un producto sin stock, **Then** la ficha no permite agregarlo.
- **Given** `/carrito`, **Then** tiene `noindex`, no aparece en el sitemap, muestra subtotal, permite cambiar cantidades, quitar y vaciar, y "Finalizar compra" está deshabilitado con el aviso.
- **Given** productos que abrí, **When** vuelvo a la home, **Then** aparece "Vistos recientemente" debajo de los carruseles, con el más reciente primero, hasta 8, sin repetidos; si no abrí ninguno, la sección no aparece.
- **Given** el navegador sin almacenamiento disponible (modo privado, bloqueado) o con datos corruptos, **Then** la tienda funciona igual y no muestra errores.
- **Given** el HTML que entrega el servidor, **Then** no cambia (sin carrito ni vistos): el SEO y el verificador siguen igual.
- **Given** la home y la ficha, **Then** Lighthouse móvil no baja de 90 en Performance y mantiene CLS ≤ 0,05.

## Casos borde y errores
- Datos guardados con otra versión de formato: se descartan.
- JSON corrupto, con tipos incorrectos, cantidades negativas o repetidas: se descartan o se corrigen sin romper.
- Cuota de almacenamiento llena o escritura bloqueada: el carrito sigue en memoria, sin error visible.
- Pestaña abierta más de 2 horas sin actividad: al volver a verla se vuelve a leer y se descarta si venció.
- Carrito vacío: `/carrito` muestra un mensaje y un enlace a seguir mirando.
- Carga lenta: mientras el carrito se lee, `/carrito` muestra "Cargando tu carrito…" y no "vacío".

## Comportamiento por país
Solo Argentina: precios en ARS, textos en español rioplatense.

## Fuera de alcance
- Filtros, búsqueda, listado y páginas de categoría (iniciativa aparte).
- Pago, Mercado Pago, pedidos y mails (C-03 no se toca).
- Cuentas de usuario y carrito entre dispositivos.
- Favoritos.
- Consentimiento de cookies (el carrito guarda solo ids y cantidades; ver preguntas abiertas).

## Impacto en métricas
- **Qué medimos:** que lo guardado sobreviva a una recarga, venza a las 2 h y se renueve; Lighthouse de home y ficha; que el verificador de SEO siga en verde.
- **Cómo sabemos si salió mal:** un carrito que reaparece después de 2 h, uno que se pierde al recargar, precios viejos, o HTML de servidor distinto.

## Contratos entre apps
| Contrato | Productor | Consumidor | Breaking |
|---|---|---|---|
| Formato guardado `{ version, expiraEn, datos }` en `ecommerce:carrito` y `ecommerce:vistos` | almacenamiento local | carrito, vistos | Se sube `version` y los datos viejos se descartan |
| Catálogo (`id`, `precio`, `stock`, `activo`) | datos | reconciliación del carrito | Sí si cambia un campo |

## Orden de despliegue y rollback
| # | Fase | Contenido |
|---|---|---|
| 1 | `almacenamiento-local` (implementada) | Utilidad con vencimiento, lectura solo en el navegador, sincronización |
| 2 | `carrito` (implementada) | Lógica, botón en la ficha, ícono en el header, página `/carrito` |
| 3 | `vistos-recientemente` (implementada) | Registro en la ficha y sección en la home |

Rollback: revertir por fase. Los datos que ya estén en los navegadores vencen solos a las 2 horas.

## Preguntas abiertas
- Privacidad: el carrito guarda solo ids y cantidades, sin datos personales ni seguimiento. ¿Hace falta un aviso o consentimiento? No es asesoramiento legal: revisarlo con quien corresponda (Q-23).
- ¿El tope de 10 unidades por producto es el correcto? (Q-24).
- Cuando haya pago: el servidor debe recalcular precios y validar stock; el carrito del navegador no es fuente de verdad.
