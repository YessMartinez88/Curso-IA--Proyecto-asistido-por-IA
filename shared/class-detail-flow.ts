/**
 * @archivo shared/class-detail-flow.ts
 * @descripcion Reglas y tipos del dominio compartidos entre la aplicación y el servidor.
 */
/**
 * Implementa la operación classAttendanceStatus dentro de este módulo.
 */
export function classAttendanceStatus({ hasCommission, hasActiveSession }: { hasCommission: boolean; hasActiveSession: boolean }) {
  if (!hasCommission) return { label: "Sin asistencia disponible", tone: "idle" as const };
  if (hasActiveSession) return { label: "Clase activa · QR disponible", tone: "active" as const };
  return { label: "Sin sesión de asistencia activa", tone: "idle" as const };
}
