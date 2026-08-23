/**
 * @archivo drizzle/schema.ts
 * @descripcion Definición declarativa del modelo de datos y sus relaciones.
 */
import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/** Core user table synchronized by the OAuth session infrastructure. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const academicProfiles = mysqlTable("academic_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  academicRole: mysqlEnum("academicRole", ["alumno", "docente", "administrativo"]).notNull(),
  displayName: varchar("displayName", { length: 160 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AcademicProfile = typeof academicProfiles.$inferSelect;
export type AcademicRole = AcademicProfile["academicRole"];

export const attendanceCommissions = mysqlTable("attendance_commissions", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 48 }).notNull().unique(),
  subject: varchar("subject", { length: 160 }),
  classroom: varchar("classroom", { length: 120 }),
  teacherName: varchar("teacherName", { length: 160 }),
  scheduleLabel: varchar("scheduleLabel", { length: 120 }),
  periodLabel: varchar("periodLabel", { length: 120 }),
  status: mysqlEnum("status", ["draft", "active"]).default("active").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const attendanceEnrollments = mysqlTable("attendance_enrollments", {
  id: int("id").autoincrement().primaryKey(),
  commissionId: int("commissionId").notNull().references(() => attendanceCommissions.id),
  studentName: varchar("studentName", { length: 160 }).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [uniqueIndex("attendance_enrollments_commission_student_unique").on(table.commissionId, table.studentName)]);

export const attendanceSessions = mysqlTable("attendance_sessions", {
  id: int("id").autoincrement().primaryKey(),
  commissionId: int("commissionId").notNull().references(() => attendanceCommissions.id),
  status: mysqlEnum("status", ["open", "closed"]).default("open").notNull(),
  qrHash: varchar("qrHash", { length: 64 }).notNull().unique(),
  qrExpiresAt: timestamp("qrExpiresAt").notNull(),
  openedAt: timestamp("openedAt").defaultNow().notNull(),
  closedAt: timestamp("closedAt"),
});

export const attendanceRecords = mysqlTable("attendance_records", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => attendanceSessions.id),
  commissionId: int("commissionId").notNull().references(() => attendanceCommissions.id),
  studentName: varchar("studentName", { length: 160 }).notNull(),
  status: mysqlEnum("status", ["present", "late"]).default("present").notNull(),
  source: mysqlEnum("source", ["qr", "manual"]).default("qr").notNull(),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
}, (table) => [uniqueIndex("attendance_records_session_student_unique").on(table.sessionId, table.studentName)]);

/** Student absence justification submitted against an attendance record or a demo attendance reference. */
export const attendanceJustifications = mysqlTable("attendance_justifications", {
  id: int("id").autoincrement().primaryKey(),
  attendanceRecordId: int("attendanceRecordId").references(() => attendanceRecords.id),
  recordReference: varchar("recordReference", { length: 80 }).notNull(),
  commissionId: int("commissionId").notNull().references(() => attendanceCommissions.id),
  studentName: varchar("studentName", { length: 160 }).notNull(),
  subject: varchar("subject", { length: 160 }).notNull(),
  classroom: varchar("classroom", { length: 120 }),
  absenceDateLabel: varchar("absenceDateLabel", { length: 80 }).notNull(),
  reason: varchar("reason", { length: 120 }).notNull(),
  comment: text("comment"),
  attachmentName: varchar("attachmentName", { length: 255 }),
  attachmentKey: varchar("attachmentKey", { length: 500 }),
  attachmentUrl: varchar("attachmentUrl", { length: 800 }),
  attachmentMimeType: varchar("attachmentMimeType", { length: 160 }),
  attachmentSizeBytes: int("attachmentSizeBytes"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewerRole: mysqlEnum("reviewerRole", ["docente", "administrativo"]),
  reviewerName: varchar("reviewerName", { length: 160 }),
  reviewComment: text("reviewComment"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("attendance_justifications_student_reference_unique").on(table.studentName, table.recordReference)]);

/** Activities created by a teacher for a specific active commission. */
export const academicActivities = mysqlTable("academic_activities", {
  id: int("id").autoincrement().primaryKey(),
  commissionId: int("commissionId").notNull().references(() => attendanceCommissions.id),
  type: mysqlEnum("type", ["evaluation", "practical_work"]).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description").notNull(),
  dueAt: timestamp("dueAt"),
  attachmentName: varchar("attachmentName", { length: 255 }),
  attachmentKey: varchar("attachmentKey", { length: 500 }),
  attachmentUrl: varchar("attachmentUrl", { length: 800 }),
  attachmentMimeType: varchar("attachmentMimeType", { length: 160 }),
  attachmentSizeBytes: int("attachmentSizeBytes"),
  maxScore: int("maxScore").default(10).notNull(),
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** One current submission per student and academic activity. */
export const academicSubmissions = mysqlTable("academic_submissions", {
  id: int("id").autoincrement().primaryKey(),
  activityId: int("activityId").notNull().references(() => academicActivities.id),
  studentName: varchar("studentName", { length: 160 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 800 }).notNull(),
  mimeType: varchar("mimeType", { length: 160 }).notNull(),
  sizeBytes: int("sizeBytes").notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  score: int("score"),
  feedback: text("feedback"),
  gradedAt: timestamp("gradedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("academic_submissions_activity_student_unique").on(table.activityId, table.studentName)]);

export type AttendanceCommission = typeof attendanceCommissions.$inferSelect;
export type AttendanceSession = typeof attendanceSessions.$inferSelect;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type AttendanceJustification = typeof attendanceJustifications.$inferSelect;
export type AcademicActivity = typeof academicActivities.$inferSelect;
export type AcademicSubmission = typeof academicSubmissions.$inferSelect;
