# Spec: Productos vistos recientemente

- **Fecha:** 2026-11-10
- **Autor:** agonzalezz
- **Iniciativa:** `initiatives/2026-11-10-carrito-persistente/initiative.md`
- **Estado:** implementada   <!-- borrador | en revisión | aprobada | implementada | descartada -->
- **Plan:** [plan.md](plan.md) · **Tareas:** [tasks.md](tasks.md)

> Aprobada por el usuario el 2026-11-10 ("OK, creá las specs y construí las 3 fases"). Ninguna tarea de código arranca con esta spec en estado `borrador`.


## Contexto
- **Qué pasa si no hacemos nada:** quien mira varios productos y vuelve a la home tiene que encontrarlos de nuevo.
- **Situación actual en el código:** la home muestra tres carruseles curados y nada personalizado. `[VERIFICADO]` `app/pages/index.vue`.

## User stories
- Como visitante quiero volver rápido a los productos que miré hace un rato.

## Criterios de aceptación
- **Given** que abro una ficha, **Then** se registra su producto como el más reciente.
- **Given** que abro un producto ya visto, **Then** pasa al primer lugar sin repetirse.
- **Given** más de 8 productos vistos, **Then** solo quedan los 8 más recientes.
- **Given** productos vistos, **When** abro la home, **Then** aparece "Vistos recientemente" debajo de los carruseles, con el más reciente primero y las mismas cards.
- **Given** que no vi ninguno, **Then** la sección no aparece.
- **Given** un producto visto que ya no existe o está inactivo, **Then** no se muestra.
- **Given** pasadas 2 horas sin abrir productos, **Then** la lista se descarta; abrir un producto renueva el plazo.
- **Given** el HTML del servidor, **Then** no incluye esta sección (se agrega al montar) y el verificador de SEO sigue en verde.
- **Given** la home, **Then** la sección, al aparecer, no mueve el contenido de arriba (CLS sin cambio).

### Casos borde
- Almacenamiento bloqueado: funciona en memoria durante la sesión.
- Datos corruptos: se ignoran.
- Solo hay un producto visto: se muestra igual, sin flechas.

### Comportamiento por país
No aplica.

## Fuera de alcance
- Mostrarlos en la ficha, recomendaciones y "productos relacionados".

## Impacto en métricas
- **Qué medimos:** orden y límite correctos; la home sin cambios para quien no vio nada; Lighthouse y CLS.
- **Cómo sabemos si salió mal:** repetidos, más de 8, o desplazamiento del contenido.

## Dependencias
- Fase 1 (`almacenamiento-local`) cerrada. Reutiliza `ProductCarousel` y `ProductCard`.

## Preguntas abiertas de esta spec
- Ninguna.

