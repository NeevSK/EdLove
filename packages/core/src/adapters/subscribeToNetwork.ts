import { networkManager } from '@repo/core/logic/managers/NetworkManager';
import { startNetworkBusAdapter } from './NetworkBusAdapter';
import { WebNetworkAdapter } from './WebNetworkAdapter';

/** Shares browser setup between React readers and imperative runtime consumers. */
export function subscribeToNetwork(listener: () => void): () => void {
  if (typeof document !== 'undefined') {
    if (networkManager.getSnapshot().source === 'none') {
      networkManager.registerAdapter(new WebNetworkAdapter());
    }
    startNetworkBusAdapter();
  }
  return networkManager.subscribe(listener);
}
