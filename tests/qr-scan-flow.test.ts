/**
 * @archivo tests/qr-scan-flow.test.ts
 * @descripcion Prueba automatizada que protege un flujo o regla de negocio del proyecto.
 */
import { describe, expect, it } from "vitest";

import { attendanceCheckInOutcome } from "../shared/attendance-flow";
import { canProcessQrScan } from "../shared/qr-scan-flow";

describe("lectura QR", () => {
  it("evita procesar lecturas repetidas o fuera de una sesión activa", () => {
    expect(canProcessQrScan({ hasActiveSession: true, isProcessing: false, isScanned: false })).toBe(true);
    expect(canProcessQrScan({ hasActiveSession: false, isProcessing: false, isScanned: false })).toBe(false);
    expect(canProcessQrScan({ hasActiveSession: true, isProcessing: true, isScanned: false })).toBe(false);
  });

  it("rechaza códigos de una comisión distinta a la seleccionada", () => {
    expect(attendanceCheckInOutcome({ hasEnrollment: true, qrIsValid: true, alreadyRecorded: false, commissionMatches: false })).toBe("wrong_commission");
  });
});
