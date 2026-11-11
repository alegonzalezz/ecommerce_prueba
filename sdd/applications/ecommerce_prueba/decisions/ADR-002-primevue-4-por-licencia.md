# ADR-002: PrimeVue 4.5.5 (MIT) en lugar de PrimeVue 5 por la licencia

- **Fecha:** 2026-11-10
- **Estado:** aceptada
- **Autor:** agonzalezz (decisión tomada con el asistente)
- **Spec relacionada:** `initiatives/2026-11-10-landing-ferreteria/specs/2026-11-10-base-nuxt-tema/ecommerce_prueba/spec.md`

## Contexto
C-04 exige PrimeVue. La versión vigente (5.0.4) se distribuye bajo la *PrimeUI License*: pide una clave y, sin ella, muestra el cartel rojo "Invalid PrimeUI License" en la esquina de la página y avisa por consola ("PrimeUI license is not configured"). `[VERIFICADO]` captura de la app con PrimeVue 5.0.4 el 2026-11-10; `node_modules/primevue/umd/primevue.min.js`.

La licencia gratuita *Community* permite uso comercial solo si la organización tiene menos de 5 desarrolladores, menos de 10 empleados, menos de US$1M de facturación y menos de US$3M de capital externo. Fuente: https://primeui.dev/licenses/community (no verificado contra el contrato, `/eula/community`).

## Decisión
Usar `primevue@4.5.5`, `@primevue/nuxt-module@4.5.5` y `@primeuix/themes@2.0.3`, todas con licencia MIT `[VERIFICADO]` (`npm view`). Versiones fijadas sin `^`.

## Alternativas consideradas
- **PrimeVue 5 con licencia Community:** requiere que el usuario confirme que cumple los límites y tramite la clave.
- **PrimeVue 5 sin clave:** el cartel rojo quedaría en producción.

## Consecuencias
- **Ganamos:** sin clave, sin cartel, sin dudas de elegibilidad. C-04 se cumple.
- **Pagamos:** línea de versión anterior; hay que revisar si recibe correcciones de seguridad.
- **Pendiente:** decidir si se migra a la 5 más adelante (con su spec).

## Cómo se revierte
Instalar `primevue@5`, `@primevue/nuxt-module@5` y `@primeuix/themes@3`, y configurar la clave como variable de entorno del servidor.

## Impacto en los documentos permanentes
- [x] `constitution/tech-stack.md`
- [x] `open-questions.md`
