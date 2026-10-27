import { stopNetworkBusAdapter } from '@repo/core/adapters/NetworkBusAdapter';
import type { NetworkSnapshot } from '@repo/core/logic/interfaces/network.port';
import { networkManager } from '@repo/core/logic/managers/NetworkManager';
import { useOfflineStatus } from '@repo/core/offline/useOfflineStatus';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('mounted connectivity observer', () => {
  it('observes unknown, online and offline through one shared platform subscription', () => {
    let snapshot: NetworkSnapshot = {
      status: 'unknown',
      source: 'native-netinfo',
      connection: null,
    };
    const listeners = new Set<() => void>();
    networkManager.registerAdapter({
      getSnapshot: () => snapshot,
      subscribe: (listener) => {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
    });
    const view = renderHook(() => useOfflineStatus());
    expect(view.result.current.status).toBe('unknown');
    expect(view.result.current.isOnline).toBe(false);
    expect(view.result.current.isOffline).toBe(false);
    expect(listeners.size).toBe(1);
    act(() => {
      snapshot = { ...snapshot, status: 'online' };
      for (const listener of listeners) listener();
    });
    expect(view.result.current.isOnline).toBe(true);
    act(() => {
      snapshot = { ...snapshot, status: 'offline' };
      for (const listener of listeners) listener();
    });
    expect(view.result.current.isOffline).toBe(true);
    view.unmount();
    stopNetworkBusAdapter();
    expect(listeners.size).toBe(0);
  });
});
