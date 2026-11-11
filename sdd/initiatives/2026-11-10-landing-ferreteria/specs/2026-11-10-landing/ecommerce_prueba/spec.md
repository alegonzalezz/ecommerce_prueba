# Spec: Landing de ferretería (header, hero, carruseles, footer)

- **Fecha:** 2026-11-10
- **Autor:** agonzalezz
- **Iniciativa:** `initiatives/2026-11-10-landing-ferreteria/initiative.md`
- **Estado:** implementada   <!-- borrador | en revisión | aprobada | implementada | descartada -->
- **Plan:** [plan.md](plan.md) · **Tareas:** [tasks.md](tasks.md)

> Aprobada por el usuario el 2026-11-10 ("aprobar specs y construir hasta ver la landing"). Ninguna tarea de código arranca con esta spec en estado `borrador`.

## Contexto
- **Qué pasa si no hacemos nada:** hay catálogo y base técnica, pero nada que mostrar.
- **Situación actual en el código:** se completa al cerrar las fases 1 y 2: `data/catalogo.json`, `public/img/productos/`, proyecto Nuxt con PrimeVue y tema Mostrador. `[VERIFICADO]` al cierre de esas fases.

## User stories
- Como **visitante** quiero ver de entrada qué es lo más vendido, lo nuevo y lo que está en oferta.
- Como **visitante desde el celular** quiero una página pensada para pantalla chica, con carruseles que se deslicen con el dedo.
- Como **visitante desde escritorio** quiero un layout amplio con flechas en los carruseles.
- Como **quien administra el catálogo** quiero que cambiar el JSON cambie la landing sin tocar componentes.

## Criterios de aceptación
- **Given** `data/catalogo.json` válido, **When** se abre `/`, **Then** aparecen, en este orden: header, hero, carruseles (en el orden del JSON: Lo más vendido, Lo nuevo, Con descuento) y footer.
- **Given** un carrusel, **Then** cada card muestra imagen `card` en `.webp`, nombre, precio en ARS (formato es-AR) y enlaza a `/producto/<slug>` (hoy da 404; aceptado).
- **Given** un producto con `precioAnterior` > `precio`, **Then** la card muestra el precio anterior tachado y el porcentaje de descuento **calculado**.
- **Given** un producto con `stock: 0`, **Then** la card muestra la etiqueta "Sin stock" y sigue visible.
- **Given** un producto con `activo: false`, **Then** no aparece en ningún carrusel.
- **Given** un carrusel sin productos activos, **Then** no se muestra, ni su ancla en el header.
- **Given** el header, **Then** tiene el nombre de la tienda (desde `app.config`) y anclas a los carruseles visibles; sin carrito.
- **Given** un viewport angosto (mobile), **Then** el header es compacto, el hero apila texto e imagen y cada carrusel es deslizable con *scroll-snap*; **Given** un viewport ancho (desktop), **Then** el hero va en dos columnas y los carruseles muestran varias cards con flechas.
- **Given** el hero, **Then** usa dos imágenes `.webp` distintas por formato (`<picture>` con `media`).
- **Given** cualquier imagen de la página, **Then** es `.webp`, con `width` y `height` declarados, y con carga diferida salvo la del hero.
- **Given** la dirección **Mostrador**, **Then** la página usa los tokens definidos en la fase 2 y evita: gradientes violetas, glassmorphism, sombras difusas y emojis.
- **Given** la página con teclado, **Then** el foco es visible y los carruseles se pueden recorrer con Tab y las flechas.
- **Given** la landing publicada, **Then** se mide Lighthouse móvil (objetivo ≥ 90, se cierra en fase 4).

### Casos borde
- Imágenes `mobile` y `desktop` de producto: existen en el JSON pero **no se usan** aquí.
- Precio sin descuento: no se muestra tachado ni porcentaje.
- Nombre de producto muy largo: se corta en dos líneas.
- Menos cards que el ancho del carrusel: no aparecen flechas inertes.

### Comportamiento por país
Solo Argentina: moneda ARS, `es-AR`, textos en español rioplatense (voseo).

## Fuera de alcance
- Ficha de producto y el destino real de los enlaces `/producto/<slug>`.
- Carrito, búsqueda, filtros, páginas de categoría y checkout.
- Fotos reales: se usan placeholders.
- Animaciones complejas.

## Impacto en métricas
- **Qué medimos:** Lighthouse móvil, Performance.
- **Cómo sabemos si salió mal:** layout roto en un formato, imágenes sin `.webp`, un carrusel desordenado respecto del JSON.

## Dependencias
- Fase 1 (catálogo) y fase 2 (base y tema) cerradas.

## Preguntas abiertas de esta spec
- Texto del hero (titular y bajada): lo redacta el asistente como provisorio en español rioplatense; el usuario lo ajusta. `<pendiente>`
- Imagen del hero: placeholders `.webp`, 2 formatos, hasta tener fotos. `[PROPUESTA]`
- Resuelta: se usó *scroll-snap* propio con `Button` de PrimeVue (ADR-001).
