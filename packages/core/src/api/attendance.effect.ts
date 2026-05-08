import { Data, Effect, pipe } from 'effect';
import type {
  AttendanceReport,
  AttendanceSnapshot,
  SchoolAttendancePulse,
} from '../logic/schemas/attendance.schema';
import { attendanceProjectionServices } from './runtimes/attendanceProjection.runtime';
import { educational, audit } from '../logic/managers/factory';
import type { AttendanceRecord } from '../types';

/**
 * Custom Error Types for Domain-Specific Failures
 */
export class AttendanceError extends Data.TaggedError('AttendanceError')<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class AuditError extends Data.TaggedError('AuditError')<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

type AttendanceAuditContext = {
  actorId?: string;
  reason?: string;
  accessKind?: 'teacher_marking' | 'institutional_read' | 'institutional_export';
  idempotencyKey?: string;
};

/**
 * Effect-powered Audit Logger (delegates to Sovereign Audit Manager)
 */
const logAttendanceAudit = (params: {
  action: string;
  entityId: string;
  executorId?: string;
  metadata?: Record<string, unknown>;
}): Effect.Effect<void, never, never> => {
  if (!params.executorId) return Effect.void;

  return pipe(
    Effect.promise(() =>
      audit.log({
        action: params.action,
        entity_id: params.entityId,
        target_id: params.entityId,
        entity_type: 'attendance',
        executor_id: params.executorId!,
        metadata: params.metadata ?? {},
      }),
    ),
    Effect.catchAll((e) => Effect.logError(`Audit logging crashed: ${e}`)),
    Effect.asVoid,
  );
};

/**
 * High-Fidelity Attendance API (Effect-TS Edition)
 */
