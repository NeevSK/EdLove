import { subscribeToNetwork } from '@repo/core/adapters/subscribeToNetwork';
import type { NetworkSnapshot } from '@repo/core/logic/interfaces/network.port';
import { networkMonitor } from '@repo/core/platform/drivers/networkMonitor';

/** The platform's network observation, for hooks (useSyncExternalStore) and mutation guards. */
export const network = {
  /** A stable reference, as useSyncExternalStore requires. */
  getSnapshot: networkMonitor.getSnapshot as () => NetworkSnapshot,
  subscribe: (listener: () => void): (() => void) => subscribeToNetwork(listener),
  isConnected: (): Promise<boolean> => networkMonitor.isConnected(),
};
