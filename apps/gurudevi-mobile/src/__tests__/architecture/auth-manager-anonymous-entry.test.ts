import { describe, expect, it, vi } from 'vitest';
import { AuthManager } from '@repo/core/logic/managers/AuthManager';

const mockAudit = vi.fn();

vi.mock('@repo/core/api/deviceTrust', () => ({
  deviceTrustAPI: {
    logAuditEvent: (...args: unknown[]) => mockAudit(...args),
  },
}));

describe('AuthManager anonymous entry', () => {
  it('reuses an existing anonymous session instead of creating a new one', async () => {
    const getSession = vi.fn().mockResolvedValue({
      user: { id: 'anon-1', is_anonymous: true },
    });
    const signInAnonymously = vi.fn();
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

    await expect(authManager.signInAnonymously()).resolves.toEqual({
      session: { user: { id: 'anon-1', is_anonymous: true } },
      user: { id: 'anon-1', is_anonymous: true },
    });

    expect(signInAnonymously).not.toHaveBeenCalled();
  });

  it('serializes anonymous sign-in calls into a single provider request', async () => {
    const getSession = vi.fn().mockResolvedValue({ user: null });
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

    const [first, second] = await Promise.all([
      authManager.signInAnonymously(),
      authManager.signInAnonymously(),
    ]);

    expect(signInAnonymously).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
  });
});
