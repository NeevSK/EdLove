import { randomUUID } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import { z } from 'zod';
import { getConsistentIdempotencyKey } from '../../../../packages/core/src/lib/sync/idempotency';

// z.json's record parser strips own __proto__ keys. Validate without replacing
// the value, so a fingerprint cannot silently omit valid JSON payload fields.
const json = z.custom<z.JSONType>((value) => z.json().safeParse(value).success);
export type OperationJSON = z.JSONType;
export function validateOperationJSON(value: unknown): OperationJSON {
  return json.parse(value);
}
const boundedText = z.string().trim().min(1).max(200);
const operationInput = z.strictObject({
  accountId: z.uuid(),
  scope: boundedText,
  capability: boundedText,
  key: z.uuid(),
  payload: json,
});
export type OperationInput = z.infer<typeof operationInput>;
const effectInput = z.strictObject({
  name: boundedText,
  key: boundedText,
  payload: json,
  privacyClass: z.enum(['minimal', 'sensitive', 'restricted']),
  purpose: boundedText,
  maxAttempts: z.number().int().min(1).max(25).default(5),
});
export type EffectInput = z.input<typeof effectInput>;
export function prepareEffect(value: unknown) {
  return effectInput.parse(value);
}
const receipt = z.strictObject({
  operation_id: z.uuid(),
  payload_hash: z.string(),
  scope: z.string(),
  status: z.enum(['pending', 'committed', 'failed', 'conflict']),
  result: json,
});
const effect = z.strictObject({
  id: z.uuid(),
  account_id: z.uuid(),
  scope: z.string(),
  capability: z.string(),
  effect_name: z.string(),
  operation_id: z.uuid(),
  idempotency_key: z.string(),
  privacy_class: z.enum(['minimal', 'sensitive', 'restricted']),
  purpose: z.string(),
  payload: json,
  attempts: z.number().int(),
  max_attempts: z.number().int(),
  lock_token: z.uuid(),
  locked_until: z.date(),
});
export type ClaimedEffect = z.infer<typeof effect> & {
  readonly leaseDeadline: number;
  readonly recoveryRequired: boolean;
};

export class OperationConflict extends Error {
  readonly code = 'OPERATION_CONFLICT';
  constructor() {
    super('Operation key was already used for different work');
  }
}
export class OperationRecoveryRequired extends Error {
  readonly code = 'OPERATION_RECOVERY_REQUIRED';
  constructor() {
    super('Existing operation requires explicit recovery');
  }
}
export class OperationOutcomeUnknown extends Error {
  readonly code = 'OPERATION_OUTCOME_UNKNOWN';
  constructor() {
    super('Operation outcome is unknown; recover using the same operation key');
  }
}

export async function operationFingerprint(
  input: Pick<OperationInput, 'scope' | 'capability' | 'payload'>,
) {
  return getConsistentIdempotencyKey(
    {
      scope: boundedText.parse(input.scope),
      capability: boundedText.parse(input.capability),
      payload: json.parse(input.payload),
    },
    'api-operation:v1',
  );
}

export class OperationStore {
  private readonly statementTimeout: number;
  private readonly lockTimeout: number;
  private readonly idleTransactionTimeout: number;

  constructor(
    private readonly pool: Pool,
    options: {
      statementTimeoutMs?: number;
      lockTimeoutMs?: number;
      idleTransactionTimeoutMs?: number;
    } = {},
  ) {
    this.statementTimeout = z
      .number()
      .int()
      .min(1)
      .max(600_000)
      .parse(options.statementTimeoutMs ?? 5000);
    this.lockTimeout = z
      .number()
      .int()
      .min(1)
      .max(600_000)
      .parse(options.lockTimeoutMs ?? 2000);
    this.idleTransactionTimeout = z
      .number()
      .int()
      .min(1)
      .max(600_000)
      .parse(options.idleTransactionTimeoutMs ?? 10000);
  }

