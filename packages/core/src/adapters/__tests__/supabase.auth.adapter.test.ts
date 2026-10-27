import { beforeEach, describe, expect, it, vi } from 'vitest';

const passwordBoundary = vi.hoisted(() => ({ fetch: vi.fn(), assert: vi.fn(), owner: vi.fn() }));
vi.mock('@repo/core/api/base', () => ({
  SOVEREIGN_ORPC_URL: 'https://sanctuary.example.invalid/api',
}));
vi.mock('@repo/core/api/clientRuntime', () => ({
  authenticatedSovereignFetch: passwordBoundary.fetch,
  assertActiveRequestAccount: passwordBoundary.assert,
}));
vi.mock('@repo/core/lib/accountScope', () => ({ getActiveAccountId: passwordBoundary.owner }));

const mockAuth = vi.hoisted(() => ({
  getSession: vi.fn(),
  getUser: vi.fn(),
  signInWithPassword: vi.fn(),
  signInWithOtp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  reauthenticate: vi.fn(),
  signInWithOAuth: vi.fn(),
  linkIdentity: vi.fn(),
  setSession: vi.fn(),
  signUp: vi.fn(),
  signInAnonymously: vi.fn(),
  updateUser: vi.fn(),
  signOut: vi.fn(),
  passkey: {
    signIn: vi.fn(),
    register: vi.fn(),
  },
  mfa: {
    listFactors: vi.fn(),
    enroll: vi.fn(),
    challenge: vi.fn(),
    verify: vi.fn(),
    challengeAndVerify: vi.fn(),
  },
}));

vi.mock('@repo/core/adapters/supabaseClient', () => ({
  supabaseClient: {
    auth: mockAuth,
    rpc: vi.fn(),
  },
}));

import { SupabaseAuthAdapter } from '../supabase/auth.adapter';

