import { Duration, Effect, pipe, Schedule } from 'effect';
import { captureException } from '@repo/core/lib/monitoring/sentry';
import { APIError } from '@repo/core/types/API';

function normalizeError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

/**
 * Shared Promise-to-Effect adapter for fallible I/O.
 * Rejections stay in the typed error channel instead of becoming defects.
 */
export function tryPromise<T>(fn: () => PromiseLike<T>): Effect.Effect<T, Error, never> {
  return Effect.tryPromise({ try: fn, catch: normalizeError });
}

/**
 * Default retry: exponential backoff starting at 200ms, max 3 attempts (4 total).
 * Use for network calls and Supabase queries.
 */
export const defaultRetryPolicy = pipe(
  Schedule.exponential(Duration.millis(200)),
  Schedule.intersect(Schedule.recurs(3)),
);

/**
 * Strict retry: exponential backoff starting at 200ms, max 2 attempts (3 total).
 * Use for non-critical operations where a single retry is sufficient.
 */
export const strictRetryPolicy = pipe(
  Schedule.exponential(Duration.millis(200)),
  Schedule.intersect(Schedule.recurs(2)),
);

/**
 * Convenience retry: exponential backoff with a configurable count.
 */
export function retryPolicy(maxRetries: number = 3) {
  return pipe(
    Schedule.exponential(Duration.millis(200)),
    Schedule.intersect(Schedule.recurs(maxRetries)),
  );
}

/**
 * Fire-and-forget: runs a promise-producing function in a forked Effect fiber.
 * Errors are logged via Effect.logError — never silently swallowed.
 *
 * Use anywhere you previously had `void fn().catch(() => {})`.
 *
 * ```ts
 * fireAndForget(() => api.sync(), 'SyncService');
 * ```
 */
export function fireAndForget(fn: () => Promise<unknown>, label: string): void {
  Effect.runFork(
    Effect.tryPromise({ try: fn, catch: normalizeError }).pipe(
      Effect.catchAll((e) =>
        Effect.sync(() => {
          captureException(e, { operation: label, boundary: 'fire-and-forget' });
        }).pipe(
          Effect.zipRight(Effect.logError(`[${label}] fire-and-forget failed`, e)),
        ),
      ),
      Effect.asVoid,
    ),
  );
}

/**
 * Boundary runner: bridges an Effect to a Promise, converting tagged errors to APIError.
 *
 * Use at the edge of your Effect zone — typically in `queryFn` callbacks or event handlers
 * where the rest of the codebase expects `Promise<T>`.
 *
 * ```ts
 * const user = await runEffect(getUser$(id), 'USER_FETCH_ERROR');
 * ```
 */
export function runEffect<T, E extends { message: string }>(
  effect: Effect.Effect<T, E, never>,
  errorCode?: string,
): Promise<T> {
  return Effect.runPromise(
    effect.pipe(
      Effect.catchAll((e) =>
        Effect.sync(() => {
          captureException(e, { operation: errorCode ?? 'EFFECT_ERROR', boundary: 'effect' });
        }).pipe(
          Effect.zipRight(
            Effect.fail(new APIError(e.message, errorCode ?? 'EFFECT_ERROR', e, true)),
          ),
        ),
      ),
    ),
  );
}

/**
 * Wrap a Supabase-style `{ data, error }` response into an Effect.
 * Handles both the promise rejection and the Supabase error object.
 *
 * ```ts
 * const user = yield* fromSupabase(() => supabase.from('users').select('*').single());
 * ```
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
