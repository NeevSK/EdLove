import { durableAgentRequestSchema } from '@repo/core/api/durableAgents.contract';
import { queryDatabaseRows } from '@repo/database/client';
import { Hono } from 'hono';
import { serve } from 'inngest/hono';
import { durableAgentFunctions, platformEventFunctions, sanctuaryInngest } from '../../agents';

const getUser = (c: any) => c.get('user') as { id: string } | undefined;
const requireUser = (c: any) => {
  const user = getUser(c);
  if (!user || user.id === 'anonymous') return c.json({ error: 'Authentication required.' }, 401);
  return null;
};

type AuthorizedClassroomScope = {
  schoolId: string;
  classroomId: string;
  teacherId: string | null;
};

const schoolAdministratorCapacities = ['principal', 'section_head', 'grade_head'];

/**
 * Resolves scope from authoritative classroom/bond relationships. Request
 * headers and bodies are deliberately not authority sources.
 */
async function resolveAuthorizedClassroomScope(
  actorId: string,
  classroomId: string,
  studentId?: string,
): Promise<AuthorizedClassroomScope | null> {
  const rows = await queryDatabaseRows<AuthorizedClassroomScope>(
    `
      select classroom.school_id as "schoolId", classroom.id as "classroomId",
        classroom.teacher_id as "teacherId"
      from public.classrooms classroom
      where classroom.id = $1::uuid
        and classroom.school_id is not null
        and (
          classroom.teacher_id = $2::uuid
          or exists (
            select 1 from public.bonds bond
            where bond.user_id = $2::uuid
              and (
                (bond.entity_type = 'PLATFORM' and bond.capacity = 'admin')
                or (
                  bond.entity_type = 'SCHOOL'
                  and bond.entity_id = classroom.school_id::text
                  and bond.capacity = any($3::text[])
                )
              )
          )
        )
        and (
          $4::uuid is null
          or exists (
            select 1 from public.classroom_students enrollment
            where enrollment.classroom_id = classroom.id
              and enrollment.student_id = $4::uuid
              and enrollment.status = 'active'
          )
        )
      limit 1
    `,
    [classroomId, actorId, schoolAdministratorCapacities, studentId ?? null],
  );
  return rows[0] ?? null;
}

async function canReadRun(actorId: string, runId: string): Promise<boolean> {
  const rows = await queryDatabaseRows<{ allowed: boolean }>(
    `
      select exists(
        select 1
        from public.durable_agent_runs run
        where run.id = $1::uuid
          and (
            run.requested_by = $2::uuid
            or run.teacher_id = $2::uuid
            or exists (
              select 1 from public.bonds bond
              where bond.user_id = $2::uuid
                and (
                  (bond.entity_type = 'PLATFORM' and bond.capacity = 'admin')
                  or (
                    bond.entity_type = 'SCHOOL'
                    and bond.entity_id = run.school_id::text
                    and bond.capacity = any($3::text[])
                  )
                )
            )
          )
      ) as allowed
    `,
    [runId, actorId, schoolAdministratorCapacities],
  );
  return rows[0]?.allowed === true;
}

async function enqueue(c: any, capability: 'student-support' | 'teacher-summary') {
  const denied = requireUser(c);
  if (denied) return denied;
  const parsed = durableAgentRequestSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success)
    return c.json({ error: 'Invalid durable-agent request.', issues: parsed.error.issues }, 400);
  if (capability === 'student-support' && !parsed.data.studentId)
    return c.json({ error: 'studentId is required for student support.' }, 400);
  const actor = getUser(c)!;
  const scope = await resolveAuthorizedClassroomScope(
    actor.id,
    parsed.data.classroomId,
    parsed.data.studentId,
  );
  if (!scope) return c.json({ error: 'You are not authorized for this classroom.' }, 403);
  const runId = crypto.randomUUID();
  const requestedAt = new Date().toISOString();
  const payload: any = {
    ...parsed.data,
    schoolId: scope.schoolId,
    teacherId: scope.teacherId ?? actor.id,
    requestedBy: actor.id,
    runId,
    requestedAt,
    correlationId: runId,
    causationId: runId,
  };
  const runType =
    capability === 'student-support' ? 'student_support_snapshot' : 'teacher_summary_draft';
  await queryDatabaseRows(
    `insert into public.durable_agent_runs (id, school_id, run_type, mode, classroom_id, student_id, teacher_id, requested_by, scenario, request_payload, idempotency_key) values ($1::uuid, $2::uuid, $3, $4, $5::uuid, $6::uuid, $7::uuid, $8::uuid, $9, $10::jsonb, $11) on conflict (idempotency_key) do nothing returning id`,
    [
      runId,
      payload.schoolId,
      runType,
      payload.mode,
      payload.classroomId,
      payload.studentId ?? null,
      payload.teacherId ?? null,
      payload.requestedBy ?? null,
      payload.demoScenario ?? null,
      JSON.stringify(payload),
      `durable-agent:${runId}:run`,
    ],
  );
  await queryDatabaseRows(
    `insert into public.durable_agent_run_events (id, run_id, event_type, school_id, idempotency_key, metadata) values ($1::uuid, $2::uuid, 'durable_agent_requested', $3::uuid, $4, $5::jsonb) on conflict (idempotency_key) do nothing returning id`,
    [
      crypto.randomUUID(),
      runId,
      payload.schoolId,
      `durable-agent:${runId}:requested`,
      JSON.stringify({ runType, ...payload }),
    ],
  );
  await sanctuaryInngest.send({
    name:
      capability === 'student-support'
        ? 'agent/student-support.requested'
        : 'agent/teacher-summary.requested',
    data: payload,
  });
  return c.json(
    { runId, status: 'queued', mode: payload.mode, reviewMode: payload.reviewMode },
    202,
  );
}

