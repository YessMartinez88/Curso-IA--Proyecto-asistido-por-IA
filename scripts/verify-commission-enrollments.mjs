/**
 * @archivo scripts/verify-commission-enrollments.mjs
 * @descripcion Herramienta de línea de comandos para verificar o automatizar tareas del proyecto.
 */
const apiBaseUrl = "http://127.0.0.1:3000/api/trpc";

/**
 * Obtiene la información necesaria para Procedure dentro del flujo actual.
 */
async function getProcedure(name) {
  const response = await fetch(`${apiBaseUrl}/${name}`);
  if (!response.ok) throw new Error(`${name} devolvió ${response.status}`);
  const payload = await response.json();
  return payload?.result?.data?.json;
}

/**
 * Implementa la operación mutation dentro de este módulo.
 */
async function mutation(name, input) {
  const response = await fetch(`${apiBaseUrl}/${name}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ json: input }),
  });
  if (!response.ok) throw new Error(`${name} devolvió ${response.status}: ${await response.text()}`);
  const payload = await response.json();
  return payload?.result?.data?.json;
}

const commissions = await getProcedure("commissions.list");
const commission = commissions.find((item) => item.code === "PROG2-B-2026");
if (!commission) throw new Error("No se encontró la comisión activa de validación");

const added = await mutation("commissions.addEnrollment", { commissionId: commission.id, studentName: "Lucía Paredes" });
const addedEnrollment = added.enrollmentHistory.find((item) => item.studentName === "Lucía Paredes" && item.active);
if (!addedEnrollment || added.enrollmentCount < 2) throw new Error("No se registró la inscripción adicional");

const deactivated = await mutation("commissions.deactivateEnrollment", { commissionId: commission.id, enrollmentId: addedEnrollment.id });
const historyEntry = deactivated.enrollmentHistory.find((item) => item.id === addedEnrollment.id);
if (!historyEntry || historyEntry.active) throw new Error("No se conservó la baja en el historial");
if (deactivated.enrollmentCount < 1) throw new Error("La comisión activa quedó sin alumnos habilitados");

console.log("Flujo validado: alumno agregado, inscripción desactivada con historial y comisión activa protegida.");
