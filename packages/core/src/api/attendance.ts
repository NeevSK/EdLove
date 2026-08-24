import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import type { StudentAttendancePulse } from '@repo/core/api/staffManagement';
import { APIError } from '@repo/core/types/API';
import * as Data from 'effect/Data';
import * as Duration from 'effect/Duration';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Schedule from 'effect/Schedule';

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

const retryPolicy = pipe(
  Schedule.exponential(Duration.millis(200)),
  Schedule.intersect(Schedule.recurs(3)),
);

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
    Effect.retry(retryPolicy),
    Effect.timeout(Duration.seconds(15)),
    Effect.catchTag('TimeoutException', () =>
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
    effect.pipe(Effect.catchAll((e) => Effect.fail(new APIError(e.message, e.status)))),
  );
}

export const attendanceAPI = {
  async upsertAttendanceRecord(
    classroom_id: string,
    student_id: string,
    status: string,
    date: string,
  ) {
    return toPromise(
      apiEffect(() =>
        (client.api as any).attendance.$post({
          json: { classroom_id, student_id, status, date },
        }),
      ),
    );
  },

  async fetchClassroomAttendance(classroom_id: string, date?: string) {
    return toPromise(
      apiEffect(() =>
        (client.api as any).attendance.$get({
          query: { classroom_id, date },
        }),
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
        (client.api as any).attendance.pulse.$get({
          query: {
            school_id,
            classroom_id: classroom_id ?? undefined,
            view_date: view_date ?? undefined,
          },
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
        (client.api as any).attendance.report.$get({
          query: {
            school_id,
            start_date,
            end_date,
            classroom_id: classroom_id ?? undefined,
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
      (client.api as any).attendance.$post({
        json: { classroom_id, student_id, status, date },
      }),
    ),

  fetchClassroomAttendance: (classroom_id: string, date?: string) =>
    apiEffect(() =>
      (client.api as any).attendance.$get({
        query: { classroom_id, date },
      }),
    ),

  getSchoolAttendancePulse: (school_id: string, classroom_id?: string, view_date?: string) =>
    apiEffect(() =>
      (client.api as any).attendance.pulse.$get({
        query: {
          school_id,
          classroom_id: classroom_id ?? undefined,
          view_date: view_date ?? undefined,
        },
      }),
    ) as Effect.Effect<StudentAttendancePulse, AttendanceHttpError, never>,

  getAttendanceReport: (
    school_id: string,
    start_date: string,
    end_date: string,
    classroom_id?: string,
  ) =>
    apiEffect(() =>
      (client.api as any).attendance.report.$get({
        query: {
          school_id,
          start_date,
          end_date,
          classroom_id: classroom_id ?? undefined,
        },
      }),
    ),
};
