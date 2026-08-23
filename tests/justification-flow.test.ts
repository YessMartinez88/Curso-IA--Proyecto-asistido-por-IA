/**
 * @archivo tests/justification-flow.test.ts
 * @descripcion Prueba automatizada que protege un flujo o regla de negocio del proyecto.
 */
import { canReviewJustification, canSubmitJustification, MAX_JUSTIFICATION_FILE_BYTES, toStudentJustificationStatus } from "../shared/justification-flow";
import { describe, expect, it } from "vitest";

describe("flujo de justificaciones", () => {
  it("requiere un comentario o un archivo para enviar una justificación", () => {
    expect(canSubmitJustification({ comment: "", hasAttachment: false })).toBe(false);
    expect(canSubmitJustification({ comment: "Consulta médica", hasAttachment: false })).toBe(true);
    expect(canSubmitJustification({ comment: "", hasAttachment: true })).toBe(true);
  });

  it("solo permite resolver justificaciones pendientes", () => {
    expect(canReviewJustification("pending")).toBe(true);
    expect(canReviewJustification("approved")).toBe(false);
    expect(canReviewJustification("rejected")).toBe(false);
  });

  it("traduce la aprobación al estado visible para el alumno", () => {
    expect(toStudentJustificationStatus("pending")).toBe("pending");
    expect(toStudentJustificationStatus("approved")).toBe("accepted");
    expect(toStudentJustificationStatus("rejected")).toBe("rejected");
    expect(MAX_JUSTIFICATION_FILE_BYTES).toBe(5 * 1024 * 1024);
  });
});
