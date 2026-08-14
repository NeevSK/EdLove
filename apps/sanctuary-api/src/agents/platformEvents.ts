import { v7 as uuidv7 } from '@repo/core/logic/utils/uuid';
import { queryDatabaseRows } from '@repo/database/client';
import { z } from 'zod';
import { sanctuaryInngest } from './inngest';
import { capturePlatformWorkerEvent } from './workerTelemetry';

// Keep the event names local to this worker boundary. Importing the complete
// shared event registry here makes TypeScript instantiate every domain schema
// transitively and materially slows (or stalls) the API compiler. Producers
// still use the canonical schemas; this consumer only needs the stable names.
const trigger = (event: string) => ({ event }) as any;
const createWorker = (config: any, handler: any) =>
  sanctuaryInngest.createFunction({ retries: 3, ...config }, async (context: any) => {
    try {
      const result = await handler(context);
      const event = context.event ?? {};
      const data = event.data ?? {};
      await capturePlatformWorkerEvent({
        worker: config.id,
        eventName: String(event.name ?? config.id),
        entityId: String(
          data.mutationId ?? data.id ?? data.studentId ?? data.classroom_id ?? 'unknown',
        ),
        schoolId: data.schoolId ?? data.school_id ?? data.tenantId ?? null,
        data,
      });
      return result;
    } catch (error) {
      const event = context.event ?? {};
      const data = event.data ?? {};
      try {
        await recordEvent(
          String(event.name ?? config.id),
          String(data.mutationId ?? data.id ?? data.studentId ?? data.classroom_id ?? 'unknown'),
          data.schoolId ?? data.school_id ?? data.tenantId ?? null,
          {
            ...data,
            worker: config.id,
            status: 'failed',
            error: error instanceof Error ? error.message : String(error),
          },
          'failed',
          error instanceof Error ? error.message : String(error),
        );
      } catch (ledgerError) {
        console.error('[worker-ledger] failed to record worker failure', ledgerError);
      }
      throw error;
    }
  }) as any;

const attendanceEventSchema = z
  .object({
    classroom_id: z.string().uuid(),
    student_id: z.string().uuid(),
    date: z.union([z.string().min(1), z.date()]),
    status: z.string().optional(),
    idempotency_key: z.string().optional(),
    correlationId: z.string().optional(),
    causationId: z.string().optional(),
  })
  .passthrough();
const classroomEventSchema = z
  .object({
    id: z.string().min(1),
    school_id: z.string().uuid().nullable().optional(),
    teacher_id: z.string().uuid().nullable().optional(),
    correlationId: z.string().optional(),
    causationId: z.string().optional(),
  })
  .passthrough();
const gradeEventSchema = z
  .object({
    id: z.string().uuid(),
    classroom_id: z.string().uuid(),
    correlationId: z.string().optional(),
    causationId: z.string().optional(),
  })
  .passthrough();
const wellbeingEventSchema = z
  .object({
    studentId: z.string().uuid(),
    moodScore: z.number().int().min(1).max(5),
    schoolId: z.string().uuid().nullable().optional(),
    correlationId: z.string().optional(),
    causationId: z.string().optional(),
  })
  .passthrough();
const mutationEventSchema = z
  .object({
    mutationId: z.string().min(1),
    action: z.enum(['saveJournalEntry', 'saveDecision', 'updateAttendance']),
    actorId: z.string().uuid(),
    payload: z.record(z.string(), z.unknown()),
    idempotencyKey: z.string().optional(),
    tenantId: z.string().nullable().optional(),
    correlationId: z.string().optional(),
    causationId: z.string().optional(),
  })
  .passthrough();
const journalMutationPayloadSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  content: z.string().min(1),
});
const attendanceMutationPayloadSchema = z.object({
  classroomId: z.string().uuid(),
  studentId: z.string().uuid(),
  status: z.string().min(1),
  date: z.union([z.string().min(1), z.date()]),
});
const decisionMutationPayloadSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  decision_text: z.string().min(1),
  context: z.string().nullable().optional(),
  is_reviewed: z.boolean().optional(),
});

