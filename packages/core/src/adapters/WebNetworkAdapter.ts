import type {
  INetwork,
  NetworkConnectionMetadata,
  NetworkSnapshot,
} from '@repo/core/logic/interfaces/network.port';

interface BrowserConnection extends EventTarget {
  readonly type?: string;
  readonly effectiveType?: string;
  readonly rtt?: number;
  readonly downlink?: number;
  readonly saveData?: boolean;
}

type NetworkNavigator = Navigator & { readonly connection?: BrowserConnection };

const INITIAL_SNAPSHOT: NetworkSnapshot = Object.freeze({
  status: 'unknown',
  source: 'browser-navigator',
  connection: null,
});

/** navigator.onLine is a browser hint, not proof that the server is reachable. */
export class WebNetworkAdapter implements INetwork {
  private snapshot: NetworkSnapshot = INITIAL_SNAPSHOT;
  private readonly listeners = new Set<() => void>();
  private listening = false;
  private connection: BrowserConnection | undefined;

  getSnapshot(): NetworkSnapshot {
    return this.snapshot;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    if (this.listeners.size === 1) this.startListening();
    listener();

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) this.stopListening();
    };
  }

  private readonly handleOnline = () => this.publish('online');
  private readonly handleOffline = () => this.publish('offline');
  private readonly handleConnection = () => this.publish(this.browserStatus());

  private browserStatus(): NetworkSnapshot['status'] {
    if (typeof navigator === 'undefined' || typeof navigator.onLine !== 'boolean') return 'unknown';
    return navigator.onLine ? 'online' : 'offline';
  }

  private startListening(): void {
    if (typeof window === 'undefined') return;
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    this.connection =
      typeof navigator === 'undefined' ? undefined : (navigator as NetworkNavigator).connection;
    this.connection?.addEventListener('change', this.handleConnection);
    this.listening = true;
    this.publish(this.browserStatus());
  }

  private stopListening(): void {
    if (!this.listening || typeof window === 'undefined') return;
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    this.connection?.removeEventListener('change', this.handleConnection);
    this.connection = undefined;
    this.listening = false;
  }

  private publish(status: NetworkSnapshot['status']): void {
    const previous = this.snapshot;
    const estimate = this.connection;
    const connection: NetworkConnectionMetadata | null = estimate
      ? {
          type: estimate.type ?? null,
          isMetered: null,
          cellularGeneration: null,
          effectiveType: estimate.effectiveType ?? null,
          rttMs:
            typeof estimate.rtt === 'number' && Number.isFinite(estimate.rtt) && estimate.rtt >= 0
              ? estimate.rtt
              : null,
          downKbps:
            typeof estimate.downlink === 'number' &&
            Number.isFinite(estimate.downlink) &&
            estimate.downlink >= 0
              ? Math.round(estimate.downlink * 1000)
              : null,
          dataSaver: estimate.saveData ?? null,
        }
      : null;
    if (
      status === previous.status &&
      connection?.type === previous.connection?.type &&
      connection?.effectiveType === previous.connection?.effectiveType &&
      connection?.rttMs === previous.connection?.rttMs &&
      connection?.downKbps === previous.connection?.downKbps &&
      connection?.dataSaver === previous.connection?.dataSaver
    )
      return;
    this.snapshot = {
      status,
      source: 'browser-navigator',
      connection,
    };
    for (const listener of this.listeners) listener();
  }
}
