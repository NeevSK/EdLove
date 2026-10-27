import type { AuthChangeEvent, AuthSession } from '@repo/core/logic/ports/auth.port';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const lifecycleMocks = vi.hoisted(() => ({
  authStateListener: undefined as
    | ((event: AuthChangeEvent, session: AuthSession | null) => Promise<void>)
    | undefined,
  getAuthSession: vi.fn(),
  signOut: vi.fn(),
  captureAccount: vi.fn(),
  retainRefreshedSession: vi.fn(),
  listAccounts: vi.fn(),
  identifySubject: vi.fn(),
  onAuthStateChange: vi.fn(),
  clearScopeSessionCompatibility: vi.fn(),
  commitIdentityScopeSession: vi.fn().mockResolvedValue(undefined),
  resolveAuthProfile: vi.fn().mockResolvedValue({ kind: 'unavailable', profileError: 'offline' }),
  stateSetters: [] as ReturnType<typeof vi.fn>[],
  cleanups: [] as (() => void)[],
  storeState: {
    setAvailableBonds: vi.fn(),
    setDemoMode: vi.fn(),
    setPerspective: vi.fn(),
    setSchoolType: vi.fn(),
    setUser: vi.fn(),
    user: null as { id: string } | null,
  },
  scopeSnapshot: null as { principalId: string | null } | null,
}));

