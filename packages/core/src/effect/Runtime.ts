import { Effect, Fiber } from 'effect';
import { captureException } from '@repo/core/monitoring';
import { APIError } from '@repo/core/types/API';

/**
 * Runtime execution boundary for @repo/core.
 *
 * Provides safe runners and managed runtime primitives that comply with
 * both Effect v3 and the Effect v4 owned-runtime model.
 *
 * Key Resilience Invariants:
 * 1. Never call Effect.runSync at module evaluation time.
 * 2. All async side-effects crossing to React/Zustand must exit through runPromise or runFork.
 * 3. Both typed failures (Fail) AND untyped crashes (Die/Defect) must be caught and routed
 *    to telemetry without crashing the host process.
 */

/**
 * Normalize an unknown error or primitive into an Error instance.
 */
export function normalizeError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (typeof error === 'string') return new Error(error);
  try {
    return new Error(JSON.stringify(error));
  } catch {
    return new Error(String(error));
  }
}

/**
 * Report best-effort background effects with full error and defect capture.
 */
export function reportBestEffort<E>(
  effect: Effect.Effect<unknown, E, never>,
  label: string,
): Effect.Effect<void, never, never> {
  return effect.pipe(
    Effect.catch((error: E) =>
      Effect.sync(() => {
        captureException(error, { operation: label, boundary: 'fire-and-forget' });
      }).pipe(Effect.andThen(Effect.logError(`[${label}] fire-and-forget failed`, error))),
    ),
    Effect.catchDefect((defect: unknown) =>
      Effect.sync(() => {
        const err = normalizeError(defect);
        captureException(err, { operation: label, boundary: 'fire-and-forget-defect' });
      }).pipe(Effect.andThen(Effect.logError(`[${label}] fire-and-forget defect`, defect))),
    ),
    Effect.asVoid,
  );
}

/**
 * Execute an Effect in a detached background fiber (fire-and-forget).
 * Failures and defects are captured by telemetry and logged; they never crash the caller.
 */
export function runForkBestEffort<E>(
  effect: Effect.Effect<unknown, E, never>,
  label: string,
): Fiber.Fiber<void, never> {
  return Effect.runFork(reportBestEffort(effect, label));
}

/**
 * Bridge an Effect to a Promise, converting typed domain errors AND unhandled defects to APIError at the boundary.
 */
export function runToPromise<T, E extends { message?: string }>(
  effect: Effect.Effect<T, E, never>,
  errorCode?: string,
): Promise<T> {
  return Effect.runPromise(
    effect.pipe(
      Effect.catch((e: E) =>
        Effect.sync(() => {
          captureException(e, { operation: errorCode ?? 'EFFECT_ERROR', boundary: 'effect' });
        }).pipe(
          Effect.andThen(
            Effect.fail(
              Object.assign(
                new APIError(e.message ?? 'Unknown error', errorCode ?? 'EFFECT_ERROR', e, true),
                { cause: e },
              ),
            ),
          ),
        ),
      ),
      Effect.catchDefect((defect: unknown) => {
        const err = normalizeError(defect);
        return Effect.sync(() => {
          captureException(err, { operation: errorCode ?? 'EFFECT_DEFECT', boundary: 'effect-defect' });
        }).pipe(
          Effect.andThen(
            Effect.fail(
              new APIError(err.message || 'Fatal defect encountered', errorCode ?? 'FATAL_DEFECT', err, true),
            ),
          ),
        );
      }),
    ),
  );
}
