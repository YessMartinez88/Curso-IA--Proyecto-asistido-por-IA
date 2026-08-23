/**
 * @archivo tests/activity-flow.test.ts
 * @descripcion Prueba automatizada que protege un flujo o regla de negocio del proyecto.
 */
import { canAssignAcademicScore, isAcademicFileSizeAllowed, MAX_ACTIVITY_FILE_BYTES, submissionReviewLabel } from "../shared/activity-flow";
import { describe, expect, it } from "vitest";

describe("flujo docente de actividades", () => {
  it("acepta adjuntos de hasta 5 MB y rechaza archivos vacíos o mayores", () => {
    expect(isAcademicFileSizeAllowed(1)).toBe(true);
    expect(isAcademicFileSizeAllowed(MAX_ACTIVITY_FILE_BYTES)).toBe(true);
    expect(isAcademicFileSizeAllowed(0)).toBe(false);
    expect(isAcademicFileSizeAllowed(MAX_ACTIVITY_FILE_BYTES + 1)).toBe(false);
  });

  it("limita la calificación al puntaje máximo de cada actividad", () => {
    expect(canAssignAcademicScore(8, 10)).toBe(true);
    expect(canAssignAcademicScore(0, 10)).toBe(true);
    expect(canAssignAcademicScore(11, 10)).toBe(false);
    expect(canAssignAcademicScore(-1, 10)).toBe(false);
  });

  it("resume las entregas según su estado de revisión", () => {
    expect(submissionReviewLabel({ submissionCount: 0, pendingReviewCount: 0 })).toBe("Sin entregas");
    expect(submissionReviewLabel({ submissionCount: 3, pendingReviewCount: 2 })).toBe("2 por revisar");
    expect(submissionReviewLabel({ submissionCount: 2, pendingReviewCount: 0 })).toBe("Entregas calificadas");
  });
});
