# Spec: Almacenamiento local con vencimiento

- **Fecha:** 2026-11-10
- **Autor:** agonzalezz
- **Iniciativa:** `initiatives/2026-11-10-carrito-persistente/initiative.md`
- **Estado:** implementada   <!-- borrador | en revisión | aprobada | implementada | descartada -->
- **Plan:** [plan.md](plan.md) · **Tareas:** [tasks.md](tasks.md)

> Aprobada por el usuario el 2026-11-10 ("OK, creá las specs y construí las 3 fases"). Ninguna tarea de código arranca con esta spec en estado `borrador`.


## Contexto
- **Qué pasa si no hacemos nada:** cada función que quiera recordar algo (carrito, vistos) reimplementaría el vencimiento, el manejo de errores y la lectura segura con SSR, con riesgo de errores de hidratación.
- **Situación actual en el código:** no hay ningún uso de almacenamiento del navegador. `prueba_pagina` guarda el tema oscuro en `localStorage` sin vencimiento. `[VERIFICADO]` `grep` en `app/`, `shared/`, `server/`; `prueba_pagina/script.js:96-105`.
- `localStorage` no vence solo: el vencimiento se guarda como dato y se comprueba al leer. `[VERIFICADO]` comportamiento estándar del navegador.

## User stories
- Como desarrollador quiero una única forma de guardar datos en el navegador con vencimiento, para que carrito y vistos se comporten igual y no rompan la página.

## Criterios de aceptación
- **Given** datos guardados, **When** se leen antes de vencer, **Then** se devuelven tal cual.
- **Given** datos guardados, **When** se leen después de vencer, **Then** se devuelve vacío y la clave se elimina.
- **Given** una escritura, **Then** el vencimiento se fija en ahora + 2 horas (constante única); una lectura **no** lo renueva.
- **Given** datos con otra versión, JSON inválido o que no pasan la validación del llamador, **When** se leen, **Then** se devuelve vacío y se eliminan.
- **Given** un navegador sin `localStorage` o que lanza error al escribir (cuota, modo privado), **Then** no se produce ninguna excepción y los datos siguen en memoria durante la sesión.
- **Given** la página renderizada en el servidor, **Then** el HTML no depende de lo guardado: la lectura ocurre recién al montar en el navegador.
- **Given** dos pestañas, **When** una escribe, **Then** la otra relee (evento `storage`).
- **Given** una pestaña que vuelve a estar visible, **Then** relee y descarta lo vencido.

### Casos borde
- Clave inexistente: vacío, sin error.
- Datos válidos pero con `expiraEn` no numérico: se descartan.
- Reloj del sistema atrasado o adelantado: se usa `Date.now()` del navegador; no se corrige.

### Comportamiento por país
No aplica.

## Fuera de alcance
- Cifrado de lo guardado, sincronización entre dispositivos, `IndexedDB`, cookies.

## Impacto en métricas
- **Qué medimos:** tests con un almacén falso y pruebas en el navegador (recarga, vencimiento adelantado, pestañas).
- **Cómo sabemos si salió mal:** errores de hidratación en consola, datos que no vencen o excepciones con el almacenamiento bloqueado.

## Dependencias
- Ninguna.

## Preguntas abiertas de esta spec
- Ninguna: la duración (2 h) y la renovación en cada cambio salen de lo decidido.

