import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockLogAuditEvent = vi.hoisted(() => vi.fn());

vi.mock('../../../api/deviceTrust', () => ({
  deviceTrustAPI: {
    logAuditEvent: mockLogAuditEvent,
  },
}));

import { AuthManager } from '../AuthManager';

describe('AuthManager', () => {
  const authPort = {
    getSession: vi.fn(),
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signInWithOAuth: vi.fn(),
    linkOAuthIdentity: vi.fn(),
    signInWithPasskey: vi.fn(),
    registerPasskey: vi.fn(),
    listMfaFactors: vi.fn(),
    enrollTotp: vi.fn(),
    challengeTotp: vi.fn(),
    verifyTotp: vi.fn(),
    challengeAndVerifyTotp: vi.fn(),
    setSession: vi.fn(),
    signUp: vi.fn(),
    signInAnonymously: vi.fn(),
    updateUser: vi.fn(),
    signOut: vi.fn(),
    executeRpc: vi.fn(),
  };

  const identityPort = {
    identifyActiveCitizen: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    linkIdentity: vi.fn(),
  };

  const manager = new AuthManager(authPort as any, identityPort as any);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs passkey sign-in attempts', async () => {
    authPort.signInWithPasskey.mockResolvedValue({ url: 'https://example.com/passkey' });

    const result = await manager.signInWithPasskey('https://app.example.com', true);

    expect(authPort.signInWithPasskey).toHaveBeenCalledWith({
      redirectTo: 'https://app.example.com',
      skipBrowserRedirect: true,
    });
    expect(mockLogAuditEvent).toHaveBeenCalledWith(
      'AUTH_SIGN_IN_PASSKEY_STARTED',
      expect.objectContaining({
        method: 'passkey',
        outcome: 'initiated',
        hasUrl: true,
      }),
      undefined,
    );
    expect(result).toEqual({ url: 'https://example.com/passkey' });
  });

  it('logs TOTP enrollments and returns the adapter result', async () => {
    authPort.enrollTotp.mockResolvedValue({ factorId: 'factor-1', qrCode: 'otpauth://totp/test' });

    const result = await manager.enrollTotp('Parent phone');

    expect(authPort.enrollTotp).toHaveBeenCalledWith({ friendlyName: 'Parent phone' });
    expect(mockLogAuditEvent).toHaveBeenCalledWith(
      'AUTH_ENROLL_TOTP_STARTED',
      expect.objectContaining({
        method: 'totp',
        outcome: 'initiated',
        friendlyName: 'Parent phone',
        factorId: 'factor-1',
      }),
      undefined,
    );
    expect(result.factorId).toBe('factor-1');
  });

  it('logs successful TOTP verification with the resolved user id', async () => {
    authPort.challengeAndVerifyTotp.mockResolvedValue({
      user: { id: 'user-1' },
      session: { access_token: 'a' },
    });

    const result = await manager.challengeAndVerifyTotp({
      factorId: 'factor-1',
      code: '123456',
    });

    expect(authPort.challengeAndVerifyTotp).toHaveBeenCalledWith({
      factorId: 'factor-1',
      code: '123456',
    });
    expect(mockLogAuditEvent).toHaveBeenCalledWith(
      'AUTH_TOTP_VERIFIED',
      expect.objectContaining({
        method: 'totp',
        outcome: 'success',
        factorId: 'factor-1',
        hasSession: true,
      }),
      'user-1',
    );
    expect(result.user?.id).toBe('user-1');
  });

  it('runs logout teardown before remote sign-out', async () => {
    authPort.signOut.mockResolvedValue(undefined);
    const onSignOut = vi.fn().mockResolvedValue(undefined);
    const clearAll = vi.fn();

    const managerWithHooks = new AuthManager(authPort as any, identityPort as any, {
      onSignOut,
      storage: {
        clearAll,
      },
    });

    await managerWithHooks.signOut();

    expect(onSignOut).toHaveBeenCalledTimes(1);
    expect(clearAll).toHaveBeenCalledTimes(1);
    expect(authPort.signOut).toHaveBeenCalledTimes(1);
    expect(mockLogAuditEvent).toHaveBeenCalledWith(
      'AUTH_SIGN_OUT',
      expect.objectContaining({
        method: 'session',
        outcome: 'success',
      }),
      undefined,
    );
  });

  it('continues account deletion by signing out after remote removal', async () => {
    authPort.executeRpc.mockResolvedValue(undefined);
    authPort.signOut.mockResolvedValue(undefined);

    const managerWithHooks = new AuthManager(authPort as any, identityPort as any, {
      storage: {
        clearAll: vi.fn(),
      },
    });

    await managerWithHooks.deleteAccount();

    expect(authPort.executeRpc).toHaveBeenCalledWith('delete_user_account');
    expect(authPort.signOut).toHaveBeenCalledTimes(1);
  });
});
