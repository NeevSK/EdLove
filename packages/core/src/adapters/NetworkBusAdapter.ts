import { sovereignBus } from '@repo/core/lib/sync/eventBus';
import { networkManager } from '@repo/core/logic/managers/NetworkManager';
import type { NetworkStatus } from '@repo/core/logic/interfaces/network.port';

let unsubscribe: (() => void) | null = null;
let previousStatus: NetworkStatus = 'unknown';

/** Bridges the shared observation into existing online/offline event consumers. */
export function startNetworkBusAdapter(): void {
  if (unsubscribe) return;

  previousStatus = networkManager.getSnapshot().status;
  unsubscribe = networkManager.subscribe(() => {
    const status = networkManager.getSnapshot().status;
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
