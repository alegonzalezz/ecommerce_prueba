# Spec: Prueba con credenciales reales del sandbox

- **Fecha:** 2026-11-10
- **Autor:** agonzalezz
- **Iniciativa:** `initiatives/2026-11-10-mercadopago-sandbox/initiative.md`
- **Estado:** borrador   <!-- borrador | en revisión | aprobada | implementada | descartada -->
- **Plan:** [plan.md](plan.md) · **Tareas:** [tasks.md](tasks.md)

> En borrador hasta que haya credenciales de prueba. Ninguna tarea de código arranca con esta spec en estado `borrador`.


## Contexto
- **Qué pasa si no hacemos nada:** todo lo anterior se probó contra un Mercado Pago simulado escrito a partir de la documentación; nada garantiza que la API real responda igual.
- **Situación actual:** no hay credenciales. `[VERIFICADO]` respuesta del usuario del 2026-11-10.

## User stories
- Como equipo quiero confirmar contra el sandbox real que todo funciona, y dejar anotado qué difiere de lo esperado.

## Criterios de aceptación
- **Given** una aplicación de Mercado Pago con credenciales de prueba en `.env`, **When** pago con la tarjeta de prueba que aprueba, **Then** vuelvo a la tienda con "Pago aprobado" y el carrito vacío.
- **Given** la tarjeta de prueba que rechaza, **Then** vuelvo con el estado real y el carrito conservado.
- **Given** la tarjeta de prueba que deja el pago pendiente, **Then** veo el estado pendiente.
- **Given** una orden creada, **Then** aparece en el panel de Mercado Pago con la referencia y el total esperados.
- **Given** los resultados reales, **Then** se documenta cada diferencia con lo que asumimos (campos, parámetros de retorno, estados, errores, dominios, `localhost`).

### Casos borde
- Si Mercado Pago rechaza las URLs de retorno por ser `localhost`: se usa un túnel o un dominio y se documenta.

### Comportamiento por país
Solo Argentina.

## Fuera de alcance
- Producción y webhooks.

## Impacto en métricas
- **Qué medimos:** cada escenario contra el sandbox.
- **Cómo sabemos si salió mal:** cualquier diferencia con lo asumido.

## Dependencias
- Fases 1 a 3 cerradas y credenciales cargadas por el usuario.

## Preguntas abiertas de esta spec
- ¿Qué tarjetas de prueba y qué datos exige hoy el sandbox de Argentina? Se toman de la documentación vigente al probar.

