/**
 * @archivo tests/attendance-flow.test.ts
 * @descripcion Prueba automatizada que protege un flujo o regla de negocio del proyecto.
 */
import { describe, expect, it } from "vitest";

import { attendanceCheckInOutcome, isQrWindowValid, qrExpirationFrom } from "../shared/attendance-flow";

describe("reglas del flujo mínimo de asistencia", () => {
  it("genera un vencimiento de QR de dos minutos", () => {
    const now = new Date("2026-08-14T18:30:00.000Z");
    expect(qrExpirationFrom(now).toISOString()).toBe("2026-08-14T18:32:00.000Z");
  });

  it("acepta el QR únicamente mientras la sesión está abierta y vigente", () => {
    const now = new Date("2026-08-14T18:30:00.000Z");
    expect(isQrWindowValid("open", new Date("2026-08-14T18:31:00.000Z"), now)).toBe(true);
    expect(isQrWindowValid("closed", new Date("2026-08-14T18:31:00.000Z"), now)).toBe(false);
    expect(isQrWindowValid("open", new Date("2026-08-14T18:29:00.000Z"), now)).toBe(false);
  });

  it("evita asistencias duplicadas y alumnos no inscriptos", () => {
    expect(attendanceCheckInOutcome({ qrIsValid: true, hasEnrollment: true, alreadyRecorded: false })).toBe("registered");
    expect(attendanceCheckInOutcome({ qrIsValid: true, hasEnrollment: true, alreadyRecorded: true })).toBe("already_recorded");
    expect(attendanceCheckInOutcome({ qrIsValid: true, hasEnrollment: false, alreadyRecorded: false })).toBe("not_enrolled");
  });
});
