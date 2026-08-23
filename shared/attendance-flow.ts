/**
 * @archivo shared/attendance-flow.ts
 * @descripcion Reglas y tipos del dominio compartidos entre la aplicación y el servidor.
 */
export const QR_LIFETIME_MS = 2 * 60 * 1000;
export const DEMO_TEACHER_NAME = "Laura Méndez";
export const DEMO_STUDENT_NAME = "Sofía Ramírez";

/**
 * Implementa la operación qrExpirationFrom dentro de este módulo.
 */
export function qrExpirationFrom(now: Date, lifetimeMs = QR_LIFETIME_MS) {
  return new Date(now.getTime() + lifetimeMs);
}

/**
 * Determina si se cumple la condición isQrWindowValid.
 */
export function isQrWindowValid(status: "open" | "closed", expiresAt: Date, now: Date) {
  return status === "open" && expiresAt.getTime() > now.getTime();
}

/**
 * Implementa la operación attendanceCheckInOutcome dentro de este módulo.
 */
export function attendanceCheckInOutcome({
  hasEnrollment,
  qrIsValid,
  alreadyRecorded,
  commissionMatches = true,
}: {
  hasEnrollment: boolean;
  qrIsValid: boolean;
  alreadyRecorded: boolean;
  commissionMatches?: boolean;
}) {
  if (!qrIsValid) return "invalid_qr" as const;
  if (!commissionMatches) return "wrong_commission" as const;
  if (!hasEnrollment) return "not_enrolled" as const;
  if (alreadyRecorded) return "already_recorded" as const;
  return "registered" as const;
}
