import type { CapabilityDescriptor } from '@repo/core/api/capabilityFoundation';
import { executeDatabaseCommand, queryDatabaseRows } from '@repo/database/client';

const MAX_DISPATCH_ATTEMPTS = 8;

export type ExternalEffectIntent = Readonly<{
  id: string;
  capability: string;
  operationId?: string;
  idempotencyKey: string;
  purpose: string;
  payload: unknown;
}>;

type ClaimedExternalEffect = Omit<ExternalEffectIntent, 'payload'> & {
  effectName: string;
  payload: Record<string, unknown>;
  attempts: number;
  leaseToken: string;
};

function deferredEffectPolicy(descriptor: CapabilityDescriptor): Extract<
  CapabilityDescriptor['effect'],
  { kind: 'deferred-effect' }
> {
  if (descriptor.effect.kind !== 'deferred-effect') {
    throw new Error(`Capability ${descriptor.id} does not admit an external effect.`);
  }
  return descriptor.effect;
}

/** Persist provider-facing intent in the same transaction as its domain commit. */
export async function enqueueExternalEffect(
  tx: { $executeRaw: (parts: TemplateStringsArray, ...values: unknown[]) => Promise<unknown> },
  descriptor: CapabilityDescriptor,
  input: ExternalEffectIntent,
): Promise<void> {
  const effect = deferredEffectPolicy(descriptor);
  if (input.capability !== descriptor.id) {
    throw new Error('Effect intent capability must match its descriptor.');
  }
  const payload = effect.payloadSchema.parse(input.payload);
  await tx.$executeRaw`
    INSERT INTO public.external_effect_intents
      (id, capability, effect_name, operation_id, idempotency_key, privacy_class, purpose, payload)
    VALUES (
      ${input.id}::uuid,
      ${descriptor.id},
      ${effect.effectName},
      ${input.operationId ?? null}::uuid,
      ${input.idempotencyKey},
      ${descriptor.privacy},
      ${input.purpose},
      ${JSON.stringify(payload)}::jsonb
    )
    ON CONFLICT (capability, idempotency_key) DO NOTHING
  `;
}

function retryDelaySeconds(attempts: number): number {
  return Math.min(3600, 2 ** Math.min(attempts, 10));
}

export async function claimPendingExternalEffects(limit = 25): Promise<ClaimedExternalEffect[]> {
  return queryDatabaseRows<ClaimedExternalEffect>(
    `
      WITH candidates AS (
        SELECT id FROM public.external_effect_intents
        WHERE (status = 'pending' AND available_at <= now())
           OR (status = 'dispatching' AND locked_until < now())
        ORDER BY available_at, created_at
        FOR UPDATE SKIP LOCKED
        LIMIT $1
      )
      UPDATE public.external_effect_intents effects
      SET status = 'dispatching',
          lock_token = gen_random_uuid(),
          locked_until = now() + interval '2 minutes',
          attempts = attempts + 1
      FROM candidates
      WHERE effects.id = candidates.id
      RETURNING effects.id, effects.capability, effects.effect_name AS "effectName",
        effects.operation_id AS "operationId", effects.idempotency_key AS "idempotencyKey",
        effects.purpose, effects.payload, effects.attempts, effects.lock_token AS "leaseToken"
    `,
    [limit],
  );
}

export async function markExternalEffectDispatched(intent: ClaimedExternalEffect): Promise<void> {
  await executeDatabaseCommand(
    `UPDATE public.external_effect_intents
       SET status = 'dispatched', locked_until = null, lock_token = null, provider_event_id = $3
     WHERE id = $1::uuid AND status = 'dispatching' AND lock_token = $2::uuid`,
    [intent.id, intent.leaseToken, intent.id],
  );
}

export async function rescheduleExternalEffect(
  intent: ClaimedExternalEffect,
  error: unknown,
): Promise<void> {
  const failed = intent.attempts >= MAX_DISPATCH_ATTEMPTS;
  await executeDatabaseCommand(
    `UPDATE public.external_effect_intents
       SET status = $3,
           locked_until = null,
           lock_token = null,
           available_at = now() + ($4::text || ' seconds')::interval,
           last_error = $5
     WHERE id = $1::uuid AND status = 'dispatching' AND lock_token = $2::uuid`,
    [
      intent.id,
      intent.leaseToken,
      failed ? 'failed' : 'pending',
      retryDelaySeconds(intent.attempts),
      error instanceof Error ? error.message.slice(0, 500) : 'External effect dispatch failed.',
    ],
  );
}
