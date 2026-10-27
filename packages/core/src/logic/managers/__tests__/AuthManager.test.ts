import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockLogAuditEvent = vi.hoisted(() => vi.fn());

vi.mock('../../../api/deviceTrust', () => ({
  deviceTrustAPI: {
    logAuditEvent: mockLogAuditEvent,
  },
}));

import type { IAuthPort } from '../../ports/auth.port';
import type { IIdentityPort } from '../../ports/identity.port';
import { AuthManager } from '../AuthManager';

describe('AuthManager', { tags: ['security', 'fast'] }, () => {
  const canonicalAccount = '123e4567-e89b-8101-8100-426614174000';
  const authPort = {
    getSession: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(),
    signInWithPassword: vi.fn(),
    signInWithMagicLink: vi.fn(),
    exchangeCodeForSession: vi.fn(),
    signInWithGoogleIdToken: vi.fn(),
    linkGoogleIdentity: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    requestPasswordReauthentication: vi.fn(),
    unlinkIdentity: vi.fn(),
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
  } satisfies IAuthPort;

  const identityPort = {
    identifyActiveCitizen: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    linkIdentity: vi.fn(),
    createInitialBond: vi.fn(),
    completeOnboarding: vi.fn(),
    resolveInternalId: vi.fn(),
    getBonds: vi.fn(),
    hasCapacity: vi.fn(),
    getActivePerspective: vi.fn(),
    switchPerspective: vi.fn(),
    blockUser: vi.fn(),
    unblockUser: vi.fn(),
    completeProfile: vi.fn(),
  } satisfies IIdentityPort;

  const manager = new AuthManager(authPort, identityPort);

  beforeEach(() => {
    vi.resetAllMocks();
    identityPort.identifyActiveCitizen.mockResolvedValue({ id: canonicalAccount });
  });

  const queuedMutations: {
    name: string;
    method: keyof typeof authPort;
    start: (subject: AuthManager) => Promise<unknown>;
  }[] = [
    { name: 'verified user lookup', method: 'getUser', start: (subject) => subject.getUser() },
    {
      name: 'password login',
      method: 'signInWithPassword',
      start: (subject) => subject.signIn('person@example.invalid', 'synthetic'),
    },
    {
      name: 'OAuth start',
      method: 'signInWithOAuth',
      start: (subject) => subject.signInWithOAuth('google'),
    },
    {
      name: 'OAuth link',
      method: 'linkOAuthIdentity',
      start: (subject) => subject.linkOAuthIdentity('google'),
    },
    {
      name: 'native Google login',
      method: 'signInWithGoogleIdToken',
      start: (subject) => subject.signInWithGoogleIdToken('synthetic'),
    },
    {
      name: 'native Google link',
      method: 'linkGoogleIdentity',
      start: (subject) => subject.linkGoogleIdentity('synthetic'),
    },
    {
      name: 'magic link',
      method: 'signInWithMagicLink',
      start: (subject) => subject.signInWithMagicLink('person@example.invalid'),
    },
    {
      name: 'recovery email',
      method: 'resetPasswordForEmail',
      start: (subject) => subject.requestPasswordRecovery('person@example.invalid'),
    },
    {
      name: 'password update',
      method: 'updateUser',
      start: (subject) => subject.updatePassword('synthetic'),
    },
    {
      name: 'password reauthentication',
      method: 'requestPasswordReauthentication',
      start: (subject) => subject.requestPasswordReauthentication(),
    },
    {
      name: 'credential unlink',
      method: 'unlinkIdentity',
      start: (subject) => subject.unlinkIdentity('identity-a'),
    },
    {
      name: 'phone request',
      method: 'signInWithPhoneOtp',
      start: (subject) => subject.signInWithPhoneOtp({ phone: '+94771234567' }),
    },
    {
      name: 'phone verification',
      method: 'verifyPhoneOtp',
      start: (subject) => subject.verifyPhoneOtp({ phone: '+94771234567', token: '123456' }),
    },
    {
      name: 'PKCE exchange',
      method: 'exchangeCodeForSession',
      start: (subject) => subject.exchangeCodeForSession('synthetic'),
    },
    {
      name: 'passkey login',
      method: 'signInWithPasskey',
      start: (subject) => subject.signInWithPasskey(),
    },
    {
      name: 'passkey registration',
      method: 'registerPasskey',
      start: (subject) => subject.registerPasskey(),
    },
    { name: 'TOTP enrollment', method: 'enrollTotp', start: (subject) => subject.enrollTotp() },
    {
      name: 'TOTP challenge',
      method: 'challengeTotp',
      start: (subject) => subject.challengeTotp('factor-a'),
    },
    {
      name: 'TOTP verification',
      method: 'verifyTotp',
      start: (subject) =>
        subject.verifyTotp({ factorId: 'factor-a', challengeId: 'challenge-a', code: '123456' }),
    },
    {
      name: 'TOTP challenge and verification',
      method: 'challengeAndVerifyTotp',
      start: (subject) => subject.challengeAndVerifyTotp({ factorId: 'factor-a', code: '123456' }),
    },
    {
      name: 'password signup',
      method: 'signUp',
      start: (subject) => subject.signUp('person@example.invalid', 'synthetic'),
    },
    {
      name: 'anonymous signup',
      method: 'signInAnonymously',
      start: (subject) => subject.signInAnonymously(),
    },
    {
      name: 'remembered session restore',
      method: 'setSession',
      start: (subject) => subject.setSession('synthetic-access', 'synthetic-refresh'),
    },
  ];

  it.each(queuedMutations)(
    'queues $name until outgoing logout finishes',
    async ({ method, start }) => {
      const pending = Promise.withResolvers<void>();
      const onSignOut = vi.fn(() => pending.promise);
      const clear = vi.fn();
      const subject = new AuthManager(authPort, identityPort, {
        onSignOut,
        localState: { clear },
      });
      authPort.signOut.mockResolvedValue(undefined);
      authPort.getSession.mockResolvedValue(null);
      authPort[method].mockResolvedValue({
        user: { id: 'subject-b', is_anonymous: method === 'signInAnonymously' },
        session: { user: { id: 'subject-b' } },
        url: null,
        factorId: 'factor-a',
        challengeId: 'challenge-a',
      });
      const logout = subject.signOut();
      await vi.waitFor(() => expect(onSignOut).toHaveBeenCalledOnce());
      const incoming = start(subject);
      await Promise.resolve();
      expect(authPort[method]).not.toHaveBeenCalled();
      pending.resolve();
      await Promise.all([logout, incoming]);
      expect(authPort[method]).toHaveBeenCalledOnce();
      expect(clear.mock.invocationCallOrder[0]).toBeLessThan(
        authPort[method].mock.invocationCallOrder[0]!,
      );
    },
  );

  it.each(['email', 'password'] as const)(
    'queues guest %s preconditions until outgoing logout finishes',
    async (kind) => {
      const pending = Promise.withResolvers<void>();
      const onSignOut = vi.fn(() => pending.promise);
      const subject = new AuthManager(authPort, identityPort, { onSignOut });
      authPort.getSession.mockResolvedValue(null);
      const logout = subject.signOut();
      await vi.waitFor(() => expect(onSignOut).toHaveBeenCalledOnce());
      const conversion =
        kind === 'email'
          ? subject.linkAnonymousEmail('person@example.invalid')
          : subject.linkAnonymousToEmail(
              'person@example.invalid',
              'synthetic',
              'Person',
              'teacher',
            );
      const denial = expect(conversion).rejects.toMatchObject({ code: 'AUTH_GUEST_REQUIRED' });
      expect(authPort.getSession).not.toHaveBeenCalled();
      pending.resolve();
      await logout;
      await denial;
      expect(authPort.getSession).toHaveBeenCalledOnce();
      expect(authPort.updateUser).not.toHaveBeenCalled();
    },
  );

  it('allows a later login after provider logout rejects', async () => {
    authPort.signOut.mockRejectedValueOnce(new Error('remote unavailable'));
    authPort.signInWithPassword.mockResolvedValue({ user: { id: 'subject-b' }, session: null });
    const clear = vi.fn();
    const subject = new AuthManager(authPort, identityPort, {
      localState: { clear },
    });
    await expect(subject.signOut()).rejects.toBeInstanceOf(AggregateError);
    expect(clear).toHaveBeenCalledOnce();
    expect(await subject.signIn('person@example.invalid', 'synthetic')).toMatchObject({
      user: { id: 'subject-b' },
    });
  });

  it('retains anonymous single-flight behavior and reuses an existing guest', async () => {
    const pending = Promise.withResolvers<{ user: { id: string }; session: null }>();
    authPort.getSession.mockResolvedValue(null);
    authPort.signInAnonymously.mockReturnValueOnce(pending.promise);
    const subject = new AuthManager(authPort, identityPort);
    const first = subject.signInAnonymously();
    const second = subject.signInAnonymously();
    await vi.waitFor(() => expect(authPort.signInAnonymously).toHaveBeenCalledOnce());
    pending.resolve({ user: { id: 'guest-a' }, session: null });
    await Promise.all([first, second]);
    authPort.getSession.mockResolvedValue({ user: { id: 'guest-a', is_anonymous: true } });
    expect(await subject.signInAnonymously()).toMatchObject({ user: { id: 'guest-a' } });
    expect(authPort.signInAnonymously).toHaveBeenCalledOnce();
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
      canonicalAccount,
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
      canonicalAccount,
    );
  });

  it('preserves the claimed guest capacity in the authenticated profile', async () => {
    authPort.getSession.mockResolvedValue({ user: { id: 'supabase-user-1', is_anonymous: true } });
    authPort.updateUser.mockResolvedValue({ user: { id: 'supabase-user-1', is_anonymous: false } });
    identityPort.identifyActiveCitizen.mockResolvedValue({ id: canonicalAccount });

    await manager.linkAnonymousToEmail(
      'person@example.com',
      'secure-password',
      'Person',
      'guardian',
    );

    expect(identityPort.createInitialBond).toHaveBeenCalledWith('guardian', {
      userId: canonicalAccount,
      displayName: 'Person',
      fullName: 'Person',
    });
    expect(identityPort.completeOnboarding).toHaveBeenCalledWith(canonicalAccount);
    expect(identityPort.updateProfile).not.toHaveBeenCalled();
    expect(authPort.updateUser).toHaveBeenCalledWith({
      email: 'person@example.com',
      password: 'secure-password',
      data: { display_name: 'Person' },
    });
    expect(mockLogAuditEvent).toHaveBeenCalledWith(
      'AUTH_LINK_ANONYMOUS_TO_EMAIL',
      expect.objectContaining({ capacity: 'guardian' }),
      canonicalAccount,
    );
  });

  it('does not complete domain onboarding if the credential subject changes during conversion', async () => {
    authPort.getSession.mockResolvedValue({ user: { id: 'guest-a', is_anonymous: true } });
    authPort.updateUser.mockResolvedValue({ user: { id: 'different-account' } });
    await expect(
      manager.linkAnonymousToEmail('person@example.com', 'secure-password', 'Person', 'guardian'),
    ).rejects.toMatchObject({ code: 'AUTH_SESSION_CHANGED' });
    expect(identityPort.createInitialBond).not.toHaveBeenCalled();
    expect(identityPort.completeOnboarding).not.toHaveBeenCalled();
  });

  it('requires provider-confirmed durable conversion before completing domain onboarding', async () => {
    authPort.getSession.mockResolvedValue({ user: { id: 'guest-a', is_anonymous: true } });
    authPort.updateUser.mockResolvedValue({ user: { id: 'guest-a', is_anonymous: true } });
    identityPort.identifyActiveCitizen.mockResolvedValue({ id: canonicalAccount });
    await expect(
      manager.linkAnonymousToEmail('person@example.com', 'secure-password', 'Person', 'guardian'),
    ).rejects.toMatchObject({ code: 'AUTH_CONFIRMATION_REQUIRED' });
    expect(identityPort.createInitialBond).not.toHaveBeenCalled();
    expect(identityPort.completeOnboarding).not.toHaveBeenCalled();
    expect(identityPort.updateProfile).not.toHaveBeenCalled();
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
      canonicalAccount,
    );
  });

  it('refuses anonymous-email linking without an anonymous session', async () => {
    authPort.getSession.mockResolvedValue({ user: { id: 'member-1', is_anonymous: false } });

    await expect(manager.linkAnonymousEmail('person@example.com')).rejects.toMatchObject({
      code: 'AUTH_GUEST_REQUIRED',
    });
    expect(authPort.updateUser).not.toHaveBeenCalled();
  });

  it('keeps recovery initiation separate and records only the confirmed password update', async () => {
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
      'AUTH_PASSWORD_UPDATED',
      expect.objectContaining({ outcome: 'success' }),
      canonicalAccount,
    );
  });

  it('passes credential unlink ownership without inventing password success telemetry', async () => {
    authPort.unlinkIdentity.mockResolvedValue({ user: { id: 'subject' } });
    await expect(manager.unlinkIdentity('identity-id', 'subject')).resolves.toEqual({
      user: { id: 'subject' },
    });
    expect(authPort.unlinkIdentity).toHaveBeenCalledWith({
      identityId: 'identity-id',
      expectedSubject: 'subject',
    });
    expect(mockLogAuditEvent).not.toHaveBeenCalled();
  });
  it('keeps a confirmation-code request separate from password success telemetry', async () => {
    authPort.requestPasswordReauthentication.mockResolvedValue(undefined);
    await manager.requestPasswordReauthentication();
    expect(authPort.requestPasswordReauthentication).toHaveBeenCalledTimes(1);
    expect(authPort.updateUser).not.toHaveBeenCalled();
    expect(mockLogAuditEvent).not.toHaveBeenCalled();
    authPort.requestPasswordReauthentication.mockRejectedValue(new Error('delivery unavailable'));
    await expect(manager.requestPasswordReauthentication()).rejects.toThrow('delivery unavailable');
  });
  it('forwards password confirmation without putting secrets in telemetry', async () => {
    authPort.updateUser.mockResolvedValue({ user: { id: 'member-1' } });
    await manager.updatePassword('synthetic-new-secret', {
      currentPassword: 'synthetic-old-secret',
      nonce: 'synthetic-nonce',
      expectedSubject: 'member-1',
    });
    expect(authPort.updateUser).toHaveBeenCalledWith({
      password: 'synthetic-new-secret',
      currentPassword: 'synthetic-old-secret',
      nonce: 'synthetic-nonce',
      expectedSubject: 'member-1',
    });
    expect(JSON.stringify(mockLogAuditEvent.mock.calls)).not.toMatch(
      /synthetic-(new-secret|old-secret|nonce)/,
    );
  });

  it('does not report a password update after a corrective provider denial', async () => {
    authPort.updateUser.mockRejectedValue(new Error('confirmation required'));
    await expect(manager.updatePassword('synthetic-new-secret')).rejects.toThrow(
      'confirmation required',
    );
    expect(mockLogAuditEvent).not.toHaveBeenCalled();
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
      canonicalAccount,
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
      canonicalAccount,
    );
    expect(result.user?.id).toBe('user-1');
  });

  it('releases runtime, revokes the provider, then clears local account state', async () => {
    authPort.signOut.mockResolvedValue(undefined);
    const onSignOut = vi.fn().mockResolvedValue(undefined);
    const clearAll = vi.fn();

    const managerWithHooks = new AuthManager(authPort, identityPort, {
      onSignOut,
      localState: {
        clear: clearAll,
      },
    });

    await managerWithHooks.signOut();

    expect(onSignOut).toHaveBeenCalledTimes(1);
    expect(clearAll).toHaveBeenCalledTimes(1);
    expect(authPort.signOut).toHaveBeenCalledTimes(1);
    expect(onSignOut.mock.invocationCallOrder[0]).toBeLessThan(
      authPort.signOut.mock.invocationCallOrder[0]!,
    );
    expect(authPort.signOut.mock.invocationCallOrder[0]).toBeLessThan(
      clearAll.mock.invocationCallOrder[0]!,
    );
    expect(mockLogAuditEvent).toHaveBeenCalledWith(
      'AUTH_SIGN_OUT_STARTED',
      expect.objectContaining({
        method: 'session',
        outcome: 'initiated',
      }),
      canonicalAccount,
    );
  });

  it('never attributes provider subjects to canonical account telemetry', async () => {
    authPort.signInWithPassword.mockResolvedValue({
      user: { id: 'provider-subject' },
      session: { access_token: 'synthetic-token' },
    });
    await manager.signIn('person@example.com', 'synthetic-password');
    expect(mockLogAuditEvent).toHaveBeenCalledWith(
      'AUTH_SIGN_IN_PASSWORD',
      expect.objectContaining({ outcome: 'success' }),
      canonicalAccount,
    );
  });

  it('preserves the provider result when account telemetry cannot resolve', async () => {
    const result = { user: { id: 'provider-subject' }, session: null };
    authPort.signInWithPassword.mockResolvedValue(result);
    identityPort.identifyActiveCitizen.mockResolvedValue({ id: 'provider-subject' });
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      expect(await manager.signIn('person@example.com', 'synthetic-password')).toBe(result);
      expect(mockLogAuditEvent).not.toHaveBeenCalled();
      expect(warning).toHaveBeenCalledWith(
        '[AuthManager] auth telemetry has no resolved canonical account',
      );
    } finally {
      warning.mockRestore();
    }
  });

  it('attempts all sign-out boundaries and reports cleanup failures without provider error data', async () => {
    const onSignOut = vi.fn().mockRejectedValue(new Error('private storage detail'));
    const clearAll = vi.fn(() => {
      throw new Error('private storage detail');
    });
    authPort.signOut.mockRejectedValue(new Error('private provider token detail'));
    const subject = new AuthManager(authPort, identityPort, {
      onSignOut,
      localState: { clear: clearAll },
    });
    let failure: unknown;
    try {
      await subject.signOut();
    } catch (error) {
      failure = error;
    }
    expect(failure).toBeInstanceOf(AggregateError);
    if (!(failure instanceof AggregateError)) throw new Error('Expected aggregate failure');
    expect(failure.errors.map((error: Error) => error.message)).toEqual([
      'Platform account teardown failed',
      'Provider sign-out was not confirmed',
      'Account state cleanup failed',
    ]);
    expect(authPort.signOut).toHaveBeenCalledTimes(1);
    expect(clearAll).toHaveBeenCalledTimes(1);
    expect(mockLogAuditEvent).not.toHaveBeenCalledWith(
      'AUTH_SIGN_OUT',
      expect.anything(),
      expect.anything(),
    );
  });

  it('does not report complete logout when cleanup fails but provider revocation succeeds', async () => {
    authPort.signOut.mockResolvedValue(undefined);
    const subject = new AuthManager(authPort, identityPort, {
      onSignOut: async () => {
        throw new Error('cleanup failed');
      },
    });
    await expect(subject.signOut()).rejects.toBeInstanceOf(AggregateError);
    expect(authPort.signOut).toHaveBeenCalledTimes(1);
  });

  it('revokes other sessions without tearing down the current account or storage', async () => {
    authPort.signOut.mockResolvedValue(undefined);
    const onSignOut = vi.fn();
    const clearAll = vi.fn();
    const subject = new AuthManager(authPort, identityPort, {
      onSignOut,
      localState: { clear: clearAll },
    });
    await subject.signOut({ scope: 'others' });
    expect(authPort.signOut).toHaveBeenCalledWith({ scope: 'others' });
    expect(onSignOut).not.toHaveBeenCalled();
    expect(clearAll).not.toHaveBeenCalled();
    expect(mockLogAuditEvent).toHaveBeenCalledWith(
      'AUTH_SIGN_OUT_STARTED',
      expect.objectContaining({ scope: 'others', outcome: 'initiated' }),
      canonicalAccount,
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

    const managerWithHooks = new AuthManager(authPort, identityPort, {
      localState: {
        clear: vi.fn(),
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
