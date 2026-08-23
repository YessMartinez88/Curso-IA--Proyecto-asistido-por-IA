/**
 * @archivo scripts/verify-teacher-commission-flow.mjs
 * @descripcion Herramienta de línea de comandos para verificar o automatizar tareas del proyecto.
 */
const apiBaseUrl = "http://127.0.0.1:3000/api/trpc";

/**
 * Implementa la operación query dentro de este módulo.
 */
async function query(name, input) {
  const suffix = input ? `?input=${encodeURIComponent(JSON.stringify({ json: input }))}` : "";
  const response = await fetch(`${apiBaseUrl}/${name}${suffix}`);
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

const commissions = await query("teacher.commissions");
const selected = commissions.find((commission) => commission.code === "PROG2-B-2026");
if (!selected || selected.status !== "active" || selected.enrollmentCount < 1) throw new Error("No se encontró una comisión activa y habilitada para el docente");

const opened = await mutation("teacher.openSession", { commissionId: selected.id });
if (!opened.qrToken || opened.commission.id !== selected.id) throw new Error("La sesión no quedó asociada a la comisión elegida");

const state = await query("teacher.attendanceState", { commissionId: selected.id });
if (state.commission.id !== selected.id || !state.activeSession) throw new Error("El estado docente no refleja la sesión de la comisión seleccionada");
if (!state.enrolledStudents.includes("Mateo Fernández")) throw new Error("No se expuso el grupo habilitado al docente");

await mutation("attendance.closeSession", { sessionId: opened.sessionId });
console.log("Flujo validado: docente listó comisiones, eligió una, vio su grupo y abrió/cerró su sesión QR.");
