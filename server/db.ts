/**
 * @archivo server/db.ts
 * @descripcion Capa de servidor que implementa datos, reglas y endpoints del dominio académico.
 */
import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { createHash, randomBytes } from "node:crypto";
import {
  academicActivities,
  academicSubmissions,
  attendanceCommissions,
  attendanceEnrollments,
  attendanceJustifications,
  attendanceRecords,
  attendanceSessions,
  type AcademicActivity,
  type AcademicSubmission,
  type AttendanceCommission,
  type AttendanceJustification,
  InsertUser,
  users,
} from "../drizzle/schema";
import { attendanceCheckInOutcome, DEMO_STUDENT_NAME, DEMO_TEACHER_NAME, isQrWindowValid, qrExpirationFrom } from "../shared/attendance-flow";
import { commissionActivationRequirements } from "../shared/commission-flow";
import { canDeactivateEnrollment } from "../shared/enrollment-flow";
import { canStartTeacherSession } from "../shared/teacher-flow";
import { canAssignAcademicScore, isAcademicFileSizeAllowed } from "../shared/activity-flow";
import { canReviewJustification, canSubmitJustification, MAX_JUSTIFICATION_FILE_BYTES } from "../shared/justification-flow";
import { canViewStudentCommission } from "../shared/student-flow";
import { ENV } from "./_core/env";
import { storagePut } from "./storage";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
/**
 * Obtiene la información necesaria para Db dentro del flujo actual.
 */
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Implementa la operación upsertUser dentro de este módulo.
 */
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    /**
     * Implementa la operación assignNullable dentro de este módulo.
     */
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

/**
 * Obtiene la información necesaria para UserByOpenId dentro del flujo actual.
 */
export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Implementa la operación requireDb dentro de este módulo.
 */
function requireDb(database: Awaited<ReturnType<typeof getDb>>) {
  if (!database) throw new Error("La base de datos no está disponible.");
  return database;
}

/**
 * Implementa la operación toIso dentro de este módulo.
 */
function toIso(date: Date | null | undefined) {
  return date ? date.toISOString() : null;
}

/**
 * Crea el recurso asociado a PlainQrToken con las validaciones del dominio.
 */
function createPlainQrToken() {
  return randomBytes(24).toString("base64url");
}

/**
 * Determina si se cumple la condición hashQrToken.
 */
function hashQrToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Garantiza las precondiciones necesarias para AttendanceDemo.
 */
export async function ensureAttendanceDemo() {
  const db = requireDb(await getDb());
  const existing = await db.select().from(attendanceCommissions).where(eq(attendanceCommissions.code, "DB1-A-2026")).limit(1);
  if (existing[0]) {
    if (!existing[0].periodLabel || existing[0].status !== "active" || !existing[0].active) {
      await db.update(attendanceCommissions).set({ periodLabel: "2° cuatrimestre 2026", status: "active", active: true }).where(eq(attendanceCommissions.id, existing[0].id));
      const updated = await db.select().from(attendanceCommissions).where(eq(attendanceCommissions.id, existing[0].id)).limit(1);
      return updated[0];
    }
    return existing[0];
  }

  const result = await db.insert(attendanceCommissions).values({
    code: "DB1-A-2026",
    subject: "Bases de Datos I",
    classroom: "Laboratorio 3",
    teacherName: "Laura Méndez",
    scheduleLabel: "Miércoles · 18:30 a 20:00",
    periodLabel: "2° cuatrimestre 2026",
    status: "active",
  });
  const commissionId = Number(result[0].insertId);
  await db.insert(attendanceEnrollments).values({ commissionId, studentName: DEMO_STUDENT_NAME });
  const commission = await db.select().from(attendanceCommissions).where(eq(attendanceCommissions.id, commissionId)).limit(1);
  return commission[0];
}

type CommissionFormInput = {
  code?: string;
  subject?: string;
  teacherName?: string;
  classroom?: string;
  scheduleLabel?: string;
  periodLabel?: string;
  studentName?: string;
};

/**
 * Implementa la operación optionalText dentro de este módulo.
 */
