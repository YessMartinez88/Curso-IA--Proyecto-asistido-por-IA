/**
 * @archivo tests/teacher-flow.test.ts
 * @descripcion Prueba automatizada que protege un flujo o regla de negocio del proyecto.
 */
import { describe, expect, it } from "vitest";

import { canStartTeacherSession } from "../shared/teacher-flow";

describe("sesión de asistencia docente", () => {
  it("requiere una comisión activa con alumnos habilitados", () => {
    expect(canStartTeacherSession({ status: "active", enrollmentCount: 1 })).toBe(true);
    expect(canStartTeacherSession({ status: "draft", enrollmentCount: 2 })).toBe(false);
    expect(canStartTeacherSession({ status: "active", enrollmentCount: 0 })).toBe(false);
  });
});
