/**
 * @archivo tests/student-flow.test.ts
 * @descripcion Prueba automatizada que protege un flujo o regla de negocio del proyecto.
 */
import { describe, expect, it } from "vitest";

import { canViewStudentCommission } from "../shared/student-flow";

describe("visibilidad de comisiones del alumno", () => {
  it("muestra únicamente comisiones activas con inscripción vigente", () => {
    expect(canViewStudentCommission({ status: "active", isEnrolled: true })).toBe(true);
    expect(canViewStudentCommission({ status: "draft", isEnrolled: true })).toBe(false);
    expect(canViewStudentCommission({ status: "active", isEnrolled: false })).toBe(false);
  });
});
