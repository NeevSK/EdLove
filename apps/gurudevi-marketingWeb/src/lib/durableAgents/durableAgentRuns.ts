import { createDomainServices, v7 as uuidv7 } from '@repo/core/logic';
import { insertWorkerAuditLog } from '../../inngest/lib/workerObservability';
import { supabaseAdmin } from '../supabase';
export type DurableAgentAuditRow = {
  action: string;
  created_at: string;
  entity_id: string;
  school_id: string | null;
  metadata: Record<string, unknown> | null;
};
export type DurableAgentRunView = {
  runId: string;
  status: 'running' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  runType: string | null;
  mode: string | null;
  scenario: string | null;
  classroomId: string | null;
  classroomName: string | null;
  studentId: string | null;
  studentName: string | null;
  teacherId: string | null;
  requestedBy: string | null;
  summaryDraft: string | null;
  evidence: unknown;
  governor: unknown;
  promotedTeacherNoteId: string | null;
  promotionMode: string | null;
  promotedAt: string | null;
  error: string | null;
  timeline: Array<{
    action: string;
    createdAt: string;
  }>;
};
function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}
function pickString(record: Record<string, unknown> | null, key: string): string | null {
  const value = record?.[key];
  return typeof value === 'string' ? value : null;
}
function deriveRunStatus(rows: DurableAgentAuditRow[]) {
  const completed = rows.find((row) => row.action === 'durable_agent_completed');
  const failed = rows.find((row) => row.action === 'durable_agent_failed');
  if (failed) return 'failed' as const;
  if (completed) return 'completed' as const;
  return 'running' as const;
}
export function materializeDurableAgentRun(
  rows: DurableAgentAuditRow[],
): DurableAgentRunView | null {
  if (rows.length === 0) return null;
  const first = rows[0];
  if (!first) return null;
  const latest = rows.at(-1)!;
  const requested = rows.find((row) => row.action === 'durable_agent_requested');
  const completed = rows.find((row) => row.action === 'durable_agent_completed');
  const failed = rows.find((row) => row.action === 'durable_agent_failed');
  const promoted = rows.find((row) => row.action === 'durable_agent_promoted_to_teacher_note');
  const requestedMetadata = asRecord(requested?.metadata);
  const completedMetadata = asRecord(completed?.metadata);
  const failedMetadata = asRecord(failed?.metadata);
  const promotedMetadata = asRecord(promoted?.metadata);
  const evidence = asRecord(completedMetadata?.evidence);
  const classroom = asRecord(evidence?.classroom);
  return {
    runId: first.entity_id,
    status: deriveRunStatus(rows),
    createdAt: first.created_at,
    updatedAt: latest.created_at,
    runType: pickString(requestedMetadata, 'runType') ?? pickString(completedMetadata, 'runType'),
    mode: pickString(requestedMetadata, 'mode'),
    scenario: pickString(requestedMetadata, 'demoScenario'),
    classroomId:
      pickString(requestedMetadata, 'classroomId') ?? pickString(completedMetadata, 'classroomId'),
    classroomName: pickString(classroom, 'name'),
    studentId:
      pickString(requestedMetadata, 'studentId') ?? pickString(completedMetadata, 'studentId'),
    studentName:
      pickString(requestedMetadata, 'studentName') ?? pickString(completedMetadata, 'studentName'),
    teacherId: pickString(requestedMetadata, 'teacherId'),
    requestedBy: pickString(requestedMetadata, 'requestedBy'),
    summaryDraft: pickString(completedMetadata, 'summaryDraft'),
    evidence: completedMetadata?.evidence ?? null,
    governor: completedMetadata?.governor ?? null,
    promotedTeacherNoteId: pickString(promotedMetadata, 'teacherNoteId'),
    promotionMode: pickString(promotedMetadata, 'promotionMode'),
    promotedAt: promoted?.created_at ?? null,
    error: pickString(failedMetadata, 'error'),
    timeline: rows.map((row) => ({
      action: row.action,
      createdAt: row.created_at,
    })),
  };
}
export async function fetchDurableAgentRun(runId: string): Promise<DurableAgentRunView | null> {
  const { data, error } = await supabaseAdmin
    .from('audit_logs')
    .select('action, created_at, entity_id, school_id, metadata')
    .eq('entity_id', runId)
    .eq('entity_type', 'durable_agent_run')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return materializeDurableAgentRun((data ?? []) as DurableAgentAuditRow[]);
}
export async function listRecentDurableAgentRuns(limit = 10) {
  const { data, error } = await supabaseAdmin
    .from('audit_logs')
    .select('action, created_at, entity_id, school_id, metadata')
    .eq('entity_type', 'durable_agent_run')
    .in('action', [
      'durable_agent_requested',
      'durable_agent_completed',
      'durable_agent_failed',
      'durable_agent_promoted_to_teacher_note',
    ])
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  const grouped = new Map<string, DurableAgentAuditRow[]>();
  for (const row of (data ?? []) as DurableAgentAuditRow[]) {
    const existing = grouped.get(row.entity_id) ?? [];
    existing.push(row);
    grouped.set(row.entity_id, existing);
  }
  return [...grouped.values()]
    .map((rows) =>
      materializeDurableAgentRun(
        [...rows].sort((left, right) => left.created_at.localeCompare(right.created_at)),
      ),
    )
    .filter((value): value is DurableAgentRunView => value !== null)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, limit);
}
export async function promoteDurableAgentRunToTeacherNote(runId: string, actorId?: string | null) {
  const run = await fetchDurableAgentRun(runId);
  if (!run) {
    throw new Error('Durable-agent run was not found.');
  }
  if (run.status !== 'completed' || !run.summaryDraft) {
    throw new Error('Only completed durable-agent runs can be promoted.');
  }
  if (!run.teacherId) {
    throw new Error('This run has no teacher target for note promotion.');
  }
  if (run.promotedTeacherNoteId) {
    return {
      run,
      teacherNoteId: run.promotedTeacherNoteId,
      alreadyPromoted: true,
      promotionMode: run.promotionMode ?? 'teacher_private_note',
    };
  }
  let teacherNoteId: string;
  let promotionMode: 'teacher_private_note' | 'demo_teacher_note';
  if (run.mode === 'demo') {
    teacherNoteId = `demo-note-${runId.slice(0, 8)}`;
    promotionMode = 'demo_teacher_note';
  } else {
    const domainServices = createDomainServices(supabaseAdmin);
    const note = await domainServices.teacherInsights.createPrivateNote(
      {
        teacherId: run.teacherId,
        type: 'note',
        content: ['Durable agent draft promoted for teacher review.', '', run.summaryDraft].join(
          '\n',
        ),
      },
      `durable-agent:${runId}:teacher-note`,
    );
    teacherNoteId = note.id;
    promotionMode = 'teacher_private_note';
  }
  await insertWorkerAuditLog({
    supabase: supabaseAdmin,
    id: uuidv7(),
    action: 'durable_agent_promoted_to_teacher_note',
    entityId: runId,
    entityType: 'durable_agent_run',
    schoolId: null,
    idempotencyKey: `durable-agent:${runId}:promoted-teacher-note`,
    correlationId: runId,
    causationId: runId,
    metadata: {
      runType: run.runType ?? 'teacher_summary_draft',
      teacherNoteId,
      promotionMode,
      teacherId: run.teacherId,
      requestedBy: actorId ?? run.requestedBy ?? null,
      classroomId: run.classroomId,
      classroomName: run.classroomName,
      studentId: run.studentId,
      studentName: run.studentName,
    },
  });
  return {
    run,
    teacherNoteId,
    alreadyPromoted: false,
    promotionMode,
  };
}
