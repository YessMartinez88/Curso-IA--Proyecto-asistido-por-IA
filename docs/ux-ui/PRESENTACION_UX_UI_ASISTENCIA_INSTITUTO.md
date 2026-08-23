# Presentación UX/UI — Asistencia Instituto

## Dirección visual global

- **Formato:** 16:9, sobrio, académico y visualmente limpio.
- **Marca:** azul noche `#0B1F3A`, gris plata `#D7DEE8`, blanco `#FFFFFF`, amarillo `#F4C542`, verde `#2E8B70` y rojo `#C95353`.
- **Tipografía:** sans serif moderna; jerarquía clara, poco texto por diapositiva y tarjetas con bordes suaves.
- **Narrativa:** problema institucional → solución por roles → decisiones UX/UI → IA como copiloto → validación y próximos pasos.

---

## Diapositiva 1 — Portada

**Título:** Asistencia Instituto

**Subtítulo:** MVP móvil para gestión de asistencia y seguimiento académico

**Bajada:** Informe UX/UI · Proyecto desarrollado con asistencia de IA

**Visual:** fondo azul noche, ícono sencillo de asistencia, acento amarillo y una línea institucional: “Instituto de Informática”.

**Nota de exposición:** Presentar el proyecto como una respuesta móvil a un problema académico cotidiano: asistencia, actividades y trazabilidad en un solo recorrido.

---

## Diapositiva 2 — El problema

**Título:** ¿Qué problema resuelve?

**Mensaje central:** La información académica suele estar fragmentada entre listas, planillas, mensajes y registros aislados.

**Cuatro bloques de problema:**

1. **Asistencia lenta o ambigua:** registrar presencia demanda tiempo y puede generar duplicados.
2. **Información dispersa:** cada materia, nota, tarea y ausencia aparece en un lugar distinto.
3. **Entregas sin trazabilidad:** no siempre es evidente qué se entregó, qué falta revisar y cuál fue la devolución.
4. **Justificaciones informales:** faltan evidencia, estado y decisión explícita.

**Visual:** cuatro tarjetas con iconos de QR, carpeta, checklist y documento.

---

## Diapositiva 3 — La propuesta

**Título:** Una experiencia académica contextual

**Idea fuerza:** Cada usuario ve solo el contexto y las decisiones que le corresponden.

| Necesidad | Respuesta del MVP |
|---|---|
| Registrar presencia | Sesión QR temporal por comisión. |
| Comprender una materia | Detalle de clase con asistencia, actividades y nota. |
| Gestionar actividades | Publicación, adjuntos, entregas, calificación y devolución. |
| Resolver ausencias | Justificación con comentario/archivo y validación posterior. |

**Visual:** eje horizontal “clase → asistencia → actividad → seguimiento”.

---

## Diapositiva 4 — Diseño por roles

**Título:** Tres perfiles, tres responsabilidades

**Alumno · Sofía Ramírez**

- Ve sus clases, agenda, actividades, notas, historial y justificaciones.
- Registra presencia mediante QR y fundamenta inasistencias.

**Docente · Laura Méndez**

- Gestiona comisiones, abre QR, publica actividades y corrige entregas.
- Revisa justificaciones de sus grupos.

**Administrativo · Martina Costa**

- Crea/activa comisiones y consulta la operación académica.
- Valida justificaciones institucionales.

**Visual:** tres columnas con color y pictograma propio. Incluir la regla: “una identidad activa por vez”.

---

## Diapositiva 5 — Experiencia del Alumno

**Título:** Inicio centrado en las clases

**Flujo:** Inicio → Clase → Actividades / Asistencia / Nota → Historial

**Decisiones UX:**

- Las materias se presentan como tarjetas únicas, sin vistas rápidas duplicadas.
- Cada clase reúne asistencia, nota actual y actividades.
- Los estados académicos son explícitos: **pendiente**, **en revisión** y **cerrada**.
- El Registro de asistencia permite filtrar presentes, tardanzas, ausencias y justificados.

**Visual:** maqueta de tres tarjetas de clase y chips de estado.

---

## Diapositiva 6 — Asistencia y justificaciones

**Título:** Del QR a una justificación trazable

**Flujo de interacción:**

1. El docente abre una sesión QR temporal por comisión.
2. El alumno registra presencia desde su teléfono.
3. Ante una ausencia, el alumno abre su historial y crea una justificación.
4. Puede escribir un comentario, adjuntar una constancia de hasta 5 MB o combinar ambas opciones.
5. Docente o Administrativo aprueba/rechaza y deja una observación.

