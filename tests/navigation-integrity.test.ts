/**
 * @archivo tests/navigation-integrity.test.ts
 * @descripcion Prueba automatizada que protege un flujo o regla de negocio del proyecto.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(__dirname, "..");
/**
 * Implementa la operación source dentro de este módulo.
 */
const source = (relativePath: string) => readFileSync(resolve(projectRoot, relativePath), "utf8");

describe("integridad de navegación por perfil", () => {
  it("declara todas las pantallas referenciadas por los recorridos principales", () => {
    [
      "app/login.tsx",
      "app/(tabs)/index.tsx",
      "app/(tabs)/agenda.tsx",
      "app/(tabs)/asistencia.tsx",
      "app/(tabs)/perfil.tsx",
      "app/clase-detalle.tsx",
      "app/academico-detalle.tsx",
      "app/scan-qr.tsx",
      "app/historial.tsx",
      "app/justificacion.tsx",
      "app/comision.tsx",
      "app/actividades-docente.tsx",
      "app/actividad-nueva.tsx",
      "app/actividad-revision.tsx",
    ].forEach((relativePath) => expect(existsSync(resolve(projectRoot, relativePath))).toBe(true));
  });

  it("conecta el acceso demo con cada perfil y concentra el cambio de identidad en Perfil", () => {
    const login = source("app/login.tsx");
    const profile = source("app/(tabs)/perfil.tsx");
    expect(login).toContain("setRole(role)");
    expect(login).toContain('router.replace("/(tabs)")');
    expect(profile).toContain('router.replace("/login")');
    ["app/(tabs)/index.tsx", "app/(tabs)/agenda.tsx", "app/(tabs)/asistencia.tsx"].forEach((relativePath) => {
      expect(source(relativePath)).not.toContain("RoleSelector");
    });
  });

  it("mantiene los enlaces centrales de Alumno, Docente y Administrativo", () => {
    const home = source("app/(tabs)/index.tsx");
    const attendance = source("app/(tabs)/asistencia.tsx");
    const agenda = source("app/(tabs)/agenda.tsx");
    const classDetail = source("app/clase-detalle.tsx");

    expect(home).toContain('pathname: "/clase-detalle"');
    expect(home).toContain('"/(tabs)/agenda"');
    expect(classDetail).toContain('"/(tabs)/asistencia"');
    expect(classDetail).toContain("/academico-detalle?id=");
    expect(attendance).toContain('pathname: "/actividades-docente"');
    expect(attendance).toContain("/scan-qr?commissionId=");
    expect(agenda).toContain('router.push("/comision"');
    expect(agenda).toContain('pathname: "/clase-detalle"');
  });
});
