import {
  sendStudentSupportRequested,
  studentSupportRequestedPayloadSchema,
  uuidv7,
} from '@repo/core/logic';
import { eventBus } from '../../../lib/inngest';
import { supabaseAdmin } from '../../../lib/supabase';

const requestSchema = studentSupportRequestedPayloadSchema.extend({
  runId: studentSupportRequestedPayloadSchema.shape.runId.optional(),
  requestedAt: studentSupportRequestedPayloadSchema.shape.requestedAt.optional(),
});
export const prerender = false;
export async function POST({ request }: { request: Request }) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }
  const runId = uuidv7();
  const requestedAt = new Date().toISOString();
  const parsed = requestSchema.safeParse({
    ...((body as Record<string, unknown>) ?? {}),
    runId,
    requestedAt,
  });
  if (!parsed.success) {
    return Response.json(
      {
        error: 'Invalid durable-agent request.',
        issues: parsed.error.issues,
      },
      { status: 400 },
    );
  }
  const payload = {
    ...parsed.data,
    runId,
    requestedAt,
    correlationId: parsed.data.correlationId ?? runId,
    causationId: parsed.data.causationId ?? runId,
  };
  const { error: auditError } = await supabaseAdmin.from('audit_logs').insert({
    id: uuidv7(),
    action: 'durable_agent_requested',
    entity_id: payload.runId,
    entity_type: 'durable_agent_run',
    school_id: payload.schoolId,
    idempotency_key: `durable-agent:${payload.runId}:requested`,
    metadata: {
      runType: 'student_support_snapshot',
      mode: payload.mode,
      demoScenario: payload.demoScenario ?? null,
      classroomId: payload.classroomId,
      teacherId: payload.teacherId ?? null,
      studentId: payload.studentId,
      studentName: payload.studentName ?? null,
      requestedBy: payload.requestedBy ?? null,
      requestedAt: payload.requestedAt,
      focusPrompt: payload.focusPrompt ?? null,
      evidenceScopes: payload.evidenceScopes,
      reviewMode: payload.reviewMode,
      correlationId: payload.correlationId ?? payload.runId,
      causationId: payload.causationId ?? payload.runId,
    },
  });
  if (auditError) {
    return Response.json({ error: 'Failed to stage the durable-agent run.' }, { status: 500 });
  }
  await sendStudentSupportRequested(eventBus, payload);
  return Response.json(
    {
      runId: payload.runId,
      status: 'queued',
      mode: payload.mode,
      reviewMode: payload.reviewMode,
    },
    { status: 202 },
  );
}
