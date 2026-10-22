import { readLocalFirst, writeLocalFirst } from '@repo/core/api/dataGateway';
import { orpcClient } from '@repo/core/api/orpcClient';
import type { StudentAttendancePulse } from '@repo/core/api/staffManagement';
import { APIError } from '@repo/core/types/API';
import { defaultRetryPolicy } from '@repo/core/utils/effect';
import { Data, Duration, Effect, pipe } from 'effect';

class AttendanceHttpError extends Data.TaggedError('AttendanceHttpError')<{
  readonly message: string;
  readonly status: string;
}> {}

function apiEffect<T>(fn: () => Promise<T>): Effect.Effect<T, AttendanceHttpError, never> {
  return pipe(
    Effect.tryPromise({
      try: fn,
      catch: (e) =>
        new AttendanceHttpError({
          message: String((e as any)?.message ?? 'Attendance API call failed'),
          status: String((e as any)?.status ?? '0'),
        }),
    }),
    Effect.retry(defaultRetryPolicy),
    Effect.timeout(Duration.seconds(15)),
    Effect.catchTag('TimeoutError', () =>
      Effect.fail(
        new AttendanceHttpError({
          message: 'Attendance API timed out after 15s',
          status: '408',
        }),
      ),
    ),
  );
}

function toPromise<T>(effect: Effect.Effect<T, AttendanceHttpError, never>): Promise<T> {
  return Effect.runPromise(
    effect.pipe(
      Effect.catch((e: AttendanceHttpError) => Effect.fail(new APIError(e.message, e.status))),
    ),
  );
}

/** One daily_attendance row to write. `gradeClassId` is a grade_classes.id (model A). */
export type GradeClassAttendanceInput = {
  gradeClassId: string;
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  date: string;
};

export type GradeClassOption = {
  id: string;
  name: string;
  academic_cycle_id: string;
  role: string | null;
};

export type GradeClassRosterRow = {
  enrollment_id: string;
  student_id: string;
  full_name: string | null;
  avatar_url: string | null;
};

/** A daily_attendance row as returned by the server contract. */
export type DailyAttendanceRow = {
  id: string;
  student_id: string;
  grade_class_id: string;
  status: GradeClassAttendanceInput['status'];
  attendance_date: string;
  student_name: string | null;
};

/**
 * @deprecated Prefer direct use of `orpcClient.attendance.*` or domain hooks.
 * Retained for backward-compatible call sites under the Strangler Fig migration protocol.
 */
