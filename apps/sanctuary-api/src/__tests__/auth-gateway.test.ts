import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { verifySupabaseSession } from '../core/adapters/verifySupabaseSession';
import { resolveAuthenticatedAccount } from '../core/authenticatedAccount';
import { appendAuthSessionAudit } from '../core/authSessionAudit';
import { createAuthGatewayRoutes } from '../core/routes/authGateway';

vi.mock('../core/authSessionAudit', () => ({ appendAuthSessionAudit: vi.fn() }));
vi.mock('../core/adapters/verifySupabaseSession', () => ({ verifySupabaseSession: vi.fn() }));
vi.mock('../core/authenticatedAccount', () => ({ resolveAuthenticatedAccount: vi.fn() }));
const account = '123e4567-e89b-8101-8100-426614174000';

const app = createAuthGatewayRoutes();
const session = {
  access_token: 'synthetic-access',
  refresh_token: 'synthetic-refresh',
  expires_in: 3600,
  token_type: 'bearer',
  user: { id: 'f0370000-0000-4000-8000-000000000001' },
};
const requests = [
  ['/sign-in', { email: 'fixture@example.invalid', password: 'fixture-password' }],
  ['/otp', { email: 'fixture@example.invalid' }],
  ['/refresh', { refresh_token: 'synthetic-refresh' }],
] as const;
const post = (path: string, body: unknown = {}, authorization?: string) =>
  app.request(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authorization ? { Authorization: authorization } : {}),
    },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.mocked(verifySupabaseSession).mockResolvedValue({ sub: session.user.id });
  vi.mocked(resolveAuthenticatedAccount).mockResolvedValue({ id: account });
  vi.mocked(appendAuthSessionAudit).mockResolvedValue('f0520000-0000-4000-8000-000000000001');
  vi.stubEnv('SUPABASE_URL', 'https://gateway.example.invalid');
  vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', 'synthetic-public');
  vi.stubEnv('SUPABASE_ANON_KEY', '');
  vi.stubEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY', '');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'synthetic-admin-must-not-be-used');
});
afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
describe('G1 auth gateway provider boundary', () => {
  for (const environment of ['test', 'development', 'production']) {
    it(`fails loudly with missing configuration in ${environment}`, async () => {
      vi.stubEnv('NODE_ENV', environment);
      vi.stubEnv('SUPABASE_URL', '');
      const fetcher = vi.spyOn(globalThis, 'fetch');
      for (const [path, body] of requests) {
        const response = await post(path, body);
        expect(response.status).toBe(503);
        expect(response.headers.get('Cache-Control')).toContain('no-store');
        expect(await response.text()).not.toContain('access_token');
      }
      expect((await post('/sign-out', {}, 'Bearer synthetic-access')).status).toBe(503);
      expect(fetcher).not.toHaveBeenCalled();
    });
  }
  it('uses only a public key and secure bounded transport for password sign-in', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(session));
    const response = await post(...requests[0]);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ session });
    expect(fetcher).toHaveBeenCalledWith(
      'https://gateway.example.invalid/auth/v1/token?grant_type=password',
      expect.objectContaining({
        redirect: 'error',
        cache: 'no-store',
        signal: expect.any(AbortSignal),
        headers: expect.objectContaining({ apikey: 'synthetic-public' }),
      }),
    );
  });
  it.each([429, 500, 503])(
    'keeps provider failure %i distinct from bad credentials',
    async (status) => {
      vi.spyOn(globalThis, 'fetch').mockImplementation(
        async () => new Response('upstream', { status }),
      );
      for (const [path, body] of requests)
        expect((await post(path, body)).status).toBe(status === 429 ? 429 : 503);
    },
  );
  it('denies malformed successful token responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      Response.json({ user: session.user }),
    );
    expect((await post(...requests[0])).status).toBe(502);
    expect((await post(...requests[2])).status).toBe(502);
  });
  it('forwards OTP redirect using the provider query contract', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({}));
    expect(
      (
        await post('/otp', {
          email: 'fixture@example.invalid',
          emailRedirectTo: 'https://gurudevi.app/auth/complete',
        })
      ).status,
    ).toBe(200);
    const endpoint = new URL(String(fetcher.mock.calls[0]?.[0]));
    expect(endpoint.searchParams.get('redirect_to')).toBe('https://gurudevi.app/auth/complete');
    expect(fetcher.mock.calls[0]?.[1]?.body).toBe(
      JSON.stringify({ email: 'fixture@example.invalid' }),
    );
  });
  it.each([401, 403, 500, 503])('never confirms logout on upstream failure %i', async (status) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('upstream', { status }));
    expect((await post('/sign-out', {}, 'Bearer synthetic-access')).status).toBe(502);
  });
  it('confirms logout only after the provider acknowledgment', async () => {
    const fetcher = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 204 }));
    const response = await post('/sign-out', {}, 'Bearer synthetic-access');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(fetcher).toHaveBeenCalledWith(
      'https://gateway.example.invalid/auth/v1/logout?scope=global',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer synthetic-access',
          apikey: 'synthetic-public',
        }),
      }),
    );
  });
  it('surfaces transport failure for every gateway operation', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Synthetic outage'));
    for (const [path, body] of requests) expect((await post(path, body)).status).toBe(502);
    expect((await post('/sign-out', {}, 'Bearer synthetic-access')).status).toBe(502);
  });
  it('rejects missing logout authority without contacting the provider', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch');
    expect((await post('/sign-out')).status).toBe(401);
    expect((await post('/sign-out', {}, 'Bearer ')).status).toBe(401);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('does not contact the provider if the initiation receipt cannot be persisted', async () => {
    vi.mocked(appendAuthSessionAudit).mockRejectedValue(new Error('database unavailable'));
    const fetcher = vi.spyOn(globalThis, 'fetch');
    expect((await post('/sign-out', {}, 'Bearer synthetic-access')).status).toBe(503);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('does not claim success when final receipt persistence fails after provider acknowledgment', async () => {
    vi.mocked(appendAuthSessionAudit)
      .mockResolvedValueOnce('f0520000-0000-4000-8000-000000000001')
      .mockRejectedValueOnce(new Error('database unavailable'));
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));
    const response = await post('/sign-out', {}, 'Bearer synthetic-access');
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      error: 'Session revocation receipt is unavailable.',
    });
    expect(appendAuthSessionAudit).toHaveBeenNthCalledWith(
      2,
      account,
      expect.any(String),
      'confirmed',
    );
  });
  it('records provider outages as unconfirmed, with no tokens or passwords in receipt arguments', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('private provider data'));
    expect((await post('/sign-out', {}, 'Bearer synthetic-access')).status).toBe(502);
    expect(appendAuthSessionAudit).toHaveBeenNthCalledWith(
      1,
      account,
      expect.any(String),
      'initiated',
    );
    expect(appendAuthSessionAudit).toHaveBeenNthCalledWith(
      2,
      account,
      expect.any(String),
      'unconfirmed',
    );
    expect(JSON.stringify(vi.mocked(appendAuthSessionAudit).mock.calls)).not.toMatch(
      /synthetic-access|private provider/,
    );
  });
});