function optionalText(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

/**
 * Implementa la operación draftCode dentro de este módulo.
 */
function draftCode() {
  return `DRAFT-${randomBytes(5).toString("hex").toUpperCase()}`;
}

/**
 * Obtiene la información necesaria para CommissionEnrollments dentro del flujo actual.
 */
async function getCommissionEnrollments(commissionId: number) {
  const db = requireDb(await getDb());
  return db.select().from(attendanceEnrollments).where(and(eq(attendanceEnrollments.commissionId, commissionId), eq(attendanceEnrollments.active, true)));
}

/**
 * Obtiene la información necesaria para CommissionEnrollmentHistory dentro del flujo actual.
 */
async function getCommissionEnrollmentHistory(commissionId: number) {
  const db = requireDb(await getDb());
  return db.select().from(attendanceEnrollments).where(eq(attendanceEnrollments.commissionId, commissionId)).orderBy(desc(attendanceEnrollments.createdAt));
}

/**
 * Implementa la operación commissionSnapshot dentro de este módulo.
 */
function commissionSnapshot(commission: AttendanceCommission, enrollmentCount: number) {
  return {
    code: commission.code,
    subject: commission.subject,
    teacherName: commission.teacherName,
    classroom: commission.classroom,
    scheduleLabel: commission.scheduleLabel,
    periodLabel: commission.periodLabel,
    enrollmentCount,
  };
}

/**
 * Obtiene la información necesaria para CommissionReadModel dentro del flujo actual.
 */
export async function getCommissionReadModel(commission: AttendanceCommission) {
  const enrollments = await getCommissionEnrollments(commission.id);
  const enrollmentHistory = await getCommissionEnrollmentHistory(commission.id);
  const missing = commissionActivationRequirements(commissionSnapshot(commission, enrollments.length));
  return {
    ...commission,
    enrollmentCount: enrollments.length,
    enrolledStudents: enrollments.map((enrollment) => enrollment.studentName),
    enrollmentHistory: enrollmentHistory.map((enrollment) => ({ id: enrollment.id, studentName: enrollment.studentName, active: enrollment.active, createdAt: toIso(enrollment.createdAt) })),
    activationMissing: missing,
    canActivate: missing.length === 0,
  };
}

/**
 * Obtiene la información necesaria para AdministrativeCommissions dentro del flujo actual.
 */
export async function listAdministrativeCommissions() {
  const db = requireDb(await getDb());
  const commissions = await db.select().from(attendanceCommissions).orderBy(desc(attendanceCommissions.updatedAt));
  return Promise.all(commissions.map(getCommissionReadModel));
}

/**
 * Obtiene la información necesaria para AdministrativeCommission dentro del flujo actual.
 */
export async function getAdministrativeCommission(commissionId: number) {
  const db = requireDb(await getDb());
  const commission = await db.select().from(attendanceCommissions).where(eq(attendanceCommissions.id, commissionId)).limit(1);
  if (!commission[0]) throw new Error("No encontramos la comisión indicada.");
  return getCommissionReadModel(commission[0]);
}

/**
 * Crea el recurso asociado a CommissionDraft con las validaciones del dominio.
 */
export async function createCommissionDraft(input: CommissionFormInput) {
  const db = requireDb(await getDb());
  const result = await db.insert(attendanceCommissions).values({
    code: optionalText(input.code) ?? draftCode(),
    subject: optionalText(input.subject),
    teacherName: optionalText(input.teacherName),
    classroom: optionalText(input.classroom),
    scheduleLabel: optionalText(input.scheduleLabel),
    periodLabel: optionalText(input.periodLabel),
    status: "draft",
    active: false,
  });
  const commissionId = Number(result[0].insertId);
  const studentName = optionalText(input.studentName);
  if (studentName) await db.insert(attendanceEnrollments).values({ commissionId, studentName });
  const commission = await db.select().from(attendanceCommissions).where(eq(attendanceCommissions.id, commissionId)).limit(1);
  return getCommissionReadModel(commission[0]);
}

/**
 * Implementa la operación updateCommissionDraft dentro de este módulo.
 */
export async function updateCommissionDraft(commissionId: number, input: CommissionFormInput) {
  const db = requireDb(await getDb());
  const existing = await db.select().from(attendanceCommissions).where(eq(attendanceCommissions.id, commissionId)).limit(1);
  if (!existing[0]) throw new Error("No encontramos la comisión indicada.");
  if (existing[0].status === "active") throw new Error("Las comisiones activas no pueden editarse desde este formulario de borrador.");
  await db.update(attendanceCommissions).set({
    code: optionalText(input.code) ?? existing[0].code,
    subject: optionalText(input.subject),
    teacherName: optionalText(input.teacherName),
    classroom: optionalText(input.classroom),
    scheduleLabel: optionalText(input.scheduleLabel),
    periodLabel: optionalText(input.periodLabel),
  }).where(eq(attendanceCommissions.id, commissionId));
  const studentName = optionalText(input.studentName);
  if (studentName) {
    await db.insert(attendanceEnrollments).values({ commissionId, studentName }).onDuplicateKeyUpdate({ set: { active: true } });
  }
  const commission = await db.select().from(attendanceCommissions).where(eq(attendanceCommissions.id, commissionId)).limit(1);
  return getCommissionReadModel(commission[0]);
}

/**
 * Implementa la operación addCommissionEnrollment dentro de este módulo.
 */
export async function addCommissionEnrollment(commissionId: number, studentName: string) {
  const db = requireDb(await getDb());
  const commission = await db.select().from(attendanceCommissions).where(eq(attendanceCommissions.id, commissionId)).limit(1);
  if (!commission[0]) throw new Error("No encontramos la comisión indicada.");
  const normalizedName = optionalText(studentName);
  if (!normalizedName) throw new Error("Ingresá el nombre del alumno.");
  await db.insert(attendanceEnrollments).values({ commissionId, studentName: normalizedName, active: true }).onDuplicateKeyUpdate({ set: { active: true } });
  return getCommissionReadModel(commission[0]);
}

/**
 * Implementa la operación deactivateCommissionEnrollment dentro de este módulo.
 */
export async function deactivateCommissionEnrollment(commissionId: number, enrollmentId: number) {
  const db = requireDb(await getDb());
  const commission = await db.select().from(attendanceCommissions).where(eq(attendanceCommissions.id, commissionId)).limit(1);
  if (!commission[0]) throw new Error("No encontramos la comisión indicada.");
  const enrollment = await db.select().from(attendanceEnrollments).where(and(eq(attendanceEnrollments.id, enrollmentId), eq(attendanceEnrollments.commissionId, commissionId))).limit(1);
  if (!enrollment[0]) throw new Error("No encontramos la inscripción indicada.");
  const activeEnrollments = await getCommissionEnrollments(commissionId);
  if (!canDeactivateEnrollment({ commissionIsActive: commission[0].status === "active", activeEnrollmentCount: activeEnrollments.length })) {
    throw new Error("Una comisión activa debe conservar al menos un alumno inscripto.");
  }
  await db.update(attendanceEnrollments).set({ active: false }).where(eq(attendanceEnrollments.id, enrollmentId));
  return getCommissionReadModel(commission[0]);
}

/**
 * Implementa la operación activateCommission dentro de este módulo.
 */
export async function activateCommission(commissionId: number) {
  const db = requireDb(await getDb());
  const commission = await db.select().from(attendanceCommissions).where(eq(attendanceCommissions.id, commissionId)).limit(1);
  if (!commission[0]) throw new Error("No encontramos la comisión indicada.");
  const readModel = await getCommissionReadModel(commission[0]);
  if (!readModel.canActivate) return { success: false as const, missing: readModel.activationMissing, commission: readModel };
  await db.update(attendanceCommissions).set({ status: "active", active: true }).where(eq(attendanceCommissions.id, commissionId));
  const updated = await db.select().from(attendanceCommissions).where(eq(attendanceCommissions.id, commissionId)).limit(1);
  return { success: true as const, missing: [] as string[], commission: await getCommissionReadModel(updated[0]) };
}

/**
 * Obtiene la información necesaria para CommissionAttendanceState dentro del flujo actual.
 */
async function getCommissionAttendanceState(commission: AttendanceCommission) {
  const db = requireDb(await getDb());
  const enrollments = await getCommissionEnrollments(commission.id);
  const sessions = await db.select().from(attendanceSessions).where(eq(attendanceSessions.commissionId, commission.id)).orderBy(desc(attendanceSessions.openedAt)).limit(1);
  let session = sessions[0] ?? null;
  if (session && !isQrWindowValid(session.status, session.qrExpiresAt, new Date())) {
    const closedAt = new Date();
    await db.update(attendanceSessions).set({ status: "closed", closedAt }).where(eq(attendanceSessions.id, session.id));
    session = { ...session, status: "closed", closedAt };
  }
  const records = session ? await db.select().from(attendanceRecords).where(eq(attendanceRecords.sessionId, session.id)).orderBy(desc(attendanceRecords.recordedAt)) : [];
  return {
    commission: await getCommissionReadModel(commission),
    enrolledStudents: enrollments.map((enrollment) => enrollment.studentName),
    activeSession: session && session.status === "open" ? {
      id: session.id,
      status: session.status,
      qrExpiresAt: toIso(session.qrExpiresAt),
      openedAt: toIso(session.openedAt),
      attendanceCount: records.length,
    } : null,
    latestRecords: records.map((record) => ({ ...record, recordedAt: toIso(record.recordedAt) })),
  };
}

/**
 * Implementa la operación openAttendanceSessionForCommission dentro de este módulo.
 */
async function openAttendanceSessionForCommission(commission: AttendanceCommission) {
  const db = requireDb(await getDb());
  const commissionModel = await getCommissionReadModel(commission);
  if (!canStartTeacherSession({ status: commissionModel.status, enrollmentCount: commissionModel.enrollmentCount })) {
    throw new Error("La comisión debe estar activa y contar con al menos un alumno inscripto.");
  }
  await db.update(attendanceSessions).set({ status: "closed", closedAt: new Date() }).where(and(eq(attendanceSessions.commissionId, commission.id), eq(attendanceSessions.status, "open")));
  const qrToken = createPlainQrToken();
  const now = new Date();
  const qrExpiresAt = qrExpirationFrom(now);
  const result = await db.insert(attendanceSessions).values({ commissionId: commission.id, status: "open", qrHash: hashQrToken(qrToken), qrExpiresAt, openedAt: now });
  return { sessionId: Number(result[0].insertId), qrToken, qrExpiresAt: qrExpiresAt.toISOString(), commission: commissionModel };
}

/**
 * Obtiene la información necesaria para TeacherCommissions dentro del flujo actual.
 */
export async function listTeacherCommissions() {
  const db = requireDb(await getDb());
  const commissions = await db.select().from(attendanceCommissions).where(and(eq(attendanceCommissions.status, "active"), eq(attendanceCommissions.teacherName, DEMO_TEACHER_NAME))).orderBy(desc(attendanceCommissions.updatedAt));
  return Promise.all(commissions.map(getCommissionReadModel));
}

/**
 * Obtiene la información necesaria para TeacherCommissionAttendanceState dentro del flujo actual.
 */
export async function getTeacherCommissionAttendanceState(commissionId: number) {
  const db = requireDb(await getDb());
  const commission = await db.select().from(attendanceCommissions).where(and(eq(attendanceCommissions.id, commissionId), eq(attendanceCommissions.status, "active"), eq(attendanceCommissions.teacherName, DEMO_TEACHER_NAME))).limit(1);
  if (!commission[0]) throw new Error("La comisión indicada no está disponible para este docente.");
  return getCommissionAttendanceState(commission[0]);
}

/**
 * Implementa la operación openTeacherCommissionSession dentro de este módulo.
 */
export async function openTeacherCommissionSession(commissionId: number) {
  const db = requireDb(await getDb());
  const commission = await db.select().from(attendanceCommissions).where(and(eq(attendanceCommissions.id, commissionId), eq(attendanceCommissions.status, "active"), eq(attendanceCommissions.teacherName, DEMO_TEACHER_NAME))).limit(1);
  if (!commission[0]) throw new Error("La comisión indicada no está disponible para este docente.");
  return openAttendanceSessionForCommission(commission[0]);
}

type TeacherActivityInput = {
  commissionId: number;
  type: "evaluation" | "practical_work";
  title: string;
  description: string;
  dueAt: Date | null;
  maxScore?: number;
  attachment?: {
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    fileBase64: string;
  };
};

/**
 * Implementa la operación safeStorageName dentro de este módulo.
 */
function safeStorageName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-180) || "adjunto";
}

