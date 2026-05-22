import { initPostHog, trackEvent } from '@repo/analytics';
import type { SupabaseClient } from '@supabase/supabase-js';

type WorkerAuditInput = {
  supabase: SupabaseClient;
  id?: string;
  action: string;
  entityId: string;
  entityType: string;
  schoolId?: string | null;
  idempotencyKey?: string;
  correlationId?: string;
  causationId?: string;
  metadata?: Record<string, unknown>;
};

type WorkerAnalyticsInput = {
  eventName: string;
  distinctId: string;
  correlationId?: string;
  causationId?: string;
  properties?: Record<string, unknown>;
};

export async function insertWorkerAuditLog({
  supabase,
  id,
  action,
  entityId,
  entityType,
  schoolId,
  idempotencyKey,
  correlationId,
  causationId,
  metadata,
}: WorkerAuditInput) {
  const { error } = await supabase.from('audit_logs').insert({
    id,
    action,
    entity_id: entityId,
    entity_type: entityType,
    school_id: schoolId ?? null,
    metadata: {
      ...(metadata ?? {}),
      correlationId: correlationId ?? null,
      causationId: causationId ?? null,
    },
    idempotency_key: idempotencyKey,
  });

  if (error) throw error;
}

export async function trackWorkerAnalytics({
  eventName,
  distinctId,
  correlationId,
  causationId,
  properties,
}: WorkerAnalyticsInput) {
  await initPostHog(import.meta.env.POSTHOG_API_KEY!, {
    host:
      import.meta.env.POSTHOG_HOST ||
      import.meta.env.PUBLIC_POSTHOG_HOST ||
      'https://eu.i.posthog.com',
  });

  trackEvent(eventName, {
    distinctId,
    correlation_id: correlationId,
    causation_id: causationId,
    ...(properties ?? {}),
  });
}
