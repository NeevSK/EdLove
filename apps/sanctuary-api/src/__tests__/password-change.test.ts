import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { verifySupabaseSessionDetails } from '../core/adapters/verifySupabaseSession';
import { resolveAuthenticatedAccount } from '../core/authenticatedAccount';
import { appendAuthPasswordAudit } from '../core/authSessionAudit';
import { createAuthCredentialRoutes } from '../core/routes/authCredentials';
import { hasRecentMfa } from '../core/sensitiveAuthAssurance';

vi.mock('../core/adapters/verifySupabaseSession', () => ({
  verifySupabaseSessionDetails: vi.fn(),
}));
vi.mock('../core/authenticatedAccount', () => ({ resolveAuthenticatedAccount: vi.fn() }));
vi.mock('../core/authSessionAudit', () => ({ appendAuthPasswordAudit: vi.fn() }));
const subject = 'f0540000-0000-4000-8000-000000000001';
const account = '123e4567-e89b-8101-8100-426614174000';
const receipt = 'f0540000-0000-4000-8000-000000000002';
const now = 1792944000000;
const proof = {
  sub: subject,
  aal: 'aal2',
  is_anonymous: false,
  amr: [{ method: 'totp', timestamp: now / 1000 - 10 }],
};
const app = createAuthCredentialRoutes();
const post = (body: unknown = { password: 'synthetic-password' }) =>
  app.request('/credentials/password', {
    method: 'POST',
    headers: { Authorization: 'Bearer synthetic-token', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.spyOn(Date, 'now').mockReturnValue(now);
  vi.stubEnv('SUPABASE_URL', 'https://password.example.invalid');
  vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', 'synthetic-public');
  vi.mocked(verifySupabaseSessionDetails).mockResolvedValue({
    claims: proof,
    user: {
      id: subject,
      is_anonymous: false,
      factors: [{ id: receipt, factor_type: 'totp', status: 'verified' }],
    },
  });
  vi.mocked(resolveAuthenticatedAccount).mockResolvedValue({ id: account });
  vi.mocked(appendAuthPasswordAudit).mockResolvedValue(receipt);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
  vi.unstubAllEnvs();
});

describe('G1 password mutation with verified identity, provider and audit boundaries substituted', () => {
  it.each([
    { factors: [] },
    { factors: [{ id: receipt, factor_type: 'totp', status: 'unverified' as const }] },
  ])('denies assurance from a removed or unverified live factor: %j', async ({ factors }) => {
    vi.mocked(verifySupabaseSessionDetails).mockResolvedValue({
      claims: proof,
      user: { id: subject, is_anonymous: false, factors },
    });
    const fetcher = vi.spyOn(globalThis, 'fetch');
    expect((await post()).status).toBe(403);
    expect(fetcher).not.toHaveBeenCalled();
    expect(appendAuthPasswordAudit).not.toHaveBeenCalled();
  });
  it('denies an unavailable live factor inventory without interpreting it as no MFA', async () => {
    vi.mocked(verifySupabaseSessionDetails).mockResolvedValue({
      claims: proof,
      user: { id: subject, is_anonymous: false },
    });
    const fetcher = vi.spyOn(globalThis, 'fetch');
    expect((await post()).status).toBe(503);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('dispatches only after initiation and confirms only the same provider subject', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      expect(appendAuthPasswordAudit).toHaveBeenCalledWith(
        account,
        expect.any(String),
        'initiated',
        undefined,
      );
      return Response.json({ id: subject, private_provider_field: 'must not escape' });
    });
    const response = await post();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      accountId: account,
      status: 'confirmed',
      receiptId: receipt,
      user: { id: subject },
    });
    expect(fetcher).toHaveBeenCalledWith(
      'https://password.example.invalid/auth/v1/user',
      expect.objectContaining({
        method: 'PUT',
        redirect: 'error',
        cache: 'no-store',
        signal: expect.any(AbortSignal),
        body: JSON.stringify({ password: 'synthetic-password' }),
      }),
    );
    expect(appendAuthPasswordAudit).toHaveBeenLastCalledWith(
      account,
      expect.any(String),
      'confirmed',
      undefined,
    );
    expect(JSON.stringify(vi.mocked(appendAuthPasswordAudit).mock.calls)).not.toMatch(
      /synthetic-password|synthetic-token/,
    );
  });
  it.each([
    { ...proof, aal: 'aal1' },
    { ...proof, is_anonymous: true },
    { ...proof, amr: [{ method: 'totp', timestamp: now / 1000 - 301 }] },
    { ...proof, amr: [{ method: 'totp', timestamp: now / 1000 + 1 }] },
    { ...proof, amr: [{ method: 'token_refresh', timestamp: now / 1000 }] },
    { ...proof, amr: ['totp'] },
    { ...proof, amr: undefined },
  ])('denies insufficient/replayed/future assurance before dispatch: %j', async (claims) => {
    vi.mocked(verifySupabaseSessionDetails).mockResolvedValue({
      claims,
      user: { id: subject, is_anonymous: false },
    });
    const fetcher = vi.spyOn(globalThis, 'fetch');
    expect((await post()).status).toBe(403);
    expect(fetcher).not.toHaveBeenCalled();
    expect(appendAuthPasswordAudit).not.toHaveBeenCalled();
  });
  it('forwards current-password and nonce only to the provider command', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ id: subject }));
    expect(
      (
        await post({
          password: 'synthetic-new',
          currentPassword: 'synthetic-old',
          nonce: 'synthetic-nonce',
        })
      ).status,
    ).toBe(200);
    expect(fetcher).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          password: 'synthetic-new',
          current_password: 'synthetic-old',
          nonce: 'synthetic-nonce',
        }),
      }),
    );
    expect(JSON.stringify(vi.mocked(appendAuthPasswordAudit).mock.calls)).not.toMatch(
      /synthetic-(new|old|nonce)/,
    );
  });
  it.each([
    ['reauthentication_needed', 'PASSWORD_REAUTHENTICATION_REQUIRED'],
    ['reauthentication_not_valid', 'PASSWORD_REAUTHENTICATION_INVALID'],
    ['same_password', 'PASSWORD_UNCHANGED'],
    ['weak_password', 'PASSWORD_TOO_WEAK'],
    ['unknown_sensitive_code', 'PASSWORD_CHANGE_NOT_CONFIRMED'],
  ])('returns a safe correction for provider rejection %s', async (code, error) => {
    const fetcher = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        Response.json({ code, message: 'synthetic-sensitive-provider-detail' }, { status: 422 }),
      );
    const response = await post();
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ error, operationId: expect.any(String) });
    expect(JSON.stringify(body)).not.toContain('synthetic-sensitive');
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(appendAuthPasswordAudit).toHaveBeenLastCalledWith(
      account,
      body.operationId,
      'unconfirmed',
      undefined,
    );
  });
  it('does not dispatch if initiation cannot be persisted', async () => {
    vi.mocked(appendAuthPasswordAudit).mockRejectedValue(new Error('database unavailable'));
    const fetcher = vi.spyOn(globalThis, 'fetch');
    expect((await post()).status).toBe(503);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('does not infer success from a mismatched provider user', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ id: receipt }));
    expect((await post()).status).toBe(502);
    expect(appendAuthPasswordAudit).toHaveBeenLastCalledWith(
      account,
      expect.any(String),
      'unconfirmed',
      undefined,
    );
  });
  it('does not infer success after timeout or a malformed provider acknowledgment', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('synthetic network timeout'));
    expect((await post()).status).toBe(502);
    expect(appendAuthPasswordAudit).toHaveBeenLastCalledWith(
      account,
      expect.any(String),
      'unconfirmed',
      undefined,
    );
  });
  it('surfaces failed final persistence after a real boundary acknowledgment', async () => {
    vi.mocked(appendAuthPasswordAudit)
      .mockResolvedValueOnce(receipt)
      .mockRejectedValueOnce(new Error('receipt unavailable'));
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ id: subject }));
    expect((await post()).status).toBe(503);
  });
  it('rejects caller-selected accounts and metadata before touching provider state', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch');
    expect((await post({ password: 'synthetic-password', accountId: receipt })).status).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('never authorizes a newly refreshed token using its issuance timestamp', () => {
    expect(
      hasRecentMfa(
        { ...proof, iat: now / 1000, amr: [{ method: 'totp', timestamp: now / 1000 - 301 }] },
        now,
      ),
    ).toBe(false);
    expect(
      hasRecentMfa({ ...proof, amr: [{ method: 'totp', timestamp: now / 1000 - 300 }] }, now),
    ).toBe(true);
  });
});
