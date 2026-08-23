/**
 * @archivo lib/student-academic-demo.ts
 * @descripcion Utilidad, proveedor o fuente de datos compartida por las pantallas.
 */
export type AcademicItemType = "evaluation" | "practical_work";
export type AcademicItemStatus = "graded" | "scheduled" | "pending_submission" | "submitted";

export type SubjectGrade = {
  id: string;
  subject: string;
  grade: number | null;
  scale: string;
  state: "published" | "pending";
  detail: string;
};

export type AcademicItem = {
  id: string;
  subject: string;
  title: string;
  type: AcademicItemType;
  status: AcademicItemStatus;
  dateLabel: string;
  dueLabel?: string;
  grade?: number;
  scale?: string;
  description: string;
  feedback?: string;
  attachmentName?: string;
};

export const subjectGrades: SubjectGrade[] = [
  { id: "db", subject: "Bases de Datos I", grade: 8, scale: "8 / 10", state: "published", detail: "Promedio parcial" },
  { id: "prog", subject: "Programación II", grade: 9, scale: "9 / 10", state: "published", detail: "Promedio parcial" },
  { id: "network", subject: "Redes y Conectividad", grade: null, scale: "Sin nota", state: "pending", detail: "Aguardando primera evaluación" },
];

export const academicItems: AcademicItem[] = [
  {
    id: "eval-db-1",
    subject: "Bases de Datos I",
    title: "Primer parcial · Modelo entidad-relación",
    type: "evaluation",
    status: "graded",
    dateLabel: "08 ago. 2026",
    grade: 8,
    scale: "8 / 10",
    description: "Evaluación individual sobre modelado conceptual, entidades, atributos y cardinalidades.",
    feedback: "Buen manejo de cardinalidades. Revisá la normalización de la relación Pedido–Detalle.",
  },
  {
    id: "eval-prog-1",
    subject: "Programación II",
    title: "Evaluación práctica · Listas y colecciones",
    type: "evaluation",
    status: "graded",
    dateLabel: "05 ago. 2026",
    grade: 9,
    scale: "9 / 10",
    description: "Resolución de ejercicios de estructuras lineales y manejo de colecciones.",
    feedback: "Resolución clara y eficiente. La entrega superó los criterios esperados.",
  },
  {
    id: "eval-network-1",
    subject: "Redes y Conectividad",
    title: "Cuestionario de protocolos TCP/IP",
    type: "evaluation",
    status: "scheduled",
    dateLabel: "22 ago. 2026 · 18:30",
    description: "Cuestionario presencial sobre modelos de red, direccionamiento y protocolos de transporte.",
  },
  {
    id: "tp-db-2",
    subject: "Bases de Datos I",
    title: "TP 2 · Diseño lógico de una biblioteca",
    type: "practical_work",
    status: "pending_submission",
    dateLabel: "Publicado el 12 ago. 2026",
    dueLabel: "Vence el 16 ago. · 23:59",
    description: "Diseñá el modelo lógico, el diagrama relacional y una breve justificación de las decisiones tomadas.",
  },
  {
    id: "tp-prog-1",
    subject: "Programación II",
    title: "TP 1 · Gestor de tareas en consola",
    type: "practical_work",
    status: "submitted",
    dateLabel: "Entregado el 10 ago. 2026 · 21:42",
    dueLabel: "En corrección",
    description: "Desarrollá una aplicación de consola para crear, ordenar y completar tareas.",
    attachmentName: "tp1_gestor_tareas.zip",
  },
  {
    id: "tp-network-1",
    subject: "Redes y Conectividad",
    title: "TP 1 · Diagnóstico de conectividad",
    type: "practical_work",
    status: "graded",
    dateLabel: "Corregido el 31 jul. 2026",
    grade: 7,
    scale: "7 / 10",
    description: "Relevamiento básico de una red local y documentación de hallazgos.",
    feedback: "El diagnóstico es correcto. Faltó documentar las pruebas de latencia.",
    attachmentName: "diagnostico_redes.pdf",
  },
];

/**
 * Implementa la operación academicAverage dentro de este módulo.
 */
export function academicAverage(grades: SubjectGrade[]) {
  const published = grades.filter((grade) => grade.grade !== null);
  if (published.length === 0) return 0;
  return Number((published.reduce((total, grade) => total + (grade.grade ?? 0), 0) / published.length).toFixed(1));
}

/**
 * Implementa la operación academicItemsByType dentro de este módulo.
 */
export function academicItemsByType(type: AcademicItemType) {
  return academicItems.filter((item) => item.type === type);
}

/**
 * Implementa la operación academicItemById dentro de este módulo.
 */
export function academicItemById(id?: string) {
  return academicItems.find((item) => item.id === id);
}