/**
 * Implementa la operación academicActivityView dentro de este módulo.
 */
function academicActivityView(activity: AcademicActivity) {
  return {
    ...activity,
    dueAt: toIso(activity.dueAt),
    createdAt: toIso(activity.createdAt),
    updatedAt: toIso(activity.updatedAt),
  };
}

/**
 * Implementa la operación academicSubmissionView dentro de este módulo.
 */
function academicSubmissionView(submission: AcademicSubmission) {
  return {
    ...submission,
    submittedAt: toIso(submission.submittedAt),
    gradedAt: toIso(submission.gradedAt),
    updatedAt: toIso(submission.updatedAt),
  };
}

/**
 * Obtiene la información necesaria para TeacherCommission dentro del flujo actual.
 */
async function getTeacherCommission(commissionId: number) {
  const db = requireDb(await getDb());
  const commission = await db.select().from(attendanceCommissions).where(and(
    eq(attendanceCommissions.id, commissionId),
    eq(attendanceCommissions.status, "active"),
    eq(attendanceCommissions.teacherName, DEMO_TEACHER_NAME),
  )).limit(1);
  if (!commission[0]) throw new Error("La comisión indicada no está disponible para este docente.");
  return commission[0];
}

/**
 * Obtiene la información necesaria para TeacherActivity dentro del flujo actual.
 */
