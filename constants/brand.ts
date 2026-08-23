/**
 * @archivo constants/brand.ts
 * @descripcion Constantes y configuraciones compartidas del dominio de la aplicación.
 */
export const brand = {
  navy: "#0B1F3A",
  navyMid: "#173B66",
  ice: "#EAF1F8",
  silver: "#D7DEE8",
  white: "#FFFFFF",
  yellow: "#F4C542",
  green: "#2E8B70",
  red: "#C95353",
  text: "#12233E",
  muted: "#64748B",
  page: "#F7F9FC",
} as const;

export const rolePresentation = {
  alumno: {
    label: "Alumno",
    shortLabel: "AL",
    greeting: "Tu jornada está al día",
    primaryAction: "Registrar asistencia",
  },
  docente: {
    label: "Docente",
    shortLabel: "DO",
    greeting: "Tu próxima clase comienza pronto",
    primaryAction: "Abrir clase",
  },
  administrativo: {
    label: "Administrativo",
    shortLabel: "AD",
    greeting: "La operación académica está activa",
    primaryAction: "Gestionar comisiones",
  },
} as const;

export type DemoRole = keyof typeof rolePresentation;

/**
 * Obtiene la información necesaria para RoleActionRoute dentro del flujo actual.
 */
export function getRoleActionRoute(role: DemoRole) {
  return role === "administrativo" ? "/(tabs)/agenda" : "/(tabs)/asistencia";
}
