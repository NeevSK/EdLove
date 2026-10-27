import type { AuthChangeEvent, AuthSession } from '@repo/core/logic/ports/auth.port';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({
  listener: null as ((event: AuthChangeEvent, session: AuthSession | null) => Promise<void>) | null,
  wake: null as ((state: string) => void) | null,
  getAuthSession: vi.fn(),
  resolveAuthProfile: vi.fn(),
  unsubscribe: vi.fn(),
  remove: vi.fn(),
  retainRefreshedSession: vi.fn(),
  setUser: vi.fn(),
  setDemoMode: vi.fn(),
  records: new Map<string, string | number>(),
}));
vi.mock('@repo/core/accounts/authenticatedAccountCapture', () => ({
  captureAuthenticatedDeviceAccount: vi.fn(),
  getVerifiedDeviceAccountProfile: vi.fn(),
}));
vi.mock('@repo/core/accounts/deviceAccounts', () => ({
  deviceAccounts: { list: async () => [], retainRefreshedSession: fixture.retainRefreshedSession },
}));
vi.mock('@repo/core/adapters/powersync/database', () => ({ disconnectPowerSync: vi.fn() }));
vi.mock('@repo/core/api/auth', () => ({
  authAPI: {
    getAuthSession: fixture.getAuthSession,
    onAuthStateChange: (listener: typeof fixture.listener) => {
      fixture.listener = listener;
      return { data: { subscription: { unsubscribe: fixture.unsubscribe } } };
    },
    signOut: vi.fn(),
  },
}));
vi.mock('@repo/core/api/highways', () => ({ assertHighway: vi.fn() }));
vi.mock('@repo/core/api/identity', () => ({ identityAPI: {} }));
vi.mock('@repo/core/api/school', () => ({ schoolAPI: {} }));
vi.mock('@repo/core/lib/accountScope', () => ({ getActiveAccountId: () => null }));
vi.mock('@repo/core/lib/sync/replayAdmission', () => ({ openReplayAdmission: vi.fn() }));
vi.mock('@repo/core/logic/auth/profileResolution', () => ({
  resolveAuthProfile: fixture.resolveAuthProfile,
}));
vi.mock('@repo/core/logic/managers/factory', () => ({
  realtime: {
    subscribe: () => ({ unsubscribe: async () => undefined }),
  },
}));
vi.mock('@repo/core/monitoring', () => ({
  initSentry: vi.fn(),
  identifyAuthSubject: vi.fn(),
  clearAuthSubject: vi.fn(),
}));
vi.mock('@repo/core/store/scopeSession', () => ({
  useScopeSessionStore: { getState: () => ({ snapshot: null }) },
}));
vi.mock('@repo/core/store/scopeSessionCoordinator', () => ({
  clearScopeSessionCompatibility: vi.fn(),
  commitIdentityScopeSession: vi.fn(),
}));
vi.mock('@repo/core/store/useAuthStore', () => {
  const state = {
    user: null,
    setUser: fixture.setUser,
    setDemoMode: fixture.setDemoMode,
  };
  return {
    useAuthStore: Object.assign(<T,>(select: (current: typeof state) => T) => select(state), {
      getState: () => state,
    }),
  };
});
vi.mock('@repo/core/lib/experienceState', () => ({
  useExperienceState: <T,>(select: (state: { setDemoMode: typeof fixture.setDemoMode }) => T) =>
    select({ setDemoMode: fixture.setDemoMode }),
}));
vi.mock('@repo/core/native/storage', () => ({
  storage: {
    getString: (key: string) => fixture.records.get(key),
    getNumber: (key: string) => fixture.records.get(key),
    set: (key: string, value: string | number) => fixture.records.set(key, value),
  },
}));
vi.mock('react-native', () => ({
  AppState: {
    addEventListener: (_event: string, callback: (state: string) => void) => {
      fixture.wake = callback;
      return { remove: fixture.remove };
    },
  },
}));

import { useSanctuaryVisitor } from '@repo/core/hooks/useSanctuaryVisitor';
import { AuthProvider, useAuth } from '@repo/core/providers/AuthProvider';