async function getTeacherActivity(activityId: number) {
  const db = requireDb(await getDb());
  const activity = await db.select().from(academicActivities).where(eq(academicActivities.id, activityId)).limit(1);
  if (!activity[0]) throw new Error("No encontramos la actividad indicada.");
  await getTeacherCommission(activity[0].commissionId);
  return activity[0];
}

/**
 * Obtiene la información necesaria para TeacherAcademicActivities dentro del flujo actual.
 */
export async function listTeacherAcademicActivities(commissionId: number) {
  await ensureAttendanceDemo();
  const db = requireDb(await getDb());
  await getTeacherCommission(commissionId);
  const activities = await db.select().from(academicActivities).where(eq(academicActivities.commissionId, commissionId)).orderBy(desc(academicActivities.createdAt));
  const submissions = await db.select().from(academicSubmissions).orderBy(desc(academicSubmissions.submittedAt));
  const submissionCount = new Map<number, number>();
  submissions.forEach((submission) => submissionCount.set(submission.activityId, (submissionCount.get(submission.activityId) ?? 0) + 1));
  const pendingReview = new Map<number, number>();
  submissions.filter((submission) => submission.score === null).forEach((submission) => pendingReview.set(submission.activityId, (pendingReview.get(submission.activityId) ?? 0) + 1));
  return activities.map((activity) => ({
    ...academicActivityView(activity),
    submissionCount: submissionCount.get(activity.id) ?? 0,
    pendingReviewCount: pendingReview.get(activity.id) ?? 0,
  }));
}

