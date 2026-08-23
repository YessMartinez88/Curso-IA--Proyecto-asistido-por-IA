/**
 * @archivo shared/commission-flow.ts
 * @descripcion Reglas y tipos del dominio compartidos entre la aplicación y el servidor.
 */
export type CommissionActivationSnapshot = {
  code: string | null;
  subject: string | null;
  teacherName: string | null;
  classroom: string | null;
  scheduleLabel: string | null;
  periodLabel: string | null;
  enrollmentCount: number;
};

type CommissionTextField = Exclude<keyof CommissionActivationSnapshot, "enrollmentCount">;

const requiredFields: Array<[CommissionTextField, string]> = [
  ["code", "código de comisión"],
  ["subject", "materia"],
  ["teacherName", "docente responsable"],
  ["classroom", "aula o laboratorio"],
  ["scheduleLabel", "horario"],
  ["periodLabel", "período académico"],
];

/**
 * Implementa la operación commissionActivationRequirements dentro de este módulo.
 */
export function commissionActivationRequirements(snapshot: CommissionActivationSnapshot) {
  const missing = requiredFields
    .filter(([field]) => !snapshot[field]?.trim())
    .map(([, label]) => label);
  if (snapshot.enrollmentCount < 1) missing.push("al menos un alumno inscripto");
  return missing;
}

/**
 * Determina si se cumple la condición canActivateCommission.
 */
export function canActivateCommission(snapshot: CommissionActivationSnapshot) {
  return commissionActivationRequirements(snapshot).length === 0;
}
