import type { INetwork } from '../interfaces/network.port';

/**
 * NetworkManager - Sovereign Dispatcher for Connectivity.
 *
 * Part of the "Hat 04 - Data Reliability" domain.
 */
class NetworkManager implements INetwork {
  private adapter: INetwork | null = null;

  registerAdapter(adapter: INetwork) {
    this.adapter = adapter;
  }

  private getAdapter(): INetwork {
    if (!this.adapter) {
      // In production, we assume connected if no adapter is registered (optimistic)
      // but warn in dev.
      if (__DEV__) {
        console.warn('[NetworkManager] No adapter registered. Defaulting to isConnected=true.');
      }
      return { isConnected: async () => true };
    }
    return this.adapter;
  }

  async isConnected(): Promise<boolean> {
    return this.getAdapter().isConnected();
  }
}

export const networkManager = new NetworkManager();
