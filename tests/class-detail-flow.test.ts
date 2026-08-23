/**
 * @archivo tests/class-detail-flow.test.ts
 * @descripcion Prueba automatizada que protege un flujo o regla de negocio del proyecto.
 */
import { describe, expect, it } from "vitest";

import { classAttendanceStatus } from "../shared/class-detail-flow";

describe("detalle de clase", () => {
  it("expone el estado de asistencia según la comisión y la sesión activa", () => {
    expect(classAttendanceStatus({ hasCommission: true, hasActiveSession: true }).tone).toBe("active");
    expect(classAttendanceStatus({ hasCommission: true, hasActiveSession: false }).label).toBe("Sin sesión de asistencia activa");
    expect(classAttendanceStatus({ hasCommission: false, hasActiveSession: false }).label).toBe("Sin asistencia disponible");
  });
});
