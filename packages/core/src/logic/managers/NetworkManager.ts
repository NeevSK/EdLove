import type { INetwork, NetworkSnapshot } from '@repo/core/logic/interfaces/network.port';

const UNKNOWN_SNAPSHOT: NetworkSnapshot = Object.freeze({
  status: 'unknown',
  source: 'none',
  connection: null,
});

/** Owns the single platform observation and publishes a stable external-store snapshot. */
export class NetworkManager implements INetwork {
  private adapter: INetwork | null = null;
  private adapterUnsubscribe: (() => void) | null = null;
  private snapshot: NetworkSnapshot = UNKNOWN_SNAPSHOT;
  private readonly listeners = new Set<() => void>();

  registerAdapter(adapter: INetwork): void {
    this.adapterUnsubscribe?.();
    this.adapterUnsubscribe = null;
    this.adapter = adapter;
    this.snapshot = adapter.getSnapshot();
    if (this.listeners.size > 0) this.subscribeToAdapter();
    this.notifyListeners();
  }

  getSnapshot = (): NetworkSnapshot => {
    return this.snapshot;
  };

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    if (this.listeners.size === 1) this.subscribeToAdapter();

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.adapterUnsubscribe?.();
        this.adapterUnsubscribe = null;
      }
    };
  }

  /** Unknown is not permission to attempt a network-only operation. */
  async isConnected(): Promise<boolean> {
    return this.snapshot.status === 'online';
  }

  private subscribeToAdapter(): void {
    if (!this.adapter || this.adapterUnsubscribe) return;
    const adapter = this.adapter;
    const unsubscribe = adapter.subscribe(() => {
      if (this.adapter !== adapter) return;
      const next = adapter.getSnapshot();
      if (next === this.snapshot) return;
      this.snapshot = next;
      this.notifyListeners();
    });
    if (this.adapter !== adapter || this.listeners.size === 0) {
      unsubscribe();
      return;
    }
    this.adapterUnsubscribe = unsubscribe;
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) listener();
  }
}

export const networkManager = new NetworkManager();