export const attendanceAPI = {
  /**
   * Record attendance for a student with automatic audit tracking
   */
  record: (
    classroomId: string,
    studentId: string,
    status: string,
    date: string,
    auditCtx?: AttendanceAuditContext,
  ): Effect.Effect<AttendanceRecord, AttendanceError | unknown, never> =>
    Effect.gen(function* () {
      // 1. Check for existing record to determine audit action
      const existing = yield* Effect.promise(() =>
        educational.attendance
          .getByDate(classroomId, date)
          .then((records) =>
            (records as unknown as AttendanceRecord[]).find((r) => r.student_id === studentId),
          ),
      );

      // 2. Perform the record operation
      const result = yield* Effect.tryPromise({
        try: () =>
          educational.attendance.record(
            classroomId,
            studentId,
            status,
            date,
          ) as Promise<AttendanceRecord>,
        catch: (e) =>
          new AttendanceError({
            message: 'Failed to record attendance',
            cause: e,
          }),
      });

      // 3. Log Audit (Fire and Forget)
      yield* Effect.forkDaemon(
        logAttendanceAudit({
          action:
            existing && existing.status !== status
              ? 'attendance_overridden'
              : 'attendance_recorded',
          entityId: result.id,
          executorId: auditCtx?.actorId,
          metadata: {
            classroomId,
            studentId,
            date,
            previousStatus: existing?.status ?? null,
            nextStatus: status,
            reason: auditCtx?.reason ?? null,
            accessKind: auditCtx?.accessKind ?? 'teacher_marking',
          },
        }),
      );

      return result;
    }),

  /**
   * Batch record attendance
   */
  batchRecord: (
    records: Array<{
      classroom_id: string;
      student_id: string;
      status: string;
      date: string;
      occurred_at?: string;
      academic_cycle_id?: string | null;
    }>,
    auditCtx?: AttendanceAuditContext,
  ): Effect.Effect<AttendanceRecord[], AttendanceError | unknown, never> =>
    Effect.gen(function* () {
      const result = yield* Effect.tryPromise({
        try: () =>
          educational.attendance.batchRecord(records) as Promise<AttendanceRecord[]>,
        catch: (e) =>
          new AttendanceError({
            message: 'Failed batch attendance recording',
            cause: e,
          }),
      });

      if (auditCtx?.actorId) {
        yield* Effect.forkDaemon(
          logAttendanceAudit({
            action: 'attendance_batch_recorded',
            entityId: records[0]?.classroom_id ?? 'attendance-batch',
            executorId: auditCtx.actorId,
            metadata: {
              classroomIds: Array.from(new Set(records.map((r) => r.classroom_id))),
              dates: Array.from(new Set(records.map((r) => r.date))),
              count: records.length,
              reason: auditCtx.reason ?? null,
              accessKind: auditCtx.accessKind ?? 'teacher_marking',
              idempotencyKey: auditCtx.idempotencyKey,
            },
          }),
        );
      }

      return result;
    }),

  /**
   * Get classroom snapshot
   */
  getClassroomAttendanceSnapshot: (classroomId: string, viewDate: string) =>
    Effect.gen(function* () {
      const records = yield* Effect.tryPromise({
        try: () =>
          educational.attendance.getByDate(classroomId, viewDate) as Promise<
            AttendanceRecord[]
          >,
        catch: (e) =>
          new AttendanceError({
            message: 'Failed to fetch snapshot',
            cause: e,
          }),
      });

      return {
        classroomId,
        viewDate,
        records,
      } as AttendanceSnapshot;
    }),

  /**
   * Get student timeline
   */
  getStudentAttendanceTimeline: (
    studentId: string,
    options?: { classroomId?: string; fromDate?: string; toDate?: string },
  ) =>
    Effect.gen(function* () {
      const records = yield* Effect.tryPromise({
        try: () =>
          educational.attendance.getForStudent(studentId, options?.classroomId) as Promise<
            AttendanceRecord[]
          >,
        catch: (e) =>
          new AttendanceError({
            message: 'Failed to fetch timeline',
            cause: e,
          }),
      });

      return records.filter((record) => {
        if (options?.fromDate && record.date < new Date(options.fromDate)) return false;
        if (options?.toDate && record.date > new Date(options.toDate)) return false;
        return true;
      });
    }),

  /**
   * Get institutional pulse
   */
  getSchoolAttendancePulse: (
    schoolId: string,
    classroomId?: string,
    viewDate?: string,
    auditCtx?: AttendanceAuditContext,
  ): Effect.Effect<SchoolAttendancePulse, AttendanceError | unknown, never> =>
    Effect.gen(function* () {
      const pulse = yield* Effect.tryPromise({
        try: () =>
          attendanceProjectionServices.getSchoolAttendancePulse(
            schoolId,
            classroomId,
            viewDate,
          ) as Promise<SchoolAttendancePulse>,
        catch: (e) => new AttendanceError({ message: 'Failed to fetch pulse', cause: e }),
      });

      yield* Effect.forkDaemon(
        logAttendanceAudit({
          action: 'attendance_institutional_read',
          entityId: classroomId ?? schoolId,
          executorId: auditCtx?.actorId,
          metadata: {
            schoolId,
            classroomId: classroomId ?? null,
            viewDate: viewDate ?? null,
            accessKind: auditCtx?.accessKind ?? 'institutional_read',
          },
        }),
      );

      return pulse;
    }),

  /**
   * Get attendance report
   */
  getAttendanceReport: (
    schoolId: string,
    startDate: string,
    endDate: string,
    classroomId?: string,
    auditCtx?: AttendanceAuditContext,
  ): Effect.Effect<AttendanceReport, AttendanceError | unknown, never> =>
    Effect.gen(function* () {
      const report = yield* Effect.tryPromise({
        try: () =>
          attendanceProjectionServices.getAttendanceReport(
            schoolId,
            startDate,
            endDate,
            classroomId,
          ) as Promise<AttendanceReport>,
        catch: (e) => new AttendanceError({ message: 'Failed to fetch report', cause: e }),
      });

      yield* Effect.forkDaemon(
        logAttendanceAudit({
          action: 'attendance_report_read',
          entityId: classroomId ?? schoolId,
          executorId: auditCtx?.actorId,
          metadata: {
            schoolId,
            classroomId: classroomId ?? null,
            startDate,
            endDate,
            accessKind: auditCtx?.accessKind ?? 'institutional_export',
          },
        }),
      );

      return report;
    }),
};
