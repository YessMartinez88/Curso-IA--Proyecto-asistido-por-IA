/**
 * @archivo lib/fortnight-agenda-demo.ts
 * @descripcion Utilidad, proveedor o fuente de datos compartida por las pantallas.
 */
import type { DemoRole } from "@/constants/brand";

export type ScheduleEvent = {
  id: string;
  time: string;
  title: string;
  detail: string;
  tag: string;
};

export type ScheduledDay = {
  id: string;
  weekday: string;
  day: string;
  fullLabel: string;
  isToday?: boolean;
  classes: ScheduleEvent[];
};

const dates = [
  ["2026-08-14", "Mié", "14", "Miércoles 14 de agosto"],
  ["2026-08-15", "Jue", "15", "Jueves 15 de agosto"],
  ["2026-08-16", "Vie", "16", "Viernes 16 de agosto"],
  ["2026-08-17", "Sáb", "17", "Sábado 17 de agosto"],
  ["2026-08-18", "Dom", "18", "Domingo 18 de agosto"],
  ["2026-08-19", "Lun", "19", "Lunes 19 de agosto"],
  ["2026-08-20", "Mar", "20", "Martes 20 de agosto"],
  ["2026-08-21", "Mié", "21", "Miércoles 21 de agosto"],
  ["2026-08-22", "Jue", "22", "Jueves 22 de agosto"],
  ["2026-08-23", "Vie", "23", "Viernes 23 de agosto"],
  ["2026-08-24", "Sáb", "24", "Sábado 24 de agosto"],
  ["2026-08-25", "Dom", "25", "Domingo 25 de agosto"],
  ["2026-08-26", "Lun", "26", "Lunes 26 de agosto"],
  ["2026-08-27", "Mar", "27", "Martes 27 de agosto"],
] as const;

const studentEvents: Record<number, ScheduleEvent[]> = {
  0: [
    { id: "student-1", time: "18:30", title: "Bases de Datos I", detail: "Laboratorio 3 · Prof. Laura Méndez", tag: "Hoy" },
    { id: "student-2", time: "20:15", title: "Programación II", detail: "Aula 204 · Prof. Andrés Gil", tag: "Hoy" },
  ],
  2: [{ id: "student-3", time: "18:30", title: "Redes y Conectividad", detail: "Laboratorio 1 · Prof. Valeria Soto", tag: "Clase" }],
  5: [{ id: "student-4", time: "20:15", title: "Programación II", detail: "Aula 204 · Prof. Andrés Gil", tag: "Clase" }],
  7: [
    { id: "student-5", time: "18:30", title: "Bases de Datos I", detail: "Laboratorio 3 · Prof. Laura Méndez", tag: "Clase" },
    { id: "student-6", time: "20:15", title: "Programación II", detail: "Aula 204 · Prof. Andrés Gil", tag: "Clase" },
  ],
  9: [{ id: "student-7", time: "18:30", title: "Redes y Conectividad", detail: "Laboratorio 1 · Prof. Valeria Soto", tag: "Clase" }],
  12: [{ id: "student-8", time: "20:15", title: "Programación II", detail: "Aula 204 · Prof. Andrés Gil", tag: "Clase" }],
};

const teacherEvents: Record<number, ScheduleEvent[]> = {
  0: [
    { id: "teacher-1", time: "18:30", title: "Programación II · 2° B", detail: "Aula 204 · 32 alumnos", tag: "Abrir" },
    { id: "teacher-2", time: "20:15", title: "Bases de Datos I · 1° A", detail: "Laboratorio 3 · 28 alumnos", tag: "Luego" },
  ],
  2: [{ id: "teacher-3", time: "18:30", title: "Proyecto Integrador · 3° A", detail: "Laboratorio 2 · 24 alumnos", tag: "Clase" }],
  5: [{ id: "teacher-4", time: "20:15", title: "Bases de Datos I · 1° A", detail: "Laboratorio 3 · 28 alumnos", tag: "Clase" }],
  7: [
    { id: "teacher-5", time: "18:30", title: "Programación II · 2° B", detail: "Aula 204 · 32 alumnos", tag: "Clase" },
    { id: "teacher-6", time: "20:15", title: "Bases de Datos I · 1° A", detail: "Laboratorio 3 · 28 alumnos", tag: "Clase" },
  ],
  9: [{ id: "teacher-7", time: "18:30", title: "Proyecto Integrador · 3° A", detail: "Laboratorio 2 · 24 alumnos", tag: "Clase" }],
  12: [{ id: "teacher-8", time: "20:15", title: "Bases de Datos I · 1° A", detail: "Laboratorio 3 · 28 alumnos", tag: "Clase" }],
};

const administrativeEvents: Record<number, ScheduleEvent[]> = {
  0: [
    { id: "admin-1", time: "18:30", title: "Programación II · 2° B", detail: "Aula 204 · Docente: Laura Méndez", tag: "Activa" },
    { id: "admin-2", time: "20:15", title: "Bases de Datos I · 1° A", detail: "Laboratorio 3 · Docente: Andrés Gil", tag: "Activa" },
  ],
  2: [{ id: "admin-3", time: "18:30", title: "Redes y Conectividad · 2° A", detail: "Laboratorio 1 · Docente: Valeria Soto", tag: "Activa" }],
  5: [{ id: "admin-4", time: "20:15", title: "Programación II · 2° B", detail: "Aula 204 · Docente: Laura Méndez", tag: "Activa" }],
  7: [
    { id: "admin-5", time: "18:30", title: "Bases de Datos I · 1° A", detail: "Laboratorio 3 · Docente: Andrés Gil", tag: "Activa" },
    { id: "admin-6", time: "20:15", title: "Proyecto Integrador · 3° A", detail: "Laboratorio 2 · Docente: Valeria Soto", tag: "Activa" },
  ],
  9: [{ id: "admin-7", time: "18:30", title: "Redes y Conectividad · 2° A", detail: "Laboratorio 1 · Docente: Valeria Soto", tag: "Activa" }],
  12: [{ id: "admin-8", time: "20:15", title: "Programación II · 2° B", detail: "Aula 204 · Docente: Laura Méndez", tag: "Activa" }],
};

/**
 * Construye la estructura o resultado requerido por FortnightAgenda.
 */
export function buildFortnightAgenda(role: DemoRole): ScheduledDay[] {
  const events = role === "alumno" ? studentEvents : role === "docente" ? teacherEvents : administrativeEvents;
  return dates.map(([id, weekday, day, fullLabel], index) => ({
    id,
    weekday,
    day,
    fullLabel,
    isToday: index === 0,
    classes: events[index] ?? [],
  }));
}

/**
 * Implementa la operación classesForDay dentro de este módulo.
 */
export function classesForDay(days: ScheduledDay[], dayId: string) {
  return days.find((day) => day.id === dayId)?.classes ?? [];
}

