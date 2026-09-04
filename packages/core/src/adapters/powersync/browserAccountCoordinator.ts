const CHANNEL_NAME = 'gurudevi-powersync-account';

export type BrowserAccountSignal = {
  accountId: string | null;
  senderId: string;
  changedAt: number;
};

const makeSenderId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

/** Coordinates the single active PowerSync account across browser tabs. */
export class BrowserPowerSyncAccountCoordinator {
  private readonly senderId = makeSenderId();
  private readonly channel =
    typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null;

  announce(accountId: string | null): void {
    const signal: BrowserAccountSignal = {
      accountId,
      senderId: this.senderId,
      changedAt: Date.now(),
    };
    this.channel?.postMessage(signal);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`${CHANNEL_NAME}:signal`, JSON.stringify(signal));
      } catch {
        // BroadcastChannel remains sufficient when storage is unavailable.
      }
    }
  }

  subscribe(onSignal: (signal: BrowserAccountSignal) => void): () => void {
    const onMessage = (event: MessageEvent<BrowserAccountSignal>) => {
      if (event.data?.senderId !== this.senderId) onSignal(event.data);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== `${CHANNEL_NAME}:signal` || !event.newValue) return;
      try {
        const signal = JSON.parse(event.newValue) as BrowserAccountSignal;
        if (signal.senderId !== this.senderId) onSignal(signal);
      } catch {
        // Ignore malformed storage events from unrelated code.
      }
    };

    this.channel?.addEventListener('message', onMessage);
    if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);
    return () => {
      this.channel?.removeEventListener('message', onMessage);
      if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
    };
  }

  dispose(): void {
    this.channel?.close();
  }
}
