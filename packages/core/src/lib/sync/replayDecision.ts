import { classifyError } from '@repo/core/lib/sync/errorClassifier';
import { retryDelayMs } from '@repo/core/logic/failure/classifyFailure';

/**
 * What happens to a queued mutation after one replay attempt, decided in one place for every
 * drain: the foreground SyncOrchestrator and the mobile background task. Before this, each drain
 * had its own rules (the background task retried an expired session or a permanent failure
 * until the dead-letter queue, and the two had different retry limits).
 *
 * The outcomes (client runtime plan, L4; the feedback for each comes with L7):
 *
 * - `Retrying`: a transient failure; it waits `backoffUntil` (jittered, so devices reconnecting
 *   after an outage don't retry together).
 * - `AuthPaused`: the session expired; replay waits for sign-in instead of spending retries.
 * - `Conflict`: someone changed it first; it waits for resolution, never the dead-letter queue.
 * - `Failed`: permanent, or out of retries; it goes to the dead-letter queue, from where it can
 *   be restored.
 *
 * A mutation with no registered v1 handler stays queued (`API_CAPABILITY_NOT_ADMITTED`) in both
 * drains; that is checked before dispatch, so it never reaches this decision.
 */
export type ReplayDecision =
  | { readonly _tag: 'Retrying'; readonly retryCount: number; readonly backoffUntil: number }
  | { readonly _tag: 'AuthPaused'; readonly retryCount: number; readonly backoffUntil: number }
  | { readonly _tag: 'Conflict'; readonly retryCount: number }
  | {
      readonly _tag: 'Failed';
      readonly retryCount: number;
      readonly reason: 'PERMANENT_FAILURE' | 'MAX_RETRIES_EXCEEDED';
    };

/** Replay limits, as a policy: change them here and every drain follows. */
export const REPLAY_POLICY = {
  /** Attempts before a transient failure goes to the dead-letter queue. */
  maxRetries: 5,
  /** How long an expired session pauses replay before it is checked again. */
  authPauseMs: 5_000,
} as const;

export function decideReplayFailure(
  error: unknown,
  previousRetryCount: number | undefined,
  { now = Date.now(), random = Math.random, policy = REPLAY_POLICY } = {},
): ReplayDecision {
  const retryCount = (previousRetryCount ?? 0) + 1;
  switch (classifyError(error)) {
    case 'PERMANENT':
      return { _tag: 'Failed', retryCount, reason: 'PERMANENT_FAILURE' };
    case 'CONFLICT':
      return { _tag: 'Conflict', retryCount };
    case 'AUTH_EXPIRED':
      return { _tag: 'AuthPaused', retryCount, backoffUntil: now + policy.authPauseMs };
    default:
      if (retryCount >= policy.maxRetries) {
        return { _tag: 'Failed', retryCount, reason: 'MAX_RETRIES_EXCEEDED' };
      }
      return { _tag: 'Retrying', retryCount, backoffUntil: now + retryDelayMs(retryCount, error, random) };
  }
}
