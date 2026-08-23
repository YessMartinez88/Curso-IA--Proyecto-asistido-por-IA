/**
 * @archivo shared/activity-flow.ts
 * @descripcion Reglas y tipos del dominio compartidos entre la aplicación y el servidor.
 */
export const MAX_ACTIVITY_FILE_BYTES = 5 * 1024 * 1024;

/**
 * Determina si se cumple la condición isAcademicFileSizeAllowed.
 */
export function isAcademicFileSizeAllowed(sizeBytes: number) {
  return Number.isInteger(sizeBytes) && sizeBytes > 0 && sizeBytes <= MAX_ACTIVITY_FILE_BYTES;
}

/**
 * Determina si se cumple la condición canAssignAcademicScore.
 */
export function canAssignAcademicScore(score: number, maxScore: number) {
  return Number.isInteger(score) && Number.isInteger(maxScore) && maxScore > 0 && score >= 0 && score <= maxScore;
}

/**
 * Implementa la operación submissionReviewLabel dentro de este módulo.
 */
export function submissionReviewLabel(input: { submissionCount: number; pendingReviewCount: number }) {
  if (input.submissionCount === 0) return "Sin entregas";
  if (input.pendingReviewCount > 0) return `${input.pendingReviewCount} por revisar`;
  return "Entregas calificadas";
}