vi.mock('react', () => ({
  useCallback: <Callback extends (...args: never[]) => unknown>(callback: Callback) => callback,
  useEffectEvent: <Callback extends (...args: never[]) => unknown>(callback: Callback) => callback,
  useEffect: (effect: () => void | (() => void)) => {
    const cleanup = effect();
    if (cleanup) lifecycleMocks.cleanups.push(cleanup);
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
  captureAuthenticatedDeviceAccount: lifecycleMocks.captureAccount,
  getVerifiedDeviceAccountProfile: vi.fn(),
}));
vi.mock('@repo/core/accounts/deviceAccounts', () => ({
  deviceAccounts: {
    list: lifecycleMocks.listAccounts,
    retainRefreshedSession: lifecycleMocks.retainRefreshedSession,
  },
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
    signOut: lifecycleMocks.signOut,
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
  identifyAuthSubject: lifecycleMocks.identifySubject,
  initSentry: vi.fn(),
  leaveBreadcrumb: vi.fn(),
}));
vi.mock('@repo/core/store/useAuthStore', () => {
  const mockUseStore = Object.assign(
    <Value>(selector: (store: typeof lifecycleMocks.storeState) => Value) =>
      selector(lifecycleMocks.storeState),
    { getState: () => lifecycleMocks.storeState },
  );
  return { useAuthStore: mockUseStore };
});
vi.mock('@repo/core/store/scopeSession', () => ({
  useScopeSessionStore: {
    getState: () => ({ snapshot: lifecycleMocks.scopeSnapshot }),
  },
}));
vi.mock('@repo/core/lib/experienceState', () => ({
  useExperienceState: <T>(select: (state: typeof lifecycleMocks.storeState) => T) =>
    select(lifecycleMocks.storeState),
}));
vi.mock('@repo/core/store/scopeSessionCoordinator', () => ({
  clearScopeSessionCompatibility: lifecycleMocks.clearScopeSessionCompatibility,
  commitIdentityScopeSession: lifecycleMocks.commitIdentityScopeSession,
}));

import { APIError } from '../../types/API';
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
    lifecycleMocks.signOut.mockReset().mockResolvedValue(undefined);
    lifecycleMocks.captureAccount.mockReset().mockResolvedValue(undefined);
    lifecycleMocks.retainRefreshedSession.mockReset().mockResolvedValue('account-1');
    lifecycleMocks.listAccounts.mockReset().mockResolvedValue([]);
    lifecycleMocks.identifySubject.mockReset();
    lifecycleMocks.onAuthStateChange.mockReset();
    lifecycleMocks.resolveAuthProfile.mockReset().mockResolvedValue({
      kind: 'unavailable',
      profileError: 'offline',
    });
    lifecycleMocks.stateSetters.length = 0;
    lifecycleMocks.cleanups.length = 0;
    lifecycleMocks.storeState.user = null;
    lifecycleMocks.scopeSnapshot = null;
    lifecycleMocks.clearScopeSessionCompatibility.mockReset();
    lifecycleMocks.commitIdentityScopeSession.mockReset().mockResolvedValue(undefined);
    lifecycleMocks.storeState.setUser.mockReset();
  });

  function startLifecycle(initialSession: Promise<AuthSession | null> = Promise.resolve(null)) {
    lifecycleMocks.getAuthSession.mockReturnValue(initialSession);
    lifecycleMocks.onAuthStateChange.mockImplementation((listener) => {
      lifecycleMocks.authStateListener = listener;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
    return useAuthLifecycle();
  }

  function activeIdentity(id: string) {
    return {
      kind: 'active',
      identity: { id, availableBonds: [], activeBond: null, onboarding_completed: true },
      schoolType: null,
    };
  }

  it('does not sign out a newer login when the old bootstrap lookup rejects', async () => {
    const pending = Promise.withResolvers<AuthSession | null>();
    startLifecycle(pending.promise);
    lifecycleMocks.resolveAuthProfile.mockResolvedValueOnce(activeIdentity('canonical-b'));
    const currentSession = session({ id: 'subject-b' });
    await lifecycleMocks.authStateListener!('SIGNED_IN', currentSession);
    pending.reject(new APIError('Refresh Token from old bootstrap', 'AUTH_ERROR'));
    await Promise.resolve();
    await Promise.resolve();
    expect(lifecycleMocks.signOut).not.toHaveBeenCalled();
    expect(lifecycleMocks.stateSetters[0]).toHaveBeenLastCalledWith(currentSession);
    expect(lifecycleMocks.storeState.setUser).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'canonical-b' }),
    );
  });

  it.each(['resolve', 'reject'] as const)('ignores profile %s after sign-out', async (outcome) => {
    const pending = Promise.withResolvers<ReturnType<typeof activeIdentity>>();
    startLifecycle();
    await Promise.resolve();
    lifecycleMocks.resolveAuthProfile.mockReturnValueOnce(pending.promise);
    const oldEvent = lifecycleMocks.authStateListener!('SIGNED_IN', session({ id: 'subject-a' }));
    await lifecycleMocks.authStateListener!('SIGNED_OUT', null);
    const writes = lifecycleMocks.storeState.setUser.mock.calls.length;
    if (outcome === 'reject') pending.reject(new Error('old profile failed'));
    else pending.resolve(activeIdentity('canonical-a'));
    await oldEvent;
    expect(lifecycleMocks.storeState.setUser).toHaveBeenCalledTimes(writes);
    expect(lifecycleMocks.storeState.setUser).toHaveBeenLastCalledWith(null);
    expect(lifecycleMocks.commitIdentityScopeSession).not.toHaveBeenCalled();
  });

  it('invalidates pending profile work when the lifecycle subscription is cleaned up', async () => {
    const pending = Promise.withResolvers<ReturnType<typeof activeIdentity>>();
    startLifecycle();
    await Promise.resolve();
    lifecycleMocks.resolveAuthProfile.mockReturnValueOnce(pending.promise);
    const oldEvent = lifecycleMocks.authStateListener!('SIGNED_IN', session({ id: 'subject-a' }));
    for (const cleanup of lifecycleMocks.cleanups) cleanup();
    const writes = lifecycleMocks.storeState.setUser.mock.calls.length;
    pending.resolve(activeIdentity('canonical-a'));
    await oldEvent;
    expect(lifecycleMocks.storeState.setUser).toHaveBeenCalledTimes(writes);
    expect(lifecycleMocks.commitIdentityScopeSession).not.toHaveBeenCalled();
  });

  it.each(['resolve', 'reject'] as const)(
    'ignores old scope %s after the new identity commits',
    async (outcome) => {
      const pending = Promise.withResolvers<void>();
      startLifecycle();
      await Promise.resolve();
      lifecycleMocks.resolveAuthProfile
        .mockResolvedValueOnce(activeIdentity('canonical-a'))
        .mockResolvedValueOnce(activeIdentity('canonical-b'));
      lifecycleMocks.commitIdentityScopeSession.mockReturnValueOnce(pending.promise);
      const oldEvent = lifecycleMocks.authStateListener!('SIGNED_IN', session({ id: 'subject-a' }));
      await vi.waitFor(() =>
        expect(lifecycleMocks.commitIdentityScopeSession).toHaveBeenCalledOnce(),
      );
      await lifecycleMocks.authStateListener!('SIGNED_IN', session({ id: 'subject-b' }));
      const writes = lifecycleMocks.storeState.setUser.mock.calls.length;
      if (outcome === 'reject') pending.reject(new Error('Scope transition superseded'));
      else pending.resolve();
      await oldEvent;
      expect(lifecycleMocks.storeState.setUser).toHaveBeenCalledTimes(writes);
      expect(lifecycleMocks.storeState.setUser).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: 'canonical-b' }),
      );
      expect(lifecycleMocks.captureAccount).toHaveBeenCalledOnce();
    },
  );

  it('does not publish old onboarding or monitoring after delayed account capture', async () => {
    const pending = Promise.withResolvers<void>();
    startLifecycle();
    await Promise.resolve();
    lifecycleMocks.resolveAuthProfile
      .mockResolvedValueOnce(activeIdentity('canonical-a'))
      .mockResolvedValueOnce(activeIdentity('canonical-b'));
    lifecycleMocks.captureAccount.mockReturnValueOnce(pending.promise);
    const oldEvent = lifecycleMocks.authStateListener!('SIGNED_IN', session({ id: 'subject-a' }));
    await vi.waitFor(() => expect(lifecycleMocks.captureAccount).toHaveBeenCalledOnce());
    await lifecycleMocks.authStateListener!('SIGNED_IN', session({ id: 'subject-b' }));
    const onboardingWrites = lifecycleMocks.storeState.setUser.mock.calls.length;
    pending.resolve();
    await oldEvent;
    expect(lifecycleMocks.storeState.setUser).toHaveBeenCalledTimes(onboardingWrites);
    expect(lifecycleMocks.identifySubject).toHaveBeenCalledOnce();
    expect(lifecycleMocks.identifySubject).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'canonical-b' }),
    );
  });

  it('does not clear the new identity after old offline ownership verification completes', async () => {
    const pending = Promise.withResolvers<{ accountId: string; authUserId: string }[]>();
    startLifecycle();
    await Promise.resolve();
    lifecycleMocks.storeState.user = { id: 'canonical-a' };
    lifecycleMocks.listAccounts.mockReturnValueOnce(pending.promise);
    lifecycleMocks.resolveAuthProfile
      .mockResolvedValueOnce({ kind: 'unavailable', profileError: 'old account offline' })
      .mockResolvedValueOnce(activeIdentity('canonical-b'));
    const oldEvent = lifecycleMocks.authStateListener!('SIGNED_IN', session({ id: 'subject-a' }));
    await vi.waitFor(() => expect(lifecycleMocks.listAccounts).toHaveBeenCalledOnce());
    await lifecycleMocks.authStateListener!('SIGNED_IN', session({ id: 'subject-b' }));
    const writes = lifecycleMocks.storeState.setUser.mock.calls.length;
    pending.resolve([]);
    await oldEvent;
    expect(lifecycleMocks.storeState.setUser).toHaveBeenCalledTimes(writes);
    expect(lifecycleMocks.storeState.setUser).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'canonical-b' }),
    );
  });

  it('ignores an older refresh session lookup after a new auth event', async () => {
    const pending = Promise.withResolvers<AuthSession | null>();
    const lifecycle = startLifecycle();
    await Promise.resolve();
    lifecycleMocks.getAuthSession.mockReturnValueOnce(pending.promise);
    const refresh = lifecycle.refreshProfile();
    lifecycleMocks.resolveAuthProfile.mockResolvedValueOnce(activeIdentity('canonical-b'));
    await lifecycleMocks.authStateListener!('SIGNED_IN', session({ id: 'subject-b' }));
    pending.resolve(session({ id: 'subject-a' }));
    await refresh;
    expect(lifecycleMocks.resolveAuthProfile).toHaveBeenCalledOnce();
    expect(lifecycleMocks.storeState.setUser).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'canonical-b' }),
    );
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
    expect(lifecycleMocks.retainRefreshedSession).toHaveBeenCalledWith(activeSession);
  });

  it('bootstraps canonical identity when refresh has no remembered account binding', async () => {
    const active = session();
    lifecycleMocks.resolveAuthProfile.mockResolvedValue(activeIdentity('canonical-a'));
    lifecycleMocks.retainRefreshedSession.mockResolvedValue(null);
    startLifecycle(Promise.resolve(active));
    await vi.waitFor(() => expect(lifecycleMocks.resolveAuthProfile).toHaveBeenCalledOnce());
    await lifecycleMocks.authStateListener?.('TOKEN_REFRESHED', active);
    expect(lifecycleMocks.resolveAuthProfile).toHaveBeenCalledTimes(2);
  });

  it('surfaces retention failure without provider details and clears only that error after recovery', async () => {
    const active = session();
    lifecycleMocks.resolveAuthProfile.mockResolvedValue(activeIdentity('canonical-a'));
    startLifecycle(Promise.resolve(active));
    await vi.waitFor(() => expect(lifecycleMocks.resolveAuthProfile).toHaveBeenCalledOnce());
    lifecycleMocks.retainRefreshedSession.mockRejectedValueOnce(
      new Error('private credential fixture detail'),
    );
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      await lifecycleMocks.authStateListener?.('TOKEN_REFRESHED', active);
      const setter = lifecycleMocks.stateSetters[4]!;
      expect(setter).toHaveBeenCalledWith('Unable to retain refreshed device credentials.');
      expect(warning).toHaveBeenCalledWith('[auth] Refreshed device credential retention failed.');
      await lifecycleMocks.authStateListener?.('TOKEN_REFRESHED', active);
      const recover = setter.mock.lastCall?.[0];
      if (typeof recover !== 'function')
        throw new Error('Expected retention error recovery updater');
      expect(recover('Unable to retain refreshed device credentials.')).toBeNull();
      expect(recover('Unrelated profile error')).toBe('Unrelated profile error');
      expect(lifecycleMocks.resolveAuthProfile).toHaveBeenCalledOnce();
    } finally {
      warning.mockRestore();
    }
  });

  it.each(['failure', 'missing-binding'] as const)(
    'ignores a stale refresh %s after a newer sign-out event',
    async (outcome) => {
      const active = session();
      lifecycleMocks.resolveAuthProfile.mockResolvedValue(activeIdentity('canonical-a'));
      startLifecycle(Promise.resolve(active));
      await vi.waitFor(() => expect(lifecycleMocks.resolveAuthProfile).toHaveBeenCalledOnce());
      const pending = Promise.withResolvers<string | null>();
      lifecycleMocks.retainRefreshedSession.mockReturnValueOnce(pending.promise);
      const refreshing = lifecycleMocks.authStateListener?.('TOKEN_REFRESHED', active);
      await lifecycleMocks.authStateListener?.('SIGNED_OUT', null);
      if (outcome === 'failure') pending.reject(new Error('old fixture error'));
      else pending.resolve(null);
      await refreshing;
      expect(lifecycleMocks.stateSetters[4]).not.toHaveBeenCalledWith(
        'Unable to retain refreshed device credentials.',
      );
      expect(lifecycleMocks.resolveAuthProfile).toHaveBeenCalledOnce();
    },
  );

  it('preserves local user state on cold boot when offline resolution is unavailable', async () => {
    const activeSession = session({ id: 'account-1' });
    lifecycleMocks.storeState.user = { id: 'account-1' };
    lifecycleMocks.listAccounts.mockResolvedValue([
      { accountId: 'account-1', authUserId: 'account-1' },
    ]);
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
    await vi.waitFor(() => expect(lifecycleMocks.stateSetters[5]).toHaveBeenCalledWith('active'));

    expect(lifecycleMocks.storeState.setUser).not.toHaveBeenCalledWith(null);
    expect(lifecycleMocks.storeState.setUser).not.toHaveBeenCalledWith(
      expect.objectContaining({ onboarding_completed: false }),
    );
  });

  it('retains a persisted canonical account bound to a different credential subject ID', async () => {
    lifecycleMocks.scopeSnapshot = { principalId: 'canonical-account' };
    lifecycleMocks.storeState.user = { id: 'canonical-account' };
    lifecycleMocks.listAccounts.mockResolvedValue([
      { accountId: 'canonical-account', authUserId: 'credential-subject' },
    ]);
    lifecycleMocks.resolveAuthProfile.mockResolvedValue({
      kind: 'active',
      identity: { id: 'canonical-account', availableBonds: [], activeBond: null },
      schoolType: null,
    });

    startLifecycle(Promise.resolve(session({ id: 'credential-subject' })));

    await vi.waitFor(() => expect(lifecycleMocks.commitIdentityScopeSession).toHaveBeenCalled());
    expect(lifecycleMocks.clearScopeSessionCompatibility).not.toHaveBeenCalled();
    expect(lifecycleMocks.storeState.setUser).not.toHaveBeenCalledWith(null);
  });

  it('discards a stale bootstrap ownership lookup after a newer auth event', async () => {
    const ownerLookup = Promise.withResolvers<never[]>();
    lifecycleMocks.scopeSnapshot = { principalId: 'old-account' };
    lifecycleMocks.listAccounts.mockReturnValue(ownerLookup.promise);
    startLifecycle(Promise.resolve(session({ id: 'old-subject' })));
    await vi.waitFor(() => expect(lifecycleMocks.listAccounts).toHaveBeenCalled());

    await lifecycleMocks.authStateListener?.('SIGNED_OUT', null);
    const clearCount = lifecycleMocks.clearScopeSessionCompatibility.mock.calls.length;
    ownerLookup.resolve([]);
    await Promise.resolve();
    await Promise.resolve();

    expect(lifecycleMocks.clearScopeSessionCompatibility).toHaveBeenCalledTimes(clearCount);
    expect(lifecycleMocks.stateSetters[0]).not.toHaveBeenCalledWith(
      expect.objectContaining({ user: expect.objectContaining({ id: 'old-subject' }) }),
    );
  });

  it('clears a persisted account scope before resolving an unbound initial subject', async () => {
    const initialSession = session({ id: 'account-b' });
    lifecycleMocks.scopeSnapshot = { principalId: 'account-a' };
    lifecycleMocks.getAuthSession.mockResolvedValue(initialSession);
    lifecycleMocks.resolveAuthProfile.mockResolvedValue({
      kind: 'active',
      identity: {
        id: 'account-b',
        availableBonds: [],
        activeBond: null,
      },
      schoolType: null,
    });
    lifecycleMocks.onAuthStateChange.mockImplementation((listener) => {
      lifecycleMocks.authStateListener = listener;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    useAuthLifecycle();
    await vi.waitFor(() => expect(lifecycleMocks.resolveAuthProfile).toHaveBeenCalled());

    expect(lifecycleMocks.clearScopeSessionCompatibility).toHaveBeenCalledTimes(1);
    expect(lifecycleMocks.clearScopeSessionCompatibility.mock.invocationCallOrder[0]).toBeLessThan(
      lifecycleMocks.resolveAuthProfile.mock.invocationCallOrder[0] ?? Number.POSITIVE_INFINITY,
    );
  });

  it('clears a persisted account scope for an initially signed-out session', async () => {
    lifecycleMocks.scopeSnapshot = { principalId: 'account-a' };
    lifecycleMocks.getAuthSession.mockResolvedValue(null);
    lifecycleMocks.onAuthStateChange.mockImplementation((listener) => {
      lifecycleMocks.authStateListener = listener;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    useAuthLifecycle();
    await vi.waitFor(() =>
      expect(lifecycleMocks.clearScopeSessionCompatibility).toHaveBeenCalled(),
    );

    expect(lifecycleMocks.clearScopeSessionCompatibility).toHaveBeenCalledTimes(1);
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
