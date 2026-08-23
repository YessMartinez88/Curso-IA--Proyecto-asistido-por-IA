/**
 * @archivo tests/brand.test.ts
 * @descripcion Prueba automatizada que protege un flujo o regla de negocio del proyecto.
 */
import { describe, expect, it } from "vitest";

import { brand, getRoleActionRoute, rolePresentation } from "../constants/brand";

describe("configuración visual y roles de demostración", () => {
  it("mantiene la paleta institucional solicitada", () => {
    expect(brand.navy).toBe("#0B1F3A");
    expect(brand.silver).toBe("#D7DEE8");
    expect(brand.white).toBe("#FFFFFF");
    expect(brand.yellow).toBe("#F4C542");
  });

  it("define una presentación para alumno, docente y administrativo", () => {
    expect(Object.keys(rolePresentation)).toEqual(["alumno", "docente", "administrativo"]);
    expect(rolePresentation.docente.primaryAction).toBe("Abrir clase");
  });

  it("lleva las acciones principales a la pantalla adecuada según el rol", () => {
    expect(getRoleActionRoute("alumno")).toBe("/(tabs)/asistencia");
    expect(getRoleActionRoute("docente")).toBe("/(tabs)/asistencia");
    expect(getRoleActionRoute("administrativo")).toBe("/(tabs)/agenda");
  });
});
