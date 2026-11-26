import { eventBus } from '@repo/core/effect/bindings/state';
import { useMutationQueue } from '@repo/core/lib/sync/mutationQueue.store';
import { useSyncStatusStore } from '@repo/core/store/useSyncStatusStore';

let holders = 0;
let unbind: (() => void) | undefined;

function bind(now: () => number): () => void {
  const { dispatch } = useSyncStatusStore.getState();
  const queue = () => {
    const { queue: items, isSyncing } = useMutationQueue.getState();
    dispatch({ type: 'outboxQueue', pendingCount: items.length, isSyncing });
  };
  queue();
  const stops = [
    useMutationQueue.subscribe(queue),
    eventBus.on('sync:started', ({ queueLength }) =>
      dispatch({ type: 'outboxStarted', queueLength }),
    ),
    eventBus.on('sync:completed', ({ processedCount, failedCount }) =>
      dispatch({
        type: 'outboxCompleted',
        processed: processedCount,
        failed: failedCount,
        at: now(),
      }),
    ),
    eventBus.on('sync:failed', ({ error }) => dispatch({ type: 'outboxFailed', error })),
    eventBus.on('conflict:detected', () => dispatch({ type: 'conflictDetected' })),
    eventBus.on('conflict:resolved', () => dispatch({ type: 'conflictResolved' })),
    eventBus.on('network:online', () => dispatch({ type: 'online' })),
    eventBus.on('network:offline', () => dispatch({ type: 'offline' })),
    eventBus.on('powersync:status', (status) =>
      dispatch({ type: 'remote', ...status, hasSynced: Boolean(status.hasSynced), at: now() }),
    ),
    eventBus.on('powersync:first_sync_complete', () =>
      dispatch({ type: 'remoteFirstSync', at: now() }),
    ),
    eventBus.on('powersync:unavailable', () => dispatch({ type: 'remoteUnavailable' })),
  ];
  return () => {
    for (const stop of stops) stop();
  };
}

/**
 * Keeps the sync status store fed while anything shows it. Shared: the first holder subscribes to
 * the bus and the outbox, the last one to let go unsubscribes, so two indicators never count an
 * event twice. Returns the release.
 */
export function retainSyncStatus(now: () => number = Date.now): () => void {
  holders += 1;
  unbind ??= bind(now);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    holders -= 1;
    if (holders === 0) {
      unbind?.();
      unbind = undefined;
    }
  };
}
