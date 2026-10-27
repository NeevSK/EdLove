import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const netInfoMock = vi.hoisted(() => ({ addEventListener: vi.fn() }));
vi.mock('@react-native-community/netinfo', () => ({ default: netInfoMock }));

import type { NetInfoState } from '@react-native-community/netinfo';
import { stopNetworkBusAdapter, startNetworkBusAdapter } from '@repo/core/adapters/NetworkBusAdapter';
import { NativeNetworkAdapter } from '@repo/core/adapters/native/NativeNetworkAdapter';
import { WebNetworkAdapter } from '@repo/core/adapters/WebNetworkAdapter';
import { sovereignBus } from '@repo/core/lib/sync/eventBus';
import { networkManager } from '@repo/core/logic/managers/NetworkManager';
import type { INetwork, NetworkSnapshot } from '@repo/core/logic/interfaces/network.port';

function netInfoState(
  isConnected: boolean | null,
  isInternetReachable: boolean | null,
): NetInfoState {
  return {
    type: 'wifi',
    isConnected,
    isInternetReachable,
    details: { isConnectionExpensive: false, ipAddress: '192.168.0.2', subnet: '192.168.0.0' },
  } as NetInfoState;
}

describe('network adapters', () => {
  let publishNative: ((state: NetInfoState) => void) | undefined;
  let removeNative: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    stopNetworkBusAdapter();
    removeNative = vi.fn();
    netInfoMock.addEventListener.mockImplementation((listener: (state: NetInfoState) => void) => {
      publishNative = listener;
      listener(netInfoState(null, null));
      return removeNative;
    });
  });

  afterEach(() => {
    stopNetworkBusAdapter();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('keeps native reachability unknown until both connectivity facts are confirmed and releases NetInfo', () => {
    const adapter = new NativeNetworkAdapter();
    const listener = vi.fn();
    const remove = adapter.subscribe(listener);
    expect(adapter.getSnapshot().status).toBe('unknown');
    expect(netInfoMock.addEventListener).toHaveBeenCalledTimes(1);

    publishNative?.(netInfoState(true, true));
    expect(adapter.getSnapshot()).toMatchObject({ status: 'online', source: 'native-netinfo' });
    publishNative?.(netInfoState(false, null));
    expect(adapter.getSnapshot().status).toBe('offline');

    remove();
    expect(removeNative).toHaveBeenCalledTimes(1);
  });

  it('reports the browser online event as a navigator hint and releases browser listeners', () => {
    const handlers = new Map<string, Set<() => void>>();
    const addEventListener = vi.fn((event: string, listener: () => void) => {
      const registered = handlers.get(event) ?? new Set<() => void>();
      registered.add(listener);
      handlers.set(event, registered);
    });
    const removeEventListener = vi.fn((event: string, listener: () => void) => {
      handlers.get(event)?.delete(listener);
    });
    vi.stubGlobal('window', { addEventListener, removeEventListener });
    vi.stubGlobal('navigator', { onLine: true });

    const adapter = new WebNetworkAdapter();
    const remove = adapter.subscribe(vi.fn());
    expect(adapter.getSnapshot()).toMatchObject({ status: 'online', source: 'browser-navigator' });

    for (const listener of handlers.get('offline') ?? []) listener();
    expect(adapter.getSnapshot().status).toBe('offline');
    remove();
    expect(removeEventListener).toHaveBeenCalledTimes(2);
    expect(handlers.get('online')?.size).toBe(0);
    expect(handlers.get('offline')?.size).toBe(0);
  });

  it('bridges confirmed transitions to existing bus consumers and stops cleanly', () => {
    let snapshot: NetworkSnapshot = { status: 'unknown', source: 'none', connection: null };
    const listeners = new Set<() => void>();
    const adapter: INetwork = {
      getSnapshot: () => snapshot,
      subscribe: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    };
    networkManager.registerAdapter(adapter);

    const onlineEvent = vi.fn();
    const offlineEvent = vi.fn();
    const removeOnline = sovereignBus.on('network:online', onlineEvent);
    const removeOffline = sovereignBus.on('network:offline', offlineEvent);
    startNetworkBusAdapter();
    startNetworkBusAdapter();
    snapshot = { status: 'online', source: 'native-netinfo', connection: null };
    for (const listener of listeners) listener();
    expect(onlineEvent).toHaveBeenCalledTimes(1);
    expect(offlineEvent).not.toHaveBeenCalled();

    stopNetworkBusAdapter();
    snapshot = { status: 'offline', source: 'native-netinfo', connection: null };
    for (const listener of listeners) listener();
    expect(offlineEvent).not.toHaveBeenCalled();

    removeOnline();
    removeOffline();
  });
});
