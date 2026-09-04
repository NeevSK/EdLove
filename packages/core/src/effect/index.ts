import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import { normalizeError, reportBestEffort, runForkBestEffort, runToPromise } from './Runtime';

/**
 * @repo/core/effect
 *
 * Authoritative boundary facade for all Effect-TS usage across the Polymath Platform.
 *
 * Submodules:
 * - @repo/core/effect/schedules — Canonical retry policies
 * - @repo/core/effect/runtime   — Runtime boundaries & execution helpers
 * - @repo/core/effect/errors    — Tagged domain error classes
 * - @repo/core/effect/layers    — Dependency injection layers
 */

// ─── 2. Tagged Domain Errors ─────────────────────────────────────────
export {
  DatabaseQueryError,
  NetworkError,
  OfflineMutationError,
  SyncDelegateError,
  SyncOperationError,
  SyncTableError,
  UnauthorizedError,
} from './Errors';
// ─── 3. Runtime Boundaries & Adapters ────────────────────────────────
export { reportBestEffort, runForkBestEffort, runToPromise } from './Runtime';
// ─── 1. Canonical Schedules ──────────────────────────────────────────
export { defaultRetryPolicy, retryPolicy, strictRetryPolicy } from './Schedules';

/**
 * Shared Promise-to-Effect adapter for fallible I/O.
 * Rejections stay in the typed error channel instead of becoming unhandled defects.
 */
export function tryPromise<T>(fn: () => PromiseLike<T>): Effect.Effect<T, Error, never> {
  return Effect.tryPromise({ try: fn, catch: normalizeError });
}

/**
 * Fire-and-forget: runs a promise-producing function in a forked Effect fiber.
 * Errors are captured and logged — never silently swallowed.
 */
export function fireAndForget(fn: () => Promise<unknown>, label: string): void {
  runForkBestEffort(tryPromise(fn), label);
}

/**
 * Fire-and-forget an existing Effect in a detached background fiber.
 */
export function fireAndForgetEffect<E>(
  effect: Effect.Effect<unknown, E, never>,
  label: string,
): void {
  runForkBestEffort(effect, label);
}

/**
 * Bridge an Effect to a Promise, converting typed errors to APIError at the boundary.
 */
export function runEffect<T, E extends { message?: string }>(
  effect: Effect.Effect<T, E, never>,
  errorCode?: string,
): Promise<T> {
  return runToPromise(effect, errorCode);
}

/**
 * Wrap a Supabase-style `{ data, error }` response into an Effect.
 * Handles both the promise rejection and the Supabase error object.
 */
export function fromSupabase<T>(
  fn: () => PromiseLike<{ data: T | null; error: unknown }>,
  label?: string,
): Effect.Effect<T, Error, never> {
  return pipe(
    Effect.tryPromise({ try: fn, catch: (e) => new Error(String(e)) }),
    Effect.flatMap(({ data, error }) =>
      error
        ? Effect.fail(
            new Error(
              typeof error === 'object' && error !== null && 'message' in error
                ? String(error.message)
                : String(error),
            ),
          )
        : data !== null
          ? Effect.succeed(data)
          : Effect.fail(new Error(`${label ?? 'Supabase'} returned null`)),
    ),
  );
}
