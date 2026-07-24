import { Effect, Fiber, Runtime } from 'effect';
import { useCallback, useEffect, useState } from 'react';

export function useSovereignEffect<A, E>(
  effect: Effect.Effect<A, E, never>,
  deps: React.DependencyList = [],
) {
  const [result, setResult] = useState<{
    status: 'idle' | 'running' | 'success' | 'failure';
    data?: A;
    error?: E;
  }>({ status: 'idle' });

  useEffect(() => {
    setResult({ status: 'running' });

    const program = Effect.gen(function* () {
      const value = yield* effect;
      setResult({ status: 'success', data: value });
    }).pipe(
      Effect.catchAll((error) => {
        setResult({ status: 'failure', error: error as E });
        return Effect.void;
      }),
    );

    const fiber = Runtime.runFork(Runtime.defaultRuntime)(program);

    return () => {
      Effect.runFork(Fiber.interrupt(fiber));
    };
    // biome-ignore lint/correctness/useExhaustiveDependencies: deps is passed as argument
    // eslint-disable-next-line
  }, deps);

  return result;
}

export function useSovereignCallback<Args extends Array<unknown>, A, E>(
  effectFn: (...args: Args) => Effect.Effect<A, E, never>,
) {
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'failure'>('idle');

  const execute = useCallback(
    (...args: Args) => {
      setStatus('running');

      return Runtime.runPromise(Runtime.defaultRuntime)(
        effectFn(...args).pipe(
          Effect.tap(() => Effect.sync(() => setStatus('success'))),
          Effect.catchAll((e) => {
            setStatus('failure');
            return Effect.fail(e);
          }),
        ),
      );
    },
    [effectFn],
  );

  return [execute, status] as const;
}
