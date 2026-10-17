import { SafeZustandStorage } from '@repo/core/lib/storageWrapper';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useConflictStore } from '@repo/core/store/useConflictStore';
import { useStore } from '@repo/core/store/useStore';
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
  const setOnline = (isOnline: boolean) => {
    useAuthStore.setState({ isOnline });
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
      authSession: null,
      authSessionResolved: true,
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
      authSession: { access_token: 'valid_token' } as any,
      authSessionResolved: true,
    });
  };

  const setViewDate = (date: string) => {
    useTemporalStore.setState({ viewDate: date });
  };

  const resetAll = async () => {
    useMutationQueue.getState().clearQueue();
    useMutationQueue.getState().clearDeadLetterQueue();
    useConflictStore.setState({ activeConflicts: [] });
    useAuthStore.setState({ isOnline: true });
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
