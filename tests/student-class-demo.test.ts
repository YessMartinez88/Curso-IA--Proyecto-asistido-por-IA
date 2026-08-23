/**
 * @archivo tests/student-class-demo.test.ts
 * @descripcion Prueba automatizada que protege un flujo o regla de negocio del proyecto.
 */
import { classSummaryForSubject, studentActivityState, studentClassSummaries } from "../lib/student-class-demo";
import { academicItemById } from "../lib/student-academic-demo";
import { describe, expect, it } from "vitest";

describe("panel de clases del alumno", () => {
  it("muestra una única tarjeta para cada materia del alumno", () => {
    expect(studentClassSummaries().map((item) => item.subject)).toEqual([
      "Bases de Datos I",
      "Programación II",
      "Redes y Conectividad",
    ]);
  });

  it("clasifica entregas pendientes, en revisión y cerradas", () => {
    expect(studentActivityState(academicItemById("tp-db-2")!)).toBe("pending");
    expect(studentActivityState(academicItemById("tp-prog-1")!)).toBe("review");
    expect(studentActivityState(academicItemById("tp-network-1")!)).toBe("closed");
  });

  it("reúne la asistencia, nota y actividades de una clase en su propio resumen", () => {
    const summary = classSummaryForSubject("Bases de Datos I");
    expect(summary?.attendance.rate).toBe(50);
    expect(summary?.grade).toBe(8);
    expect(summary?.activityCounts.pending).toBe(1);
    expect(summary?.activityCounts.closed).toBe(1);
  });
});
