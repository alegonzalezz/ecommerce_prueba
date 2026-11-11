# Plan: Base Nuxt SSR + PrimeVue con tema propio

- **Spec:** [spec.md](spec.md)
- **Fecha:** 2026-11-10

## Enfoque
Crear el proyecto Nuxt en la **raíz de `ecommerce_prueba/`**, al lado de `sdd/`, con el módulo oficial `@primevue/nuxt-module` y un preset propio sobre `@primeuix/themes`. Tipografías autoalojadas con paquetes `@fontsource-variable/*` (sin red en runtime). `[PROPUESTA]`

Se usa la versión vigente de Nuxt (4.x), no la 3 mencionada en la propuesta inicial: la 3 ya no es la actual. `[INFERIDO]` de `npm view nuxt version` = 4.6.4.

**Alternativas descartadas:**
- *Nuxt 3:* versión anterior; sin motivo para empezar en ella.
- *Vue + Vite (SPA):* no cumple SSR (C-01).
- *`@nuxt/fonts` con descarga automática:* menos predecible; los paquetes `@fontsource-variable` son deterministas y funcionan offline.

## Cambios por capa
- **Producto:** definir tokens de la dirección **Mostrador** (ver abajo).
- **Front (Nuxt + PrimeVue):** `package.json`, `nuxt.config.ts` (SSR, módulo PrimeVue, CSS global, `lang`), `app/app.vue`, `app/app.config.ts` (nombre de tienda), `app/assets/css/` (variables y tipografías), `app/theme/mostrador.ts` (preset PrimeVue). `.gitignore` con `node_modules`, `.nuxt`, `.output`, `.data`.
- **Server routes de Nuxt (Nitro):** Sin cambios (solo el servidor de SSR).
- **Pagos (Mercado Pago):** Sin cambios.
- **Mails:** Sin cambios.
- **SEO:** Sin cambios (fase 4). Solo `lang` y `title` provisorio.
- **Data:** Sin cambios.
- **DB:** no aplica a este repo (C-02). No hay migraciones.
- **Infra:** Sin cambios (host en fase 4).
- **Observabilidad:** Sin cambios.

### Tokens de la dirección Mostrador `[PROPUESTA]`
| Token | Valor |
|---|---|
| Verde bosque (principal) | `#1F3D2B` |
| Crema (fondo) | `#F6F0E4` |
| Kraft (fondo alterno) | `#E7DAC0` |
| Ladrillo (acento) | `#B5432A` |
| Tinta (texto) | `#22201C` |
| Títulos | Fraunces (variable) |
| Texto | DM Sans (variable) |
| Radio de esquinas | 12 px (cards), 999 px (botones tipo pastilla) |

## Verificación de constraints
| Constraint | ¿Aplica? | Cómo se cumple |
|---|---|---|
| C-01 (SSR) | Sí | `ssr: true` en `nuxt.config.ts`; se verifica con `curl` a `/`. |
| C-02 (sin backend ni DB) | Sí | Sin servicios propios; solo el servidor de SSR de Nuxt. |
| C-03 (Mercado Pago) | No | Sin pagos. |
| C-04 (PrimeVue) | Sí | `@primevue/nuxt-module` instalado y con preset propio. |
| C-05 | Sin definir | `<pendiente>`. |

## Testing
- Verificación manual: `npm run dev`, `curl` a `/`, revisión en navegador de tokens y tipografías.
- `npm run build` termina sin errores.
- Sin tests automáticos de UI en esta fase. `[PROPUESTA]`

## Feature flag
No aplica.

## Rollout
Merge a la rama que se defina (Q-11). Sin despliegue.

## Rollback
Revertir el commit; la fase 1 queda intacta.

## Riesgos
- Node 25.2.1 fuera del rango declarado por Nuxt. Resultado: Nuxt 4.4.5 funciona; ver Q-16 para el camino a las 4.6.x.
- PrimeVue 5 y `@primeuix/themes` 3 son más nuevos que mi conocimiento previo: la API del preset puede diferir. Mitigación: leer la documentación instalada en `node_modules` antes de escribir el preset.
- Conflicto de `sdd/` dentro del repo (Q-01): Nuxt escanea la raíz; hay que excluir `sdd/` si molesta (p. ej. `ignore` en `nuxt.config.ts`).

## Cambios respecto del plan original (implementación, 2026-11-10)
- **PrimeVue 4.5.5 en lugar de 5.0.4.** PrimeVue 5 pide clave de licencia PrimeUI y sin ella muestra el cartel rojo "Invalid PrimeUI License" en la página. Decisión del usuario: bajar a la 4.x (MIT). Ver `applications/ecommerce_prueba/decisions/ADR-002-primevue-4-por-licencia.md`. `[VERIFICADO]`
- **Nuxt 4.4.5 en lugar de 4.6.4.** npm eligió 4.4.5 porque las 4.6.x declaran `engines` `^22.22.3 || ^24.15.0 || >=26.0.0` y la máquina tiene Node 25.2.1. Las versiones ≤ 4.6.2 tienen avisos de `npm audit` (Q-16). `[VERIFICADO]`
- Nombre de tienda provisorio: "Tu Ferretería" (en `app/app.config.ts`).
- Verificación: `npm run dev` responde 200; `curl /` trae `lang="es-AR"`, el `<h1>` y el `<button>` de PrimeVue renderizados en el servidor; sin avisos de licencia; `npm run build` en verde; 0 referencias a Google Fonts en el build. `[VERIFICADO]`