/**
 * Crea el recurso asociado a TeacherAcademicActivity con las validaciones del dominio.
 */
export async function createTeacherAcademicActivity(input: TeacherActivityInput) {
  await ensureAttendanceDemo();
  const db = requireDb(await getDb());
  await getTeacherCommission(input.commissionId);

  let attachment: { key: string; url: string } | null = null;
  if (input.attachment) {
    if (!isAcademicFileSizeAllowed(input.attachment.sizeBytes)) throw new Error("El archivo adjunto debe pesar hasta 5 MB.");
    const bytes = Buffer.from(input.attachment.fileBase64, "base64");
    if (bytes.length !== input.attachment.sizeBytes) throw new Error("El tamaño del archivo adjunto no coincide con el contenido recibido.");
    attachment = await storagePut(
      `teacher-activities/${input.commissionId}/${safeStorageName(input.attachment.fileName)}`,
      bytes,
      input.attachment.mimeType,
    );
  }

  const result = await db.insert(academicActivities).values({
    commissionId: input.commissionId,
    type: input.type,
    title: input.title.trim(),
    description: input.description.trim(),
    dueAt: input.dueAt,
    maxScore: input.maxScore ?? 10,
    published: true,
    attachmentName: input.attachment?.fileName ?? null,
    attachmentKey: attachment?.key ?? null,
    attachmentUrl: attachment?.url ?? null,
    attachmentMimeType: input.attachment?.mimeType ?? null,
    attachmentSizeBytes: input.attachment?.sizeBytes ?? null,
  });
  const activityId = Number(result[0].insertId);
  const activity = await db.select().from(academicActivities).where(eq(academicActivities.id, activityId)).limit(1);
  return academicActivityView(activity[0]);
}

/**
 * Obtiene la información necesaria para TeacherActivitySubmissions dentro del flujo actual.
 */
export async function listTeacherActivitySubmissions(activityId: number) {
  const db = requireDb(await getDb());
  const activity = await getTeacherActivity(activityId);
  const submissions = await db.select().from(academicSubmissions).where(eq(academicSubmissions.activityId, activityId)).orderBy(desc(academicSubmissions.submittedAt));
  return { activity: academicActivityView(activity), submissions: submissions.map(academicSubmissionView) };
}

/**
 * Implementa la operación gradeTeacherAcademicSubmission dentro de este módulo.
 */
