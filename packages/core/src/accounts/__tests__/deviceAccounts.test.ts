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
    setSession: (...args: unknown[]) => mockSetSession(...args),
    signOut: (...args: unknown[]) => mockSignOut(...args),
  },
}));

vi.mock('../../lib/supabaseAuthStorage', () => ({
  clearLegacySupabaseSession: vi.fn(),
  getStoredSessionForAccount: (...args: unknown[]) => mockGetStoredSessionForAccount(...args),
  removeStoredSessionForAccount: vi.fn(),
  setStoredSessionForAccount: vi.fn(),
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
}));

import { setActiveAccountId } from '../../lib/accountScope';
import { useMutationQueue } from '../../lib/sync/useMutationQueue';
import { deviceAccounts } from '../deviceAccounts';

const validAccessToken =
  'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1c2VyLTEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJleHAiOjQxMDI0NDQ4MDB9.signature';
const validRefreshToken = 'refresh-token-for-test';

describe('deviceAccounts', () => {
  beforeEach(() => {
    setActiveAccountId(null);
    // Resetting persisted queue state may write an empty snapshot. Clear mocks
    // after that fixture work so account-capture assertions observe only calls
    // made by the operation under test.
    useMutationQueue.setState({ queue: [], deadLetterQueue: [], isSyncing: false });
    vi.clearAllMocks();
    mockLogAuditEvent.mockResolvedValue(undefined);
    mockSyncCurrentAccountDevice.mockResolvedValue(null);
    mockTouchCurrentDevice.mockResolvedValue(null);
    mockUpsertCurrentSecuritySession.mockResolvedValue(undefined);
    mockRevokeMyInstallSecuritySessions.mockResolvedValue(undefined);
  });

  it('captures the active account and stores scoped session tokens', async () => {
    mockIdentifyActiveCitizen.mockResolvedValue({ id: 'account-1' });
    mockGetString.mockReturnValue(null);

    const session = {
      access_token: 'a',
      refresh_token: 'r',
      user: { id: 'user-1', email: 'user@example.com', user_metadata: { display_name: 'Naween' } },
    } as any;

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

    expect(mockSetSession).toHaveBeenCalledWith(
      validAccessToken,
      validRefreshToken,
    );
    expect(mockTouchCurrentDevice).toHaveBeenCalledWith('account-1');
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
    mockGetString.mockReturnValue(JSON.stringify([
      { accountId: 'account-1', lastUsedAt: '2026-01-01T00:00:00.000Z' },
      { accountId: 'account-2', lastUsedAt: '2026-01-02T00:00:00.000Z' },
    ]));

    await deviceAccounts.switchTo('account-2');

    expect(mockClearPowerSyncAccount).toHaveBeenCalledOnce();
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
});
