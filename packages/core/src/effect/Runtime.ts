import * as Effect from 'effect/Effect';
import * as Fiber from 'effect/Fiber';
import * as Layer from 'effect/Layer';
import { captureException } from '@repo/core/monitoring';
import { APIError } from '@repo/core/types/API';

/**
 * Runtime execution boundary for @repo/core.
 *
 * Provides safe runners and managed runtime primitives that comply with
 * both Effect v3 and the Effect v4 owned-runtime model.
 *
 * Rules:
 * 1. Never call Effect.runSync at module evaluation time.
 * 2. All async side-effects crossing to React/Zustand must exit through runPromise or runFork.
 */

/**
 * Normalize an unknown error into an Error instance.
 */
export function normalizeError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

/**
 * Report best-effort background effects with error capture.
 */
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
 * Execute an Effect in a detached background fiber (fire-and-forget).
 * Failures are captured by Sentry/telemetry and logged; they never crash the caller.
 */
export function runForkBestEffort<E>(
  effect: Effect.Effect<unknown, E, never>,
  label: string,
): Fiber.RuntimeFiber<void, never> {
  return Effect.runFork(reportBestEffort(effect, label));
}

/**
 * Bridge an Effect to a Promise, converting tagged domain errors to APIError at the boundary.
 */
export function runToPromise<T, E extends { message?: string }>(
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
            Effect.fail(new APIError(e.message ?? 'Unknown error', errorCode ?? 'EFFECT_ERROR', e, true)),
          ),
        ),
      ),
    ),
  );
}