export async function gradeTeacherAcademicSubmission(input: { submissionId: number; score: number; feedback?: string }) {
  const db = requireDb(await getDb());
  const submission = await db.select().from(academicSubmissions).where(eq(academicSubmissions.id, input.submissionId)).limit(1);
  if (!submission[0]) throw new Error("No encontramos la entrega indicada.");
  const activity = await getTeacherActivity(submission[0].activityId);
  if (!canAssignAcademicScore(input.score, activity.maxScore)) throw new Error(`La calificación debe ser un número entero entre 0 y ${activity.maxScore}.`);
  const feedback = input.feedback?.trim() || null;
  const gradedAt = new Date();
  await db.update(academicSubmissions).set({ score: input.score, feedback, gradedAt }).where(eq(academicSubmissions.id, submission[0].id));
  const updated = await db.select().from(academicSubmissions).where(eq(academicSubmissions.id, submission[0].id)).limit(1);
  return academicSubmissionView(updated[0]);
}

/**
 * Obtiene la información necesaria para StudentCommissions dentro del flujo actual.
 */
export async function listStudentCommissions() {
  const db = requireDb(await getDb());
  const enrollments = await db.select().from(attendanceEnrollments).where(and(eq(attendanceEnrollments.studentName, DEMO_STUDENT_NAME), eq(attendanceEnrollments.active, true)));
  const candidates = await Promise.all(enrollments.map(async (enrollment) => {
    const commission = await db.select().from(attendanceCommissions).where(eq(attendanceCommissions.id, enrollment.commissionId)).limit(1);
    return commission[0] ? { commission: commission[0], isEnrolled: true } : null;
  }));
  const visible = candidates.filter((item): item is { commission: AttendanceCommission; isEnrolled: true } => Boolean(item)).filter((item) => canViewStudentCommission({ status: item.commission.status, isEnrolled: item.isEnrolled }));
  return Promise.all(visible.map((item) => getCommissionReadModel(item.commission)));
}

/**
 * Obtiene la información necesaria para StudentCommissionAttendanceState dentro del flujo actual.
 */
export async function getStudentCommissionAttendanceState(commissionId: number) {
  const db = requireDb(await getDb());
  const enrollment = await db.select().from(attendanceEnrollments).where(and(eq(attendanceEnrollments.commissionId, commissionId), eq(attendanceEnrollments.studentName, DEMO_STUDENT_NAME), eq(attendanceEnrollments.active, true))).limit(1);
  if (!enrollment[0]) throw new Error("No estás inscripto en esta comisión.");
  const commission = await db.select().from(attendanceCommissions).where(and(eq(attendanceCommissions.id, commissionId), eq(attendanceCommissions.status, "active"))).limit(1);
  if (!commission[0]) throw new Error("La comisión indicada no está activa.");
  return getCommissionAttendanceState(commission[0]);
}

/**
 * Obtiene la información necesaria para StudentAttendanceHistory dentro del flujo actual.
 */
export async function getStudentAttendanceHistory() {
  const db = requireDb(await getDb());
  const records = await db.select().from(attendanceRecords).where(eq(attendanceRecords.studentName, DEMO_STUDENT_NAME)).orderBy(desc(attendanceRecords.recordedAt));
  return Promise.all(records.map(async (record) => {
    const commission = await db.select().from(attendanceCommissions).where(eq(attendanceCommissions.id, record.commissionId)).limit(1);
    return { ...record, recordedAt: toIso(record.recordedAt), subject: commission[0]?.subject ?? "Comisión", classroom: commission[0]?.classroom ?? "Aula sin asignar", code: commission[0]?.code ?? "" };
  }));
}

/**
 * Obtiene la información necesaria para AttendanceDemoState dentro del flujo actual.
 */
export async function getAttendanceDemoState() {
  const commission = await ensureAttendanceDemo();
  return getCommissionAttendanceState(commission);
}

/**
 * Implementa la operación openAttendanceDemoSession dentro de este módulo.
 */
export async function openAttendanceDemoSession() {
  const commission = await ensureAttendanceDemo();
  return openAttendanceSessionForCommission(commission);
}

/**
 * Implementa la operación checkInAttendanceDemo dentro de este módulo.
 */