describe('SupabaseAuthAdapter', () => {
  const adapter = new SupabaseAuthAdapter();

  beforeEach(() => {
    vi.clearAllMocks();
    passwordBoundary.fetch.mockReset();
    passwordBoundary.assert.mockReset();
    passwordBoundary.owner.mockReturnValue('123e4567-e89b-8101-8100-426614174000');
  });

  it('unlinks a credential through Sanctuary with a subject-bound receipt', async () => {
    const user = { id: 'f0560000-0000-4000-8000-000000000001', is_anonymous: false };
    const identityId = 'f0560000-0000-4000-8000-000000000002';
    mockAuth.getSession.mockResolvedValue({
      data: { session: { user, access_token: 'synthetic-access' } },
      error: null,
    });
    passwordBoundary.fetch.mockResolvedValue(
      Response.json({
        accountId: '123e4567-e89b-8101-8100-426614174000',
        operationId: 'f0560000-0000-4000-8000-000000000003',
        receiptId: 'f0560000-0000-4000-8000-000000000004',
        identityId,
        provider: 'google',
        status: 'confirmed',
        user: { id: user.id },
      }),
    );
    expect(await adapter.unlinkIdentity({ identityId, expectedSubject: user.id })).toEqual({
      user: { id: user.id },
    });
    expect(passwordBoundary.fetch).toHaveBeenCalledWith(
      'https://sanctuary.example.invalid/api/auth/credentials/identities/unlink',
      expect.objectContaining({
        method: 'POST',
        cache: 'no-store',
        body: JSON.stringify({ identityId }),
      }),
      '123e4567-e89b-8101-8100-426614174000',
    );
  });
  it('rejects credential unlink before dispatch if the expected subject changed', async () => {
    mockAuth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'new-subject', is_anonymous: false },
          access_token: 'synthetic-access',
        },
      },
      error: null,
    });
    await expect(
      adapter.unlinkIdentity({
        identityId: 'f0560000-0000-4000-8000-000000000002',
        expectedSubject: 'old-subject',
      }),
    ).rejects.toMatchObject({ code: 'AUTH_SESSION_CHANGED' });
    expect(passwordBoundary.fetch).not.toHaveBeenCalled();
  });
  it('surfaces recovery protection without retrying credential unlink', async () => {
    mockAuth.getSession.mockResolvedValue({
      data: {
        session: { user: { id: 'subject', is_anonymous: false }, access_token: 'synthetic-access' },
      },
      error: null,
    });
    passwordBoundary.fetch.mockResolvedValue(
      Response.json({ error: 'RECOVERY_CREDENTIAL_REQUIRED' }, { status: 409 }),
    );
    await expect(
      adapter.unlinkIdentity({ identityId: 'f0560000-0000-4000-8000-000000000002' }),
    ).rejects.toMatchObject({ code: 'RECOVERY_CREDENTIAL_REQUIRED' });
    expect(passwordBoundary.fetch).toHaveBeenCalledTimes(1);
  });
  it('requests provider confirmation explicitly without changing a password', async () => {
    mockAuth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'provider-subject', is_anonymous: false } } },
      error: null,
    });
    mockAuth.reauthenticate.mockResolvedValue({ error: null });
    await expect(adapter.requestPasswordReauthentication()).resolves.toBeUndefined();
    expect(mockAuth.reauthenticate).toHaveBeenCalledTimes(1);
    expect(passwordBoundary.assert).toHaveBeenCalledWith('123e4567-e89b-8101-8100-426614174000');
    expect(mockAuth.updateUser).not.toHaveBeenCalled();
    expect(passwordBoundary.fetch).not.toHaveBeenCalled();
  });
  it.each([null, { user: { id: 'guest', is_anonymous: true } }])(
    'denies confirmation without a non-anonymous session: %j',
    async (session) => {
      mockAuth.getSession.mockResolvedValue({ data: { session }, error: null });
      await expect(adapter.requestPasswordReauthentication()).rejects.toMatchObject({
        code: 'AUTH_REQUIRED',
      });
      expect(mockAuth.reauthenticate).not.toHaveBeenCalled();
    },
  );
  it('does not expose provider delivery failure details or claim a code was sent', async () => {
    mockAuth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'provider-subject', is_anonymous: false } } },
      error: null,
    });
    mockAuth.reauthenticate.mockResolvedValue({
      error: { message: 'synthetic-private-delivery-detail' },
    });
    await expect(adapter.requestPasswordReauthentication()).rejects.toMatchObject({
      code: 'AUTH_REAUTHENTICATION_UNAVAILABLE',
      message: 'Could not request password confirmation. Try again.',
    });
    expect(passwordBoundary.assert).not.toHaveBeenCalled();
  });
  it('rejects a stale confirmation completion after the credential subject changes', async () => {
    mockAuth.getSession
      .mockResolvedValueOnce({
        data: { session: { user: { id: 'old-subject', is_anonymous: false } } },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { session: { user: { id: 'new-subject', is_anonymous: false } } },
        error: null,
      });
    mockAuth.reauthenticate.mockResolvedValue({ error: null });
    await expect(adapter.requestPasswordReauthentication()).rejects.toMatchObject({
      code: 'AUTH_SESSION_CHANGED',
    });
  });
  it('routes password changes through Sanctuary and preserves the credential subject', async () => {
    const user = { id: 'f0540000-0000-4000-8000-000000000001', is_anonymous: false };
    mockAuth.getSession.mockResolvedValue({
      data: { session: { user, access_token: 'synthetic-access' } },
      error: null,
    });
    passwordBoundary.fetch.mockResolvedValue(
      Response.json({
        accountId: '123e4567-e89b-8101-8100-426614174000',
        operationId: 'f0540000-0000-4000-8000-000000000002',
        receiptId: 'f0540000-0000-4000-8000-000000000003',
        status: 'confirmed',
        user: { id: user.id },
      }),
    );
    expect(await adapter.updateUser({ password: 'synthetic-password' })).toEqual({
      user: { id: user.id },
    });
    expect(passwordBoundary.fetch).toHaveBeenCalledWith(
      'https://sanctuary.example.invalid/api/auth/credentials/password',
      expect.objectContaining({
        method: 'POST',
        cache: 'no-store',
        body: JSON.stringify({ password: 'synthetic-password' }),
      }),
      '123e4567-e89b-8101-8100-426614174000',
    );
    expect(mockAuth.updateUser).not.toHaveBeenCalled();
  });
  it('forwards confirmation fields only inside the Sanctuary password command', async () => {
    const user = { id: 'f0540000-0000-4000-8000-000000000001', is_anonymous: false };
    mockAuth.getSession.mockResolvedValue({
      data: { session: { user, access_token: 'synthetic-access' } },
      error: null,
    });
    passwordBoundary.fetch.mockResolvedValue(
      Response.json({
        accountId: '123e4567-e89b-8101-8100-426614174000',
        operationId: 'f0540000-0000-4000-8000-000000000002',
        receiptId: 'f0540000-0000-4000-8000-000000000003',
        status: 'confirmed',
        user: { id: user.id },
      }),
    );
    await adapter.updateUser({
      password: 'synthetic-new',
      currentPassword: 'synthetic-old',
      nonce: 'synthetic-nonce',
      expectedSubject: user.id,
    });
    expect(passwordBoundary.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          password: 'synthetic-new',
          currentPassword: 'synthetic-old',
          nonce: 'synthetic-nonce',
        }),
      }),
      expect.any(String),
    );
    expect(mockAuth.updateUser).not.toHaveBeenCalled();
  });
  it.each([
    'PASSWORD_REAUTHENTICATION_REQUIRED',
    'PASSWORD_REAUTHENTICATION_INVALID',
    'PASSWORD_UNCHANGED',
    'PASSWORD_TOO_WEAK',
  ])('preserves a whitelisted corrective error without retrying: %s', async (error) => {
    mockAuth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'provider-subject' }, access_token: 'synthetic-access' } },
      error: null,
    });
    passwordBoundary.fetch.mockResolvedValue(Response.json({ error }, { status: 400 }));
    await expect(adapter.updateUser({ password: 'synthetic-new' })).rejects.toMatchObject({
      code: error,
    });
    expect(passwordBoundary.fetch).toHaveBeenCalledTimes(1);
    expect(mockAuth.updateUser).not.toHaveBeenCalled();
  });
  it('does not echo arbitrary provider errors into client errors', async () => {
    mockAuth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'provider-subject' }, access_token: 'synthetic-access' } },
      error: null,
    });
    passwordBoundary.fetch.mockResolvedValue(
      Response.json({ error: 'synthetic-private-secret' }, { status: 400 }),
    );
    await expect(adapter.updateUser({ password: 'synthetic-new' })).rejects.toMatchObject({
      code: 'AUTH_PASSWORD_CHANGE_UNCONFIRMED',
      message: 'Password change could not be confirmed.',
    });
  });
  it('rejects confirmation without a password before any provider call', async () => {
    await expect(adapter.updateUser({ nonce: 'synthetic-nonce' })).rejects.toMatchObject({
      code: 'INVALID_PASSWORD_CHANGE',
    });
    expect(passwordBoundary.fetch).not.toHaveBeenCalled();
    expect(mockAuth.updateUser).not.toHaveBeenCalled();
  });
  it('denies a changed expected subject before dispatching a password command', async () => {
    mockAuth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'new-subject', is_anonymous: false },
          access_token: 'synthetic-access',
        },
      },
      error: null,
    });
    await expect(
      adapter.updateUser({ password: 'synthetic-new', expectedSubject: 'old-subject' }),
    ).rejects.toMatchObject({ code: 'AUTH_SESSION_CHANGED' });
    expect(passwordBoundary.fetch).not.toHaveBeenCalled();
    expect(mockAuth.updateUser).not.toHaveBeenCalled();
  });
  it('does not bypass server MFA denial with a direct provider password update', async () => {
    mockAuth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'provider-subject', is_anonymous: false },
          access_token: 'synthetic-access',
        },
      },
      error: null,
    });
    passwordBoundary.fetch.mockResolvedValue(new Response(null, { status: 403 }));
    await expect(adapter.updateUser({ password: 'synthetic-password' })).rejects.toMatchObject({
      code: 'RECENT_MFA_REQUIRED',
    });
    expect(mockAuth.updateUser).not.toHaveBeenCalled();
    expect(passwordBoundary.fetch).toHaveBeenCalledTimes(1);
  });
  it('does not silently fall back when password mutation transport fails', async () => {
    mockAuth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'provider-subject', is_anonymous: false },
          access_token: 'synthetic-access',
        },
      },
      error: null,
    });
    passwordBoundary.fetch.mockRejectedValue(new Error('network unavailable'));
    await expect(adapter.updateUser({ password: 'synthetic-password' })).rejects.toThrow(
      'network unavailable',
    );
    expect(mockAuth.updateUser).not.toHaveBeenCalled();
  });
  it('rejects a receipt from an account switched during the operation', async () => {
    const user = { id: 'f0540000-0000-4000-8000-000000000001', is_anonymous: false };
    mockAuth.getSession
      .mockResolvedValueOnce({
        data: { session: { user, access_token: 'synthetic-access' } },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { session: { user: { id: 'changed-subject' } } },
        error: null,
      });
    passwordBoundary.fetch.mockResolvedValue(
      Response.json({
        accountId: '123e4567-e89b-8101-8100-426614174000',
        operationId: 'f0540000-0000-4000-8000-000000000002',
        receiptId: 'f0540000-0000-4000-8000-000000000003',
        status: 'confirmed',
        user: { id: user.id },
      }),
    );
    await expect(adapter.updateUser({ password: 'synthetic-password' })).rejects.toMatchObject({
      code: 'AUTH_SESSION_CHANGED',
    });
    expect(mockAuth.updateUser).not.toHaveBeenCalled();
  });
  it('preserves the explicit anonymous email conversion path', async () => {
    const user = { id: 'guest-subject', is_anonymous: true };
    mockAuth.getSession.mockResolvedValue({
      data: { session: { user, access_token: 'synthetic-access' } },
      error: null,
    });
    mockAuth.updateUser.mockResolvedValue({ data: { user }, error: null });
    await adapter.updateUser({
      email: 'fixture@example.invalid',
      password: 'synthetic-password',
      data: { display_name: 'Fixture' },
    });
    expect(mockAuth.updateUser).toHaveBeenCalledWith(
      {
        email: 'fixture@example.invalid',
        password: 'synthetic-password',
        data: { display_name: 'Fixture' },
      },
      undefined,
    );
    expect(passwordBoundary.fetch).not.toHaveBeenCalled();
  });

  it('signs in with passkey through the Supabase passkey API', async () => {
    mockAuth.passkey.signIn.mockResolvedValue({
      data: { url: 'https://example.com/passkey-signin' },
      error: null,
    });

    const result = await adapter.signInWithPasskey({ redirectTo: 'https://app.example.com' });

    expect(mockAuth.passkey.signIn).toHaveBeenCalledWith({
      options: {
        redirectTo: 'https://app.example.com',
        skipBrowserRedirect: undefined,
      },
    });
    expect(result).toEqual({ url: 'https://example.com/passkey-signin' });
  });

  it('registers a passkey through the Supabase passkey API', async () => {
    mockAuth.passkey.register.mockResolvedValue({
      data: { url: 'https://example.com/passkey-register' },
      error: null,
    });

    const result = await adapter.registerPasskey({ skipBrowserRedirect: true });

    expect(mockAuth.passkey.register).toHaveBeenCalledWith({
      options: {
        redirectTo: undefined,
        skipBrowserRedirect: true,
      },
    });
    expect(result).toEqual({ url: 'https://example.com/passkey-register' });
  });

  it('lists TOTP factors from Supabase MFA', async () => {
    mockAuth.mfa.listFactors.mockResolvedValue({
      data: {
        totp: [
          {
            id: 'totp-1',
            friendly_name: 'Phone',
            factor_type: 'totp',
            status: 'verified',
            created_at: '2026-05-21T00:00:00Z',
            updated_at: '2026-05-21T00:00:00Z',
          },
        ],
        phone: [],
        webauthn: [],
      },
      error: null,
    });

    const result = await adapter.listMfaFactors();

    expect(mockAuth.mfa.listFactors).toHaveBeenCalledTimes(1);
    expect(result.all).toHaveLength(1);
    expect(result.verified).toHaveLength(1);
  });

  it('enrolls TOTP through Supabase MFA', async () => {
    mockAuth.mfa.enroll.mockResolvedValue({
      data: {
        id: 'factor-1',
        totp: {
          qrCode: 'otpauth://totp/test',
          secret: 'ABC123',
          uri: 'otpauth://totp/test?secret=ABC123',
        },
      },
      error: null,
    });

    const result = await adapter.enrollTotp({ friendlyName: 'Parent phone' });

    expect(mockAuth.mfa.enroll).toHaveBeenCalledWith({
      factorType: 'totp',
      friendlyName: 'Parent phone',
    });
    expect(result.factorId).toBe('factor-1');
    expect(result.qrCode).toContain('otpauth://totp/test');
  });

  it('verifies a TOTP code through Supabase MFA', async () => {
    mockAuth.mfa.challengeAndVerify.mockResolvedValue({
      data: {
        user: { id: 'user-1' },
        session: { access_token: 'a', refresh_token: 'r' },
      },
      error: null,
    });

    const result = await adapter.challengeAndVerifyTotp({ factorId: 'factor-1', code: '123456' });

    expect(mockAuth.mfa.challengeAndVerify).toHaveBeenCalledWith({
      factorId: 'factor-1',
      code: '123456',
    });
    expect(result.user?.id).toBe('user-1');
  });

  it('signs in anonymously through Supabase auth API', async () => {
    mockAuth.signInAnonymously.mockResolvedValue({
      data: {
        user: { id: 'anon-1', is_anonymous: true },
        session: { access_token: 'tok_anon', refresh_token: 'ref_anon' },
      },
      error: null,
    });

    const resultWithoutOptions = await adapter.signInAnonymously();
    expect(mockAuth.signInAnonymously).toHaveBeenCalledWith(undefined);
    expect(resultWithoutOptions.user?.id).toBe('anon-1');

    const resultWithOptions = await adapter.signInAnonymously({ data: { role: 'guest' } });
    expect(mockAuth.signInAnonymously).toHaveBeenCalledWith({
      options: { data: { role: 'guest' } },
    });
    expect(resultWithOptions.user?.id).toBe('anon-1');
  });

  it('passes email credentials directly to Supabase password sign-in', async () => {
    mockAuth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'member-1', email: 'member@example.com' },
        session: { access_token: 'access', refresh_token: 'refresh' },
      },
      error: null,
    });

    const result = await adapter.signInWithPassword('member@example.com', 'correct horse battery');

    expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
      email: 'member@example.com',
      password: 'correct horse battery',
    });
    expect(result.user?.id).toBe('member-1');
  });

  it('forwards the app callback when linking an email identity', async () => {
    mockAuth.updateUser.mockResolvedValue({
      data: { user: { id: 'guest-1', is_anonymous: true } },
      error: null,
    });

    const result = await adapter.updateUser({
      email: 'member@example.com',
      options: { emailRedirectTo: 'gurudevi://auth/callback' },
    });

    expect(mockAuth.updateUser).toHaveBeenCalledWith(
      { email: 'member@example.com' },
      { emailRedirectTo: 'gurudevi://auth/callback' },
    );
    expect(result.user?.id).toBe('guest-1');
  });

  it('uses the web auth callback for magic links', async () => {
    vi.stubGlobal('window', { location: { origin: 'https://gurudevi.app' } });
    mockAuth.signInWithOtp.mockResolvedValue({ data: { user: null, session: null }, error: null });

    await adapter.signInWithMagicLink('member@example.com');

    expect(mockAuth.signInWithOtp).toHaveBeenCalledWith({
      email: 'member@example.com',
      options: { emailRedirectTo: 'https://gurudevi.app/auth/callback', shouldCreateUser: true },
    });
  });

  it('sends password recovery through the supplied app callback', async () => {
    mockAuth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });

    await adapter.resetPasswordForEmail('member@example.com', 'gurudevi://auth/callback');

    expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledWith('member@example.com', {
      redirectTo: 'gurudevi://auth/callback',
    });
  });
});
