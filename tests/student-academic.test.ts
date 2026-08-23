/**
 * @archivo tests/student-academic.test.ts
 * @descripcion Prueba automatizada que protege un flujo o regla de negocio del proyecto.
 */
import { describe, expect, it } from "vitest";

import { academicAverage, academicItemById, academicItemsByType, subjectGrades } from "../lib/student-academic-demo";

describe("seguimiento académico del alumno", () => {
  it("calcula el promedio solo con las materias que tienen calificación publicada", () => {
    expect(academicAverage(subjectGrades)).toBe(8.5);
  });

  it("separa evaluaciones y trabajos prácticos", () => {
    expect(academicItemsByType("evaluation")).toHaveLength(3);
    expect(academicItemsByType("practical_work")).toHaveLength(3);
  });

  it("encuentra el detalle solicitado por su identificador", () => {
    const item = academicItemById("tp-db-2");
    expect(item?.status).toBe("pending_submission");
    expect(item?.subject).toBe("Bases de Datos I");
  });
});
