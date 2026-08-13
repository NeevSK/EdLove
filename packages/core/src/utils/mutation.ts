import * as Data from 'effect/Data';
import * as Duration from 'effect/Duration';
import * as Effect from 'effect/Effect';
import * as Schedule from 'effect/Schedule';

export class OfflineMutationError extends Data.TaggedError('OfflineMutationError')<{}> {}

/** Canonical Effect workflow for online/offline mutation execution. */
export function executeMutation$<T>(options: {
  readonly isConnected: () => Promise<boolean>;
  readonly mutation: () => Promise<T>;
  readonly retryCount?: number;
}): Effect.Effect<T, Error | OfflineMutationError, never> {
  return Effect.tryPromise({
    try: options.isConnected,
    catch: (cause) => (cause instanceof Error ? cause : new Error(String(cause))),
  }).pipe(
    Effect.filterOrFail(
      (connected) => connected,
      () => new OfflineMutationError(),
    ),
    Effect.flatMap(() =>
      Effect.tryPromise({
        try: options.mutation,
        catch: (cause) => (cause instanceof Error ? cause : new Error(String(cause))),
      }),
    ),
    Effect.retry({
      schedule: Schedule.exponential(Duration.seconds(1)),
      times: options.retryCount ?? 3,
      while: (error) => !(error instanceof OfflineMutationError),
    }),
  );
}
