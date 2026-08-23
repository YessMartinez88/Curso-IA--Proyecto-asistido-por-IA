/**
 * @archivo scripts/verify-attendance-flow.mjs
 * @descripcion Herramienta de línea de comandos para verificar o automatizar tareas del proyecto.
 */
const apiBaseUrl = "http://127.0.0.1:3000/api/trpc";

/**
 * Implementa la operación callProcedure dentro de este módulo.
 */
async function callProcedure(name, input) {
  const response = await fetch(`${apiBaseUrl}/${name}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input === undefined ? {} : { json: input }),
  });

  if (!response.ok) {
    throw new Error(`${name} devolvió ${response.status}: ${await response.text()}`);
  }

  const payload = await response.json();
  const data = payload?.result?.data?.json;
  if (!data) {
    throw new Error(`${name} devolvió una respuesta sin datos`);
  }
  return data;
}

const setup = await callProcedure("attendance.setupDemo");
const opened = await callProcedure("attendance.openSession");
const registered = await callProcedure("attendance.checkIn", {
  qrToken: opened.qrToken,
  studentName: "Sofía Ramírez",
});
const duplicate = await callProcedure("attendance.checkIn", {
  qrToken: opened.qrToken,
  studentName: "Sofía Ramírez",
});
const closed = await callProcedure("attendance.closeSession", { sessionId: opened.sessionId });
const stateResponse = await fetch(`${apiBaseUrl}/attendance.state`);
if (!stateResponse.ok) throw new Error(`attendance.state devolvió ${stateResponse.status}`);
const statePayload = await stateResponse.json();
const state = statePayload?.result?.data?.json;

if (setup.code !== "DB1-A-2026") throw new Error("La comisión demo no se preparó correctamente");
if (registered.outcome !== "registered") throw new Error(`Resultado inesperado al registrar: ${registered.outcome}`);
if (duplicate.outcome !== "already_recorded") throw new Error(`El duplicado no fue rechazado: ${duplicate.outcome}`);
if (!closed.success) throw new Error("La sesión no se cerró correctamente");
if (state.activeSession !== null) throw new Error("La sesión quedó abierta después del cierre");
if (!state.latestRecords.some((record) => record.studentName === "Sofía Ramírez")) throw new Error("No se encontró el registro persistente del alumno");

console.log("Flujo validado: comisión preparada, QR temporal registrado, duplicado rechazado, sesión cerrada e historial persistente actualizado.");
