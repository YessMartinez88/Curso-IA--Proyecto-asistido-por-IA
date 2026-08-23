/**
 * @archivo tests/student-attendance.test.ts
 * @descripcion Prueba automatizada que protege un flujo o regla de negocio del proyecto.
 */
import { describe, expect, it } from "vitest";

import {
  attendanceRecords,
  attendanceSummary,
  canRequestJustification,
  filterAttendanceRecords,
} from "../lib/student-attendance-demo";

describe("historial de asistencia del alumno", () => {
  it("filtra los registros por estado sin alterar el listado original", () => {
    const absent = filterAttendanceRecords(attendanceRecords, "absent");
    expect(absent).toHaveLength(2);
    expect(absent.every((record) => record.status === "absent")).toBe(true);
    expect(attendanceRecords).toHaveLength(5);
  });

  it("solo permite justificar ausencias sin una aprobación previa", () => {
    const openAbsence = attendanceRecords.find((record) => record.id === "bd-07");
    const pendingAbsence = attendanceRecords.find((record) => record.id === "prog-30");
    const justified = attendanceRecords.find((record) => record.id === "redes-01");

    expect(openAbsence && canRequestJustification(openAbsence)).toBe(true);
    expect(pendingAbsence && canRequestJustification(pendingAbsence)).toBe(false);
    expect(justified && canRequestJustification(justified)).toBe(false);
  });

  it("calcula el resumen de presencia considerando presentes y llegadas tarde", () => {
    expect(attendanceSummary(attendanceRecords)).toEqual({ attended: 2, total: 5, rate: 40 });
  });
});