export async function checkInAttendanceDemo({ qrToken, studentName = DEMO_STUDENT_NAME, expectedCommissionId }: { qrToken: string; studentName?: string; expectedCommissionId?: number }) {
  const db = requireDb(await getDb());
  await ensureAttendanceDemo();
  const tokenHash = hashQrToken(qrToken);
  const sessions = await db.select().from(attendanceSessions).where(eq(attendanceSessions.qrHash, tokenHash)).limit(1);
  const session = sessions[0];
  const now = new Date();
  const qrIsValid = Boolean(session && isQrWindowValid(session.status, session.qrExpiresAt, now));
  if (!session || !qrIsValid) return { outcome: "invalid_qr" as const };

  const enrollment = await db.select().from(attendanceEnrollments).where(and(eq(attendanceEnrollments.commissionId, session.commissionId), eq(attendanceEnrollments.studentName, studentName), eq(attendanceEnrollments.active, true))).limit(1);
  const existing = await db.select().from(attendanceRecords).where(and(eq(attendanceRecords.sessionId, session.id), eq(attendanceRecords.studentName, studentName))).limit(1);
  const outcome = attendanceCheckInOutcome({ hasEnrollment: Boolean(enrollment[0]), qrIsValid, alreadyRecorded: Boolean(existing[0]), commissionMatches: !expectedCommissionId || session.commissionId === expectedCommissionId });
  if (outcome !== "registered") return { outcome };

  const result = await db.insert(attendanceRecords).values({
    sessionId: session.id,
    commissionId: session.commissionId,
    studentName,
    status: "present",
    source: "qr",
    recordedAt: now,
  });
  const recordId = Number(result[0].insertId);
  return { outcome, recordId, recordedAt: now.toISOString() };
}

/**
 * Implementa la operación closeAttendanceDemoSession dentro de este módulo.
 */
export async function closeAttendanceDemoSession(sessionId: number) {
  const db = requireDb(await getDb());
  await db.update(attendanceSessions).set({ status: "closed", closedAt: new Date() }).where(eq(attendanceSessions.id, sessionId));
  return { success: true } as const;
}

type JustificationAttachment = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  fileBase64: string;
};

type StudentJustificationInput = {
  recordReference: string;
  commissionId: number;
  subject: string;
  classroom?: string | null;
  absenceDateLabel: string;
  reason: string;
  comment?: string | null;
  attachment?: JustificationAttachment;
};

/**
 * Implementa la operación justificationView dentro de este módulo.
 */
function justificationView(justification: AttendanceJustification) {
  return {
    ...justification,
    reviewedAt: toIso(justification.reviewedAt),
    createdAt: toIso(justification.createdAt),
    updatedAt: toIso(justification.updatedAt),
  };
}

/**
 * Obtiene la información necesaria para JustificationCommission dentro del flujo actual.
 */
async function getJustificationCommission(commissionId: number) {
  const db = requireDb(await getDb());
  const commission = await db.select().from(attendanceCommissions).where(and(
    eq(attendanceCommissions.id, commissionId),
    eq(attendanceCommissions.status, "active"),
  )).limit(1);
  if (!commission[0]) throw new Error("No encontramos una comisión activa para esta inasistencia.");
  return commission[0];
}

/**
 * Implementa la operación justificationStorageName dentro de este módulo.
 */
function justificationStorageName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-180) || "constancia";
}

/**
 * Crea el recurso asociado a StudentAttendanceJustification con las validaciones del dominio.
 */
export async function createStudentAttendanceJustification(input: StudentJustificationInput) {
  await ensureAttendanceDemo();
  const db = requireDb(await getDb());
  const commission = await getJustificationCommission(input.commissionId);
  const enrollment = await db.select().from(attendanceEnrollments).where(and(
    eq(attendanceEnrollments.commissionId, input.commissionId),
    eq(attendanceEnrollments.studentName, DEMO_STUDENT_NAME),
    eq(attendanceEnrollments.active, true),
  )).limit(1);
  if (!enrollment[0]) throw new Error("No podés justificar una inasistencia de una comisión sin inscripción activa.");
  if (!canSubmitJustification({ comment: input.comment, hasAttachment: Boolean(input.attachment) })) throw new Error("Escribí un comentario o adjuntá una constancia para continuar.");

  let attachment: { key: string; url: string } | null = null;
  if (input.attachment) {
    if (input.attachment.sizeBytes <= 0 || input.attachment.sizeBytes > MAX_JUSTIFICATION_FILE_BYTES) throw new Error("La constancia adjunta debe pesar hasta 5 MB.");
    const bytes = Buffer.from(input.attachment.fileBase64, "base64");
    if (bytes.length !== input.attachment.sizeBytes) throw new Error("El tamaño de la constancia no coincide con el contenido recibido.");
    attachment = await storagePut(
      `attendance-justifications/${input.commissionId}/${justificationStorageName(input.attachment.fileName)}`,
      bytes,
      input.attachment.mimeType,
    );
  }

  const result = await db.insert(attendanceJustifications).values({
    recordReference: input.recordReference,
    commissionId: input.commissionId,
    studentName: DEMO_STUDENT_NAME,
    subject: input.subject.trim(),
    classroom: input.classroom ?? commission.classroom ?? null,
    absenceDateLabel: input.absenceDateLabel,
    reason: input.reason.trim(),
    comment: input.comment?.trim() || null,
    attachmentName: input.attachment?.fileName ?? null,
    attachmentKey: attachment?.key ?? null,
    attachmentUrl: attachment?.url ?? null,
    attachmentMimeType: input.attachment?.mimeType ?? null,
    attachmentSizeBytes: input.attachment?.sizeBytes ?? null,
    status: "pending",
  });
  const justification = await db.select().from(attendanceJustifications).where(eq(attendanceJustifications.id, Number(result[0].insertId))).limit(1);
  return justificationView(justification[0]);
}

