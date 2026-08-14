type WorkerTelemetryInput = {
  worker: string;
  eventName: string;
  entityId: string;
  schoolId?: string | null;
  data: Record<string, unknown>;
};

const EVENT_NAMES: Record<string, string> = {
  'school/attendance.recorded': 'attendance_recorded',
  'school/classroom.created': 'classroom_created',
  'school/grade.published': 'grade_published',
  'wellbeing/mood.logged': 'wellbeing_mood_processed',
};

const SAFE_KEYS = new Set([
  'classroom_id',
  'student_id',
  'studentId',
  'assignment_id',
  'grade',
  'status',
  'action',
]);

/**
 * Emits worker telemetry without sending journal text, decision content, or
 * other arbitrary event payload fields to the analytics provider.
 *
 * Analytics is observability, not the source of truth for worker completion.
 * A missing key or provider failure is therefore recorded locally by the
 * worker ledger but does not roll back a completed domain side effect.
 */
export async function capturePlatformWorkerEvent(input: WorkerTelemetryInput) {
  const apiKey = process.env.POSTHOG_API_KEY;
  if (!apiKey) return { sent: false, reason: 'not_configured' as const };

  const host = (process.env.POSTHOG_HOST ?? 'https://eu.i.posthog.com').replace(/\/$/, '');
  const properties: Record<string, unknown> = {
    worker: input.worker,
    worker_entity_id: input.entityId,
    school_id: input.schoolId ?? null,
    correlation_id: input.data.correlationId ?? null,
    causation_id: input.data.causationId ?? null,
  };
  for (const [key, value] of Object.entries(input.data)) {
    if (SAFE_KEYS.has(key)) properties[key] = value;
  }
  if (input.eventName === 'wellbeing/mood.logged' && typeof input.data.moodScore === 'number') {
    properties.intervention_needed = input.data.moodScore <= 2;
  }

  try {
    const response = await fetch(`${host}/capture/`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        event: EVENT_NAMES[input.eventName] ?? input.eventName,
        distinct_id: String(input.data.studentId ?? input.data.student_id ?? input.entityId),
        properties,
      }),
    });
    if (!response.ok) {
      return { sent: false, reason: `provider_${response.status}` as const };
    }
    return { sent: true as const };
  } catch {
    return { sent: false, reason: 'provider_unavailable' as const };
  }
}
