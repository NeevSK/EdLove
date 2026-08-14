import { longitudinalContract } from '@repo/core/api/longitudinal.contract';
import { selectLatestTemporalRecordsAsOf } from '@repo/core/lib/temporalEvents';
import { SovereignError } from '@repo/core/types/Errors';
import { executeDatabaseCommand, queryDatabaseRows } from '@repo/database/client';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(longitudinalContract).$context<ORPCContext>();

type EventRow = Record<string, any>;

const requireUser = (context: ORPCContext) => {
  assertDatabase(context);
  if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();
};

async function listEvents(
  context: ORPCContext,
  studentId: string,
  viewDate: string,
  entityTypes?: string[],
): Promise<any[]> {
  requireUser(context);
  const authorized = await queryDatabaseRows<{ allowed: boolean }>(
    `
      select exists (
        select 1
        from public.users student
        where student.id = $1::uuid
          and (
            student.id = $2::uuid
            or exists (
              select 1 from public.student_guardian_relationships sgr
              where sgr.student_id = student.id and sgr.guardian_id = $2::uuid
            )
            or exists (
              select 1 from public.users viewer
              where viewer.id = $2::uuid
                and viewer.school_id = student.school_id
                and coalesce(viewer.role, '') in (
                  'founder', 'developer', 'admin', 'principal',
                  'assistant_principal', 'assistantPrincipal',
                  'section_head', 'grade_head', 'teacher'
                )
            )
            or exists (
              select 1 from public.users viewer
              join public.student_record_access_grants grant_row
                on grant_row.grantee_school_id = viewer.school_id
              where viewer.id = $2::uuid
                and grant_row.student_id = student.id
                and grant_row.status = 'granted'
                and (grant_row.expiry_at is null or grant_row.expiry_at > now())
            )
          )
      ) as allowed
    `,
    [studentId, context.user.id],
  );
  if (!authorized[0]?.allowed)
    throw SovereignError.unauthorized('read', 'student longitudinal history');

  await executeDatabaseCommand(
    `
      insert into audit.student_record_access_logs (accessor_id, student_id, purpose)
      values ($1::uuid, $2::uuid, $3)
    `,
    [context.user.id, studentId, 'Longitudinal history through Sanctuary API'],
  );

  const rows = await queryDatabaseRows<EventRow>(
    `
      select id, student_id, school_id, grade_id, classroom_id, entity_type,
             entity_id, operation, snapshot, metadata, source_table,
             recorded_by, occurred_at, recorded_at, effective_from, effective_to,
             created_at, updated_at
      from public.student_longitudinal_events
      where student_id = $1::uuid
        and occurred_at <= $2::timestamptz
        and ($3::text[] is null or entity_type = any($3::text[]))
      order by occurred_at desc, recorded_at desc
    `,
    [studentId, viewDate, entityTypes?.length ? entityTypes : null],
  );
  return rows.map((row) => ({
    ...row,
    id: String(row.id),
    student_id: String(row.student_id),
    school_id: row.school_id ? String(row.school_id) : null,
    grade_id: row.grade_id ? String(row.grade_id) : null,
    classroom_id: row.classroom_id ? String(row.classroom_id) : null,
    recorded_by: row.recorded_by ? String(row.recorded_by) : null,
    occurred_at: new Date(row.occurred_at).toISOString(),
    recorded_at: new Date(row.recorded_at).toISOString(),
    effective_from: row.effective_from ? new Date(row.effective_from).toISOString() : null,
    effective_to: row.effective_to ? new Date(row.effective_to).toISOString() : null,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : undefined,
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
    snapshot: row.snapshot ?? row.metadata ?? {},
  }));
}

export const longitudinalRouter = impl.router({
  getStudentTimeline: impl.getStudentTimeline
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => ({
      studentId: input.query.studentId,
      viewDate: input.query.viewDate,
      events: await listEvents(
        context,
        input.query.studentId,
        input.query.viewDate,
        input.query.entityTypes,
      ),
    })),

  getStudentSnapshotAsOf: impl.getStudentSnapshotAsOf
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      const events = await listEvents(
        context,
        input.query.studentId,
        input.query.viewDate,
        input.query.entityTypes,
      );
      return {
        studentId: input.query.studentId,
        viewDate: input.query.viewDate,
        records: selectLatestTemporalRecordsAsOf(events, input.query.viewDate, {
          getEntityKey: (event) => `${event.entity_type}:${event.entity_id}`,
          getEffectiveTo: (event) => event.effective_to,
        }),
      };
    }),
});
