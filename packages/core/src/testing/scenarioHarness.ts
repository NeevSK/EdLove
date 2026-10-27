import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import type { INetwork, NetworkSnapshot } from '@repo/core/logic/interfaces/network.port';
import { networkManager } from '@repo/core/logic/managers/NetworkManager';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useConflictStore } from '@repo/core/store/useConflictStore';
import { useTemporalStore } from '@repo/core/store/useTemporalStore';
import { vi } from 'vitest';

export interface ScenarioTestHarness {
  setOnline: (isOnline: boolean) => void;
  setGuestUser: () => void;
  setAuthenticatedUser: (userId?: string) => void;
  setViewDate: (date: string) => void;
  resetAll: () => Promise<void>;
}

export function createScenarioTestContext(): ScenarioTestHarness {
  let networkSnapshot: NetworkSnapshot = {
    status: 'online',
    source: 'native-netinfo',
    connection: null,
  };
  const networkListeners = new Set<() => void>();
  const scenarioNetwork: INetwork = {
    getSnapshot: () => networkSnapshot,
    subscribe: (listener) => {
      networkListeners.add(listener);
      return () => networkListeners.delete(listener);
    },
  };
  networkManager.registerAdapter(scenarioNetwork);

  const setOnline = (isOnline: boolean) => {
    const status = isOnline ? 'online' : 'offline';
    if (networkSnapshot.status === status) return;
    networkSnapshot = { ...networkSnapshot, status };
    for (const listener of networkListeners) listener();
  };

  const setGuestUser = () => {
    useAuthStore.setState({
      user: {
        id: 'guest',
        email: null,
        is_anonymous: true,
        user_metadata: { display_name: 'Guest Explorer' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: '2026-01-01T00:00:00.000Z',
      } as any,
    });
  };

  const setAuthenticatedUser = (userId = 'user_scenario_123') => {
    useAuthStore.setState({
      user: {
        id: userId,
        email: 'user@example.com',
        is_anonymous: false,
        user_metadata: { display_name: 'Authenticated User' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: '2026-01-01T00:00:00.000Z',
      } as any,
    });
  };

  const setViewDate = (date: string) => {
    useTemporalStore.setState({ viewDate: date });
  };

  const resetAll = async () => {
    useMutationQueue.getState().clearQueue();
    useMutationQueue.getState().clearDeadLetterQueue();
    useConflictStore.setState({ activeConflicts: [] });
    setOnline(true);
    useTemporalStore.setState({ viewDate: '2026-09-07' });
    vi.restoreAllMocks();
  };

  return {
    setOnline,
    setGuestUser,
    setAuthenticatedUser,
    setViewDate,
    resetAll,
  };
}
