/**
 * @archivo server/routers.ts
 * @descripcion Capa de servidor que implementa datos, reglas y endpoints del dominio académico.
 */
import { COOKIE_NAME } from "../shared/const.js";
import { z } from "zod";
import * as db from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  attendance: router({
    setupDemo: publicProcedure.mutation(() => db.ensureAttendanceDemo()),
    state: publicProcedure.query(() => db.getAttendanceDemoState()),
    openSession: publicProcedure.mutation(() => db.openAttendanceDemoSession()),
    checkIn: publicProcedure.input(z.object({ qrToken: z.string().min(12), studentName: z.string().min(2).max(160).optional(), expectedCommissionId: z.number().int().positive().optional() })).mutation(({ input }) => db.checkInAttendanceDemo(input)),
    closeSession: publicProcedure.input(z.object({ sessionId: z.number().int().positive() })).mutation(({ input }) => db.closeAttendanceDemoSession(input.sessionId)),
  }),
  teacher: router({
    commissions: publicProcedure.query(() => db.listTeacherCommissions()),
    attendanceState: publicProcedure.input(z.object({ commissionId: z.number().int().positive() })).query(({ input }) => db.getTeacherCommissionAttendanceState(input.commissionId)),
    openSession: publicProcedure.input(z.object({ commissionId: z.number().int().positive() })).mutation(({ input }) => db.openTeacherCommissionSession(input.commissionId)),
  }),
  activities: router({
    teacherList: publicProcedure.input(z.object({ commissionId: z.number().int().positive() })).query(({ input }) => db.listTeacherAcademicActivities(input.commissionId)),
    create: publicProcedure.input(z.object({
      commissionId: z.number().int().positive(),
      type: z.enum(["evaluation", "practical_work"]),
      title: z.string().trim().min(3).max(180),
      description: z.string().trim().min(3).max(5000),
      dueAt: z.string().datetime().nullable(),
      maxScore: z.number().int().min(1).max(100).optional(),
      attachment: z.object({
        fileName: z.string().min(1).max(255),
        mimeType: z.string().min(1).max(160),
        sizeBytes: z.number().int().positive().max(5 * 1024 * 1024),
        fileBase64: z.string().min(4).max(7 * 1024 * 1024),
      }).nullable().optional(),
    })).mutation(({ input }) => db.createTeacherAcademicActivity({
      ...input,
      dueAt: input.dueAt ? new Date(input.dueAt) : null,
      attachment: input.attachment ?? undefined,
    })),
    submissions: publicProcedure.input(z.object({ activityId: z.number().int().positive() })).query(({ input }) => db.listTeacherActivitySubmissions(input.activityId)),
    grade: publicProcedure.input(z.object({
      submissionId: z.number().int().positive(),
      score: z.number().int().min(0).max(100),
      feedback: z.string().trim().max(3000).optional(),
    })).mutation(({ input }) => db.gradeTeacherAcademicSubmission(input)),
  }),
  justifications: router({
    studentList: publicProcedure.query(() => db.listStudentAttendanceJustifications()),
    create: publicProcedure.input(z.object({
      recordReference: z.string().trim().min(1).max(80),
      commissionId: z.number().int().positive(),
      subject: z.string().trim().min(2).max(160),
      classroom: z.string().trim().max(120).nullable().optional(),
      absenceDateLabel: z.string().trim().min(2).max(80),
      reason: z.string().trim().min(2).max(120),
      comment: z.string().trim().max(3000).nullable().optional(),
      attachment: z.object({
        fileName: z.string().min(1).max(255),
        mimeType: z.string().min(1).max(160),
        sizeBytes: z.number().int().positive().max(5 * 1024 * 1024),
        fileBase64: z.string().min(4).max(7 * 1024 * 1024),
      }).nullable().optional(),
    })).mutation(({ input }) => db.createStudentAttendanceJustification({ ...input, attachment: input.attachment ?? undefined })),
    teacherList: publicProcedure.query(() => db.listTeacherAttendanceJustifications()),
    administrativeList: publicProcedure.query(() => db.listAdministrativeAttendanceJustifications()),
    review: publicProcedure.input(z.object({
      justificationId: z.number().int().positive(),
      decision: z.enum(["approved", "rejected"]),
      reviewComment: z.string().trim().max(3000).nullable().optional(),
      reviewerRole: z.enum(["docente", "administrativo"]),
    })).mutation(({ input }) => db.reviewAttendanceJustification(input)),
  }),
  student: router({
    commissions: publicProcedure.query(() => db.listStudentCommissions()),
    attendanceState: publicProcedure.input(z.object({ commissionId: z.number().int().positive() })).query(({ input }) => db.getStudentCommissionAttendanceState(input.commissionId)),
    attendanceHistory: publicProcedure.query(() => db.getStudentAttendanceHistory()),
  }),
  commissions: router({
    list: publicProcedure.query(() => db.listAdministrativeCommissions()),
    get: publicProcedure.input(z.object({ commissionId: z.number().int().positive() })).query(({ input }) => db.getAdministrativeCommission(input.commissionId)),
    addEnrollment: publicProcedure.input(z.object({ commissionId: z.number().int().positive(), studentName: z.string().min(2).max(160) })).mutation(({ input }) => db.addCommissionEnrollment(input.commissionId, input.studentName)),
    deactivateEnrollment: publicProcedure.input(z.object({ commissionId: z.number().int().positive(), enrollmentId: z.number().int().positive() })).mutation(({ input }) => db.deactivateCommissionEnrollment(input.commissionId, input.enrollmentId)),
    createDraft: publicProcedure.input(z.object({
      code: z.string().max(48).optional(),
      subject: z.string().max(160).optional(),
      teacherName: z.string().max(160).optional(),
      classroom: z.string().max(120).optional(),
      scheduleLabel: z.string().max(120).optional(),
      periodLabel: z.string().max(120).optional(),
      studentName: z.string().max(160).optional(),
    })).mutation(({ input }) => db.createCommissionDraft(input)),
    updateDraft: publicProcedure.input(z.object({
      commissionId: z.number().int().positive(),
      code: z.string().max(48).optional(),
      subject: z.string().max(160).optional(),
      teacherName: z.string().max(160).optional(),
      classroom: z.string().max(120).optional(),
      scheduleLabel: z.string().max(120).optional(),
      periodLabel: z.string().max(120).optional(),
      studentName: z.string().max(160).optional(),
    })).mutation(({ input }) => db.updateCommissionDraft(input.commissionId, input)),
    activate: publicProcedure.input(z.object({ commissionId: z.number().int().positive() })).mutation(({ input }) => db.activateCommission(input.commissionId)),
  }),
});

export type AppRouter = typeof appRouter;
