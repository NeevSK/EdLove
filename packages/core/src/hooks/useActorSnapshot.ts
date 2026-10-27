import { useCallback, useSyncExternalStore } from 'react';
import type { AnyActorRef, SnapshotFrom } from 'xstate';

/**
 * React 19 Concurrent-safe hook to subscribe to any XState actor snapshot.
 * Uses native React `useSyncExternalStore` for zero-tearing UI updates.
 *
 * @param actor - Any running XState actor reference (v6 compatible)
 * @returns The current snapshot of the actor
 */
export function useActorSnapshot<TActor extends AnyActorRef>(
  actor: TActor,
): SnapshotFrom<TActor> {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const sub = actor.subscribe({
        next: () => onStoreChange(),
        error: () => onStoreChange(),
        complete: () => onStoreChange(),
      });
      return () => {
        sub.unsubscribe();
      };
    },
    [actor],
  );

  const getSnapshot = useCallback(() => {
    return actor.getSnapshot() as SnapshotFrom<TActor>;
  }, [actor]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
