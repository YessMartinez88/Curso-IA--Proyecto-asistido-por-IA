/**
 * @archivo scripts/verify-student-commission-flow.mjs
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

const commissions = await query("commissions.list");
const selected = commissions.find((commission) => commission.code === "PROG2-B-2026");
if (!selected) throw new Error("No se encontró la comisión de validación");

await mutation("commissions.addEnrollment", { commissionId: selected.id, studentName: "Sofía Ramírez" });
const studentCommissions = await query("student.commissions");
if (!studentCommissions.some((commission) => commission.id === selected.id)) throw new Error("La comisión inscripta no apareció para el alumno");

const opened = await mutation("teacher.openSession", { commissionId: selected.id });
const studentState = await query("student.attendanceState", { commissionId: selected.id });
if (!studentState.activeSession || studentState.commission.id !== selected.id) throw new Error("El alumno no recibió la clase activa seleccionada");

const registration = await mutation("attendance.checkIn", { qrToken: opened.qrToken, studentName: "Sofía Ramírez" });
if (registration.outcome !== "registered") throw new Error(`Registro inesperado: ${registration.outcome}`);

const history = await query("student.attendanceHistory");
if (!history.some((record) => record.commissionId === selected.id && record.subject === "Programación II")) throw new Error("El historial no vinculó la asistencia con la materia correcta");

await mutation("attendance.closeSession", { sessionId: opened.sessionId });
console.log("Flujo validado: alumno ve su comisión, detecta clase activa, registra asistencia y recibe la materia correcta en su historial.");