/**
 * Obtiene la información necesaria para StudentAttendanceJustifications dentro del flujo actual.
 */
export async function listStudentAttendanceJustifications() {
  await ensureAttendanceDemo();
  const db = requireDb(await getDb());
  const items = await db.select().from(attendanceJustifications).where(eq(attendanceJustifications.studentName, DEMO_STUDENT_NAME)).orderBy(desc(attendanceJustifications.createdAt));
  return items.map(justificationView);
}

/**
 * Obtiene la información necesaria para TeacherAttendanceJustifications dentro del flujo actual.
 */
export async function listTeacherAttendanceJustifications() {
  await ensureAttendanceDemo();
  const db = requireDb(await getDb());
  const items = await db.select().from(attendanceJustifications).orderBy(desc(attendanceJustifications.createdAt));
  const visible = await Promise.all(items.map(async (item) => {
    const commission = await db.select().from(attendanceCommissions).where(and(
      eq(attendanceCommissions.id, item.commissionId),
      eq(attendanceCommissions.teacherName, DEMO_TEACHER_NAME),
    )).limit(1);
    return commission[0] ? justificationView(item) : null;
  }));
  return visible.filter((item): item is ReturnType<typeof justificationView> => Boolean(item));
}

/**
 * Obtiene la información necesaria para AdministrativeAttendanceJustifications dentro del flujo actual.
 */
export async function listAdministrativeAttendanceJustifications() {
  await ensureAttendanceDemo();
  const db = requireDb(await getDb());
  const items = await db.select().from(attendanceJustifications).orderBy(desc(attendanceJustifications.createdAt));
  return items.map(justificationView);
}

/**
 * Implementa la operación reviewAttendanceJustification dentro de este módulo.
 */
export async function reviewAttendanceJustification(input: { justificationId: number; decision: "approved" | "rejected"; reviewComment?: string | null; reviewerRole: "docente" | "administrativo" }) {
  const db = requireDb(await getDb());
  const justification = await db.select().from(attendanceJustifications).where(eq(attendanceJustifications.id, input.justificationId)).limit(1);
  if (!justification[0]) throw new Error("No encontramos la justificación indicada.");
  if (!canReviewJustification(justification[0].status)) throw new Error("Esta justificación ya fue resuelta.");
  if (input.reviewerRole === "docente") {
    const commission = await db.select().from(attendanceCommissions).where(and(
      eq(attendanceCommissions.id, justification[0].commissionId),
      eq(attendanceCommissions.teacherName, DEMO_TEACHER_NAME),
    )).limit(1);
    if (!commission[0]) throw new Error("No tenés permisos para revisar esta justificación.");
  }
  const reviewerName = input.reviewerRole === "docente" ? DEMO_TEACHER_NAME : "Martina Costa";
  const reviewedAt = new Date();
  await db.update(attendanceJustifications).set({
    status: input.decision,
    reviewerRole: input.reviewerRole,
    reviewerName,
    reviewComment: input.reviewComment?.trim() || null,
    reviewedAt,
  }).where(eq(attendanceJustifications.id, justification[0].id));
  const updated = await db.select().from(attendanceJustifications).where(eq(attendanceJustifications.id, justification[0].id)).limit(1);
  return justificationView(updated[0]);
}
