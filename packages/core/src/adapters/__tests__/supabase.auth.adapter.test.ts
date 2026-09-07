import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockAuth = vi.hoisted(() => ({
  getSession: vi.fn(),
  getUser: vi.fn(),
  signInWithPassword: vi.fn(),
  signInWithOtp: vi.fn(),
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

  it('uses the web auth callback for magic links', async () => {
    vi.stubGlobal('window', { location: { origin: 'https://platform.gurudevi.edlove.org' } });
    mockAuth.signInWithOtp.mockResolvedValue({ data: { user: null, session: null }, error: null });

    await adapter.signInWithMagicLink('member@example.com');

    expect(mockAuth.signInWithOtp).toHaveBeenCalledWith({
      email: 'member@example.com',
      options: { emailRedirectTo: 'https://platform.gurudevi.edlove.org/auth/callback' },
    });
  });
});
