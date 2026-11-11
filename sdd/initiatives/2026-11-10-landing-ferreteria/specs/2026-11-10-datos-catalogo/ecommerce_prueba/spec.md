# Spec: Datos del catálogo (JSON, imágenes y validación)

- **Fecha:** 2026-11-10
- **Autor:** agonzalezz
- **Iniciativa:** `initiatives/2026-11-10-landing-ferreteria/initiative.md`
- **Estado:** implementada   <!-- borrador | en revisión | aprobada | implementada | descartada -->
- **Plan:** [plan.md](plan.md) · **Tareas:** [tasks.md](tasks.md)

> Aprobada por el usuario el 2026-11-10. Ninguna tarea de código arranca con esta spec en estado `borrador`.

## Contexto
- **Qué pasa si no hacemos nada:** la landing (fase 3) no tiene de dónde leer productos ni carruseles.
- **Situación actual en el código:** no hay código. `ecommerce_prueba` es un repo sin commits. `[VERIFICADO]` `git log` ("does not have any commits yet"). Esta fase crea los primeros archivos de datos del repo, antes de que exista el proyecto Nuxt (fase 2).

## User stories
- Como **quien administra el catálogo** quiero un único JSON con productos y carruseles para editar la tienda sin tocar componentes.
- Como **desarrollador** quiero que un script frene el build si el JSON está roto (ids inexistentes, imágenes faltantes) para no publicar una landing rota.

## Criterios de aceptación
Formato Given/When/Then.

- **Given** el archivo de catálogo, **When** se lo lee, **Then** tiene exactamente dos claves de primer nivel: `productos` (lista) y `carruseles` (lista ordenada).
- **Given** un producto, **Then** tiene: `id`, `slug`, `nombre`, `descripcionCorta`, `descripcion`, `precio`, `precioAnterior` (o `null`), `moneda` (`"ARS"`), `categoria`, `marca`, `sku`, `stock`, `etiquetas`, `atributos`, `fechaAlta`, `activo` e `imagenes` con `card`, `mobile` y `desktop` (cada una con `src` y `alt`). `[PROPUESTA]`
- **Given** el catálogo, **When** se valida, **Then** los `id` y los `slug` son únicos.
- **Given** un carrusel, **Then** tiene `id`, `nombre` y `productos` (lista de ids). Los tres carruseles están en este orden: `mas-vendido` ("Lo más vendido"), `nuevo` ("Lo nuevo"), `con-descuento` ("Con descuento").
- **Given** un id listado en un carrusel que no existe en `productos`, **When** se valida, **Then** el script falla e indica carrusel e id.
- **Given** un id repetido dentro de un mismo carrusel, **When** se valida, **Then** el script falla.
- **Given** un producto del carrusel `con-descuento`, **When** se valida, **Then** tiene `precioAnterior` mayor que `precio`; si no, falla.
- **Given** una imagen declarada, **When** se valida, **Then** `src` termina en `.webp` y el archivo existe.
- **Given** un producto con las tres imágenes, **Then** hay 3 archivos `.webp` por producto, con el mismo prefijo (`<id>-card`, `<id>-mobile`, `<id>-desktop`). `[PROPUESTA]`
- **Given** el descuento, **Then** el JSON **no** guarda porcentaje: se calcula al mostrar.

### Casos borde
- Producto con `activo: false`: es válido en `productos`; la landing lo ignora (fase 3).
- `precioAnterior: null` en un producto fuera de `con-descuento`: válido.
- `precio` o `precioAnterior` no numéricos o negativos: la validación falla.
- Un carrusel sin ids: la validación avisa (no es error de esquema, pero la landing no lo mostrará). `[PROPUESTA]`

### Comportamiento por país
Solo Argentina; `moneda` es siempre `"ARS"` y los precios son números enteros en pesos. `[PROPUESTA]` (formato es-AR se aplica al mostrar, fase 3). Si no aplica otro país, no hay más variantes.

## Fuera de alcance
- Mostrar nada en pantalla (landing y proyecto Nuxt son fases 2 y 3).
- Usar las imágenes `mobile` y `desktop` (se generan y se validan, pero nadie las consume todavía).
- Fotos reales: esta fase usa placeholders con el mismo nombre; se reemplazan después sin tocar el JSON.
- Un panel o API para editar el catálogo.

## Impacto en métricas
- **Qué medimos:** que el script de validación pase en limpio y que cada imagen sea `.webp`. El peso máximo por imagen queda como pregunta abierta.
- **Cómo sabemos si salió mal:** el script falla con un catálogo que debería ser válido, o deja pasar uno roto.

## Dependencias
- Ninguna app ni servicio externo. Depende de que se decida la herramienta para generar los `.webp` (ver plan).

## Decisiones tomadas (2026-11-10)
- Dimensiones: `card` 480×480, `mobile` 800×1000, `desktop` 1200×900. Peso objetivo: card ≤ 40 KB; mobile y desktop ≤ 120 KB. La validación avisa (no falla) si un archivo supera su objetivo, para no frenar el reemplazo por fotos reales. `[PROPUESTA]`
- `stock: 0` no invalida nada: el producto se muestra con etiqueta "Sin stock" (fase 3).
- Herramienta de placeholders: `sharp` (dependencia de desarrollo). Ver plan.

## Preguntas abiertas de esta spec
- Carpeta definitiva del JSON (`data/` propuesta, para no chocar con módulos de Nuxt) y de las imágenes (`public/img/productos/`). `[PROPUESTA]`