export function createDurableAgentRoutes(options: { includeInngest?: boolean } = {}) {
  const routes = new Hono();
  routes.post('/api/durable-agents/student-support', (c: any) => enqueue(c, 'student-support'));
  routes.post('/api/durable-agents/teacher-summary', (c: any) => enqueue(c, 'teacher-summary'));
  routes.get('/api/durable-agents/runs', async (c: any) => {
    const denied = requireUser(c);
    if (denied) return denied;
    const limit = Math.min(Math.max(Number(c.req.query('limit') ?? 8) || 8, 1), 25);
    const actor = getUser(c)!;
    const rows = await queryDatabaseRows<any>(
      `
        select event.event_type as action, event.created_at, event.run_id as entity_id,
          event.school_id, event.metadata
        from public.durable_agent_run_events event
        join public.durable_agent_runs run on run.id = event.run_id
        where run.requested_by = $1::uuid
          or run.teacher_id = $1::uuid
          or exists (
            select 1 from public.bonds bond
            where bond.user_id = $1::uuid
              and (
                (bond.entity_type = 'PLATFORM' and bond.capacity = 'admin')
                or (
                  bond.entity_type = 'SCHOOL'
                  and bond.entity_id = run.school_id::text
                  and bond.capacity = any($3::text[])
                )
              )
          )
        order by event.created_at desc
        limit $2
      `,
      [actor.id, limit * 8, schoolAdministratorCapacities],
    );
    return c.json({ runs: materialize(rows).slice(0, limit) });
  });
  routes.get('/api/durable-agents/runs/:runId', async (c: any) => {
    const denied = requireUser(c);
    if (denied) return denied;
    const actor = getUser(c)!;
    const runId = c.req.param('runId');
    if (!(await canReadRun(actor.id, runId))) return c.json({ error: 'Run not found.' }, 404);
    const rows = await queryDatabaseRows<any>(
      `select event_type as action, created_at, run_id as entity_id, school_id, metadata
       from public.durable_agent_run_events where run_id = $1::uuid order by created_at asc`,
      [runId],
    );
    const run = materialize(rows)[0];
    return run ? c.json(run) : c.json({ error: 'Run not found.' }, 404);
  });
  routes.post('/api/durable-agents/runs/:runId/promote', async (c: any) => {
    const denied = requireUser(c);
    if (denied) return denied;
    const runId = c.req.param('runId');
    const actor = getUser(c)!;
    if (!(await canReadRun(actor.id, runId))) return c.json({ error: 'Run not found.' }, 404);
    const rows = await queryDatabaseRows<any>(
      `select metadata from public.durable_agent_run_events
       where run_id = $1::uuid and event_type = 'durable_agent_completed'
       order by created_at desc limit 1`,
      [runId],
    );
    const metadata = rows[0]?.metadata;
    if (!metadata?.summaryDraft)
      return c.json({ error: 'Only completed runs can be promoted.' }, 400);
    const promoted = await queryDatabaseRows<any>(
      `select metadata from public.durable_agent_run_events where run_id = $1::uuid and event_type = 'durable_agent_promoted_to_teacher_note' limit 1`,
      [runId],
    );
    if (promoted[0]?.metadata?.teacherNoteId) {
      return c.json({
        runId,
        teacherNoteId: promoted[0].metadata.teacherNoteId,
        alreadyPromoted: true,
        promotionMode: promoted[0].metadata.promotionMode ?? 'teacher_private_note',
        status: 'promoted',
      });
    }
    if (metadata.mode !== 'demo' && actor.id !== metadata.teacherId)
      return c.json({ error: 'Only the assigned teacher can promote this draft.' }, 403);
    if (metadata.mode === 'demo') {
      const teacherNoteId = `demo-note-${runId.slice(0, 8)}`;
      await queryDatabaseRows(
        `insert into public.durable_agent_run_events (id, run_id, event_type, school_id, idempotency_key, metadata) values ($1::uuid, $2::uuid, 'durable_agent_promoted_to_teacher_note', $3::uuid, $4, $5::jsonb) on conflict (idempotency_key) do nothing returning id`,
        [
          crypto.randomUUID(),
          runId,
          metadata.schoolId,
          `durable-agent:${runId}:promoted-teacher-note`,
          JSON.stringify({
            teacherNoteId,
            promotionMode: 'demo_teacher_note',
            teacherId: metadata.teacherId,
          }),
        ],
      );
      await queryDatabaseRows(
        `update public.durable_agent_runs set promoted_teacher_note_id = $2, promotion_mode = 'demo_teacher_note', promoted_at = now(), updated_at = now() where id = $1::uuid`,
        [runId, teacherNoteId],
      );
      return c.json({
        runId,
        teacherNoteId,
        alreadyPromoted: false,
        promotionMode: 'demo_teacher_note',
        status: 'promoted',
      });
    }
    const note = await queryDatabaseRows<any>(
      `insert into public.teacher_notes (id, teacher_id, content, type, idempotency_key) values ($1::uuid, $2::uuid, $3, 'note', $4) on conflict do update set content = excluded.content, updated_at = now() returning id`,
      [
        crypto.randomUUID(),
        metadata.teacherId,
        `Durable agent draft promoted for teacher review.\n\n${metadata.summaryDraft}`,
        `durable-agent:${runId}:teacher-note`,
      ],
    );
    await queryDatabaseRows(
      `insert into public.durable_agent_run_events (id, run_id, event_type, school_id, idempotency_key, metadata) values ($1::uuid, $2::uuid, 'durable_agent_promoted_to_teacher_note', $3::uuid, $4, $5::jsonb) on conflict (idempotency_key) do nothing returning id`,
      [
        crypto.randomUUID(),
        runId,
        metadata.schoolId,
        `durable-agent:${runId}:promoted-teacher-note`,
        JSON.stringify({
          teacherNoteId: note[0]?.id,
          promotionMode: 'teacher_private_note',
          teacherId: metadata.teacherId,
        }),
      ],
    );
    await queryDatabaseRows(
      `update public.durable_agent_runs set promoted_teacher_note_id = $2::uuid, promotion_mode = 'teacher_private_note', promoted_at = now(), updated_at = now() where id = $1::uuid`,
      [runId, note[0]?.id],
    );
    return c.json({
      runId,
      teacherNoteId: note[0]?.id,
      alreadyPromoted: false,
      promotionMode: 'teacher_private_note',
      status: 'promoted',
    });
  });
  if (options.includeInngest !== false) {
    const inngestHandler = serve({
      client: sanctuaryInngest,
      functions: [...durableAgentFunctions, ...platformEventFunctions] as any,
    });
    routes.all('/api/inngest', (c: any) => inngestHandler(c));
  }
  return routes;
}

