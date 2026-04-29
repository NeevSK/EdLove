import { Effect, Runtime, Fiber } from "effect";
import { useEffect, useState, useCallback } from "react";

/**
 * Hook to run an Effect-TS effect within a React lifecycle.
 * Automatically handles cancellation (interruption) on unmount.
 */
export function useSovereignEffect<A, E, R>(
  effect: Effect.Effect<A, E, R>,
  deps: React.DependencyList = []
) {
  const [result, setResult] = useState<{
    status: 'idle' | 'running' | 'success' | 'failure';
    data?: A;
    error?: E;
  }>({ status: 'idle' });

  useEffect(() => {
    setResult({ status: 'running' });

    // 1. Create a fiber to track the execution
    const program = Effect.gen(function* (_) {
      const value = yield* _(effect);
      setResult({ status: 'success', data: value });
    }).pipe(
      Effect.catchAll((error) => {
        setResult({ status: 'failure', error: error as E });
        return Effect.void;
      })
    );

    const runtime = Runtime.defaultRuntime as Runtime.Runtime<R>;
    const fiber = Runtime.runFork(runtime)(program);

    // 2. Cleanup: Interrupt the fiber if the component unmounts
    return () => {
      Effect.runFork(Fiber.interrupt(fiber));
    };
  }, deps);

  return result;
}

/**
 * Hook to get a callback that runs an Effect.
 * Useful for event handlers (e.g., button clicks).
 */
export function useSovereignCallback<Args extends Array<unknown>, A, E, R>(
  effectFn: (...args: Args) => Effect.Effect<A, E, R>
) {
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'failure'>('idle');

  const execute = useCallback((...args: Args) => {
    setStatus('running');
    
    return Runtime.runPromise(Runtime.defaultRuntime as Runtime.Runtime<R>)(
      effectFn(...args).pipe(
        Effect.tap(() => Effect.sync(() => setStatus('success'))),
        Effect.catchAll((e) => {
          setStatus('failure');
          return Effect.fail(e);
        })
      )
    );
  }, [effectFn]);

  return [execute, status] as const;
}
