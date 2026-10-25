import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { verifySupabaseSessionDetails } from '../core/adapters/verifySupabaseSession';
import { resolveAuthenticatedAccount } from '../core/authenticatedAccount';
import { appendAuthCredentialAudit } from '../core/authSessionAudit';
import { createAuthCredentialRoutes } from '../core/routes/authCredentials';

vi.mock('../core/adapters/verifySupabaseSession', () => ({
  verifySupabaseSessionDetails: vi.fn(),
}));
vi.mock('../core/authenticatedAccount', () => ({ resolveAuthenticatedAccount: vi.fn() }));
vi.mock('../core/authSessionAudit', () => ({
  appendAuthCredentialAudit: vi.fn(),
  appendAuthPasswordAudit: vi.fn(),
}));
const subject = 'f0560000-0000-4000-8000-000000000001';
const googleId = 'f0560000-0000-4000-8000-000000000002';
const emailId = 'f0560000-0000-4000-8000-000000000003';
const receipt = 'f0560000-0000-4000-8000-000000000004';
const account = '123e4567-e89b-8101-8100-426614174000';
const now = 1792944000000;
const google = { identity_id: googleId, user_id: subject, provider: 'google' };
const email = { identity_id: emailId, user_id: subject, provider: 'email' };
const claims = {
  sub: subject,
  aal: 'aal2',
  is_anonymous: false,
  amr: [{ method: 'totp', timestamp: now / 1000 - 10 }],
};
const user = {
  id: subject,
  is_anonymous: false,
  email_confirmed_at: '2026-10-25T00:00:00Z',
  factors: [{ id: receipt, factor_type: 'totp', status: 'verified' as const }],
  identities: [google, email],
};
const app = createAuthCredentialRoutes();
const post = (body: unknown = { identityId: googleId }) =>
  app.request('/credentials/identities/unlink', {
    method: 'POST',
    headers: { Authorization: 'Bearer synthetic-token', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.spyOn(Date, 'now').mockReturnValue(now);
  vi.stubEnv('SUPABASE_URL', 'https://unlink.example.invalid');
  vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', 'synthetic-public');
  vi.mocked(verifySupabaseSessionDetails).mockResolvedValue({ claims, user });
  vi.mocked(resolveAuthenticatedAccount).mockResolvedValue({ id: account });
  vi.mocked(appendAuthCredentialAudit).mockResolvedValue(receipt);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
  vi.unstubAllEnvs();
});

describe('G1 credential unlink with provider and persistence boundaries substituted', () => {
  it('records initiation before DELETE and requires a fresh inventory before confirmation', async () => {
    vi.mocked(verifySupabaseSessionDetails)
      .mockResolvedValueOnce({ claims, user })
      .mockResolvedValueOnce({ claims, user: { ...user, identities: [email] } });
    const fetcher = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      expect(appendAuthCredentialAudit).toHaveBeenCalledWith(
        account,
        expect.any(String),
        'identity_unlink',
        'initiated',
        undefined,
      );
      return new Response(null, { status: 204 });
    });
    const response = await post();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      accountId: account,
      operationId: expect.any(String),
      receiptId: receipt,
      identityId: googleId,
      provider: 'google',
      status: 'confirmed',
      user: { id: subject },
    });
    expect(fetcher).toHaveBeenCalledWith(
      `https://unlink.example.invalid/auth/v1/user/identities/${googleId}`,
      expect.objectContaining({
        method: 'DELETE',
        redirect: 'error',
        cache: 'no-store',
        signal: expect.any(AbortSignal),
      }),
    );
    expect(verifySupabaseSessionDetails).toHaveBeenCalledTimes(2);
    expect(appendAuthCredentialAudit).toHaveBeenLastCalledWith(
      account,
      expect.any(String),
      'identity_unlink',
      'confirmed',
      undefined,
    );
    expect(JSON.stringify(vi.mocked(appendAuthCredentialAudit).mock.calls)).not.toMatch(
      /synthetic-token|synthetic-public/,
    );
  });
  it.each([
    { identities: [google], email_confirmed_at: user.email_confirmed_at },
    { identities: [google, email], email_confirmed_at: null },
    { identities: [google, email], email_confirmed_at: undefined },
    {
      identities: [google, { ...email, provider: 'phone' }],
      email_confirmed_at: user.email_confirmed_at,
    },
  ])('protects the last admitted recovery credential: %j', async (remaining) => {
    vi.mocked(verifySupabaseSessionDetails).mockResolvedValue({
      claims,
      user: { ...user, ...remaining },
    });
    const fetcher = vi.spyOn(globalThis, 'fetch');
    expect((await post()).status).toBe(409);
    expect(fetcher).not.toHaveBeenCalled();
    expect(appendAuthCredentialAudit).not.toHaveBeenCalled();
  });
  it.each([emailId, receipt])(
    'rejects unadmitted or foreign identity targets before mutation: %s',
    async (identityId) => {
      const fetcher = vi.spyOn(globalThis, 'fetch');
      expect((await post({ identityId })).status).toBe(identityId === emailId ? 403 : 404);
      expect(fetcher).not.toHaveBeenCalled();
    },
  );
  it.each([
    { ...claims, aal: 'aal1' },
    { ...claims, amr: [{ method: 'totp', timestamp: now / 1000 - 301 }] },
    { ...claims, amr: [{ method: 'token_refresh', timestamp: now / 1000 }] },
  ])('denies insufficient or stale assurance: %j', async (proof) => {
    vi.mocked(verifySupabaseSessionDetails).mockResolvedValue({ claims: proof, user });
    const fetcher = vi.spyOn(globalThis, 'fetch');
    expect((await post()).status).toBe(403);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('does not dispatch when initiation persistence fails', async () => {
    vi.mocked(appendAuthCredentialAudit).mockRejectedValue(new Error('database unavailable'));
    const fetcher = vi.spyOn(globalThis, 'fetch');
    expect((await post()).status).toBe(503);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it.each(['still-linked', 'recovery-removed', 'session-revoked', 'inventory-outage'])(
    'does not infer unlink success after %s',
    async (outcome) => {
      vi.mocked(verifySupabaseSessionDetails).mockResolvedValueOnce({ claims, user });
      if (outcome === 'inventory-outage')
        vi.mocked(verifySupabaseSessionDetails).mockRejectedValueOnce(
          new Error('provider unavailable'),
        );
      else
        vi.mocked(verifySupabaseSessionDetails).mockResolvedValueOnce(
          outcome === 'session-revoked'
            ? null
            : { claims, user: outcome === 'recovery-removed' ? { ...user, identities: [] } : user },
        );
      const fetcher = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response(null, { status: 204 }));
      expect((await post()).status).toBe(502);
      expect(fetcher).toHaveBeenCalledTimes(1);
      expect(appendAuthCredentialAudit).toHaveBeenLastCalledWith(
        account,
        expect.any(String),
        'identity_unlink',
        'unconfirmed',
        undefined,
      );
    },
  );
  it('does not retry an uncertain DELETE or expose provider error text', async () => {
    const fetcher = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(Response.json({ message: 'private-provider-detail' }, { status: 500 }));
    const response = await post();
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain('private-provider-detail');
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(verifySupabaseSessionDetails).toHaveBeenCalledTimes(1);
  });
  it('reports failed final persistence after provider confirmation', async () => {
    vi.mocked(verifySupabaseSessionDetails)
      .mockResolvedValueOnce({ claims, user })
      .mockResolvedValueOnce({ claims, user: { ...user, identities: [email] } });
    vi.mocked(appendAuthCredentialAudit)
      .mockResolvedValueOnce(receipt)
      .mockRejectedValueOnce(new Error('receipt unavailable'));
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));
    expect((await post()).status).toBe(503);
  });
  it('rejects caller-selected canonical account and metadata fields', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch');
    expect((await post({ identityId: googleId, accountId: account })).status).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
