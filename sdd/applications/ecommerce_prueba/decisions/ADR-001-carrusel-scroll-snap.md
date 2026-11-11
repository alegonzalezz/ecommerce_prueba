# ADR-001: Carrusel con scroll-snap propio en lugar de `Carousel` de PrimeVue

- **Fecha:** 2026-11-10
- **Estado:** aceptada
- **Autor:** agonzalezz (decisión tomada con el asistente)
- **Spec relacionada:** `initiatives/2026-11-10-landing-ferreteria/specs/2026-11-10-landing/ecommerce_prueba/spec.md`

## Contexto
La landing necesita carruseles con SSR (C-01), deslizables con el dedo en mobile y con flechas en desktop. La spec preveía `Carousel` de PrimeVue y un plan B.

El `Carousel` de PrimeVue 4.5.5 decide cuántos ítems muestra leyendo `window.innerWidth` recién al montar y los mueve con `transform: translate3d(...)`. `[VERIFICADO]` `node_modules/primevue/carousel/index.mjs` (`mounted`, líneas 139-145; `calculatePosition`, líneas 284-291). Con SSR el servidor no conoce el ancho: renderiza con el valor base y el navegador re-acomoda al hidratar.

## Decisión
Pista propia con `overflow-x: auto` y `scroll-snap`, ancho de las cards definido solo con CSS, y `Button` de PrimeVue para las flechas (C-04 se sigue cumpliendo: `Button` y `Tag`).

## Alternativas consideradas
- **`Carousel` de PrimeVue:** descartado por el re-layout al hidratar (riesgo para CLS y para la fidelidad del SSR). No se midió en esta app; la decisión se apoya en el código del componente.
- **Librería externa de carruseles:** suma una dependencia sin necesidad.

## Consecuencias
- **Ganamos:** SSR determinista (el HTML ya tiene el layout final), CLS 0,002 medido, sin JavaScript para deslizar en mobile, navegación por teclado y *reduced motion* resueltos a mano.
- **Pagamos:** las flechas, el estado deshabilitado y el atajo de teclado son código propio (`app/components/ProductCarousel.vue`).
- **Pendiente:** sin indicadores de página (no se pidieron).

## Cómo se revierte
Reemplazar `ProductCarousel.vue` por `Carousel` de PrimeVue con `responsiveOptions`; el resto de la landing no cambia.

## Impacto en los documentos permanentes
- [x] `architecture.md`
- [x] `conventions.md`
