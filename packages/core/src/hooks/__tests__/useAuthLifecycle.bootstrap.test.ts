import type { AuthChangeEvent, AuthSession } from '@repo/core/logic/ports/auth.port';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const lifecycleMocks = vi.hoisted(() => ({
  authStateListener: undefined as
    | ((event: AuthChangeEvent, session: AuthSession | null) => Promise<void>)
    | undefined,
  getAuthSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  resolveAuthProfile: vi.fn().mockResolvedValue({ kind: 'unavailable', profileError: 'offline' }),
  stateSetters: [] as ReturnType<typeof vi.fn>[],
  storeState: {
    setAuthSession: vi.fn(),
    setAuthSessionResolved: vi.fn(),
    setAvailableBonds: vi.fn(),
    setDemoMode: vi.fn(),
    setOnboardingCompleted: vi.fn(),
    setPerspective: vi.fn(),
    setSchoolType: vi.fn(),
    setUser: vi.fn(),
    user: null as { id: string } | null,
  },
}));

vi.mock('react', () => ({
  useCallback: <Callback extends (...args: never[]) => unknown>(callback: Callback) => callback,
  useEffect: (effect: () => void | (() => void)) => {
    effect();
  },
  useMemo: <Value>(factory: () => Value) => factory(),
  useRef: <Value>(current: Value) => ({ current }),
  useState: <Value>(initialValue: Value) => {
    const setValue = vi.fn();
    lifecycleMocks.stateSetters.push(setValue);
    return [initialValue, setValue] as const;
  },
}));

vi.mock('@repo/core/accounts/authenticatedAccountCapture', () => ({
  captureAuthenticatedDeviceAccount: vi.fn(),
  getVerifiedDeviceAccountProfile: vi.fn(),
}));
vi.mock('@repo/core/accounts/deviceAccounts', () => ({
  deviceAccounts: { list: vi.fn().mockResolvedValue([]) },
}));
vi.mock('@repo/core/logic/managers/factory', () => ({
  realtime: {
    subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn().mockResolvedValue(undefined) }),
  },
}));
vi.mock('@repo/core/api/auth', () => ({
  authAPI: {
    getAccountLifecycleStatus: vi.fn(),
    getAuthSession: lifecycleMocks.getAuthSession,
    onAuthStateChange: lifecycleMocks.onAuthStateChange,
    signOut: vi.fn(),
  },
}));
vi.mock('@repo/core/api/school', () => ({
  schoolAPI: {
    getSchool: vi.fn().mockResolvedValue({ type: null }),
  },
}));
vi.mock('@repo/core/api/highways', () => ({ assertHighway: vi.fn() }));
vi.mock('@repo/core/api/identity', () => ({ identityAPI: { identifyActiveCitizen: vi.fn() } }));
vi.mock('@repo/core/logic/auth/profileResolution', () => ({
  resolveAuthProfile: (...args: unknown[]) => lifecycleMocks.resolveAuthProfile(...args),
}));
vi.mock('@repo/core/monitoring', () => ({
  clearAuthSubject: vi.fn(),
  identifyAuthSubject: vi.fn(),
  initSentry: vi.fn(),
  leaveBreadcrumb: vi.fn(),
}));
vi.mock('@repo/core/store/useStore', () => {
  const mockUseStore = Object.assign(
    <Value>(selector: (store: typeof lifecycleMocks.storeState) => Value) =>
      selector(lifecycleMocks.storeState),
    { getState: () => lifecycleMocks.storeState },
  );
  return { useStore: mockUseStore };
});

import { useAuthLifecycle } from '../useAuthLifecycle';

function session(overrides: Record<string, unknown> = {}): AuthSession {
  return {
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    expires_in: 3600,
    expires_at: 4_102_444_800,
    token_type: 'bearer',
    user: {
      id: 'account-1',
      email: 'member@example.com',
      app_metadata: {},
      user_metadata: {},
      created_at: '2026-09-01T00:00:00.000Z',
      ...overrides,
    },
  };
}

