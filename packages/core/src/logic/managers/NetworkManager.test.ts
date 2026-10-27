import { afterEach, describe, expect, it, vi } from 'vitest';
import type { INetwork, NetworkSnapshot } from '@repo/core/logic/interfaces/network.port';
import { NetworkManager } from './NetworkManager';

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

describe('NetworkManager', () => {
  afterEach(() => vi.restoreAllMocks());

  it('keeps unknown fail-closed and shares one adapter subscription until the last observer leaves', async () => {
    const manager = new NetworkManager();
    const native = adapter(online);
    expect(manager.getSnapshot().status).toBe('unknown');
    expect(await manager.isConnected()).toBe(false);

    manager.registerAdapter(native.value);
    const first = vi.fn();
    const second = vi.fn();
    const removeFirst = manager.subscribe(first);
    const removeSecond = manager.subscribe(second);
    expect(native.subscribe).toHaveBeenCalledTimes(1);
    expect(native.listenerCount()).toBe(1);

    native.publish({ ...online, status: 'offline' });
    expect(manager.getSnapshot().status).toBe('offline');
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);

    removeFirst();
    expect(native.listenerCount()).toBe(1);
    removeSecond();
    expect(native.listenerCount()).toBe(0);
  });

  it('releases the previous adapter before subscribing to its replacement', () => {
    const manager = new NetworkManager();
    const firstAdapter = adapter(online);
    const nextAdapter = adapter({ status: 'unknown', source: 'native-netinfo', connection: null });
    const remove = manager.subscribe(vi.fn());

    manager.registerAdapter(firstAdapter.value);
    expect(firstAdapter.listenerCount()).toBe(1);
    manager.registerAdapter(nextAdapter.value);

    expect(firstAdapter.listenerCount()).toBe(0);
    expect(nextAdapter.listenerCount()).toBe(1);
    expect(manager.getSnapshot().status).toBe('unknown');
    remove();
    expect(nextAdapter.listenerCount()).toBe(0);
  });
});
