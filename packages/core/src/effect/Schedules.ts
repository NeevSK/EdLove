/**
 * Canonical retry schedules for @repo/core.
 *
 * All network and database retry policies live here.
 * To change retry behavior across the entire codebase, change it here.
 *
 * v4 note: Schedule API is stable across v3 → v4. This file is the single
 * point to update if Schedule signatures change during migration.
 *
 * Import:
 *   import { defaultRetryPolicy, strictRetryPolicy, retryPolicy } from '@repo/core/utils/effect';
 */
import { Duration, Schedule } from 'effect';

/**
 * Default retry: exponential backoff at 200ms, max 3 retries (4 total attempts).
 * Use for: Supabase reads, oRPC network calls, attendance API.
 */
export const defaultRetryPolicy = Schedule.max([
  Schedule.exponential(Duration.millis(200)),
  Schedule.recurs(3),
]);

/**
 * Strict retry: exponential backoff at 200ms, max 2 retries (3 total attempts).
 * Use for: non-critical operations where one extra retry is sufficient.
 */
export const strictRetryPolicy = Schedule.max([
  Schedule.exponential(Duration.millis(200)),
  Schedule.recurs(2),
]);

/**
 * Configurable retry: exponential backoff at 200ms with caller-specified count.
 * Use when the caller wants to tune retry depth without naming a new policy.
 */
export function retryPolicy(maxRetries: number = 3) {
  return Schedule.max([
    Schedule.exponential(Duration.millis(200)),
    Schedule.recurs(maxRetries),
  ]);
}

