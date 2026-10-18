import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockLogAuditEvent = vi.hoisted(() => vi.fn());

vi.mock('../../../api/deviceTrust', () => ({
  deviceTrustAPI: {
    logAuditEvent: mockLogAuditEvent,
  },
}));

import { AuthManager } from '../AuthManager';

describe('AuthManager', { tags: ['security', 'fast'] }, () => {
  const authPort = {
    getSession: vi.fn(),
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    signInWithPhoneOtp: vi.fn(),
    verifyPhoneOtp: vi.fn(),
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

  it('delegates phone OTP without recording provider identity as an account audit', async () => {
    authPort.signInWithPhoneOtp.mockResolvedValue(undefined);
    const verified = { user: { id: 'provider-subject' }, session: { access_token: 'session' } };
    authPort.verifyPhoneOtp.mockResolvedValue(verified);

    await expect(manager.signInWithPhoneOtp({ phone: '+94771234567' })).resolves.toBeUndefined();
    await expect(manager.verifyPhoneOtp({ phone: '+94771234567', token: '123456' })).resolves.toBe(
      verified,
    );

    expect(authPort.signInWithPhoneOtp).toHaveBeenCalledWith({ phone: '+94771234567' });
    expect(authPort.verifyPhoneOtp).toHaveBeenCalledWith({
      phone: '+94771234567',
      token: '123456',
    });
    expect(mockLogAuditEvent).not.toHaveBeenCalled();
  });

  it('requires password sign-up to return an active session', async () => {
    authPort.signUp.mockResolvedValue({ user: { id: 'user-1' }, session: null });

    await expect(manager.signUp('person@example.com', 'secure-password')).rejects.toMatchObject({
      code: 'AUTH_SIGN_UP_SESSION_MISSING',
    });

    expect(authPort.signUp).toHaveBeenCalledWith({
      email: 'person@example.com',
      password: 'secure-password',
      options: {
        data: { display_name: undefined },
      },
    });
    expect(mockLogAuditEvent).not.toHaveBeenCalled();
  });

  it('records a password sign-up only after Supabase returns an active session', async () => {
    const result = { user: { id: 'user-1' }, session: { access_token: 'access-token' } };
    authPort.signUp.mockResolvedValue(result);

    await expect(manager.signUp('person@example.com', 'secure-password', 'Person')).resolves.toBe(
      result,
    );

    expect(mockLogAuditEvent).toHaveBeenCalledWith(
      'AUTH_SIGN_UP_PASSWORD',
      expect.objectContaining({ outcome: 'success', hasSession: true }),
      undefined,
    );
  });

  it('preserves the claimed guest capacity in the authenticated profile', async () => {
    authPort.updateUser.mockResolvedValue({ user: { id: 'supabase-user-1' } });
    identityPort.identifyActiveCitizen.mockResolvedValue({ id: 'internal-user-1' });

    await manager.linkAnonymousToEmail(
      'person@example.com',
      'secure-password',
      'Person',
      'guardian',
    );

    expect(identityPort.updateProfile).toHaveBeenCalledWith(
      'internal-user-1',
      expect.objectContaining({ capacity: 'guardian', onboarding_completed: true }),
    );
    expect(mockLogAuditEvent).toHaveBeenCalledWith(
      'AUTH_LINK_ANONYMOUS_TO_EMAIL',
      expect.objectContaining({ capacity: 'guardian' }),
      'internal-user-1',
    );
  });

  it('links an email to the current anonymous subject instead of creating a second session', async () => {
    authPort.getSession.mockResolvedValue({ user: { id: 'guest-1', is_anonymous: true } });
    authPort.updateUser.mockResolvedValue({ user: { id: 'guest-1' } });

    await manager.linkAnonymousEmail('person@example.com', 'gurudevi://auth/callback');

    expect(authPort.updateUser).toHaveBeenCalledWith({
      email: 'person@example.com',
      options: { emailRedirectTo: 'gurudevi://auth/callback' },
    });
    expect(authPort.signInWithPassword).not.toHaveBeenCalled();
    expect(mockLogAuditEvent).toHaveBeenCalledWith(
      'AUTH_LINK_ANONYMOUS_EMAIL_STARTED',
      expect.objectContaining({ method: 'email_link', outcome: 'initiated' }),
      'guest-1',
    );
  });

  it('refuses anonymous-email linking without an anonymous session', async () => {
    authPort.getSession.mockResolvedValue({ user: { id: 'member-1', is_anonymous: false } });

    await expect(manager.linkAnonymousEmail('person@example.com')).rejects.toMatchObject({
      code: 'AUTH_GUEST_REQUIRED',
    });
    expect(authPort.updateUser).not.toHaveBeenCalled();
  });

  it('keeps password recovery separate from sign-in and records completion only after update', async () => {
    authPort.resetPasswordForEmail.mockResolvedValue(undefined);
    authPort.updateUser.mockResolvedValue({ user: { id: 'member-1' } });

    await manager.requestPasswordRecovery('member@example.com', 'gurudevi://auth/callback');
    await manager.updatePassword('new-secure-password');

    expect(authPort.resetPasswordForEmail).toHaveBeenCalledWith(
      'member@example.com',
      'gurudevi://auth/callback',
    );
    expect(authPort.signInWithPassword).not.toHaveBeenCalled();
    expect(authPort.updateUser).toHaveBeenCalledWith({ password: 'new-secure-password' });
    expect(mockLogAuditEvent).toHaveBeenCalledWith(
      'AUTH_PASSWORD_RECOVERY_COMPLETED',
      expect.objectContaining({ outcome: 'success' }),
      'member-1',
    );
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

  it('requests account deletion without deleting the account or signing out', async () => {
    vi.when(authPort.executeRpc)
      .calledWith('request_account_deletion')
      .thenResolve([
        {
          status: 'pending_verification',
          request_id: 'request-1',
          requested_at: '2026-09-01T00:00:00.000Z',
          reason: 'fresh_authentication_required',
        },
      ]);

    const managerWithHooks = new AuthManager(authPort as any, identityPort as any, {
      storage: {
        clearAll: vi.fn(),
      },
    });

    const result = await managerWithHooks.requestAccountDeletion();

    expect(authPort.executeRpc).toHaveBeenCalledWith('request_account_deletion');
    expect(authPort.signOut).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: 'pending_verification',
      request_id: 'request-1',
      requested_at: '2026-09-01T00:00:00.000Z',
      reason: 'fresh_authentication_required',
    });
  });

  it('rejects an invalid deletion-request response instead of treating it as success', async () => {
    authPort.executeRpc.mockResolvedValue([]);

    await expect(manager.requestAccountDeletion()).rejects.toThrow(
      'Account deletion request returned an invalid response.',
    );
    expect(authPort.signOut).not.toHaveBeenCalled();
  });

  it('reads no deletion request as an empty status instead of an invalid response', async () => {
    authPort.executeRpc.mockResolvedValue([]);

    await expect(manager.getAccountDeletionRequestStatus()).resolves.toBeNull();
    expect(authPort.executeRpc).toHaveBeenCalledWith('get_account_deletion_request_status');
  });

  it('reads the latest deletion request status from the table-function response', async () => {
    authPort.executeRpc.mockResolvedValue([
      {
        status: 'scheduled',
        request_id: 'request-1',
        requested_at: '2026-09-01T00:00:00.000Z',
        scheduled_for: '2026-10-01T00:00:00.000Z',
        reason: '',
      },
    ]);

    await expect(manager.getAccountDeletionRequestStatus()).resolves.toEqual({
      status: 'scheduled',
      request_id: 'request-1',
      requested_at: '2026-09-01T00:00:00.000Z',
      scheduled_for: '2026-10-01T00:00:00.000Z',
      reason: '',
    });
  });

  it('cancels an active pending deletion request through the server rpc', async () => {
    authPort.executeRpc.mockResolvedValue([
      {
        status: 'cancelled',
        request_id: 'request-1',
        requested_at: '2026-09-01T00:00:00.000Z',
        reason: 'cancelled_by_user',
      },
    ]);

    await expect(manager.cancelAccountDeletionRequest()).resolves.toEqual({
      status: 'cancelled',
      request_id: 'request-1',
      requested_at: '2026-09-01T00:00:00.000Z',
      reason: 'cancelled_by_user',
    });
    expect(authPort.executeRpc).toHaveBeenCalledWith('cancel_account_deletion_request');
  });

  it('reads the server-owned account lifecycle status without mutating state', async () => {
    authPort.executeRpc.mockResolvedValue([
      {
        status: 'deactivated',
        deactivated_at: '2026-09-01T00:00:00.000Z',
        request_id: 'request-1',
        scheduled_for: '2026-10-01T00:00:00.000Z',
        reason: 'account_deletion_requested',
      },
    ]);

    await expect(manager.getAccountLifecycleStatus()).resolves.toEqual({
      status: 'deactivated',
      deactivated_at: '2026-09-01T00:00:00.000Z',
      request_id: 'request-1',
      scheduled_for: '2026-10-01T00:00:00.000Z',
      reason: 'account_deletion_requested',
    });
    expect(authPort.executeRpc).toHaveBeenCalledWith('get_account_lifecycle_status');
    expect(authPort.signOut).not.toHaveBeenCalled();
  });

  it('rejects an empty lifecycle-status response instead of inventing an active account', async () => {
    authPort.executeRpc.mockResolvedValue([]);

    await expect(manager.getAccountLifecycleStatus()).rejects.toThrow(
      'Account lifecycle status returned an invalid response.',
    );
    expect(authPort.signOut).not.toHaveBeenCalled();
  });
});
