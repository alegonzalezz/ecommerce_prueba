# Spec: Carrito de compras

- **Fecha:** 2026-11-10
- **Autor:** agonzalezz
- **Iniciativa:** `initiatives/2026-11-10-carrito-persistente/initiative.md`
- **Estado:** implementada   <!-- borrador | en revisión | aprobada | implementada | descartada -->
- **Plan:** [plan.md](plan.md) · **Tareas:** [tasks.md](tasks.md)

> Aprobada por el usuario el 2026-11-10 ("OK, creá las specs y construí las 3 fases"). Ninguna tarea de código arranca con esta spec en estado `borrador`.


## Contexto
- **Qué pasa si no hacemos nada:** la tienda no permite elegir productos; no hay base para el pago.
- **Situación actual en el código:** la ficha muestra el aviso "Pronto podrás comprar online" y no hay botón ni carrito; el header solo tiene el nombre y el menú de secciones. `[VERIFICADO]` `app/pages/producto/[slug].vue`, `app/components/AppHeader.vue`.

## User stories
- Como visitante quiero agregar un producto desde su ficha y ver cuántos llevo.
- Como visitante quiero revisar mi carrito, cambiar cantidades, quitar productos y ver el subtotal.
- Como visitante quiero enterarme si un producto cambió o se agotó.

## Criterios de aceptación
- **Given** una ficha con stock, **When** hago clic en "Agregar al carrito", **Then** se suma 1 unidad, el botón confirma con un mensaje legible por lector de pantalla ("Agregado al carrito") y aparece un enlace "Ver carrito".
- **Given** un producto ya en el carrito, **Then** la ficha indica cuántas unidades hay y permite seguir agregando hasta el máximo.
- **Given** un producto con `stock: 0`, **Then** el botón está deshabilitado y dice "Sin stock".
- **Given** el máximo por producto (el menor entre el stock y 10), **When** lo alcanzo, **Then** el botón se deshabilita con "Máximo disponible en tu carrito".
- **Given** el header en cualquier página, **Then** muestra un enlace al carrito con la cantidad total de unidades; si es 0, no muestra número.
- **Given** `/carrito` con productos, **Then** cada línea muestra imagen `card`, nombre (con enlace a la ficha), precio unitario actual, selector de cantidad (− / +), subtotal de la línea y "Quitar"; y el resumen muestra unidades y subtotal.
- **Given** `/carrito`, **When** cambio la cantidad a 0 o toco "Quitar", **Then** la línea desaparece; "Vaciar carrito" quita todo.
- **Given** un producto guardado que ya no existe, está inactivo o sin stock, **When** cargo el carrito, **Then** se quita y se muestra un aviso que lo explica.
- **Given** una cantidad guardada mayor que el máximo, **Then** se ajusta y se avisa.
- **Given** `/carrito`, **Then** "Finalizar compra" está deshabilitado y se lee "Pronto podrás comprar online."
- **Given** `/carrito`, **Then** el `<head>` trae `noindex, nofollow`, no figura en `sitemap.xml` ni en `llms.txt`, y dice que el carrito se guarda en este navegador por 2 horas.
- **Given** el carrito vacío, **Then** se muestra "Tu carrito está vacío" con un enlace para seguir mirando.
- **Given** la lectura en curso, **Then** `/carrito` muestra "Cargando tu carrito…" y no "vacío".
- **Given** un viewport de 390 px y de 1440 px, **Then** no hay desborde horizontal y el ícono del header no mueve el contenido al aparecer la cantidad.

### Casos borde
- Precio distinto al de la última visita: se muestra el actual (no se guarda el precio).
- Productos repetidos o cantidades no enteras en lo guardado: se unifican o se descartan.
- Dos pestañas: el cambio se refleja en la otra.
- Subtotal con descuentos: se usa el precio vigente (`precio`), no `precioAnterior`.

### Comportamiento por país
Solo Argentina: ARS, formato `es-AR`.

## Fuera de alcance
- Pago, envío, impuestos, cupones, pedidos y cuentas.
- Agregar desde las cards de los carruseles (solo desde la ficha).
- Carrito entre dispositivos.

## Impacto en métricas
- **Qué medimos:** carrito que sobrevive a una recarga; avisos correctos ante cambios; Lighthouse de la ficha y la home sin bajar de 90; CLS ≤ 0,05.
- **Cómo sabemos si salió mal:** cantidades que superan el stock, precios viejos, el ícono moviendo el header, o un `/carrito` indexable.

## Dependencias
- Fase 1 (`almacenamiento-local`) cerrada.

## Preguntas abiertas de esta spec
- Tope de 10 unidades por producto: `[PROPUESTA]` (Q-24).