function credential(id = 'credential-a', token = 'access-a'): AuthSession {
  return { user: { id }, access_token: token, refresh_token: 'refresh-a' };
}
const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(AuthProvider, { children });
function pendingSession() {
  let resolve!: (value: AuthSession | null) => void;
  const promise = new Promise<AuthSession | null>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
}
beforeEach(() => {
  vi.clearAllMocks();
  fixture.records.clear();
  fixture.listener = null;
  fixture.wake = null;
  fixture.getAuthSession.mockReset().mockResolvedValue(null);
  fixture.resolveAuthProfile
    .mockReset()
    .mockResolvedValue({ kind: 'unavailable', profileError: 'offline' });
  fixture.retainRefreshedSession.mockReset().mockResolvedValue('canonical-a');
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('single provider credential owner', () => {
  it('publishes a newer auth event and ignores an older bootstrap response', async () => {
    const bootstrap = pendingSession();
    fixture.getAuthSession.mockReturnValue(bootstrap.promise);
    const view = renderHook(() => useAuth(), { wrapper });
    expect(view.result.current.loading).toBe(true);
    const current = credential('credential-b');
    await act(async () => {
      await fixture.listener?.('SIGNED_IN', current);
    });
    expect(view.result.current.session).toBe(current);
    expect(view.result.current.loading).toBe(false);
    await act(async () => {
      bootstrap.resolve(credential('old-credential'));
    });
    expect(view.result.current.session).toBe(current);
    view.unmount();
    expect(fixture.unsubscribe).toHaveBeenCalledOnce();
    expect(fixture.remove).toHaveBeenCalledOnce();
  });

  it('uses the latest committed credentials on app wake without resubscribing auth', async () => {
    const current = credential();
    fixture.getAuthSession.mockResolvedValue(current);
    const view = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(view.result.current.loading).toBe(false));
    const now = vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 61_000);
    fixture.resolveAuthProfile.mockClear();
    await act(async () => {
      fixture.wake?.('active');
    });
    await waitFor(() => expect(fixture.resolveAuthProfile).toHaveBeenCalledOnce());
    expect(fixture.resolveAuthProfile.mock.calls[0]?.[0]).toBe(current);
    const rotated = credential('credential-a', 'rotated-token');
    await act(async () => {
      await fixture.listener?.('TOKEN_REFRESHED', rotated);
    });
    expect(view.result.current.session).toBe(rotated);
    expect(fixture.retainRefreshedSession).toHaveBeenCalledWith(rotated);
    expect(fixture.remove).not.toHaveBeenCalled();
    await act(async () => {
      await fixture.listener?.('SIGNED_OUT', null);
    });
    fixture.resolveAuthProfile.mockClear();
    await act(async () => {
      fixture.wake?.('active');
    });
    expect(fixture.resolveAuthProfile).not.toHaveBeenCalled();
    now.mockRestore();
  });

  it('derives visitor status from provider readiness/session instead of an auth-store mirror', async () => {
    const bootstrap = pendingSession();
    fixture.getAuthSession.mockReturnValue(bootstrap.promise);
    const view = renderHook(() => ({ auth: useAuth(), visitor: useSanctuaryVisitor() }), {
      wrapper,
    });
    expect(view.result.current.visitor.isFirstTime).toBe(false);
    await act(async () => {
      bootstrap.resolve(null);
    });
    expect(view.result.current.visitor.isFirstTime).toBe(true);
    await act(async () => {
      await fixture.listener?.('SIGNED_IN', credential());
    });
    expect(view.result.current.visitor.hasPreviousSession).toBe(true);
    expect(view.result.current.visitor.isFirstTime).toBe(false);
    act(() => view.result.current.visitor.markVisited());
    await act(async () => {
      await fixture.listener?.('SIGNED_OUT', null);
    });
    expect(view.result.current.visitor.isFirstTime).toBe(false);
    expect(view.result.current.visitor.hasPreviousSession).toBe(false);
  });
});