async function recordEvent(
  eventName: string,
  entityId: string,
  schoolId: string | null | undefined,
  payload: Record<string, unknown>,
  status: 'completed' | 'failed' = 'completed',
  error: string | null = null,
) {
  await queryDatabaseRows(
    `
      insert into public.platform_worker_events
        (id, event_name, entity_id, school_id, correlation_id, causation_id, payload, idempotency_key, status, error, updated_at)
      values ($1::uuid, $2, $3, $4::uuid, $5, $6, $7::jsonb, $8, $9, $10, now())
      on conflict (idempotency_key) do update set
        status = excluded.status,
        error = excluded.error,
        payload = excluded.payload,
        updated_at = now()
      returning id
    `,
    [
      uuidv7(),
      eventName,
      entityId,
      schoolId ?? null,
      payload.correlationId ?? null,
      payload.causationId ?? null,
      JSON.stringify(payload),
      `${eventName}:${entityId}`,
      status,
      error,
    ],
  );
}

export const schoolAttendanceRecorded = createWorker(
  { id: 'sanctuary-school-attendance-recorded', triggers: [trigger('school/attendance.recorded')] },
  async ({ event, step }) => {
    const attendance = attendanceEventSchema.parse(event.data);
    const classroom = await step.run('load-attendance-school', async () => {
      const rows = await queryDatabaseRows<any>(
        'select school_id, teacher_id from public.classrooms where id = $1::uuid limit 1',
        [attendance.classroom_id],
      );
      return rows[0] ?? {};
    });
    await step.run('record-attendance-worker-event', () =>
      recordEvent(
        'school/attendance.recorded',
        `${attendance.classroom_id}:${attendance.student_id}:${attendance.date}`,
        classroom.school_id,
        { ...attendance, worker: 'sanctuary-attendance' },
      ),
    );
    if (attendance.status === 'absent' && classroom.teacher_id) {
      await step.run('create-attendance-teacher-note', async () => {
        await queryDatabaseRows(
          `
            insert into public.teacher_notes
              (id, teacher_id, content, type, idempotency_key)
            values ($1::uuid, $2::uuid, $3, 'note', $4)
            on conflict do nothing
            returning id
          `,
          [
            uuidv7(),
            classroom.teacher_id,
            [
              'System-generated attendance insight.',
              `Student ${attendance.student_id} was marked absent in classroom ${attendance.classroom_id} on ${attendance.date}.`,
              'Use this as a private cue for follow-up, not as a finalized student judgment.',
            ].join(' '),
            `attendance-recorded:${attendance.classroom_id}:${attendance.student_id}:${attendance.date}:teacher-note`,
          ],
        );
      });
    }
    return {
      processed: true,
      classroomId: attendance.classroom_id,
      studentId: attendance.student_id,
      teacherInsightCreated: attendance.status === 'absent' && Boolean(classroom.teacher_id),
    };
  },
);

export const schoolClassroomCreated = createWorker(
  { id: 'sanctuary-school-classroom-created', triggers: [trigger('school/classroom.created')] },
  async ({ event, step }) => {
    const classroom = classroomEventSchema.parse(event.data);
    await step.run('record-classroom-worker-event', () =>
      recordEvent('school/classroom.created', classroom.id, classroom.school_id ?? null, {
        ...classroom,
        worker: 'sanctuary-classroom',
      }),
    );
    return { processed: true, classroomId: classroom.id };
  },
);

export const schoolGradePublished = createWorker(
  { id: 'sanctuary-school-grade-published', triggers: [trigger('school/grade.published')] },
  async ({ event, step }) => {
    const grade = gradeEventSchema.parse(event.data);
    const classroom = await step.run('load-grade-school', async () => {
      const rows = await queryDatabaseRows<any>(
        'select school_id from public.classrooms where id = $1::uuid limit 1',
        [grade.classroom_id],
      );
      return rows[0] ?? {};
    });
    await step.run('record-grade-worker-event', () =>
      recordEvent('school/grade.published', grade.id, classroom.school_id ?? null, {
        ...grade,
        worker: 'sanctuary-grading',
      }),
    );
    return { processed: true, gradeId: grade.id };
  },
);

export const wellbeingMoodLogged = createWorker(
  { id: 'sanctuary-wellbeing-mood-logged', triggers: [trigger('wellbeing/mood.logged')] },
  async ({ event, step }) => {
    const mood = wellbeingEventSchema.parse(event.data);
    const intervention = mood.moodScore <= 2;
    await step.run('record-wellbeing-worker-event', () =>
      recordEvent('wellbeing/mood.logged', mood.studentId, mood.schoolId, {
        ...mood,
        interventionNeeded: intervention,
        worker: 'sanctuary-wellbeing',
      }),
    );
    return { processed: true, intervention, studentId: mood.studentId };
  },
);

