# Preguntas abiertas — prueba_pagina

Formato: pregunta · por qué importa · a qué documento va la respuesta.

| ID | Pregunta | Por qué importa | Va a |
|---|---|---|---|
| Q-01 | ¿Quién es el referente de la app? | Para escalar decisiones | `applications/prueba_pagina.md` |
| Q-02 | ¿Hay constraints del equipo para esta app? | Hoy `constraints.md` solo tiene `C-01 <pendiente>` | `constitution/constraints.md` |
| Q-03 | ¿Cuál es el destinatario real de los mails (`DESTINATARIO`) y qué cuenta hace el deploy del Apps Script? | El repo solo tiene un placeholder (`tu-email@gmail.com`) | `integrations.md` |
| Q-04 | ¿La URL pública de `SCRIPT_URL` hardcodeada en el repo es un riesgo aceptado? Cualquiera puede enviar mails por ese endpoint (sin autenticación ni límite) | Spam y abuso de cuota de Gmail | `constitution/principles.md` / ADR |
| Q-05 | ¿`apps-script-code.gs` debe estar versionado? El README dice que no se sube | Contradice la documentación y se publica en Pages (`path: .`) | `conventions.md` |
| Q-06 | ¿Se quiere seguir con `console.log` del payload (datos personales)? | Privacidad | `constitution/principles.md` |
| Q-07 | ¿Qué runtime usa el Apps Script (V8 u otro)? | Versión exacta del stack | `constitution/tech-stack.md` |
| Q-08 | ¿Se va a pasar a dominio propio? ¿Cuál? | Hay que actualizar 4 lugares de SEO | `integrations.md` |
| Q-09 | ¿La rama `OptimizacionSEO` se mergea o se descarta (1 commit adelante de `main`)? | Estado del flujo de ramas | `conventions.md` |
| Q-10 | ¿Los mails `ventas@test.com` / `info@test.com` de `llms.txt` son placeholders? | Datos públicos incorrectos | `integrations.md` |
| Q-11 | ¿Existe un ambiente previo a producción? Hoy todo push a `main` va a producción | Flujo de ambientes | `applications/prueba_pagina.md` |
| Q-12 | ¿Quién es el responsable de la cuenta de Google Search Console? | Operación SEO | `integrations.md` |
| Q-13 | Se evaluó Mailflare (2026-11-10) como reemplazo del envío por Apps Script y se **descartó por ahora**; `prueba_pagina` sigue con Apps Script. El plan es pasar más adelante a Resend. ¿Cómo se protege la API key en un sitio estático sin backend? (la key no puede ir en `script.js`; hace falta un intermediario: Worker chico, Apps Script que llame a Resend, u otro) | Seguridad del envío y abuso por endpoint público | `integrations.md`, ADR |""")
