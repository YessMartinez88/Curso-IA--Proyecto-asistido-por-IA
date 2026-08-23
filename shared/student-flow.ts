/**
 * @archivo shared/student-flow.ts
 * @descripcion Reglas y tipos del dominio compartidos entre la aplicación y el servidor.
 */
/**
 * Determina si se cumple la condición canViewStudentCommission.
 */
export function canViewStudentCommission({ status, isEnrolled }: { status: "draft" | "active"; isEnrolled: boolean }) {
  return status === "active" && isEnrolled;
}
