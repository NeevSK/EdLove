import type { AuthSession } from '@repo/core/logic/ports/auth.port';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetString = vi.fn();
const mockSet = vi.fn();
const mockDelete = vi.fn();
const mockClearAll = vi.fn();

const mockGetSession = vi.fn();
const mockSetSession = vi.fn();
const mockSignOut = vi.fn();
const mockLogAuditEvent = vi.fn();
const mockSyncCurrentAccountDevice = vi.fn();
const mockTouchCurrentDevice = vi.fn();
const mockGetInstallId = vi.fn();
const mockRevokeMyInstallSecuritySessions = vi.fn();
const mockIdentifyActiveCitizen = vi.fn();
const mockUpsertCurrentSecuritySession = vi.fn();
const mockGetProfile = vi.fn();
const mockGetStoredSessionForAccount = vi.fn();
const mockClearPowerSyncAccount = vi.fn();
const mockDisconnectPowerSync = vi.fn();
const mockSetStoredSessionForAccount = vi.fn();

vi.mock('../../lib/storage', () => ({
  storage: {
    getString: (...args: unknown[]) => mockGetString(...args),
    set: (...args: unknown[]) => mockSet(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
    clearAll: (...args: unknown[]) => mockClearAll(...args),
  },
}));

vi.mock('../../api/deviceTrust', () => ({
  deviceTrustAPI: {
    logAuditEvent: (...args: unknown[]) => mockLogAuditEvent(...args),
    syncCurrentAccountDevice: (...args: unknown[]) => mockSyncCurrentAccountDevice(...args),
    touchCurrentDevice: (...args: unknown[]) => mockTouchCurrentDevice(...args),
    getInstallId: (...args: unknown[]) => mockGetInstallId(...args),
    revokeMyInstallSecuritySessions: (...args: unknown[]) =>
      mockRevokeMyInstallSecuritySessions(...args),
    upsertCurrentSecuritySession: (...args: unknown[]) => mockUpsertCurrentSecuritySession(...args),
  },
}));

vi.mock('../../api/identity', () => ({
  identityAPI: {
    identifyActiveCitizen: (...args: unknown[]) => mockIdentifyActiveCitizen(...args),
    getProfile: (...args: unknown[]) => mockGetProfile(...args),
  },
}));

vi.mock('@repo/core/api/auth', () => ({
  authAPI: {
    getAuthSession: (...args: unknown[]) => mockGetSession(...args),
    setSession: (...args: unknown[]) => mockSetSession(...args),
    signOut: (...args: unknown[]) => mockSignOut(...args),
  },
}));

vi.mock('../../lib/supabaseAuthStorage', () => ({
  clearLegacySupabaseSession: vi.fn(),
  getStoredSessionForAccount: (...args: unknown[]) => mockGetStoredSessionForAccount(...args),
  removeStoredSessionForAccount: vi.fn(),
  setStoredSessionForAccount: (...args: unknown[]) => mockSetStoredSessionForAccount(...args),
}));

vi.mock('../../lib/storageWrapper', () => ({
  SafeZustandStorage: {
    getItem: () => null,
    setItem: () => Promise.resolve(),
    removeItem: () => Promise.resolve(),
  },
}));

vi.mock('@repo/core/store/useAuthStore', () => ({
  useAuthStore: Object.assign(() => ({}), {
    getState: vi.fn(),
    setState: vi.fn(),
    persist: { rehydrate: vi.fn() },
  }),
}));

vi.mock('@repo/core/store/resetScopedStores', () => ({
  rehydrateScopedStores: vi.fn(),
  resetScopedStores: vi.fn(),
}));

vi.mock('../../lib/accountPin', () => ({
  accountPin: {
    removePin: vi.fn(),
  },
}));

vi.mock('../../adapters/powersync/database', () => ({
  clearPowerSyncAccount: (...args: unknown[]) => mockClearPowerSyncAccount(...args),
  disconnectPowerSync: (...args: unknown[]) => mockDisconnectPowerSync(...args),
}));

import { getActiveAccountId, setActiveAccountId } from '../../lib/accountScope';
import { openReplayAdmission, tryBeginReplay } from '../../lib/sync/replayAdmission';
import { useMutationQueue } from '../../lib/sync/useMutationQueue';
import { rehydrateScopedStores } from '../../store/resetScopedStores';
import { deviceAccounts } from '../deviceAccounts';

const validAccessToken =
  'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyLTEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJleHAiOjQxMDI0NDQ4MDB9.signature';
const validRefreshToken = 'refresh-token-for-test';

describe('deviceAccounts', () => {
  beforeEach(() => {
    setActiveAccountId(null);
    for (const accountId of ['account-a', 'account-b', 'account-1', 'account-2']) {
      openReplayAdmission(accountId);
    }
    // Resetting persisted queue state may write an empty snapshot. Clear mocks
    // after that fixture work so account-capture assertions observe only calls
    // made by the operation under test.
    useMutationQueue.setState({ queue: [], deadLetterQueue: [], isSyncing: false });
    vi.resetAllMocks();
    mockGetSession.mockResolvedValue({
      access_token: 'a',
      refresh_token: 'r',
      user: { id: 'user-1' },
    });
    mockLogAuditEvent.mockResolvedValue(undefined);
    mockSyncCurrentAccountDevice.mockResolvedValue(null);
    mockTouchCurrentDevice.mockResolvedValue(null);
    mockUpsertCurrentSecuritySession.mockResolvedValue(undefined);
    mockRevokeMyInstallSecuritySessions.mockResolvedValue(undefined);
    mockGetInstallId.mockResolvedValue(null);
  });

  it('captures the active account and stores scoped session tokens', async () => {
    mockIdentifyActiveCitizen.mockResolvedValue({ id: 'account-1' });
    mockGetString.mockReturnValue(null);

    const session: AuthSession = {
      access_token: 'a',
      refresh_token: 'r',
      user: { id: 'user-1', email: 'user@example.com', user_metadata: { display_name: 'Naween' } },
    };

    const record = await deviceAccounts.captureCurrentAccount(session, null);

    expect(record?.accountId).toBe('account-1');
    expect(mockSet).toHaveBeenCalled();
    expect(mockSyncCurrentAccountDevice).toHaveBeenCalledWith('account-1');
    await vi.waitFor(() =>
      expect(mockUpsertCurrentSecuritySession).toHaveBeenCalledWith(
        expect.objectContaining({ accountId: 'account-1', authStrength: 'session' }),
      ),
    );
  });

  it('does not retain anonymous or sandbox sessions on a shared device', async () => {
    mockGetString.mockReturnValue(null);

    const anonymousSession = {
      access_token: 'anonymous-access-token',
      refresh_token: 'anonymous-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: 'anonymous-1',
        app_metadata: {},
        user_metadata: {},
        created_at: '2026-09-01T00:00:00.000Z',
        is_anonymous: true,
      },
    } as AuthSession;
    const sandboxSession = {
      access_token: 'sandbox-access-token',
      refresh_token: 'sandbox-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: 'sandbox-1',
        app_metadata: {},
        user_metadata: { experience_mode: 'sandbox' },
        created_at: '2026-09-01T00:00:00.000Z',
      },
    } as AuthSession;

    await expect(deviceAccounts.captureCurrentAccount(anonymousSession, null)).resolves.toBeNull();
    await expect(deviceAccounts.captureCurrentAccount(sandboxSession, null)).resolves.toBeNull();

    expect(mockIdentifyActiveCitizen).not.toHaveBeenCalled();
    expect(mockSet).not.toHaveBeenCalled();
  });

  it('switches to a stored account session', async () => {
    mockGetString.mockImplementation((key: string) => {
      if (key.includes('sb-')) {
        return JSON.stringify({ access_token: validAccessToken, refresh_token: validRefreshToken });
      }
      if (key === 'gurudevi-device-accounts') {
        return JSON.stringify([{ accountId: 'account-1', lastUsedAt: '2026-01-01T00:00:00.000Z' }]);
      }
      return null;
    });
    mockGetStoredSessionForAccount.mockResolvedValue({
      access_token: validAccessToken,
      refresh_token: validRefreshToken,
    });
    mockSetSession.mockResolvedValue({ error: null });
    mockTouchCurrentDevice.mockResolvedValue({ isTrusted: true });

    await deviceAccounts.switchTo('account-1');

    expect(mockSetSession).toHaveBeenCalledWith(validAccessToken, validRefreshToken);
    expect(mockTouchCurrentDevice).toHaveBeenCalledWith('account-1');
  });

  it('reopens only the target whose active scope and live credential match its canonical owner', async () => {
    const values = rememberedAccounts();
    values.set(
      'gurudevi-device-accounts',
      JSON.stringify([
        { accountId: 'account-a', authUserId: 'subject-a', lastUsedAt: '2026-01-01' },
        { accountId: 'account-b', authUserId: 'subject-b', lastUsedAt: '2026-01-02' },
      ]),
    );
    setActiveAccountId('account-a');
    mockGetStoredSessionForAccount.mockResolvedValue({
      access_token: validAccessToken,
      refresh_token: validRefreshToken,
    });
    mockSetSession.mockResolvedValue({ error: null });
    mockGetSession.mockResolvedValue(sessionFor('subject-b'));

    await deviceAccounts.switchTo('account-b');

    expect(tryBeginReplay('account-a')).toBeNull();
    const replay = tryBeginReplay('account-b');
    expect(replay).not.toBeNull();
    replay?.release();
  });

  it('reopens the previous owner only after rollback restores its matching credential', async () => {
    const values = rememberedAccounts();
    values.set(
      'gurudevi-device-accounts',
      JSON.stringify([
        { accountId: 'account-a', authUserId: 'user-1', lastUsedAt: '2026-01-01' },
        { accountId: 'account-b', authUserId: 'subject-b', lastUsedAt: '2026-01-02' },
      ]),
    );
    setActiveAccountId('account-a');
    mockGetStoredSessionForAccount.mockResolvedValue({
      access_token: validAccessToken,
      refresh_token: validRefreshToken,
    });
    mockSetSession.mockRejectedValueOnce(new Error('incoming session rejected'));

    await expect(deviceAccounts.switchTo('account-b')).rejects.toThrow('incoming session rejected');

    const replay = tryBeginReplay('account-a');
    expect(replay).not.toBeNull();
    replay?.release();
    expect(tryBeginReplay('account-b')).toBeNull();
  });

  it('quarantines outgoing work without replaying another account or legacy work during a switch', async () => {
    setActiveAccountId('account-1');
    useMutationQueue.setState({
      queue: [
        {
          id: 'account-1-command',
          idempotencyKey: 'account-1-key',
          type: 'CUSTOM',
          scope: 'self',
          name: 'save',
          variables: {},
          timestamp: 1,
          retryCount: 0,
          userId: 'account-1',
          commandState: 'queued',
        },
        {
          id: 'account-2-command',
          idempotencyKey: 'account-2-key',
          type: 'CUSTOM',
          scope: 'self',
          name: 'save',
          variables: {},
          timestamp: 2,
          retryCount: 0,
          userId: 'account-2',
          commandState: 'queued',
        },
        {
          id: 'legacy-command',
          idempotencyKey: 'legacy-key',
          type: 'CUSTOM',
          scope: 'self',
          name: 'save',
          variables: {},
          timestamp: 3,
          retryCount: 0,
          commandState: 'queued',
        },
      ],
    });
    mockGetStoredSessionForAccount.mockResolvedValue({
      access_token: validAccessToken,
      refresh_token: validRefreshToken,
    });
    mockSetSession.mockResolvedValue({ error: null });
    mockGetString.mockReturnValue(
      JSON.stringify([
        { accountId: 'account-1', lastUsedAt: '2026-01-01T00:00:00.000Z' },
        { accountId: 'account-2', lastUsedAt: '2026-01-02T00:00:00.000Z' },
      ]),
    );

    await deviceAccounts.switchTo('account-2');

    expect(mockDisconnectPowerSync).toHaveBeenCalledOnce();
    expect(mockClearPowerSyncAccount).not.toHaveBeenCalled();
    expect(useMutationQueue.getState().queue).toEqual([
      expect.objectContaining({ id: 'account-1-command', commandState: 'auth_paused' }),
      expect.objectContaining({ id: 'account-2-command', commandState: 'queued' }),
      expect.objectContaining({ id: 'legacy-command', commandState: 'queued' }),
    ]);
  });

  it('signs out the current account and clears local state', async () => {
    setActiveAccountId('account-1');
    mockGetInstallId.mockResolvedValue('install-1');
    mockGetString.mockImplementation((key: string) => {
      if (key === 'gurudevi-device-accounts') {
        return JSON.stringify([{ accountId: 'account-1', lastUsedAt: '2026-01-01T00:00:00.000Z' }]);
      }
      return null;
    });
    mockGetStoredSessionForAccount.mockResolvedValue(null);
    mockSignOut.mockResolvedValue(undefined);

    await deviceAccounts.removeAccount('account-1');

    expect(mockSignOut).toHaveBeenCalledWith({ scope: 'local' });
  });

  it.each(['runtime-close', 'incoming-session'] as const)(
    'retains the outgoing account and its database when %s fails',
    async (failure) => {
      setActiveAccountId('account-1');
      mockGetStoredSessionForAccount.mockResolvedValue({
        access_token: validAccessToken,
        refresh_token: validRefreshToken,
      });
      const error = new Error('synthetic switch failure');
      if (failure === 'runtime-close') mockDisconnectPowerSync.mockRejectedValueOnce(error);
      else mockSetSession.mockRejectedValueOnce(error);

      await expect(deviceAccounts.switchTo('account-2')).rejects.toThrow(error);

      expect(getActiveAccountId()).toBe('account-1');
      expect(mockClearPowerSyncAccount).not.toHaveBeenCalled();
      expect(mockDisconnectPowerSync).toHaveBeenCalledOnce();
      expect(mockSetSession).toHaveBeenCalledTimes(failure === 'runtime-close' ? 0 : 1);
      expect(mockTouchCurrentDevice).not.toHaveBeenCalled();
    },
  );

  it('falls back to the next stored account when removing the active one', async () => {
    setActiveAccountId('account-1');
    mockGetInstallId.mockResolvedValue('install-1');
    mockGetStoredSessionForAccount.mockImplementation((accountId: string) =>
      Promise.resolve(
        accountId === 'account-2'
          ? {
              access_token: `${validAccessToken.slice(0, -9)}account2`,
              refresh_token: 'refresh-token-account-2',
            }
          : { access_token: validAccessToken, refresh_token: validRefreshToken },
      ),
    );
    mockSetSession.mockResolvedValue({ error: null });
    mockTouchCurrentDevice.mockResolvedValue({ isTrusted: true });
    mockGetString.mockImplementation((key: string) => {
      if (key === 'gurudevi-device-accounts') {
        return JSON.stringify([
          { accountId: 'account-1', lastUsedAt: '2026-01-01T00:00:00.000Z' },
          { accountId: 'account-2', lastUsedAt: '2026-01-02T00:00:00.000Z' },
        ]);
      }
      return null;
    });

    await deviceAccounts.removeAccount('account-1');

    expect(mockSetSession).toHaveBeenCalledWith(
      `${validAccessToken.slice(0, -9)}account2`,
      'refresh-token-account-2',
    );
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it('signs out every stored account and clears the active scope', async () => {
    setActiveAccountId('account-1');
    mockGetInstallId.mockResolvedValue('install-1');
    mockGetString.mockImplementation((key: string) => {
      if (key === 'gurudevi-device-accounts') {
        return JSON.stringify([
          { accountId: 'account-1', lastUsedAt: '2026-01-01T00:00:00.000Z' },
          { accountId: 'account-2', lastUsedAt: '2026-01-02T00:00:00.000Z' },
        ]);
      }
      return null;
    });

    await deviceAccounts.signOutAllAccounts();

    expect(mockSignOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(mockDelete).toHaveBeenCalled();
    expect(mockClearPowerSyncAccount).toHaveBeenCalledTimes(1);
    await vi.waitFor(() =>
      expect(mockRevokeMyInstallSecuritySessions).toHaveBeenCalledWith(
        'install-1',
        'signed_out_all_locally',
      ),
    );
  });

  function sessionFor(subject: string): AuthSession {
    return {
      access_token: `access-${subject}`,
      refresh_token: `refresh-${subject}`,
      user: { id: subject },
    };
  }

  function profileFor(accountId: string) {
    return {
      id: accountId,
      email: null,
      display_name: null,
      avatar_url: null,
      capacity: null,
      school_id: null,
    };
  }

  function rememberedAccounts() {
    const values = new Map<string, string>();
    mockGetString.mockImplementation((key: string) => values.get(key) ?? null);
    mockSet.mockImplementation((key: string, value: string) => {
      values.set(key, value);
    });
    mockDelete.mockImplementation((key: string) => {
      values.delete(key);
    });
    return values;
  }

  it('serializes captures so concurrent registry updates retain both verified accounts', async () => {
    rememberedAccounts();
    const firstSession = sessionFor('subject-a');
    const secondSession = sessionFor('subject-b');
    let current = firstSession;
    mockGetSession.mockImplementation(async () => current);
    const identity = Promise.withResolvers<{ id: string }>();
    mockIdentifyActiveCitizen
      .mockReturnValueOnce(identity.promise)
      .mockResolvedValueOnce({ id: 'account-b' });
    const first = deviceAccounts.captureCurrentAccount(firstSession, profileFor('account-a'));
    const credentialChanged = first.then(() => {
      current = secondSession;
    });
    const second = deviceAccounts.captureCurrentAccount(secondSession, profileFor('account-b'));
    await vi.waitFor(() => expect(mockIdentifyActiveCitizen).toHaveBeenCalledOnce());
    expect(mockSetStoredSessionForAccount).not.toHaveBeenCalled();
    identity.resolve({ id: 'account-a' });
    await Promise.all([first, credentialChanged, second]);
    expect((await deviceAccounts.list()).map((entry) => entry.accountId).sort()).toEqual([
      'account-a',
      'account-b',
    ]);
    expect(getActiveAccountId()).toBe('account-b');
  });

  it('rejects a supplied profile that disagrees with the server canonical account', async () => {
    mockIdentifyActiveCitizen.mockResolvedValue({ id: 'account-a' });
    const session = sessionFor('subject-a');
    mockGetSession.mockResolvedValue(session);
    await expect(
      deviceAccounts.captureCurrentAccount(session, profileFor('account-b')),
    ).rejects.toMatchObject({ code: 'AUTH_ACCOUNT_MISMATCH' });
    expect(mockSetStoredSessionForAccount).not.toHaveBeenCalled();
    expect(mockSet).not.toHaveBeenCalled();
  });

  it('rejects a token change during canonical resolution before writing remembered credentials', async () => {
    const session = sessionFor('subject-a');
    mockGetSession.mockResolvedValueOnce(session).mockResolvedValueOnce(sessionFor('subject-b'));
    mockIdentifyActiveCitizen.mockResolvedValue({ id: 'account-a' });
    await expect(deviceAccounts.captureCurrentAccount(session)).rejects.toMatchObject({
      code: 'AUTH_SESSION_CHANGED',
    });
    expect(mockSetStoredSessionForAccount).not.toHaveBeenCalled();
    expect(mockSet).not.toHaveBeenCalled();
  });

  it('does not reactivate an account from a capture queued behind its removal', async () => {
    const values = rememberedAccounts();
    values.set(
      'gurudevi-device-accounts',
      JSON.stringify([{ accountId: 'account-a', lastUsedAt: '2026-01-01' }]),
    );
    setActiveAccountId('account-a');
    mockSignOut.mockImplementation(async () => {
      mockGetSession.mockResolvedValue(null);
    });
    const removing = deviceAccounts.removeAccount('account-a');
    const capture = deviceAccounts.captureCurrentAccount(
      sessionFor('subject-a'),
      profileFor('account-a'),
    );
    const rejected = expect(capture).rejects.toMatchObject({ code: 'AUTH_SESSION_CHANGED' });
    await Promise.all([removing, rejected]);
    expect(mockSetStoredSessionForAccount).not.toHaveBeenCalled();
    expect(await deviceAccounts.list()).toEqual([]);
    expect(getActiveAccountId()).toBeNull();
  });

  it('queues callback-shaped capture behind session installation without deadlocking', async () => {
    rememberedAccounts();
    const session = sessionFor('subject-b');
    mockGetStoredSessionForAccount.mockResolvedValue(session);
    mockIdentifyActiveCitizen.mockResolvedValue({ id: 'account-b' });
    let capture: ReturnType<typeof deviceAccounts.captureCurrentAccount> | undefined;
    mockSetSession.mockImplementation(async () => {
      mockGetSession.mockResolvedValue(session);
      capture = deviceAccounts.captureCurrentAccount(session, profileFor('account-b'));
    });
    await deviceAccounts.switchTo('account-b');
    expect(capture).toBeDefined();
    await capture;
    expect(getActiveAccountId()).toBe('account-b');
    expect((await deviceAccounts.list()).map((entry) => entry.accountId)).toEqual(['account-b']);
  });

  it('does not start removal while a switch is still rehydrating scoped stores', async () => {
    rememberedAccounts();
    mockGetStoredSessionForAccount.mockResolvedValue({
      access_token: validAccessToken,
      refresh_token: validRefreshToken,
    });
    const pending = Promise.withResolvers<void>();
    vi.mocked(rehydrateScopedStores).mockReturnValueOnce(pending.promise);
    const switching = deviceAccounts.switchTo('account-b');
    await vi.waitFor(() => expect(rehydrateScopedStores).toHaveBeenCalledOnce());
    const removal = deviceAccounts.removeAccount('account-b');
    expect(mockClearPowerSyncAccount).not.toHaveBeenCalled();
    pending.resolve();
    await Promise.all([switching, removal]);
    expect(mockClearPowerSyncAccount).toHaveBeenCalledOnce();
    expect(getActiveAccountId()).toBeNull();
  });

  it('restores the previous scope after rehydration failure and permits the next transaction', async () => {
    rememberedAccounts();
    setActiveAccountId('account-a');
    mockGetStoredSessionForAccount.mockResolvedValue({
      access_token: validAccessToken,
      refresh_token: validRefreshToken,
    });
    vi.mocked(rehydrateScopedStores).mockRejectedValueOnce(new Error('rehydration unavailable'));
    await expect(deviceAccounts.switchTo('account-b')).rejects.toThrow('rehydration unavailable');
    expect(getActiveAccountId()).toBe('account-a');
    expect(mockSetSession).not.toHaveBeenCalled();
    await deviceAccounts.switchTo('account-b');
    expect(getActiveAccountId()).toBe('account-b');
  });

  it('does not publish a selection whose persistent write fails', async () => {
    setActiveAccountId('account-a');
    mockGetStoredSessionForAccount.mockResolvedValue({
      access_token: validAccessToken,
      refresh_token: validRefreshToken,
    });
    let scopeAtFailure: string | null = null;
    mockSet.mockImplementation((key: string, value: string) => {
      if (key === 'gurudevi-active-account-id' && value === 'account-b') {
        scopeAtFailure = getActiveAccountId();
        throw new Error('selection write failed');
      }
    });
    await expect(deviceAccounts.switchTo('account-b')).rejects.toThrow('selection write failed');
    expect(scopeAtFailure).toBe('account-a');
    expect(getActiveAccountId()).toBe('account-a');
    expect(mockSetSession).not.toHaveBeenCalled();
  });

  it('does not activate a stale capture when credentials finish storing after a session change', async () => {
    const session = sessionFor('subject-a');
    mockGetSession.mockResolvedValue(session);
    mockIdentifyActiveCitizen.mockResolvedValue({ id: 'account-a' });
    const pending = Promise.withResolvers<void>();
    mockSetStoredSessionForAccount.mockReturnValueOnce(pending.promise);
    const capturing = deviceAccounts.captureCurrentAccount(session);
    const rejected = expect(capturing).rejects.toMatchObject({ code: 'AUTH_SESSION_CHANGED' });
    await vi.waitFor(() => expect(mockSetStoredSessionForAccount).toHaveBeenCalledOnce());
    mockGetSession.mockResolvedValue(sessionFor('subject-b'));
    pending.resolve();
    await rejected;
    expect(mockSetStoredSessionForAccount).toHaveBeenCalledWith('account-a', {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
    expect(mockSet).not.toHaveBeenCalled();
    expect(getActiveAccountId()).toBeNull();
  });

  it('leaves activation unchanged after credential storage failure and permits a later retry', async () => {
    rememberedAccounts();
    const session = sessionFor('subject-a');
    mockGetSession.mockResolvedValue(session);
    mockIdentifyActiveCitizen.mockResolvedValue({ id: 'account-a' });
    mockSetStoredSessionForAccount.mockRejectedValueOnce(new Error('secure storage unavailable'));
    await expect(deviceAccounts.captureCurrentAccount(session)).rejects.toThrow(
      'secure storage unavailable',
    );
    expect(getActiveAccountId()).toBeNull();
    expect(await deviceAccounts.list()).toEqual([]);
    await deviceAccounts.captureCurrentAccount(session);
    expect(getActiveAccountId()).toBe('account-a');
  });

  it('retains rotated credentials only under the active remembered binding without rewriting profile or scope', async () => {
    const values = rememberedAccounts();
    const registry = JSON.stringify([
      {
        accountId: 'account-a',
        authUserId: 'subject-a',
        isAnonymous: false,
        displayName: 'Existing name',
      },
    ]);
    values.set('gurudevi-device-accounts', registry);
    setActiveAccountId('account-a');
    const rotated = sessionFor('subject-a');
    mockGetSession.mockResolvedValue(rotated);
    await expect(deviceAccounts.retainRefreshedSession(rotated)).resolves.toBe('account-a');
    expect(mockSetStoredSessionForAccount).toHaveBeenCalledWith('account-a', {
      access_token: rotated.access_token,
      refresh_token: rotated.refresh_token,
    });
    expect(values.get('gurudevi-device-accounts')).toBe(registry);
    expect(mockSet).not.toHaveBeenCalled();
    expect(mockIdentifyActiveCitizen).not.toHaveBeenCalled();
    expect(getActiveAccountId()).toBe('account-a');
  });

  it.each([
    { active: null, subject: 'subject-a', anonymous: false },
    { active: 'account-b', subject: 'subject-a', anonymous: false },
    { active: 'account-a', subject: 'other-subject', anonymous: false },
    { active: 'account-a', subject: 'subject-a', anonymous: true },
  ])(
    'does not infer a binding for active $active, subject $subject, anonymous $anonymous',
    async ({ active, subject, anonymous }) => {
      const values = rememberedAccounts();
      values.set(
        'gurudevi-device-accounts',
        JSON.stringify([{ accountId: 'account-a', authUserId: subject, isAnonymous: anonymous }]),
      );
      setActiveAccountId(active);
      const rotated = sessionFor('subject-a');
      mockGetSession.mockResolvedValue(rotated);
      await expect(deviceAccounts.retainRefreshedSession(rotated)).resolves.toBeNull();
      expect(mockSetStoredSessionForAccount).not.toHaveBeenCalled();
      expect(getActiveAccountId()).toBe(active);
    },
  );

  it('rejects a superseded refresh without poisoning retention of the current token', async () => {
    const values = rememberedAccounts();
    values.set(
      'gurudevi-device-accounts',
      JSON.stringify([{ accountId: 'account-a', authUserId: 'subject-a', isAnonymous: false }]),
    );
    setActiveAccountId('account-a');
    const original = sessionFor('subject-a');
    const rotated = {
      ...original,
      access_token: 'rotated-access',
      refresh_token: 'rotated-refresh',
    };
    mockGetSession.mockResolvedValue(rotated);
    const old = deviceAccounts.retainRefreshedSession(original);
    const rejected = expect(old).rejects.toMatchObject({ code: 'AUTH_SESSION_CHANGED' });
    const current = deviceAccounts.retainRefreshedSession(rotated);
    await Promise.all([rejected, current]);
    expect(mockSetStoredSessionForAccount).toHaveBeenCalledOnce();
    expect(mockSetStoredSessionForAccount).toHaveBeenCalledWith('account-a', {
      access_token: 'rotated-access',
      refresh_token: 'rotated-refresh',
    });
  });

  it('reports secure-storage failure during retention and permits retry', async () => {
    const values = rememberedAccounts();
    values.set(
      'gurudevi-device-accounts',
      JSON.stringify([{ accountId: 'account-a', authUserId: 'subject-a', isAnonymous: false }]),
    );
    setActiveAccountId('account-a');
    const rotated = sessionFor('subject-a');
    mockGetSession.mockResolvedValue(rotated);
    mockSetStoredSessionForAccount.mockRejectedValueOnce(new Error('secure storage unavailable'));
    await expect(deviceAccounts.retainRefreshedSession(rotated)).rejects.toThrow(
      'secure storage unavailable',
    );
    await expect(deviceAccounts.retainRefreshedSession(rotated)).resolves.toBe('account-a');
    expect(getActiveAccountId()).toBe('account-a');
  });
});
