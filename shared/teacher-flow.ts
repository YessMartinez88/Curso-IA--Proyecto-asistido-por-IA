/**
 * @archivo shared/teacher-flow.ts
 * @descripcion Reglas y tipos del dominio compartidos entre la aplicación y el servidor.
 */
/**
 * Determina si se cumple la condición canStartTeacherSession.
 */
export function canStartTeacherSession({ status, enrollmentCount }: { status: "draft" | "active"; enrollmentCount: number }) {
  return status === "active" && enrollmentCount > 0;
}
