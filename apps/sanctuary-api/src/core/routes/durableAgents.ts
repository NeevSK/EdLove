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

async function schoolScope(c: any) {
  const headerSchoolId = c.get('schoolId');
  if (headerSchoolId) return headerSchoolId;
  const user = getUser(c);
  if (!user || user.id === 'anonymous') return null;
  const rows = await queryDatabaseRows<{ school_id: string | null }>(
    'select school_id from public.users where id = $1::uuid limit 1',
    [user.id],
  );
  return rows[0]?.school_id ?? null;
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
  const authorization = await queryDatabaseRows<{ allowed: boolean }>(
    `
      select exists(
        select 1
        from public.classrooms classroom
        join public.users viewer on viewer.id = $2::uuid
        where classroom.id = $1::uuid
          and classroom.school_id = $3::uuid
          and (
            classroom.teacher_id = $2::uuid
            or coalesce(viewer.role, '') in ('founder', 'developer', 'admin', 'principal', 'assistant_principal', 'assistantPrincipal', 'section_head', 'grade_head')
          )
      ) as allowed
    `,
    [parsed.data.classroomId, actor.id, parsed.data.schoolId],
  );
  if (!authorization[0]?.allowed)
    return c.json({ error: 'You are not authorized for this classroom.' }, 403);
  const runId = crypto.randomUUID();
  const requestedAt = new Date().toISOString();
  const payload: any = {
    ...parsed.data,
    teacherId: parsed.data.teacherId ?? actor.id,
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

export function createDurableAgentRoutes() {
  const routes = new Hono();
  routes.post('/api/durable-agents/student-support', (c: any) => enqueue(c, 'student-support'));
  routes.post('/api/durable-agents/teacher-summary', (c: any) => enqueue(c, 'teacher-summary'));
  routes.get('/api/durable-agents/runs', async (c: any) => {
    const denied = requireUser(c);
    if (denied) return denied;
    const limit = Math.min(Math.max(Number(c.req.query('limit') ?? 8) || 8, 1), 25);
    const schoolId = await schoolScope(c);
    if (!schoolId) return c.json({ error: 'A school scope is required.' }, 403);
    const rows = await queryDatabaseRows<any>(
      `select event_type as action, created_at, run_id as entity_id, school_id, metadata from public.durable_agent_run_events where school_id = $1::uuid order by created_at desc limit $2`,
      [schoolId, limit * 8],
    );
    return c.json({ runs: materialize(rows).slice(0, limit) });
  });
  routes.get('/api/durable-agents/runs/:runId', async (c: any) => {
    const denied = requireUser(c);
    if (denied) return denied;
    const schoolId = await schoolScope(c);
    if (!schoolId) return c.json({ error: 'A school scope is required.' }, 403);
    const rows = await queryDatabaseRows<any>(
      `select event_type as action, created_at, run_id as entity_id, school_id, metadata from public.durable_agent_run_events where run_id = $1::uuid and school_id = $2::uuid order by created_at asc`,
      [c.req.param('runId'), schoolId],
    );
    const run = materialize(rows)[0];
    return run ? c.json(run) : c.json({ error: 'Run not found.' }, 404);
  });
  routes.post('/api/durable-agents/runs/:runId/promote', async (c: any) => {
    const denied = requireUser(c);
    if (denied) return denied;
    const runId = c.req.param('runId');
    const schoolId = await schoolScope(c);
    if (!schoolId) return c.json({ error: 'A school scope is required.' }, 403);
    const rows = await queryDatabaseRows<any>(
      `select metadata from public.durable_agent_run_events where run_id = $1::uuid and event_type = 'durable_agent_completed' and school_id = $2::uuid order by created_at desc limit 1`,
      [runId, schoolId],
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
    const actor = getUser(c)?.id;
    if (metadata.mode !== 'demo' && actor !== metadata.teacherId)
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
  const inngestHandler = serve({
    client: sanctuaryInngest,
    functions: [...durableAgentFunctions, ...platformEventFunctions] as any,
  });
  routes.all('/api/inngest', (c: any) => inngestHandler(c));
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
