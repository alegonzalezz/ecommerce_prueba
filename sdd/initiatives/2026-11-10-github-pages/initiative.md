---
slug: 2026-11-10-github-pages
title: Publicar la tienda como sitio estático en GitHub Pages (sin pago)
author: agonzalezz
status: en producción                    # borrador | aprobada | en desarrollo | en QA | en producción | descartada
apps:
  - name: ecommerce_prueba
    why: Es la tienda; hay que poder construirla como sitio estático y publicarla en Pages
    depends_on: []
---

# Iniciativa: Publicar la tienda como sitio estático en GitHub Pages (sin pago)

> Spec funcional única. Cada app afectada recibe una porción en `specs/<YYYY-MM-DD-fase>/<app>/spec.md`.
> Los repos de código no llevan `.sdd/`: solo código. Las tareas viven en el `tasks.md` de cada spec.

Origen: pedido del usuario del 2026-11-10 ("commit, push y ajustá para que el proyecto entre en las GitHub Pages"). Con dos respuestas: se publica una **versión estática sin pago** (el usuario aceptó que el pago no puede funcionar en Pages) y se sube también `sdd/` al repositorio público.

## Contexto
- **Qué pasa si no hacemos nada:** el proyecto solo corre en local o en un host con servidor. `[VERIFICADO]` `package.json`, no hay workflow de despliegue.
- **Límite de GitHub Pages:** sirve solo archivos estáticos; no ejecuta rutas de servidor. La tienda usa rutas de servidor para el pago (guardan el token de Mercado Pago, C-03) y para el estado. `[VERIFICADO]` `server/api/`; límite de Pages `[INFERIDO]` documentación de GitHub.
- **Constraints:** C-01 se mantiene (`ssr: true`): el HTML lo genera el mismo renderizador, pero **al construir** y no por pedido. C-02 se cumple. C-03 (Mercado Pago) **no aplica en Pages**: sin servidor no hay forma segura de usar el token; el pago sigue disponible en cualquier host con servidor. `[PROPUESTA]` aprobado por el usuario el 2026-11-10.
- **URL:** `https://alegonzalezz.github.io/ecommerce_prueba/` (sitio de proyecto, en una subcarpeta). El repositorio es público y estaba vacío. `[VERIFICADO]` `gh repo view`.
- **Decisiones del asistente (el usuario las puede vetar):**
  - Mismo código para todos los destinos; lo que cambia se define con variables de entorno (por defecto, el comportamiento actual).
  - El despliegue corre los tests y la validación del catálogo antes de publicar.
  - Páginas con URL sin barra final (`/producto/x`), como las que ya declaran el `canonical` y el sitemap.
  - Se agrega un `README.md` con los comandos y el enlace al sitio.

## User stories
- Como visitante quiero entrar a la tienda por una URL pública y navegarla completa (home, fichas, carrito).
- Como equipo quiero publicar con un `push` a `main`, sin pasos manuales.
- Como equipo quiero que el mismo código siga funcionando con pago en un host con servidor.

## Criterios de aceptación
Todos `[EC]` (`ecommerce_prueba`).
- **Given** un `push` a `main`, **Then** GitHub Actions corre los tests y la validación del catálogo, construye el sitio estático y lo publica en Pages; si algo falla, no publica.
- **Given** el sitio publicado en la subcarpeta `/ecommerce_prueba/`, **Then** todas las imágenes, estilos, fuentes y enlaces funcionan: ningún recurso de la propia tienda da 404 al cargar la home, una ficha y el carrito.
- **Given** un enlace directo a `/producto/<slug>` de un producto existente, **Then** carga (200); **Given** un slug inexistente, **Then** Pages responde 404 con la página de error de la tienda.
- **Given** la navegación dentro de la tienda (cards, menú, migas, carrito), **Then** funciona sin recargar y los enlaces a secciones de la home (`/#nuevo`) llevan al lugar correcto.
- **Given** la versión de Pages, **Then** el carrito y los vistos recientemente funcionan igual (viven en el navegador).
- **Given** la versión de Pages, **Then** "Finalizar compra" está deshabilitado y la pantalla dice que el pago online no está disponible en esta versión de demostración; no se hace ninguna llamada a `/api/*`.
- **Given** la ficha y la home publicadas, **Then** `canonical`, Open Graph, datos estructurados, `sitemap.xml` y `llms.txt` usan la URL de Pages (con la subcarpeta).
- **Given** el mismo código construido sin esas variables, **Then** se comporta como hasta ahora (raíz `/`, pago disponible).
- **Given** el repositorio, **Then** ningún secreto está en el workflow ni hace falta ninguno.
- **Given** el sitio en Pages, **Then** Lighthouse móvil: Performance ≥ 90.

## Casos borde y errores
- Un producto nuevo en el JSON: aparece en la próxima publicación (la ficha, el sitemap y `llms.txt` se generan al construir).
- El catálogo roto: la validación frena la publicación.
- Un enlace con barra final (`/producto/x/`): Pages podría no resolverlo; los enlaces propios nunca la llevan.
- `/compra/resultado` abierta en Pages: dice que no hay una compra para verificar.

## Comportamiento por país
Solo Argentina.

## Fuera de alcance
- Pago, webhooks y cualquier ruta de servidor en Pages.
- Dominio propio y certificados (Q-09).
- Un host con servidor para la versión completa (Q-05).

## Impacto en métricas
- **Qué medimos:** recursos 404 al cargar, códigos de respuesta de las fichas y del slug inexistente, el verificador de SEO contra el sitio publicado y Lighthouse.
- **Cómo sabemos si salió mal:** imágenes rotas, enlaces que salen de la subcarpeta, o un botón de pago que parece funcionar y no.

## Contratos entre apps
| Contrato | Productor | Consumidor | Breaking |
|---|---|---|---|
| Variables `NUXT_APP_BASE_URL`, `NUXT_PUBLIC_SITE_URL`, `NUXT_PUBLIC_PAGO_DISPONIBLE` | workflow de Pages | la construcción | No: sin ellas, se comporta como antes |

## Orden de despliegue y rollback
Una sola fase: `publicacion-estatica`. Rollback: desactivar Pages en la configuración del repositorio o revertir el commit.

## Preguntas abiertas
- `robots.txt`, `sitemap.xml` y `llms.txt` quedan bajo la subcarpeta; los buscadores solo leen `robots.txt` en la raíz del dominio (Q-35).
- El pago en un host con servidor (Q-05, Q-32).