describe('useAuthLifecycle bootstrap ordering', () => {
  beforeEach(() => {
    lifecycleMocks.authStateListener = undefined;
    lifecycleMocks.getAuthSession.mockReset();
    lifecycleMocks.onAuthStateChange.mockReset();
    lifecycleMocks.resolveAuthProfile.mockReset().mockResolvedValue({
      kind: 'unavailable',
      profileError: 'offline',
    });
    lifecycleMocks.stateSetters.length = 0;
    lifecycleMocks.storeState.user = null;
    lifecycleMocks.storeState.setUser.mockReset();
    lifecycleMocks.storeState.setOnboardingCompleted.mockReset();
  });

  it('keeps a newer auth event when the initial session lookup resolves late', async () => {
    let resolveInitialSession: (value: AuthSession | null) => void = () => undefined;
    lifecycleMocks.getAuthSession.mockImplementation(
      () =>
        new Promise<AuthSession | null>((resolve) => {
          resolveInitialSession = resolve;
        }),
    );
    lifecycleMocks.onAuthStateChange.mockImplementation((listener) => {
      lifecycleMocks.authStateListener = listener;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    useAuthLifecycle();

    expect(lifecycleMocks.onAuthStateChange.mock.invocationCallOrder[0]).toBeLessThan(
      lifecycleMocks.getAuthSession.mock.invocationCallOrder[0] ?? Number.POSITIVE_INFINITY,
    );

    const eventSession = session({ id: 'account-2' });
    await lifecycleMocks.authStateListener?.('TOKEN_REFRESHED', eventSession);
    expect(lifecycleMocks.stateSetters[0]).toHaveBeenLastCalledWith(eventSession);

    resolveInitialSession(null);
    await Promise.resolve();
    await Promise.resolve();

    expect(lifecycleMocks.stateSetters[0]).toHaveBeenCalledTimes(1);
  });

  it('skips redundant profile resolution on TOKEN_REFRESHED when user ID is unchanged', async () => {
    const activeSession = session({ id: 'account-1' });
    lifecycleMocks.getAuthSession.mockResolvedValue(activeSession);
    lifecycleMocks.resolveAuthProfile.mockResolvedValue({
      kind: 'active',
      identity: { id: 'account-1' },
      schoolType: null,
    });
    lifecycleMocks.onAuthStateChange.mockImplementation((listener) => {
      lifecycleMocks.authStateListener = listener;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    useAuthLifecycle();
    await Promise.resolve();
    await Promise.resolve();

    const initialCalls = lifecycleMocks.resolveAuthProfile.mock.calls.length;

    // Fire TOKEN_REFRESHED for the same user
    await lifecycleMocks.authStateListener?.('TOKEN_REFRESHED', activeSession);

    expect(lifecycleMocks.resolveAuthProfile.mock.calls.length).toBe(initialCalls);
  });

  it('preserves local user state on cold boot when offline resolution is unavailable', async () => {
    const activeSession = session({ id: 'account-1' });
    lifecycleMocks.storeState.user = { id: 'account-1' };
    lifecycleMocks.getAuthSession.mockResolvedValue(activeSession);
    lifecycleMocks.resolveAuthProfile.mockResolvedValue({
      kind: 'unavailable',
      profileError: 'Network request timed out',
    });
    lifecycleMocks.onAuthStateChange.mockImplementation((listener) => {
      lifecycleMocks.authStateListener = listener;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    useAuthLifecycle();
    await Promise.resolve();
    await Promise.resolve();

    // Must NOT have wiped the matching local user or onboarding state
    expect(lifecycleMocks.storeState.setUser).not.toHaveBeenCalledWith(null);
    expect(lifecycleMocks.storeState.setOnboardingCompleted).not.toHaveBeenCalledWith(false);
  });

  it('does not resolve a cloud profile for an anonymous bootstrap or auth event', async () => {
    const anonymousSession = session({ id: 'guest-1', is_anonymous: true });
    lifecycleMocks.getAuthSession.mockResolvedValue(anonymousSession);
    lifecycleMocks.onAuthStateChange.mockImplementation((listener) => {
      lifecycleMocks.authStateListener = listener;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    useAuthLifecycle();
    await Promise.resolve();
    await Promise.resolve();

    expect(lifecycleMocks.resolveAuthProfile).not.toHaveBeenCalled();

    await lifecycleMocks.authStateListener?.('SIGNED_IN', anonymousSession);

    expect(lifecycleMocks.resolveAuthProfile).not.toHaveBeenCalled();
    expect(lifecycleMocks.storeState.setUser).toHaveBeenCalledWith(null);
  });
});
