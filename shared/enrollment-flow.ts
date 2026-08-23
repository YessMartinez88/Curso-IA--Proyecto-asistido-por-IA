/**
 * @archivo shared/enrollment-flow.ts
 * @descripcion Reglas y tipos del dominio compartidos entre la aplicación y el servidor.
 */
/**
 * Determina si se cumple la condición canDeactivateEnrollment.
 */
export function canDeactivateEnrollment({ commissionIsActive, activeEnrollmentCount }: { commissionIsActive: boolean; activeEnrollmentCount: number }) {
  return !commissionIsActive || activeEnrollmentCount > 1;
}
