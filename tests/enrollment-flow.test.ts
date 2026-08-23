/**
 * @archivo tests/enrollment-flow.test.ts
 * @descripcion Prueba automatizada que protege un flujo o regla de negocio del proyecto.
 */
import { describe, expect, it } from "vitest";

import { canDeactivateEnrollment } from "../shared/enrollment-flow";

describe("inscripciones de comisión", () => {
  it("protege al último alumno activo de una comisión ya activada", () => {
    expect(canDeactivateEnrollment({ commissionIsActive: true, activeEnrollmentCount: 1 })).toBe(false);
  });

  it("permite conservar la trazabilidad al desactivar una inscripción si existen alternativas", () => {
    expect(canDeactivateEnrollment({ commissionIsActive: true, activeEnrollmentCount: 2 })).toBe(true);
    expect(canDeactivateEnrollment({ commissionIsActive: false, activeEnrollmentCount: 1 })).toBe(true);
  });
});
