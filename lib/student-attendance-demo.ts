/**
 * @archivo lib/student-attendance-demo.ts
 * @descripcion Utilidad, proveedor o fuente de datos compartida por las pantallas.
 */
export type AttendanceStatus = "present" | "late" | "absent" | "justified";
export type JustificationStatus = "none" | "pending" | "accepted" | "rejected";
export type AttendanceFilter = "all" | AttendanceStatus;

export type AttendanceRecord = {
  id: string;
  subject: string;
  date: string;
  time: string;
  classroom: string;
  status: AttendanceStatus;
  source: "QR" | "Manual";
  justificationStatus: JustificationStatus;
};

export const attendanceRecords: AttendanceRecord[] = [
  { id: "bd-14", subject: "Bases de Datos I", date: "14 ago. 2026", time: "18:31", classroom: "Laboratorio 3", status: "present", source: "QR", justificationStatus: "none" },
  { id: "prog-12", subject: "Programación II", date: "12 ago. 2026", time: "20:23", classroom: "Aula 204", status: "late", source: "QR", justificationStatus: "none" },
  { id: "bd-07", subject: "Bases de Datos I", date: "07 ago. 2026", time: "—", classroom: "Laboratorio 3", status: "absent", source: "Manual", justificationStatus: "none" },
  { id: "redes-01", subject: "Redes y Conectividad", date: "01 ago. 2026", time: "—", classroom: "Laboratorio 1", status: "justified", source: "Manual", justificationStatus: "accepted" },
  { id: "prog-30", subject: "Programación II", date: "30 jul. 2026", time: "—", classroom: "Aula 204", status: "absent", source: "Manual", justificationStatus: "pending" },
];

export const attendanceFilterLabels: Record<AttendanceFilter, string> = {
  all: "Todos",
  present: "Presentes",
  late: "Tarde",
  absent: "Ausentes",
  justified: "Justificados",
};

export const attendanceStatusLabels: Record<AttendanceStatus, string> = {
  present: "Presente",
  late: "Tarde",
  absent: "Ausente",
  justified: "Justificada",
};

/**
 * Implementa la operación filterAttendanceRecords dentro de este módulo.
 */
export function filterAttendanceRecords(records: AttendanceRecord[], filter: AttendanceFilter) {
  return filter === "all" ? records : records.filter((record) => record.status === filter);
}

/**
 * Determina si se cumple la condición canRequestJustification.
 */
export function canRequestJustification(record: AttendanceRecord) {
  return record.status === "absent" && (record.justificationStatus === "none" || record.justificationStatus === "rejected");
}

/**
 * Implementa la operación attendanceSummary dentro de este módulo.
 */
export function attendanceSummary(records: AttendanceRecord[]) {
  const attended = records.filter((record) => record.status === "present" || record.status === "late").length;
  const total = records.length;
  return {
    attended,
    total,
    rate: total === 0 ? 0 : Math.round((attended / total) * 100),
  };
}

