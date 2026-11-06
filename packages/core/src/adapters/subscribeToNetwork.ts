import { networkMonitor } from '@repo/core/platform/drivers/networkMonitor';
import { startNetworkBusAdapter } from './NetworkBusAdapter';
import { WebNetworkAdapter } from './WebNetworkAdapter';

/** Shares browser setup between React readers and imperative runtime consumers. */
export function subscribeToNetwork(listener: () => void): () => void {
  if (typeof document !== 'undefined') {
    if (networkMonitor.getSnapshot().source === 'none') {
      networkMonitor.registerAdapter(new WebNetworkAdapter());
    }
    startNetworkBusAdapter();
  }
  return networkMonitor.subscribe(listener);
}