export const syncMutationQueued = createWorker(
  { id: 'sanctuary-sync-mutation-queued', triggers: [trigger('sync/mutation-queued')] },
  async ({ event, step }) => {
    const mutation = mutationEventSchema.parse(event.data);
    const result = await step.run('execute-supported-mutation', async () => {
      if (mutation.action === 'saveJournalEntry') {
        const payload = journalMutationPayloadSchema.parse(mutation.payload);
        if (payload.user_id !== mutation.actorId) {
          throw new Error('Queued journal mutation actor does not own the journal entry.');
        }
        const journalId = z
          .string()
          .uuid()
          .parse(payload.id ?? mutation.mutationId);
        const rows = await queryDatabaseRows<any>(
          'insert into public.journal_entries (id, user_id, content) values ($1::uuid, $2::uuid, $3) on conflict (id) do nothing returning id',
          [journalId, payload.user_id, payload.content],
        );
        return {
          target: 'journal_entries',
          id: rows[0]?.id ?? journalId,
          duplicate: rows.length === 0,
        };
      }
      if (mutation.action === 'saveDecision') {
        const payload = decisionMutationPayloadSchema.parse(mutation.payload);
        if (payload.user_id !== mutation.actorId) {
          throw new Error('Queued decision mutation actor does not own the decision journal.');
        }
        const decisionId = z
          .string()
          .uuid()
          .parse(payload.id ?? mutation.mutationId);
        const rows = await queryDatabaseRows<any>(
          'insert into public.decision_journals (id, user_id, decision_text, context, is_reviewed, idempotency_key) values ($1::uuid, $2::uuid, $3, $4, $5, $6) on conflict do nothing returning id',
          [
            decisionId,
            payload.user_id,
            payload.decision_text,
            payload.context ?? null,
            payload.is_reviewed ?? false,
            mutation.idempotencyKey ?? `mutation:${mutation.mutationId}`,
          ],
        );
        return {
          target: 'decision_journals',
          id: rows[0]?.id ?? decisionId,
          duplicate: rows.length === 0,
        };
      }
      if (mutation.action === 'updateAttendance') {
        const payload = attendanceMutationPayloadSchema.parse(mutation.payload);
        const authorized = await queryDatabaseRows<{ authorized: boolean }>(
          `
            select exists (
              select 1
              from public.classrooms c
              where c.id = $1::uuid
                and (
                  c.teacher_id = $2::uuid
                  or exists (
                    select 1
                    from public.bonds b
                    where b.user_id = $2::uuid
                      and b.entity_id = c.school_id
                      and b.entity_type = 'SCHOOL'
                      and b.capacity in ('teacher', 'grade_head', 'principal')
                      and coalesce(b.status, 'active') = 'active'
                  )
                )
            ) as authorized
          `,
          [payload.classroomId, mutation.actorId],
        );
        if (!authorized[0]?.authorized) {
          throw new Error('Queued attendance mutation actor is not authorized for the classroom.');
        }
        const rows = await queryDatabaseRows<any>(
          'insert into public.attendance (classroom_id, student_id, status, date) values ($1::uuid, $2::uuid, $3, $4::timestamptz) on conflict (classroom_id, student_id, date) do update set status = excluded.status returning classroom_id, student_id, status, date, idempotency_key',
          [payload.classroomId, payload.studentId, payload.status, payload.date],
        );
        return { target: 'attendance', id: rows[0]?.idempotency_key };
      }
      throw new Error(`Unsupported remote mutation action: ${String(mutation.action)}`);
    });
    await step.run('record-mutation-worker-event', () =>
      recordEvent(`sync/${mutation.action}`, mutation.mutationId, mutation.tenantId ?? null, {
        ...mutation,
        result,
        worker: 'sanctuary-mutation',
      }),
    );
    return { mutationId: mutation.mutationId, status: 'synced', result };
  },
);

export const platformEventFunctions: any[] = [
  schoolAttendanceRecorded,
  schoolClassroomCreated,
  schoolGradePublished,
  wellbeingMoodLogged,
  syncMutationQueued,
];