  async transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    let broken = false;
    let committing = false;
    try {
      await client.query('begin');
      await client.query(
        `select set_config('statement_timeout', $1, true), set_config('lock_timeout', $2, true),
          set_config('idle_in_transaction_session_timeout', $3, true)`,
        [
          String(this.statementTimeout),
          String(this.lockTimeout),
          String(this.idleTransactionTimeout),
        ],
      );
      const result = await work(client);
      committing = true;
      await client.query('commit');
      return result;
    } catch (error) {
      const outcome = committing ? new OperationOutcomeUnknown() : error;
      try {
        await client.query('rollback');
      } catch {
        broken = true;
        throw outcome;
      }
      throw outcome;
    } finally {
      client.release(broken);
    }
  }

  async execute(
    input: OperationInput,
    callbacks: {
      authorize: (client: PoolClient) => Promise<void>;
      mutate: (
        client: PoolClient,
        enqueue: (intent: EffectInput, preparedId?: string) => Promise<string>,
      ) => Promise<OperationJSON>;
      signal?: AbortSignal;
      recordAccepted?: (client: PoolClient, operationId: string) => Promise<void>;
    },
  ): Promise<{ operationId: string; replayed: boolean; result: OperationJSON }> {
    const command = operationInput.parse(input);
    const fingerprint = await operationFingerprint(command);
    return this.transaction(async (client) => {
      callbacks.signal?.throwIfAborted();
      await callbacks.authorize(client);
      const operationId = randomUUID();
      const inserted = await client.query<{ operation_id: string }>(
        `insert into public.operation_receipts (operation_id, account_id, capability, idempotency_key, payload_hash, scope, status)
         values ($1,$2,$3,$4,$5,$6,'pending')
         on conflict (account_id, capability, idempotency_key) do nothing returning operation_id`,
        [
          operationId,
          command.accountId,
          command.capability,
          command.key,
          fingerprint,
          command.scope,
        ],
      );
      const selected = await client.query<{
        operation_id: string;
        payload_hash: string;
        scope: string;
        status: string;
        result: unknown;
      }>(
        `select operation_id,payload_hash,scope,status,result from public.operation_receipts
         where account_id=$1 and capability=$2 and idempotency_key=$3 for update`,
        [command.accountId, command.capability, command.key],
      );
      const row = receipt.parse(selected.rows[0]);
      // Lock acquisition may wait behind another request: re-evaluate access
      // before reading its stored result or performing the mutation.
      await callbacks.authorize(client);
      callbacks.signal?.throwIfAborted();
      if (row.payload_hash !== fingerprint || row.scope !== command.scope)
        throw new OperationConflict();
      if (inserted.rowCount === 0) {
        if (row.status !== 'committed') throw new OperationRecoveryRequired();
        return { operationId: row.operation_id, replayed: true, result: row.result };
      }
      const enqueue = async (value: EffectInput, preparedId?: string) => {
        const intent = effectInput.parse(value);
        const id = preparedId === undefined ? randomUUID() : z.uuid().parse(preparedId);
        await client.query(
          `insert into public.external_effect_intents
           (id,account_id,scope,capability,effect_name,operation_id,idempotency_key,privacy_class,purpose,payload,max_attempts)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11)`,
          [
            id,
            command.accountId,
            command.scope,
            command.capability,
            intent.name,
            operationId,
            `${operationId}:${intent.key}`,
            intent.privacyClass,
            intent.purpose,
            JSON.stringify(intent.payload),
            intent.maxAttempts,
          ],
        );
        return id;
      };
      const result = json.parse(await callbacks.mutate(client, enqueue));
      callbacks.signal?.throwIfAborted();
      await client.query(
        `update public.operation_receipts set status='committed',result=$2::jsonb where operation_id=$1`,
        [operationId, JSON.stringify(result)],
      );
      // The capability must revalidate authority using this transaction and hold
      // any resource locks needed by its own rules until the commit completes.
      await callbacks.authorize(client);
      callbacks.signal?.throwIfAborted();
      await callbacks.recordAccepted?.(client, operationId);
      callbacks.signal?.throwIfAborted();
      return { operationId, replayed: false, result };
    });
  }

  async claim(options: {
    capability: string;
    effectName: string;
    limit: number;
    leaseMs: number;
    excludeIds?: readonly string[];
  }): Promise<ClaimedEffect[]> {
    const parsed = z
      .strictObject({
        capability: boundedText,
        effectName: boundedText,
        limit: z.number().int().min(1).max(100),
        leaseMs: z.number().int().min(100).max(300_000),
        excludeIds: z.array(z.uuid()).max(100).optional(),
      })
      .parse(options);
    return this.transaction(async (client) => {
      await client.query(
        `with expired as (
          select id from public.external_effect_intents
          where capability=$1 and effect_name=$2 and account_id is not null
            and status='dispatching' and locked_until<=clock_timestamp() and attempts>=max_attempts
          order by locked_until,id for update skip locked limit $3
        ) update public.external_effect_intents e
        set status='failed',last_error='attempts_exhausted_uncertain',lock_token=null,locked_until=null
        from expired where e.id=expired.id`,
        [parsed.capability, parsed.effectName, parsed.limit],
      );
      const claimStarted = performance.now();
      const result = await client.query<{ id: string }>(
        `with candidates as (
          select e.id, e.status as prior_status from public.external_effect_intents e join public.operation_receipts r on r.operation_id=e.operation_id
          where e.capability=$1 and e.effect_name=$2 and r.status='committed'
            and r.account_id=e.account_id and r.capability=e.capability and r.scope=e.scope
            and not (e.id = any($6::uuid[]))
            and e.attempts<e.max_attempts and ((e.status='pending' and e.available_at<=clock_timestamp())
              or (e.status='dispatching' and e.locked_until<=clock_timestamp()))
          order by case when e.status='pending' then e.available_at else e.locked_until end,e.id
          for update of e skip locked limit $3
         ) update public.external_effect_intents e set status='dispatching', attempts=e.attempts+case when c.prior_status='pending' then 1 else 0 end,lock_token=$4,
             locked_until=clock_timestamp()+($5::integer*interval '1 millisecond')
         from candidates c where e.id=c.id
         returning e.id,e.account_id,e.scope,e.capability,e.effect_name,e.operation_id,e.idempotency_key,
           e.privacy_class,e.purpose,e.payload,e.attempts,e.max_attempts,e.lock_token,e.locked_until,
           (extract(epoch from (e.locked_until-clock_timestamp()))*1000)::double precision remaining_lease_ms,
           (c.prior_status='dispatching') as recovery_required`,
        [
          parsed.capability,
          parsed.effectName,
          parsed.limit,
          randomUUID(),
          parsed.leaseMs,
          parsed.excludeIds ?? [],
        ],
      );
      const received = performance.now();
      const roundTripMs = received - claimStarted;
      return z
        .array(effect.extend({ remaining_lease_ms: z.number(), recovery_required: z.boolean() }))
        .parse(result.rows)
        .map(({ remaining_lease_ms, recovery_required, ...claim }) => ({
          ...claim,
          recoveryRequired: recovery_required,
          // Subtract the full request round trip, conservatively accounting for
          // transport delay without assuming Node and PostgreSQL clocks agree.
          leaseDeadline: received + Math.max(0, remaining_lease_ms - roundTripMs),
        }));
    });
  }

  async startRecoveredAttempt(claim: Pick<ClaimedEffect, 'id' | 'lock_token'>): Promise<boolean> {
    return this.transaction(async (client) => {
      const result = await client.query(
        `update public.external_effect_intents set attempts=attempts+1
       where id=$1 and lock_token=$2 and status='dispatching'
         and locked_until>clock_timestamp() and attempts<max_attempts`,
        [z.uuid().parse(claim.id), z.uuid().parse(claim.lock_token)],
      );
      return result.rowCount === 1;
    });
  }

  async acknowledge(
    claim: Pick<ClaimedEffect, 'id' | 'lock_token'>,
    providerEventId: string,
  ): Promise<boolean> {
    const reference = boundedText.parse(providerEventId);
    return this.transaction(async (client) => {
      const result = await client.query(
        `update public.external_effect_intents set status='dispatched',provider_event_id=$3,
      lock_token=null,locked_until=null,last_error=null where id=$1 and lock_token=$2
      and status='dispatching' and locked_until>clock_timestamp()`,
        [z.uuid().parse(claim.id), z.uuid().parse(claim.lock_token), reference],
      );
      return result.rowCount === 1;
    });
  }

  async fail(
    claim: Pick<ClaimedEffect, 'id' | 'lock_token'>,
    options: { retryAfterMs: number; terminal?: boolean },
  ): Promise<boolean> {
    const delay = z.number().int().min(100).max(86_400_000).parse(options.retryAfterMs);
    return this.transaction(async (client) => {
      const result = await client.query(
        `update public.external_effect_intents
      set status=case when $4 or attempts>=max_attempts then 'failed' else 'pending' end,
        available_at=clock_timestamp()+($3::integer*interval '1 millisecond'),
        last_error=case when $4 then 'unsupported_or_rejected' else 'dispatch_failed' end,
        lock_token=null,locked_until=null
      where id=$1 and lock_token=$2 and status='dispatching' and locked_until>clock_timestamp()`,
        [
          z.uuid().parse(claim.id),
          z.uuid().parse(claim.lock_token),
          delay,
          options.terminal ?? false,
        ],
      );
      return result.rowCount === 1;
    });
  }
}
