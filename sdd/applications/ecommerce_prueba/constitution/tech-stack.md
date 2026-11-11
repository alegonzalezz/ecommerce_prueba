# Stack — ecommerce_prueba

Versiones leídas de `package.json` y de `node_modules` el 2026-11-10.

| Capa | Tecnología | Versión | Evidencia |
|---|---|---|---|
| Framework | Nuxt (SSR, `ssr: true`) | 4.4.5 | `package.json`, `nuxt.config.ts` `[VERIFICADO]` |
| Núcleo | Vue / vue-router | 3.5.45 / 5.5.0 | `package.json` `[VERIFICADO]` |
| UI | PrimeVue | 4.5.5 (fija) | `package.json`; ver `decisions/ADR-002-primevue-4-por-licencia.md` `[VERIFICADO]` |
| UI (módulo y temas) | `@primevue/nuxt-module` / `@primeuix/themes` | 4.5.5 / 2.0.3 (fijas) | `package.json` `[VERIFICADO]` |
| Tema | Preset propio "Mostrador" sobre Aura | — | `app/theme/mostrador.ts` `[VERIFICADO]` |
| Tipografías | `@fontsource-variable/fraunces`, `@fontsource-variable/dm-sans` (autoalojadas) | ^5.3.0 | `package.json`, `nuxt.config.ts`; 0 pedidos a Google Fonts `[VERIFICADO]` |
| Lenguaje | TypeScript (tipos en `app/types/`) | — | `app/types/catalogo.ts` `[VERIFICADO]` |
| Datos | JSON versionado + JSON Schema | draft-07 | `data/catalogo.json`, `data/catalogo.schema.json` `[VERIFICADO]` |
| Validación (dev) | `ajv` | ^8.20.0 | `package.json`, `scripts/validar-catalogo.mjs` `[VERIFICADO]` |
| Imágenes (dev) | `sharp` (genera placeholders `.webp`) | ^0.35.5 | `package.json`, `scripts/generar-placeholders.mjs` `[VERIFICADO]` |
| Tests | `node:test` (incorporado en Node) | — | `package.json` script `test` `[VERIFICADO]` |
| Runtime de desarrollo | Node | 25.2.1 (máquina del autor) | `node --version`; `engines` de Nuxt 4.4.5: `^20.19.0 \|\| >=22.12.0` `[VERIFICADO]` |
| Gestor de paquetes | npm | 11.6.2 | `npm --version`, `package-lock.json` `[VERIFICADO]` |
| Pagos | Mercado Pago, sandbox primero | `<pendiente>` | `[PROPUESTA]` dicho por el usuario (2026-11-10) |
| Mails | `<pendiente>` | — | ver `open-questions.md` Q-04 |
| Hosting | Host con Node para SSR | `<pendiente>` | ver Q-05 |