export const attendanceAPI = {
  /** Grade classes the signed-in teacher (or school leader) may mark. */
  async getMyGradeClasses(): Promise<GradeClassOption[]> {
    const result = await readLocalFirst<GradeClassOption[]>({
      key: 'attendance:my_grade_classes',
      ttl: 24 * 60 * 60 * 1000,
      fetchRemote: () =>
        toPromise(apiEffect(() => orpcClient.attendance.getMyGradeClasses())) as Promise<
          GradeClassOption[]
        >,
    });
    return result ?? [];
  },

  /** Active enrollments (student_grade_class_enrollments) for a grade class on a date. */
  async getGradeClassRoster(gradeClassId: string, date?: string): Promise<GradeClassRosterRow[]> {
    const dateKey = date ?? 'today';
    const result = await readLocalFirst<GradeClassRosterRow[]>({
      key: `attendance:roster:${gradeClassId}:${dateKey}`,
      ttl: 12 * 60 * 60 * 1000,
      fetchRemote: () =>
        toPromise(
          apiEffect(() => orpcClient.attendance.getGradeClassRoster({ query: { gradeClassId, date } })),
        ) as Promise<GradeClassRosterRow[]>,
    });
    return result ?? [];
  },

  /**
   * Saved daily_attendance for a grade class and date (Model A), shaped as `{ records }`.
   */
  async getGradeClassAttendanceSnapshot(
    gradeClassId: string,
    date?: string,
  ): Promise<{ records: DailyAttendanceRow[] }> {
    const dateKey = date ?? 'today';
    const result = await readLocalFirst<{ records: DailyAttendanceRow[] }>({
      key: `attendance:snapshot:${gradeClassId}:${dateKey}`,
      ttl: 5 * 60 * 1000,
      fetchRemote: async () => {
        const records = (await toPromise(
          apiEffect(() => orpcClient.attendance.getByClassroom({ query: { gradeClassId, date } })),
        )) as DailyAttendanceRow[];
        return { records };
      },
    });
    return result ?? { records: [] };
  },

  /**
   * @deprecated Use `getGradeClassAttendanceSnapshot`.
   * Note: The id must be a grade_classes.id (Model A).
   */
  async getClassroomAttendanceSnapshot(
    gradeClassId: string,
    date?: string,
  ): Promise<{ records: DailyAttendanceRow[] }> {
    return this.getGradeClassAttendanceSnapshot(gradeClassId, date);
  },

  /** Writes a roll call in one transaction. All rows should share one grade class. */
  async batchRecord(records: GradeClassAttendanceInput[]): Promise<DailyAttendanceRow[]> {
    return writeLocalFirst(records, {
      queueKey: 'attendance:batchRecord',
      optimistic: records.map((r, idx) => ({
        id: `opt_${Date.now()}_${idx}`,
        student_id: r.studentId,
        grade_class_id: r.gradeClassId,
        status: r.status,
        attendance_date: r.date,
        student_name: null,
      })),
      enqueueLocal: async (_payload) => {
        // Enqueue to local outbox mutation queue
      },
      commitRemote: async (payload) => {
        return (await toPromise(
          apiEffect(() => orpcClient.attendance.batchRecord({ body: payload })),
        )) as DailyAttendanceRow[];
      },
    });
  },

  async upsertAttendanceRecord(
    classroom_id: string,
    student_id: string,
    status: string,
    date: string,
  ) {
    const payload = {
      gradeClassId: classroom_id,
      studentId: student_id,
      status: status as any,
      date,
    };
    return writeLocalFirst(payload, {
      queueKey: `attendance:record:${classroom_id}:${student_id}:${date}`,
      optimistic: {
        id: `opt_${Date.now()}`,
        student_id,
        grade_class_id: classroom_id,
        status: status as any,
        attendance_date: date,
        student_name: null,
        student_avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sessions: [],
      },
      enqueueLocal: async (_payload) => {
        // Enqueue to local outbox mutation queue
      },
      commitRemote: async (body) => {
        return toPromise(apiEffect(() => orpcClient.attendance.record({ body })));
      },
    });
  },

  /** Alias for upsertAttendanceRecord. */
  async upsertDailyRecord(classroom_id: string, student_id: string, status: string, date: string) {
    return this.upsertAttendanceRecord(classroom_id, student_id, status, date);
  },

  /** Alias for sync queue record handler. */
  async record(classroom_id: string, student_id: string, status: string, date: string) {
    return this.upsertAttendanceRecord(classroom_id, student_id, status, date);
  },

  /** Queries attendance records for a student. */
  async getForStudent(student_id: string, date?: string) {
    return toPromise(
      apiEffect(() =>
        orpcClient.attendance.getByClassroom({ query: { gradeClassId: student_id, date } }),
      ),
    );
  },

  /** Queries attendance timeline for a student. */
  async getStudentAttendanceTimeline(student_id: string, _limit?: number) {
    return toPromise(
      apiEffect(() =>
        orpcClient.attendance.getByClassroom({ query: { gradeClassId: student_id } }),
      ),
    );
  },

  async fetchClassroomAttendance(classroom_id: string, date?: string) {
    return toPromise(
      apiEffect(() =>
        orpcClient.attendance.getByClassroom({ query: { gradeClassId: classroom_id, date } }),
      ),
    );
  },

  async getSchoolAttendancePulse(
    school_id: string,
    classroom_id?: string,
    view_date?: string,
  ): Promise<StudentAttendancePulse> {
    return toPromise(
      apiEffect(() =>
        orpcClient.attendance.getSchoolPulse({
          query: { schoolId: school_id, gradeClassId: classroom_id, viewDate: view_date },
        }),
      ) as Effect.Effect<StudentAttendancePulse, AttendanceHttpError, never>,
    );
  },

  async getAttendanceReport(
    school_id: string,
    start_date: string,
    end_date: string,
    classroom_id?: string,
  ) {
    return toPromise(
      apiEffect(() =>
        orpcClient.attendance.getReport({
          query: {
            schoolId: school_id,
            startDate: start_date,
            endDate: end_date,
            gradeClassId: classroom_id,
          },
        }),
      ),
    );
  },
};

export const attendanceAPI$ = {
  upsertAttendanceRecord: (
    classroom_id: string,
    student_id: string,
    status: string,
    date: string,
  ) =>
    apiEffect(() =>
      orpcClient.attendance.record({
        body: { gradeClassId: classroom_id, studentId: student_id, status: status as any, date },
      }),
    ),

  upsertDailyRecord: (classroom_id: string, student_id: string, status: string, date: string) =>
    apiEffect(() =>
      orpcClient.attendance.record({
        body: { gradeClassId: classroom_id, studentId: student_id, status: status as any, date },
      }),
    ),

  record: (classroom_id: string, student_id: string, status: string, date: string) =>
    apiEffect(() =>
      orpcClient.attendance.record({
        body: { gradeClassId: classroom_id, studentId: student_id, status: status as any, date },
      }),
    ),

  getForStudent: (student_id: string, date?: string) =>
    apiEffect(() =>
      orpcClient.attendance.getByClassroom({ query: { gradeClassId: student_id, date } }),
    ),

  getStudentAttendanceTimeline: (student_id: string, _limit?: number) =>
    apiEffect(() =>
      orpcClient.attendance.getByClassroom({ query: { gradeClassId: student_id } }),
    ),

  fetchClassroomAttendance: (classroom_id: string, date?: string) =>
    apiEffect(() =>
      orpcClient.attendance.getByClassroom({ query: { gradeClassId: classroom_id, date } }),
    ),

  getSchoolAttendancePulse: (school_id: string, classroom_id?: string, view_date?: string) =>
    apiEffect(() =>
      orpcClient.attendance.getSchoolPulse({
        query: { schoolId: school_id, gradeClassId: classroom_id, viewDate: view_date },
      }),
    ) as Effect.Effect<StudentAttendancePulse, AttendanceHttpError, never>,

  getAttendanceReport: (
    school_id: string,
    start_date: string,
    end_date: string,
    classroom_id?: string,
  ) =>
    apiEffect(() =>
      orpcClient.attendance.getReport({
        query: {
          schoolId: school_id,
          startDate: start_date,
          endDate: end_date,
          gradeClassId: classroom_id,
        },
      }),
    ),
};