function materialize(rows: any[]) {
  const grouped = new Map<string, any[]>();
  for (const row of rows) grouped.set(row.entity_id, [...(grouped.get(row.entity_id) ?? []), row]);
  return [...grouped.values()].map((events) => {
    const requested =
      events.find((row) => row.action === 'durable_agent_requested')?.metadata ?? {};
    const completed =
      events.find((row) => row.action === 'durable_agent_completed')?.metadata ?? {};
    const failed = events.find((row) => row.action === 'durable_agent_failed')?.metadata ?? {};
    const promoted =
      events.find((row) => row.action === 'durable_agent_promoted_to_teacher_note')?.metadata ?? {};
    return {
      runId: events[0].entity_id,
      status: failed.error ? 'failed' : completed.summaryDraft ? 'completed' : 'running',
      createdAt: events[0].created_at,
      updatedAt: events.at(-1).created_at,
      runType: requested.runType ?? completed.runType ?? null,
      mode: requested.mode ?? null,
      scenario: requested.demoScenario ?? null,
      classroomId: requested.classroomId ?? completed.classroomId ?? null,
      studentId: requested.studentId ?? completed.studentId ?? null,
      studentName: requested.studentName ?? completed.studentName ?? null,
      teacherId: requested.teacherId ?? completed.teacherId ?? null,
      requestedBy: requested.requestedBy ?? null,
      summaryDraft: completed.summaryDraft ?? null,
      evidence: completed.evidence ?? null,
      governor: completed.governor ?? null,
      promotedTeacherNoteId: promoted.teacherNoteId ?? null,
      promotionMode: promoted.promotionMode ?? null,
      promotedAt: promoted.teacherNoteId
        ? events.find((row) => row.action === 'durable_agent_promoted_to_teacher_note')?.created_at
        : null,
      error: failed.error ?? null,
      timeline: events.map((row) => ({ action: row.action, createdAt: row.created_at })),
    };
  });
}
