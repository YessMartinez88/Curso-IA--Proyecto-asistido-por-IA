/**
 * @archivo shared/justification-flow.ts
 * @descripcion Reglas y tipos del dominio compartidos entre la aplicación y el servidor.
 */
export const MAX_JUSTIFICATION_FILE_BYTES = 5 * 1024 * 1024;

/**
 * Determina si se cumple la condición canSubmitJustification.
 */
export function canSubmitJustification(input: { comment?: string | null; hasAttachment: boolean }) {
  return Boolean(input.comment?.trim()) || input.hasAttachment;
}

/**
 * Determina si se cumple la condición canReviewJustification.
 */
export function canReviewJustification(status: "pending" | "approved" | "rejected") {
  return status === "pending";
}

/**
 * Implementa la operación toStudentJustificationStatus dentro de este módulo.
 */
export function toStudentJustificationStatus(status: "pending" | "approved" | "rejected"): "pending" | "accepted" | "rejected" {
  return status === "approved" ? "accepted" : status;
}
