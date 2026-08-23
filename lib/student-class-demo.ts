/**
 * @archivo lib/student-class-demo.ts
 * @descripcion Utilidad, proveedor o fuente de datos compartida por las pantallas.
 */
import { buildFortnightAgenda } from "./fortnight-agenda-demo";
import { academicItems, subjectGrades, type AcademicItem } from "./student-academic-demo";
import { attendanceRecords, attendanceSummary, type AttendanceRecord } from "./student-attendance-demo";

export type StudentActivityState = "pending" | "review" | "closed" | "upcoming";

export type StudentClassSummary = {
  subject: string;
  detail: string;
  time: string;
  attendance: ReturnType<typeof attendanceSummary>;
  grade: number | null;
  gradeScale: string;
  activities: AcademicItem[];
  activityCounts: Record<StudentActivityState, number>;
  latestAttendance?: AttendanceRecord;
};

/**
 * Implementa la operación studentActivityState dentro de este módulo.
 */
export function studentActivityState(item: AcademicItem): StudentActivityState {
  if (item.status === "pending_submission") return "pending";
  if (item.status === "submitted") return "review";
  if (item.status === "graded") return "closed";
  return "upcoming";
}

/**
 * Implementa la operación studentActivitiesForSubject dentro de este módulo.
 */
export function studentActivitiesForSubject(subject?: string) {
  return academicItems.filter((item) => item.subject === subject);
}

/**
 * Implementa la operación classSummaryForSubject dentro de este módulo.
 */
export function classSummaryForSubject(subject?: string): StudentClassSummary | null {
  if (!subject) return null;

  const events = buildFortnightAgenda("alumno")
    .flatMap((day) => day.classes)
    .filter((event) => event.title === subject);
  const firstEvent = events[0];
  if (!firstEvent) return null;

  const activities = studentActivitiesForSubject(subject);
  const records = attendanceRecords.filter((record) => record.subject === subject);
  const grade = subjectGrades.find((item) => item.subject === subject);
  const activityCounts: Record<StudentActivityState, number> = { pending: 0, review: 0, closed: 0, upcoming: 0 };

  activities.forEach((item) => {
    activityCounts[studentActivityState(item)] += 1;
  });

  return {
    subject,
    detail: firstEvent.detail,
    time: firstEvent.time,
    attendance: attendanceSummary(records),
    grade: grade?.grade ?? null,
    gradeScale: grade?.scale ?? "Sin nota publicada",
    activities,
    activityCounts,
    latestAttendance: records[0],
  };
}

/**
 * Implementa la operación studentClassSummaries dentro de este módulo.
 */
export function studentClassSummaries() {
  const subjects = buildFortnightAgenda("alumno")
    .flatMap((day) => day.classes)
    .map((event) => event.title)
    .filter((subject, index, all) => all.indexOf(subject) === index);

  return subjects
    .map((subject) => classSummaryForSubject(subject))
    .filter((summary): summary is StudentClassSummary => summary !== null);
}
