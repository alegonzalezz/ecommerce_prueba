# Spec: Base Nuxt SSR + PrimeVue con tema propio

- **Fecha:** 2026-11-10
- **Autor:** agonzalezz
- **Iniciativa:** `initiatives/2026-11-10-landing-ferreteria/initiative.md`
- **Estado:** implementada   <!-- borrador | en revisión | aprobada | implementada | descartada -->
- **Plan:** [plan.md](plan.md) · **Tareas:** [tasks.md](tasks.md)

> Aprobada por el usuario el 2026-11-10 ("aprobar specs y construir hasta ver la landing"). Ninguna tarea de código arranca con esta spec en estado `borrador`.

## Contexto
- **Qué pasa si no hacemos nada:** no hay proyecto sobre el cual construir la landing (fase 3).
- **Situación actual en el código:** `ecommerce_prueba` no tiene proyecto web. Tras la fase 1 contiene `data/`, `public/img/productos/` y `scripts/`. `[VERIFICADO]` se confirma al cerrar la fase 1 (ver `tasks.md` de `2026-11-10-datos-catalogo`).
- **Decisiones previas del usuario (2026-11-10):** SSR (C-01), sin backend separado (C-02), PrimeVue (C-04), dirección visual **B · Mostrador**.

## User stories
- Como **desarrollador** quiero un proyecto Nuxt con SSR y PrimeVue listo para correr en local para construir páginas sobre una base con identidad propia.
- Como **visitante** quiero que los textos y botones se vean coherentes (tipografía, color, bordes) aunque todavía no haya landing.

## Criterios de aceptación
- **Given** el repo clonado, **When** se instala y se corre el modo desarrollo, **Then** la app responde en `http://localhost:3000` sin errores en consola.
- **Given** la app en marcha, **When** se pide `/` con `curl`, **Then** el HTML ya trae contenido renderizado en el servidor (C-01).
- **Given** un componente PrimeVue (p. ej. `Button`), **When** se renderiza, **Then** usa los tokens de **Mostrador** (verde bosque, crema, rojo ladrillo, esquinas suaves) y no el tema por defecto.
- **Given** la página, **Then** las tipografías (serif para títulos, sans redonda para texto) se sirven desde el propio sitio, sin pedir a Google Fonts.
- **Given** el nombre de la tienda, **Then** vive en **un solo lugar** de la configuración (`app/app.config.ts`) y se usa desde ahí. Valor provisorio: "Tu Ferretería".
- **Given** el idioma, **Then** `lang="es-AR"` y los textos de UI están en español rioplatense.
- **Given** el proyecto, **Then** no hay servicios ni base de datos propios (C-02).

### Casos borde
- Node fuera del rango declarado por Nuxt (`^22.22.3 || ^24.15.0 || >=26`): resultado real: Nuxt 4.4.5 es compatible con Node 25.2.1; las 4.6.x no (ver Q-16).
- Pantalla sin JavaScript: el contenido SSR sigue visible.

### Comportamiento por país
Solo Argentina (`es-AR`).

## Fuera de alcance
- La landing y sus componentes (fase 3).
- Mercado Pago, server routes de negocio, mails (C-03 no se toca).
- Despliegue y host con Node (fase 4).
- Dark mode.

## Impacto en métricas
- **Qué medimos:** que el proyecto arranque y renderice por SSR.
- **Cómo sabemos si salió mal:** errores de hidratación en consola, tema por defecto de PrimeVue visible, o una petición a `fonts.googleapis.com`.

## Dependencias
- Fase 1 (`datos-catalogo`) cerrada: aporta `public/` y `scripts/` y `sharp`.
- Versiones instaladas: Nuxt 4.4.5, PrimeVue 4.5.5, `@primevue/nuxt-module` 4.5.5, `@primeuix/themes` 2.0.3. PrimeVue 5 se descartó por licencia (ver `applications/ecommerce_prueba/decisions/ADR-002-primevue-4-por-licencia.md`). `[VERIFICADO]` `package.json`.

## Preguntas abiertas de esta spec
- Resuelta: Nuxt 4.4.5 declara Node `^20.19.0 || >=22.12.0`, compatible con 25.2.1. Las 4.6.x no lo son (ver Q-16).
- Gestor de paquetes: npm (instalado: 11.6.2). `[PROPUESTA]`
- TypeScript sí/no: sí, es el default de Nuxt. `[PROPUESTA]`
