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
    upsertCurrentSecuritySession: (...args: unknown[]) =>
      mockUpsertCurrentSecuritySession(...args),
  },
}));

vi.mock('../../api/identity', () => ({
  identityAPI: {
    identifyActiveCitizen: (...args: unknown[]) => mockIdentifyActiveCitizen(...args),
    getProfile: (...args: unknown[]) => mockGetProfile(...args),
  },
}));

vi.mock('../../api/supabase', () => ({
  __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__: {
    auth: {
      setSession: (...args: unknown[]) => mockSetSession(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
    },
  },
}));

vi.mock('../../lib/supabaseAuthStorage', () => ({
  clearLegacySupabaseSession: vi.fn(),
  getStoredSessionForAccount: (...args: unknown[]) => mockGetStoredSessionForAccount(...args),
  removeStoredSessionForAccount: vi.fn(),
  setStoredSessionForAccount: vi.fn(),
}));

vi.mock('../../store/resetScopedStores', () => ({
  rehydrateScopedStores: vi.fn(),
  resetScopedStores: vi.fn(),
}));

vi.mock('../../lib/accountPin', () => ({
  accountPin: {
    removePin: vi.fn(),
  },
}));

import { deviceAccounts } from '../deviceAccounts';
import { setActiveAccountId } from '../../lib/accountScope';

describe('deviceAccounts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActiveAccountId(null);
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
    expect(mockUpsertCurrentSecuritySession).toHaveBeenCalledWith(
      expect.objectContaining({ accountId: 'account-1', authStrength: 'session' }),
    );
  });

  it('switches to a stored account session', async () => {
    mockGetString.mockImplementation((key: string) => {
      if (key.includes('sb-')) {
        return JSON.stringify({ access_token: 'token-a', refresh_token: 'token-r' });
      }
      if (key === 'gurudevi-device-accounts') {
        return JSON.stringify([{ accountId: 'account-1', lastUsedAt: '2026-01-01T00:00:00.000Z' }]);
      }
      return null;
    });
    mockGetStoredSessionForAccount.mockResolvedValue({
      access_token: 'token-a',
      refresh_token: 'token-r',
    });
    mockSetSession.mockResolvedValue({ error: null });
    mockTouchCurrentDevice.mockResolvedValue({ isTrusted: true });

    await deviceAccounts.switchTo('account-1');

    expect(mockSetSession).toHaveBeenCalledWith({
      access_token: 'token-a',
      refresh_token: 'token-r',
    });
    expect(mockTouchCurrentDevice).toHaveBeenCalledWith('account-1');
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

    await deviceAccounts.signOutCurrentAccount();

    expect(mockRevokeMyInstallSecuritySessions).toHaveBeenCalled();
    expect(mockSignOut).toHaveBeenCalledWith({ scope: 'local' });
  });

  it('falls back to the next stored account when removing the active one', async () => {
    setActiveAccountId('account-1');
    mockGetStoredSessionForAccount.mockImplementation((accountId: string) =>
      Promise.resolve(
        accountId === 'account-2'
          ? { access_token: 'token-b', refresh_token: 'token-s' }
          : { access_token: 'token-a', refresh_token: 'token-r' },
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

    expect(mockSetSession).toHaveBeenCalledWith({
      access_token: 'token-b',
      refresh_token: 'token-s',
    });
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
  });
});
