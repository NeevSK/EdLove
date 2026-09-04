import { captureException } from '@repo/core/monitoring';
import { APIError } from '@repo/core/types/API';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';

// Re-export canonical retry schedules. All callers continue to use:
//   import { defaultRetryPolicy, strictRetryPolicy, retryPolicy } from '@repo/core/utils/effect'
export { defaultRetryPolicy, strictRetryPolicy, retryPolicy } from '@repo/core/effect/Schedules';

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
  fireAndForgetEffect(tryPromise(fn), label);
}

export function fireAndForgetEffect<E>(
  effect: Effect.Effect<unknown, E, never>,
  label: string,
): void {
  Effect.runFork(reportBestEffort(effect, label));
}

export function reportBestEffort<E>(
  effect: Effect.Effect<unknown, E, never>,
  label: string,
): Effect.Effect<void, never, never> {
  return effect.pipe(
    Effect.catchAll((error) =>
      Effect.sync(() => {
        captureException(error, { operation: label, boundary: 'fire-and-forget' });
      }).pipe(Effect.zipRight(Effect.logError(`[${label}] fire-and-forget failed`, error))),
    ),
    Effect.asVoid,
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
