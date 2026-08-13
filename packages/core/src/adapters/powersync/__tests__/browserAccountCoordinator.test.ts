import { afterEach, describe, expect, it, vi } from 'vitest';
import { BrowserPowerSyncAccountCoordinator } from '../browserAccountCoordinator';

class FakeBroadcastChannel {
  static instances: FakeBroadcastChannel[] = [];
  private listeners = new Set<(event: MessageEvent) => void>();

  constructor() {
    FakeBroadcastChannel.instances.push(this);
  }

  addEventListener(_type: string, listener: (event: MessageEvent) => void) {
    this.listeners.add(listener);
  }

  removeEventListener(_type: string, listener: (event: MessageEvent) => void) {
    this.listeners.delete(listener);
  }

  postMessage(data: unknown) {
    for (const channel of FakeBroadcastChannel.instances) {
      for (const listener of channel.listeners) listener({ data } as MessageEvent);
    }
  }

  close() {}
}

describe('browser PowerSync account coordination', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    FakeBroadcastChannel.instances = [];
  });

  it('notifies another tab when the active account changes', () => {
    vi.stubGlobal('BroadcastChannel', FakeBroadcastChannel);
    const first = new BrowserPowerSyncAccountCoordinator();
    const second = new BrowserPowerSyncAccountCoordinator();
    const received = vi.fn();
    const unsubscribe = second.subscribe(received);

    first.announce('account-a');
    expect(received).toHaveBeenCalledWith(expect.objectContaining({ accountId: 'account-a' }));

    unsubscribe();
    first.dispose();
    second.dispose();
  });

  it('does not notify the sender of its own account signal', () => {
    vi.stubGlobal('BroadcastChannel', FakeBroadcastChannel);
    const coordinator = new BrowserPowerSyncAccountCoordinator();
    const received = vi.fn();
    const unsubscribe = coordinator.subscribe(received);

    coordinator.announce('account-a');
    expect(received).not.toHaveBeenCalled();

    unsubscribe();
    coordinator.dispose();
  });
});
