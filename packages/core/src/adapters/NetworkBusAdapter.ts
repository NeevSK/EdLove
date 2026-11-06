import { sovereignBus } from '@repo/core/lib/sync/eventBus';
import { networkMonitor } from '@repo/core/platform/drivers/networkMonitor';
import type { NetworkStatus } from '@repo/core/logic/interfaces/network.port';

let unsubscribe: (() => void) | null = null;
let previousStatus: NetworkStatus = 'unknown';

/** Bridges the shared observation into existing online/offline event consumers. */
export function startNetworkBusAdapter(): void {
  if (unsubscribe) return;

  previousStatus = networkMonitor.getSnapshot().status;
  unsubscribe = networkMonitor.subscribe(() => {
    const status = networkMonitor.getSnapshot().status;
    if (status === previousStatus) return;
    previousStatus = status;

    if (status === 'online') {
      sovereignBus.emit('network:online', { timestamp: Date.now() });
    } else if (status === 'offline') {
      sovereignBus.emit('network:offline', { timestamp: Date.now() });
    }
  });
}

export function stopNetworkBusAdapter(): void {
  unsubscribe?.();
  unsubscribe = null;
  previousStatus = 'unknown';
}
