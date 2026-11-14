import { afterEach, describe, expect, it, vi } from 'vitest';
import type { INetwork, NetworkSnapshot } from '@repo/core/logic/interfaces/network.port';
import { NetworkMonitor } from './networkMonitor';

function adapter(initial: NetworkSnapshot) {
  let snapshot = initial;
  const listeners = new Set<() => void>();
  const subscribe = vi.fn((listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  });
  return {
    value: {
      getSnapshot: () => snapshot,
      subscribe,
    } satisfies INetwork,
    publish(next: NetworkSnapshot) {
      snapshot = next;
      for (const listener of listeners) listener();
    },
    subscribe,
    listenerCount: () => listeners.size,
  };
}

const online: NetworkSnapshot = {
  status: 'online',
  source: 'native-netinfo',
  connection: null,
};

describe('NetworkMonitor', () => {
  afterEach(() => vi.restoreAllMocks());

  it('keeps unknown fail-closed and shares one adapter subscription until the last observer leaves', async () => {
    const monitor = new NetworkMonitor();
    const native = adapter(online);
    expect(monitor.getSnapshot().status).toBe('unknown');
    expect(await monitor.isConnected()).toBe(false);

    monitor.registerAdapter(native.value);
    const first = vi.fn();
    const second = vi.fn();
    const removeFirst = monitor.subscribe(first);
    const removeSecond = monitor.subscribe(second);
    expect(native.subscribe).toHaveBeenCalledTimes(1);
    expect(native.listenerCount()).toBe(1);

    native.publish({ ...online, status: 'offline' });
    expect(monitor.getSnapshot().status).toBe('offline');
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);

    removeFirst();
    expect(native.listenerCount()).toBe(1);
    removeSecond();
    expect(native.listenerCount()).toBe(0);
  });

  it('releases the previous adapter before subscribing to its replacement', () => {
    const monitor = new NetworkMonitor();
    const firstAdapter = adapter(online);
    const nextAdapter = adapter({ status: 'unknown', source: 'native-netinfo', connection: null });
    const remove = monitor.subscribe(vi.fn());

    monitor.registerAdapter(firstAdapter.value);
    expect(firstAdapter.listenerCount()).toBe(1);
    monitor.registerAdapter(nextAdapter.value);

    expect(firstAdapter.listenerCount()).toBe(0);
    expect(nextAdapter.listenerCount()).toBe(1);
    expect(monitor.getSnapshot().status).toBe('unknown');
    remove();
    expect(nextAdapter.listenerCount()).toBe(0);
  });
});
