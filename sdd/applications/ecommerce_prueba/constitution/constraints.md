# Constraints — ecommerce_prueba

Fuente de las filas C-01 a C-04: lo dicho por el usuario en la conversación del 2026-11-10 (no hay archivo previo). No se agregó ninguna regla por inferencia.

| ID | Regla (verificable, una línea) | Por qué | Cómo se verifica |
|---|---|---|---|
| C-01 | La app se renderiza con SSR. | Decisión del equipo (2026-11-10). | `<pendiente>`: revisar el modo de render en la config del framework cuando exista. |
| C-02 | No hay backend separado ni base de datos propia: todo el código vive en este repo (front + server routes del propio framework). | Decisión del equipo (2026-11-10). | `<pendiente>`: ausencia de otro servicio/DB en la arquitectura. |
| C-03 | Los pagos se hacen con Mercado Pago; se trabaja en sandbox hasta que el equipo decida pasar a producción. | Decisión del equipo (2026-11-10). | `<pendiente>`: credenciales usadas en cada ambiente. |
| C-04 | La UI se arma con PrimeVue. | Decisión del equipo (2026-11-10). | `<pendiente>`: dependencia en el manifiesto cuando exista. |
| C-05 | <pendiente> | <pendiente> | <pendiente> |

*Las constraints las define el equipo, no se infieren del código.*
