import { AuthManager } from '@repo/core/logic/managers/AuthManager';
import { describe, expect, it, vi } from 'vitest';

const mockAudit = vi.fn();

vi.mock('@repo/core/api/deviceTrust', () => ({
  deviceTrustAPI: {
    logAuditEvent: (...args) => mockAudit(...args),
  },
}));

describe('AuthManager anonymous identity boundary', () => {
  it('allows anonymous Supabase onboarding identity creation', async () => {
    const getSession = vi.fn().mockResolvedValue({ user: null });
    const signInAnonymously = vi.fn().mockResolvedValue({
      session: { id: 'session-1' },
      user: { id: 'anon-1', is_anonymous: true },
    });
    const authPort: any = {
      getSession,
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
      signUp: vi.fn(),
      signInAnonymously,
      updateUser: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
      executeRpc: vi.fn(),
    };
    const identityPort: any = {
      identifyActiveCitizen: vi.fn(),
      updateProfile: vi.fn(),
      linkIdentity: vi.fn(),
    };
    const authManager = new AuthManager(authPort, identityPort);

    await expect(authManager.signInAnonymously()).resolves.toMatchObject({
      user: { is_anonymous: true },
    });
    expect(signInAnonymously).toHaveBeenCalledTimes(1);
  });

  it('reuses the existing anonymous session before creating another one', async () => {
    const getSession = vi.fn().mockResolvedValue({
      user: { id: 'anon-existing', is_anonymous: true },
    });
    const signInAnonymously = vi.fn().mockResolvedValue({
      session: { id: 'session-1' },
      user: { id: 'anon-2', is_anonymous: true },
    });
    const authPort: any = {
      getSession,
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
      signUp: vi.fn(),
      signInAnonymously,
      updateUser: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
      executeRpc: vi.fn(),
    };
    const identityPort: any = {
      identifyActiveCitizen: vi.fn(),
      updateProfile: vi.fn(),
      linkIdentity: vi.fn(),
    };
    const authManager = new AuthManager(authPort, identityPort);

    const result = await authManager.signInAnonymously();
    expect(result).toMatchObject({ user: { id: 'anon-existing' } });
    expect(signInAnonymously).not.toHaveBeenCalled();
  });
});
