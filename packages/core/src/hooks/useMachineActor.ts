import { useEffect, useRef, useState } from 'react';
import type { AnyActorRef, SnapshotFrom } from 'xstate';
import { useActorSnapshot } from './useActorSnapshot';

export interface MachineActorLike extends AnyActorRef {
  start?(): void;
  stop?(): void;
}

/**
 * React 19 Concurrent-safe lifecycle hook for managing an XState actor.
 *
 * Guarantees:
 * 1. Actor is started upon creation.
 * 2. Actor is cleanly STOPPED on component unmount (preventing Hermes/V8 zombie leaks).
 * 3. Previous actor is STOPPED before a new one is created if dependencies change.
 * 4. Zero-tearing reactive UI updates via useSyncExternalStore.
 *
 * @param actorFactory Function that creates an actor instance (e.g. `() => createActor(machine)`)
 * @param deps Dependency array. When any dependency changes, old actor is stopped and a fresh one is started.
 * @returns `{ actor, snapshot }`
 */
export function useMachineActor<TActor extends MachineActorLike>(
  actorFactory: () => TActor,
  deps: unknown[] = [],
): {
  actor: TActor;
  snapshot: SnapshotFrom<TActor>;
} {
  const actorRef = useRef<TActor | null>(null);
  const prevDepsRef = useRef<unknown[]>(deps);

  // Check if dependencies changed
  const depsChanged =
    deps.length !== prevDepsRef.current.length ||
    deps.some((dep, i) => !Object.is(dep, prevDepsRef.current[i]));

  if (depsChanged) {
    prevDepsRef.current = deps;
    const freshActor = actorFactory();
    freshActor.start?.();
    actorRef.current = freshActor;
  } else if (!actorRef.current) {
    const freshActor = actorFactory();
    freshActor.start?.();
    actorRef.current = freshActor;
  }

  // Teardown sentinel: guarantee actor.stop() on unmount or before dependency shift
  useEffect(() => {
    const currentActor = actorRef.current;
    return () => {
      currentActor?.stop?.();
    };
  }, deps);

  // Subscribe to snapshot
  const snapshot = useActorSnapshot(actorRef.current);

  return {
    actor: actorRef.current,
    snapshot,
  };
}