**Visual:** diagrama de cinco pasos con flechas; usar verde para “presencia” y amarillo para “en revisión”.

---

## Diapositiva 7 — Panel Docente

**Título:** Actividades dentro de cada comisión

**Crear una actividad:** nombre, descripción, fecha límite y adjunto.

**Revisar entregas:** archivo recibido, calificación y devolución.

**Principio UX:** La actividad no aparece como módulo aislado; nace dentro de la clase a la que pertenece.

**Visual:** dos tarjetas secuenciales: “Publicar” → “Revisar y calificar”, con un indicador de cantidad de entregas pendientes.

---

## Diapositiva 8 — Panel Administrativo

**Título:** Operación institucional y validación

**Funciones del rol:**

- Crear y completar comisiones en borrador.
- Activar comisiones cuando la información es suficiente.
- Consultar inscripciones y sesiones de asistencia.
- Revisar solicitudes de justificación con comentario, adjunto y decisión documentada.

**Criterio de permisos:** Administración no modifica calificaciones pedagógicas; se concentra en la trazabilidad institucional.

**Visual:** tablero de comisiones con estados “Borrador” / “Activa” y una tarjeta de justificación.

---

## Diapositiva 9 — Arquitectura de información

**Título:** Navegación simple, contexto claro

**Pestañas persistentes:** Inicio · Agenda · Asistencia · Perfil.

**Regla principal:** Las pantallas de detalle se abren solo cuando el usuario necesita profundizar; el cambio de identidad está concentrado en Perfil.

**Visual principal:** insertar el recurso local `/home/ubuntu/asistencia-mobile/docs/ux-ui/flujo-principal.png` ocupando la mayor parte de la diapositiva.

**Pie:** Alumno envía → Docente/Admin revisa → Alumno ve estado actualizado.

---

## Diapositiva 10 — Sistema visual y accesibilidad

**Título:** Una interfaz institucional, legible y táctil

**Paleta:**

- Azul noche `#0B1F3A`: jerarquía institucional y acciones principales.
- Amarillo `#F4C542`: llamadas a la acción y recordatorios.
- Verde `#2E8B70`: éxito, presencia y aprobación.
- Rojo `#C95353`: ausencia, rechazo y alerta.

**Criterios aplicados:**

- Color acompañado por iconos y etiquetas de texto.
- Tarjetas, espaciados y controles visibles para interacción móvil.
- Mensajes de carga, vacío, éxito y error que explican el siguiente paso.

**Referencia breve:** Apple HIG plantea interfaces intuitivas, perceptibles y adaptables; WCAG 2.2 organiza la accesibilidad en los principios perceptible, operable, comprensible y robusto. [1] [2]

---

## Diapositiva 11 — IA como copiloto de desarrollo

**Título:** IA: apoyo con validación humana

| Etapa | Aporte de IA | Decisión humana |
|---|---|---|
| Descubrimiento | Organización de requisitos y roles. | Definición del problema y alcance. |
| UX/UI | Alternativas de flujos, jerarquía y estados. | Ajustes iterativos sobre pantallas reales. |
| Desarrollo | Código, pruebas y documentación. | Revisión de recorridos y restauración de versiones estables. |
| Calidad | Diagnóstico de errores y auditoría de enlaces. | Validación de tipado y pruebas. |

**Cita destacada:** “La IA no reemplazó el criterio de producto: aceleró la exploración, pero las decisiones se verificaron y corrigieron en contexto.”

---

## Diapositiva 12 — Validación, límites y próximos pasos

**Título:** Estado del MVP y evolución

**Validado:**

- 36 pruebas automatizadas aprobadas.
- Tipado TypeScript sin errores.
- Flujos auditados: roles, QR, actividades, entregas, justificaciones y rutas.

**Límites actuales:**

- Falta prueba con usuarios reales del instituto.
- Falta auditoría formal de contraste, VoiceOver y Dynamic Type.
- Faltan notificaciones reales y política institucional de privacidad.

**Siguientes iteraciones:** notificaciones de vencimiento/decisión, entrega real de archivos del alumno y tablero administrativo de indicadores.

**Cierre:** “Asistencia Instituto convierte procesos académicos dispersos en recorridos móviles claros, trazables y orientados por rol.”

---

## Referencias

[1] Apple Human Interface Guidelines — Accessibility: https://developer.apple.com/design/human-interface-guidelines/accessibility

[2] W3C, Web Content Accessibility Guidelines (WCAG) 2.2: https://www.w3.org/TR/WCAG22/
