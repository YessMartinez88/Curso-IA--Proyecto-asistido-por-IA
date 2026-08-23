# Diseño de interfaz — Asistencia Instituto

## Enfoque de experiencia móvil

La aplicación se diseña en orientación **vertical 9:16**, para uso frecuente con una sola mano. La interfaz debe sentirse nativa en iOS: jerarquías claras, títulos legibles, acciones prioritarias cercanas al pulgar, controles de tamaño cómodo y retroalimentación inmediata. La primera versión presentará datos locales de demostración, pero toda la arquitectura visual será compatible con los flujos reales de alumnos, docentes y administrativos.

La navegación inicial será deliberadamente simple. Una pantalla de acceso permite elegir un perfil de demostración y, una vez dentro, la navegación inferior concentra cuatro destinos. Cada perfil mostrará una acción primaria distinta: registrar asistencia para el alumno, abrir clase para el docente y crear comisión para el administrativo.

## Paleta de colores

| Uso | Color | Aplicación |
|---|---|---|
| Azul noche | `#0B1F3A` | Barra superior, texto de mayor jerarquía, iconos activos y navegación. |
| Azul institucional | `#173B66` | Superficies destacadas, cabeceras internas y estados activos. |
| Azul hielo | `#EAF1F8` | Tarjetas informativas, filtros seleccionados y fondos de secciones. |
| Plata | `#D7DEE8` | Bordes, separadores y controles secundarios. |
| Blanco | `#FFFFFF` | Fondo principal, tarjetas y campos de formulario. |
| Amarillo acento | `#F4C542` | Acción principal, avisos de atención y puntos de actividad. |
| Verde | `#2E8B70` | Confirmaciones, asistencia presente y estados aprobados. |
| Rojo | `#C95353` | Errores, ausencias y estados rechazados. |

El amarillo debe ser un detalle funcional, no un color dominante. El fondo de la aplicación permanecerá blanco o azul hielo muy suave para preservar sobriedad institucional.

## Lista de pantallas

| Pantalla | Contenido y funcionalidad principal | Rol |
|---|---|---|
| Acceso | Identidad del instituto, ingreso y selección de perfil de demostración. | Todos |
| Inicio alumno | Resumen del día, próxima clase, porcentaje de asistencia, novedades académicas y CTA para QR. | Alumno |
| Asistencia QR | Marco de escaneo, instrucciones breves, permiso de cámara y simulación de validación. | Alumno |
| Agenda alumno | Materias, día, horario, aula o laboratorio y acceso a detalle. | Alumno |
| Historial alumno | Registros de asistencia, estados, justificaciones y acceso a crear solicitud. | Alumno |
| Evaluaciones alumno | Notas publicadas, fechas de evaluación, trabajos prácticos y devoluciones. | Alumno |
| Inicio docente | Clases del día, sesión próxima y CTA para abrir clase. | Docente |
| Sesión docente | Código QR, cuenta regresiva, lista de asistencia y controles para cerrar la sesión. | Docente |
| Comisiones docente | Materias y comisiones asignadas, asistencia, evaluaciones y trabajos prácticos. | Docente |
| Inicio administrativo | Resumen institucional con comisiones activas, incidencias y accesos de gestión. | Administrativo |
| Comisiones administrativo | Lista, búsqueda y alta de comisiones; asignación de aula y docente. | Administrativo |
| Perfil | Datos de sesión, rol activo y salida segura. | Todos |

## Flujos principales

### Alumno: registro de asistencia

El alumno inicia sesión, llega a su panel de inicio y utiliza el CTA amarillo “Registrar asistencia”. Se abre el lector QR, se valida la sesión activa y se presenta una confirmación con materia, aula y hora registrada. Desde el historial puede consultar la asistencia o crear una justificación para una inasistencia.

### Docente: apertura de clase

El docente abre la aplicación y ve la próxima clase en la parte superior. Al tocar “Abrir clase”, ingresa a la sesión activa con el QR de asistencia, el contador de registros y la lista de alumnos. Al finalizar, cierra la sesión y el QR pierde validez.

### Administrativo: configuración de comisión

El administrativo accede a Inicio, elige “Gestionar comisiones” y visualiza las comisiones actuales. Puede crear una comisión, asignar materia, docente, aula y horario. Las opciones de asistencia y justificaciones quedan accesibles como gestión posterior.

## Reglas de composición

La barra superior tendrá fondo blanco, título en azul noche y avatar pequeño a la derecha. Las tarjetas usarán borde plata de 1 px, radio de 16 px y sombra mínima. La navegación inferior tendrá fondo blanco, iconos azul noche cuando estén activos y texto auxiliar gris. Los botones de acción primaria se ubicarán en la mitad inferior o el borde inferior de la pantalla para favorecer el alcance del pulgar.

Las listas expondrán un título, un dato auxiliar, un estado visible con texto y color, y una flecha cuando exista detalle. Los formularios se presentarán en bloques cortos, con etiquetas siempre visibles y ayudas debajo del campo cuando la decisión requiera contexto.

## Accesibilidad

Se mantendrá contraste alto entre texto y fondo, tamaños de toque de al menos 44 puntos para acciones relevantes, etiquetas textuales junto a iconos críticos y estados comunicados mediante color y texto. Los indicadores de asistencia, evaluaciones y justificaciones no dependerán únicamente de un color para transmitir significado.
