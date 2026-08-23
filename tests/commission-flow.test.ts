/**
 * @archivo tests/commission-flow.test.ts
 * @descripcion Prueba automatizada que protege un flujo o regla de negocio del proyecto.
 */
import { describe, expect, it } from "vitest";

import { canActivateCommission, commissionActivationRequirements } from "../shared/commission-flow";

const completeCommission = {
  code: "PROG2-B-2026",
  subject: "Programación II",
  teacherName: "Laura Méndez",
  classroom: "Aula 204",
  scheduleLabel: "Miércoles · 18:30 a 20:00",
  periodLabel: "2° cuatrimestre 2026",
  enrollmentCount: 1,
};

describe("activación de comisiones", () => {
  it("exige todos los datos operativos antes de activar", () => {
    const missing = commissionActivationRequirements({ ...completeCommission, classroom: null, enrollmentCount: 0 });
    expect(missing).toContain("aula o laboratorio");
    expect(missing).toContain("al menos un alumno inscripto");
  });

  it("habilita la activación con una comisión completa y al menos un alumno", () => {
    expect(canActivateCommission(completeCommission)).toBe(true);
  });
});
