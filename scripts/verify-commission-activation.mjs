/**
 * @archivo scripts/verify-commission-activation.mjs
 * @descripcion Herramienta de línea de comandos para verificar o automatizar tareas del proyecto.
 */
const apiBaseUrl = "http://127.0.0.1:3000/api/trpc";

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

const draft = await mutation("commissions.createDraft", {
  code: "PROG2-B-2026",
  subject: "Programación II",
});

if (draft.canActivate || !draft.activationMissing.includes("docente responsable")) {
  throw new Error("El borrador incompleto no mostró los requisitos esperados");
}

const completed = await mutation("commissions.updateDraft", {
  commissionId: draft.id,
  code: "PROG2-B-2026",
  subject: "Programación II",
  teacherName: "Laura Méndez",
  classroom: "Aula 204",
  scheduleLabel: "Miércoles · 18:30 a 20:00",
  periodLabel: "2° cuatrimestre 2026",
  studentName: "Mateo Fernández",
});

if (!completed.canActivate) throw new Error("La comisión completa no quedó lista para activar");

const activated = await mutation("commissions.activate", { commissionId: draft.id });
if (!activated.success || activated.commission.status !== "active") throw new Error("La comisión no se activó");

const listResponse = await fetch(`${apiBaseUrl}/commissions.list`);
if (!listResponse.ok) throw new Error(`commissions.list devolvió ${listResponse.status}`);
const listPayload = await listResponse.json();
const commissions = listPayload?.result?.data?.json ?? [];
if (!commissions.some((commission) => commission.id === draft.id && commission.status === "active")) {
  throw new Error("La comisión activa no apareció en el listado persistente");
}

console.log("Flujo validado: borrador creado, requisitos detectados, datos completados, comisión activada y listada.");
