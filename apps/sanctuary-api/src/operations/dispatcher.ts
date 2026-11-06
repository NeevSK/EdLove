import { z } from 'zod';
import { type ClaimedEffect, OperationStore } from './store';

const recoveryResult = z.discriminatedUnion('status', [
  z.strictObject({
    status: z.literal('accepted'),
    providerEventId: z.string().trim().min(1).max(200),
  }),
  z.strictObject({ status: z.literal('retry') }),
  z.strictObject({ status: z.literal('unresolved') }),
]);

export interface EffectHandler {
  capability: string;
  effectName: string;
  authorize: (effect: ClaimedEffect, signal: AbortSignal) => Promise<void>;
  recover?: (
    effect: ClaimedEffect,
    signal: AbortSignal,
  ) => Promise<
    { status: 'accepted'; providerEventId: string } | { status: 'retry' } | { status: 'unresolved' }
  >;
  dispatch: (effect: ClaimedEffect, signal: AbortSignal) => Promise<{ providerEventId: string }>;
}

export class EffectAuthorizationDenied extends Error {
  constructor() {
    super('Effect authorization denied');
  }
}

// Per-process rotation avoids giving the first registered handler every small poll.
const nextHandler = new WeakMap<OperationStore, number>();

/** One bounded poll: the host owns scheduling and shutdown. No dispatcher starts
 * before an explicit handler is admitted; authorization is rechecked per attempt. */
export async function dispatchDueEffects(
  store: OperationStore,
  handlers: readonly EffectHandler[],
  options: {
    signal: AbortSignal;
    leaseMs: number;
    limit: number;
    retryAfterMs: number;
  },
) {
  z.number().int().min(100).max(300_000).parse(options.leaseMs);
  z.number().int().min(1).max(100).parse(options.limit);
  z.number().int().min(100).max(86_400_000).parse(options.retryAfterMs);
  const seen = new Set<string>();
  for (const handler of handlers) {
    const key = JSON.stringify([handler.capability, handler.effectName]);
    if (seen.has(key)) throw new Error('Duplicate effect handler');
    seen.add(key);
  }
  let acknowledged = 0;
  let failed = 0;
  let uncertain = 0;
  let totalClaimed = 0;
  const start = handlers.length ? (nextHandler.get(store) ?? 0) % handlers.length : 0;
  for (let offset = 0; offset < handlers.length && totalClaimed < options.limit; offset++) {
    const index = (start + offset) % handlers.length;
    const handler = handlers[index];
    if (!handler) continue;
    options.signal.throwIfAborted();
    const claimedIds: string[] = [];
    while (totalClaimed < options.limit) {
      if (options.signal.aborted) break;
      const claims = await store.claim({
        capability: handler.capability,
        effectName: handler.effectName,
        limit: 1,
        leaseMs: options.leaseMs,
        excludeIds: claimedIds,
      });
      const claim = claims[0];
      if (!claim) break;
      totalClaimed++;
      nextHandler.set(store, (index + 1) % handlers.length);
      claimedIds.push(claim.id);
      if (options.signal.aborted) {
        // Claimed work is retained until lease expiry, never marked delivered.
        uncertain++;
        continue;
      }
      const remaining = Math.floor(claim.leaseDeadline - performance.now());
      if (remaining <= 0) {
        uncertain++;
        continue;
      }
      const signal = AbortSignal.any([options.signal, AbortSignal.timeout(remaining)]);
      try {
        await handler.authorize(claim, signal);
      } catch (error) {
        if (claim.recoveryRequired) {
          uncertain++;
          continue;
        }
        const settled = await store.fail(claim, {
          retryAfterMs: options.retryAfterMs,
          terminal: error instanceof EffectAuthorizationDenied,
        });
        if (settled) failed++;
        else uncertain++;
        continue;
      }
      if (claim.recoveryRequired) {
        if (!handler.recover || signal.aborted) {
          uncertain++;
          continue;
        }
        let recovery: z.infer<typeof recoveryResult>;
        try {
          const result = recoveryResult.safeParse(await handler.recover(claim, signal));
          if (!result.success) {
            uncertain++;
            continue;
          }
          recovery = result.data;
          signal.throwIfAborted();
        } catch {
          uncertain++;
          continue;
        }
        if (recovery.status === 'accepted') {
          try {
            await handler.authorize(claim, signal);
            signal.throwIfAborted();
            if (await store.acknowledge(claim, recovery.providerEventId)) acknowledged++;
            else uncertain++;
          } catch {
            uncertain++;
          }
          continue;
        }
        if (recovery.status !== 'retry') {
          uncertain++;
          continue;
        }
        try {
          // Recovery can wait on a provider: current authority must be rechecked.
          await handler.authorize(claim, signal);
          signal.throwIfAborted();
          if (!(await store.startRecoveredAttempt(claim))) {
            uncertain++;
            continue;
          }
        } catch {
          uncertain++;
          continue;
        }
      }
      let result: { providerEventId: string };
      if (signal.aborted) {
        if (claim.recoveryRequired) {
          uncertain++;
          continue;
        }
        // Dispatch has not started, so retrying cannot duplicate a provider send.
        if (await store.fail(claim, { retryAfterMs: options.retryAfterMs })) failed++;
        else uncertain++;
        continue;
      }
      try {
        result = await handler.dispatch(claim, signal);
      } catch {
        // A provider may have accepted work before the call failed or was aborted.
        uncertain++;
        continue;
      }
      try {
        if (await store.acknowledge(claim, result.providerEventId)) acknowledged++;
        else uncertain++;
      } catch {
        // The provider accepted the send; do not classify its outcome as a failed send.
        uncertain++;
      }
    }
  }
  return { acknowledged, failed, uncertain };
}
