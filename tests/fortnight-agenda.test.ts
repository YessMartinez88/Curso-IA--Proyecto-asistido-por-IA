/**
 * @archivo tests/fortnight-agenda.test.ts
 * @descripcion Prueba automatizada que protege un flujo o regla de negocio del proyecto.
 */
import { describe, expect, it } from "vitest";

import { buildFortnightAgenda, classesForDay } from "../lib/fortnight-agenda-demo";

describe("agenda de 14 días", () => {
  it("crea una ventana completa de catorce fechas para el alumno", () => {
    const agenda = buildFortnightAgenda("alumno");
    expect(agenda).toHaveLength(14);
    expect(agenda[0]).toMatchObject({ id: "2026-08-14", isToday: true });
    expect(agenda[13].id).toBe("2026-08-27");
  });

  it("conserva las clases correspondientes a la fecha seleccionada", () => {
    const agenda = buildFortnightAgenda("docente");
    const classes = classesForDay(agenda, "2026-08-21");
    expect(classes).toHaveLength(2);
    expect(classes[0].title).toContain("Programación II");
  });

  it("incluye la agenda institucional para el perfil administrativo", () => {
    const agenda = buildFortnightAgenda("administrativo");
    expect(classesForDay(agenda, "2026-08-14")).toHaveLength(2);
    expect(classesForDay(agenda, "2026-08-18")).toHaveLength(0);
  });
});
