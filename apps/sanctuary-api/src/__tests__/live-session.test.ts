import { generateKeyPairSync, sign } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  verifySupabaseSession,
  verifySupabaseSessionDetails,
} from '../core/adapters/verifySupabaseSession';
import { clearJwkCache } from '../jwt';

const keys = generateKeyPairSync('rsa', { modulusLength: 2048 });
const subject = 'f0350000-0000-4000-8000-000000000001';
const environment = {
  NODE_ENV: 'production',
  SUPABASE_URL: 'https://live-session.example.invalid',
  SUPABASE_JWT_ISSUER: 'https://live-session.example.invalid/auth/v1',
  SUPABASE_JWT_AUDIENCE: 'authenticated',
  SUPABASE_JWT_PUBLIC_KEY: keys.publicKey.export({ type: 'spki', format: 'pem' }).toString(),
  SUPABASE_ANON_KEY: 'synthetic-publishable-key',
  SUPABASE_PUBLISHABLE_KEY: '',
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: '',
  EXPO_PUBLIC_SUPABASE_ANON_KEY: '',
};
function token(session: unknown = 'f0350000-0000-4000-8000-000000000002', omitSession = false) {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'live-session' })).toString(
    'base64url',
  );
  const payload = Buffer.from(
    JSON.stringify({
      sub: subject,
      ...(omitSession ? {} : { session_id: session }),
      iss: environment.SUPABASE_JWT_ISSUER,
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 120,
    }),
  ).toString('base64url');
  const body = `${header}.${payload}`;
  return `${body}.${sign('sha256', Buffer.from(body), keys.privateKey).toString('base64url')}`;
}
afterEach(() => {
  vi.restoreAllMocks();
  clearJwkCache();
});

describe('G1 live provider credential projection with real RSA verification', () => {
  it('strips contacts, identity data, metadata and provider tokens from the returned user', async () => {
    const identityId = 'f0510000-0000-4000-8000-000000000001';
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({
        id: subject,
        is_anonymous: false,
        email: 'private@example.invalid',
        phone: '+94770000000',
        user_metadata: { private: 'secret' },
        provider_token: 'provider-secret',
        identities: [
          {
            identity_id: identityId,
            user_id: subject,
            provider: 'google',
            identity_data: { email: 'private@example.invalid' },
          },
        ],
      }),
    );
    const result = await verifySupabaseSessionDetails(token(), environment);
    expect(result?.user).toEqual({
      id: subject,
      is_anonymous: false,
      identities: [{ identity_id: identityId, user_id: subject, provider: 'google' }],
    });
    expect(JSON.stringify(result?.user)).not.toMatch(/private@example|provider-secret|94770000000/);
  });
  it('rejects a provider identity attached to a different subject', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({
        id: subject,
        is_anonymous: false,
        identities: [
          {
            identity_id: 'f0510000-0000-4000-8000-000000000001',
            user_id: 'f0510000-0000-4000-8000-000000000002',
            provider: 'google',
          },
        ],
      }),
    );
    await expect(verifySupabaseSessionDetails(token(), environment)).rejects.toMatchObject({
      details: { code: 'AUTH_IDENTITY_OWNERSHIP_INVARIANT_VIOLATION', status: 503 },
    });
  });
});

describe('G1 live Supabase session boundary with real RSA verification', () => {
  it('rechecks the provider after signature caching and denies a revoked session', async () => {
    const fetcher = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(Response.json({ id: subject }))
      .mockResolvedValueOnce(new Response(null, { status: 403 }));
    const signed = token();
    expect(await verifySupabaseSession(signed, environment)).toMatchObject({ sub: subject });
    expect(await verifySupabaseSession(signed, environment)).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher).toHaveBeenCalledWith(
      `${environment.SUPABASE_URL}/auth/v1/user`,
      expect.objectContaining({
        cache: 'no-store',
        redirect: 'error',
        signal: expect.any(AbortSignal),
        headers: { Authorization: `Bearer ${signed}`, apikey: environment.SUPABASE_ANON_KEY },
      }),
    );
  });
  it.each([undefined, null, 'invalid', '00000000-0000-0000-0000-000000000000'])(
    'rejects invalid session claim %s before network',
    async (session) => {
      const fetcher = vi.spyOn(globalThis, 'fetch');
      expect(
        await verifySupabaseSession(token(session, session === undefined), environment),
      ).toBeNull();
      expect(fetcher).not.toHaveBeenCalled();
    },
  );
  it.each([400, 401, 403])('denies provider rejection %i', async (status) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status }));
    expect(await verifySupabaseSession(token(), environment)).toBeNull();
  });
  it.each([429, 500, 503])('surfaces provider availability failure %i', async (status) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status }));
    await expect(verifySupabaseSession(token(), environment)).rejects.toMatchObject({
      details: { code: 'AUTH_SESSION_VERIFICATION_UNAVAILABLE', status: 503 },
    });
  });
  it('denies a different subject returned by the provider', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({ id: 'f0350000-0000-4000-8000-000000000099' }),
    );
    expect(await verifySupabaseSession(token(), environment)).toBeNull();
  });
  it('surfaces network failure without signature-only fallback', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Synthetic outage'));
    await expect(verifySupabaseSession(token(), environment)).rejects.toMatchObject({
      details: { code: 'AUTH_SESSION_VERIFICATION_UNAVAILABLE', status: 503 },
    });
  });
  it('fails closed on malformed provider data', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ id: 'not-an-account' }));
    await expect(verifySupabaseSession(token(), environment)).rejects.toMatchObject({
      details: { code: 'AUTH_SESSION_VERIFICATION_UNAVAILABLE', status: 503 },
    });
  });
  it('requires configured user-endpoint credentials even with an explicit public key', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch');
    await expect(
      verifySupabaseSession(token(), { ...environment, SUPABASE_ANON_KEY: '' }),
    ).rejects.toMatchObject({
      details: { code: 'AUTH_SESSION_VERIFICATION_UNAVAILABLE', status: 503 },
    });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('uses the publishable key name configured in the development environment', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ id: subject }));
    expect(
      await verifySupabaseSession(token(), {
        ...environment,
        SUPABASE_ANON_KEY: '',
        EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'synthetic-project-key',
      }),
    ).not.toBeNull();
    expect(fetcher).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ apikey: 'synthetic-project-key' }),
      }),
    );
  });
  it('rejects an invalid signature before contacting the provider', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch');
    const signed = token();
    const invalid = `${signed.slice(0, signed.lastIndexOf('.') + 1)}invalid`;
    expect(await verifySupabaseSession(invalid, environment)).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('bounds provider validation with an abort signal and denies timeout', async () => {
    const controller = new AbortController();
    const timeout = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(controller.signal);
    const fetcher = vi.spyOn(globalThis, 'fetch').mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(controller.signal.reason), {
            once: true,
          });
        }),
    );
    const result = expect(verifySupabaseSession(token(), environment)).rejects.toMatchObject({
      details: { code: 'AUTH_SESSION_VERIFICATION_UNAVAILABLE', status: 503 },
    });
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    controller.abort(new DOMException('Synthetic timeout', 'TimeoutError'));
    await result;
    expect(timeout).toHaveBeenCalledWith(5000);
  });
});
