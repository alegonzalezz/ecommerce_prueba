# Spec: Página de producto

- **Fecha:** 2026-11-10
- **Autor:** agonzalezz
- **Iniciativa:** `initiatives/2026-11-10-ficha-producto/initiative.md`
- **Estado:** implementada   <!-- borrador | en revisión | aprobada | implementada | descartada -->
- **Plan:** [plan.md](plan.md) · **Tareas:** [tasks.md](tasks.md)

> Aprobada por el usuario el 2026-11-10 ("OK, creá las specs y construí las 3 fases"). Ninguna tarea de código arranca con esta spec en estado `borrador`.


## Contexto
- **Qué pasa si no hacemos nada:** cada card de la landing termina en un 404.
- **Situación actual en el código:** `app/pages/index.vue` es la única página; `app/components/ProductCard.vue` usa un `<a>` hacia `/producto/<slug>` porque la ruta no existe; el header y el footer enlazan a `#id`, que solo funciona en la home. Las imágenes `mobile` (800×1000) y `desktop` (1200×900) de cada producto existen y no se usan. `[VERIFICADO]` `app/components/ProductCard.vue`, `AppHeader.vue`, `AppFooter.vue`, `public/img/productos/`.

## User stories
- Como visitante quiero ver un producto con su foto, precio, disponibilidad y características en una página clara.
- Como visitante quiero volver al inicio o a un carrusel desde cualquier página.

## Criterios de aceptación
- **Given** un producto activo, **When** abro `/producto/<slug>`, **Then** veo (desktop: dos columnas, imagen a la izquierda; mobile: apilado) la imagen del formato correspondiente, la marca, el nombre como `<h1>`, el precio, el precio anterior tachado y el porcentaje si hay descuento, la disponibilidad, la descripción y la tabla de características.
- **Given** un producto con `stock: 0`, **Then** se ve "Sin stock" y la imagen atenuada, como en la card.
- **Given** la ficha, **Then** se ve el aviso "Pronto podrás comprar online" y **no** hay botón de compra.
- **Given** la ficha, **Then** las migas muestran Inicio › Categoría › Producto; Inicio enlaza a `/`, la categoría es texto sin enlace y el producto es la página actual (`aria-current`).
- **Given** un slug inexistente o de un producto inactivo, **When** lo pido, **Then** el servidor responde 404 con una página que explica y enlaza al inicio.
- **Given** la ficha, **When** uso el menú o el pie, **Then** los enlaces llevan a la sección correspondiente de la home (`/#mas-vendido`, etc.).
- **Given** la landing, **When** hago clic en una card, **Then** navego a la ficha sin recargar toda la página.
- **Given** la ficha en mobile (390 px) y desktop (1440 px), **Then** no hay desborde horizontal y la imagen tiene `width`/`height` y es `.webp`.

### Casos borde
- Producto sin atributos: no se muestra la tabla.
- Nombre muy largo: el título se ajusta en varias líneas sin romper la columna.
- Slug con mayúsculas o barra final: se trata como no encontrado (el catálogo usa slugs en minúscula).

### Comportamiento por país
Solo Argentina (`es-AR`, ARS).

## Fuera de alcance
- SEO (fases 2 y 3), carrito, compra, productos relacionados, galería, páginas de categoría.

## Impacto en métricas
- **Qué medimos:** 200 en todos los productos del catálogo, 404 en slugs inválidos, sin desborde horizontal.
- **Cómo sabemos si salió mal:** un producto del JSON sin página, o un 200 en un slug inventado.

## Dependencias
- Iniciativa `2026-11-10-landing-ferreteria` implementada (catálogo, tema, componentes).

## Preguntas abiertas de esta spec
- Texto exacto del aviso de compra: "Pronto podrás comprar online" (dado por el usuario).
- Si el aviso se mantiene cuando exista el carrito: se retira con esa iniciativa.

