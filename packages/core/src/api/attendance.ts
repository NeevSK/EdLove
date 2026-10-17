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

export const attendanceAPI = {
  /** Grade classes the signed-in teacher (or school leader) may mark. */
  async getMyGradeClasses(): Promise<GradeClassOption[]> {
    return toPromise(apiEffect(() => orpcClient.attendance.getMyGradeClasses())) as Promise<
      GradeClassOption[]
    >;
  },

  /** Active enrollments (student_grade_class_enrollments) for a grade class on a date. */
  async getGradeClassRoster(gradeClassId: string, date?: string): Promise<GradeClassRosterRow[]> {
    return toPromise(
      apiEffect(() => orpcClient.attendance.getGradeClassRoster({ query: { gradeClassId, date } })),
    ) as Promise<GradeClassRosterRow[]>;
  },

  /**
   * Saved daily_attendance for a grade class and date (Model A), shaped as `{ records }`.
   */
  async getGradeClassAttendanceSnapshot(
    gradeClassId: string,
    date?: string,
  ): Promise<{ records: DailyAttendanceRow[] }> {
    const records = (await toPromise(
      apiEffect(() => orpcClient.attendance.getByClassroom({ query: { gradeClassId, date } })),
    )) as DailyAttendanceRow[];
    return { records };
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
    return toPromise(
      apiEffect(() => orpcClient.attendance.batchRecord({ body: records })),
    ) as Promise<DailyAttendanceRow[]>;
  },

  async upsertAttendanceRecord(
    classroom_id: string,
    student_id: string,
    status: string,
    date: string,
  ) {
    return toPromise(
      apiEffect(() =>
        orpcClient.attendance.record({
          body: { gradeClassId: classroom_id, studentId: student_id, status: status as any, date },
        }),
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
