import { generateKeyPairSync } from 'node:crypto';
import { SyncCredentialsSchema } from '@repo/core/api/syncCredentials';
import { SovereignError } from '@repo/core/types/Errors';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { verifySupabaseSessionDetails } from '../core/adapters/verifySupabaseSession';
import { resolveAuthenticatedAccount } from '../core/authenticatedAccount';
import { createAuthSyncRoutes } from '../core/routes/authSync';

vi.mock('../core/adapters/verifySupabaseSession', () => ({
  verifySupabaseSessionDetails: vi.fn(),
}));
vi.mock('../core/authenticatedAccount', () => ({ resolveAuthenticatedAccount: vi.fn() }));

const accountId = '123e4567-e89b-8101-8100-426614174000';
const subject = 'f0370000-0000-4000-8000-000000000001';
const now = 1792965600;
const pair = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const key = { ...pair.privateKey.export({ format: 'jwk' }), kid: 'acceptance-key' };
const environment = {
  POWERSYNC_URL: 'https://sync.example.invalid',
  POWERSYNC_SIGNING_JWK: JSON.stringify(key),
};
const app = createAuthSyncRoutes();
function post(config = environment, authorization = 'Bearer provider-token') {
  return app.request(
    '/sync-credentials',
    {
      method: 'POST',
      headers: { Authorization: authorization, 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: subject, exp: now + 86400 }),
    },
    config,
  );
}
function session(exp = now + 3600, anonymous: boolean | undefined = false) {
  return { claims: { sub: subject, exp }, user: { id: subject, is_anonymous: anonymous } };
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now * 1000);
  vi.mocked(verifySupabaseSessionDetails).mockResolvedValue(session());
  vi.mocked(resolveAuthenticatedAccount).mockResolvedValue({ id: accountId });
});
afterEach(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
});

describe('G1 sync grants / real WebCrypto, substituted issuer and account database', () => {
  it('signs a canonical grant with a five-minute lifetime and endpoint-specific audience', async () => {
    const response = await post();
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toContain('no-store');
    const grant = SyncCredentialsSchema.parse(await response.json());
    expect(grant).toMatchObject({
      accountId,
      endpoint: environment.POWERSYNC_URL,
      expiresAt: now + 300,
    });
    const [header, payload, signature] = grant.token.split('.');
    expect(JSON.parse(Buffer.from(header!, 'base64url').toString())).toEqual({
      alg: 'ES256',
      typ: 'JWT',
      kid: key.kid,
    });
    expect(JSON.parse(Buffer.from(payload!, 'base64url').toString())).toEqual({
      sub: accountId,
      canonical_account_id: accountId,
      aud: environment.POWERSYNC_URL,
      iat: now,
      exp: now + 300,
    });
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      pair.publicKey.export({ format: 'jwk' }),
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify'],
    );
    expect(
      await crypto.subtle.verify(
        { name: 'ECDSA', hash: 'SHA-256' },
        publicKey,
        Buffer.from(signature!, 'base64url'),
        new TextEncoder().encode(`${header}.${payload}`),
      ),
    ).toBe(true);
    expect(verifySupabaseSessionDetails).toHaveBeenCalledWith('provider-token', environment);
    expect(resolveAuthenticatedAccount).toHaveBeenCalledWith(subject, undefined);
  });
  it('does not outlive the admitted provider session', async () => {
    vi.mocked(verifySupabaseSessionDetails).mockResolvedValue(session(now + 30));
    expect(SyncCredentialsSchema.parse(await (await post()).json()).expiresAt).toBe(now + 30);
  });
  it('publishes only public signing coordinates', async () => {
    const response = await app.request('/sync-jwks', {}, environment);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      keys: [
        { ...pair.publicKey.export({ format: 'jwk' }), kid: key.kid, alg: 'ES256', use: 'sig' },
      ],
    });
    expect(verifySupabaseSessionDetails).not.toHaveBeenCalled();
  });
  it('sanitizes invalid public-key configuration at both HTTP boundaries', async () => {
    const config = { ...environment, POWERSYNC_VERIFYING_JWKS: JSON.stringify({ keys: [key] }) };
    for (const response of [await post(config), await app.request('/sync-jwks', {}, config)]) {
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ error: 'SYNC_CREDENTIALS_UNAVAILABLE' });
      expect(response.headers.get('Cache-Control')).toContain('no-store');
    }
  });
  it('rejects mismatched private and public signing coordinates', async () => {
    const other = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
    const configuration = {
      ...environment,
      POWERSYNC_SIGNING_JWK: JSON.stringify({
        ...key,
        d: other.privateKey.export({ format: 'jwk' }).d,
      }),
    };
    expect((await post(configuration)).status).toBe(503);
  });
  for (const authorization of ['', 'Basic provider-token', 'Bearer ']) {
    it(`denies malformed bearer admission: ${JSON.stringify(authorization)}`, async () => {
      expect((await post(environment, authorization)).status).toBe(401);
      expect(verifySupabaseSessionDetails).not.toHaveBeenCalled();
    });
  }
  it('denies a revoked session on the next renewal', async () => {
    expect((await post()).status).toBe(200);
    vi.mocked(verifySupabaseSessionDetails).mockResolvedValue(null);
    expect((await post()).status).toBe(401);
    expect(verifySupabaseSessionDetails).toHaveBeenCalledTimes(2);
  });
  for (const anonymous of [true, undefined]) {
    it(`denies unidentified provider state: ${String(anonymous)}`, async () => {
      vi.mocked(verifySupabaseSessionDetails).mockResolvedValue(session(now + 300, anonymous));
      // Explicit assignment avoids the default parameter turning undefined into false.
      if (anonymous === undefined)
        vi.mocked(verifySupabaseSessionDetails).mockResolvedValue({
          claims: { sub: subject, exp: now + 300 },
          user: { id: subject },
        });
      expect((await post()).status).toBe(403);
      expect(resolveAuthenticatedAccount).not.toHaveBeenCalled();
    });
  }
  for (const exp of [now, now - 1, Number.NaN, Number.POSITIVE_INFINITY, now + 0.5]) {
    it(`does not issue a grant for invalid expiry ${exp}`, async () => {
      vi.mocked(verifySupabaseSessionDetails).mockResolvedValue(session(exp));
      expect((await post()).status).not.toBe(200);
    });
  }
  it('fails closed on provider outage without exposing an upstream error', async () => {
    vi.mocked(verifySupabaseSessionDetails).mockRejectedValue(
      new Error('private provider details'),
    );
    const response = await post();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'SYNC_CREDENTIALS_UNAVAILABLE' });
  });
  it('denies an account whose binding no longer exists', async () => {
    vi.mocked(resolveAuthenticatedAccount).mockRejectedValue(
      SovereignError.authenticationRequired(),
    );
    expect((await post()).status).toBe(401);
  });
  it('fails closed on account database outage', async () => {
    vi.mocked(resolveAuthenticatedAccount).mockRejectedValue(new Error('private database details'));
    expect((await post()).status).toBe(503);
  });
  it('rejects a noncanonical account returned by the database', async () => {
    vi.mocked(resolveAuthenticatedAccount).mockResolvedValue({ id: subject });
    expect((await post()).status).toBe(503);
  });
  for (const config of [
    { ...environment, POWERSYNC_SIGNING_JWK: '' },
    { ...environment, POWERSYNC_SIGNING_JWK: JSON.stringify({ ...key, crv: 'P-384' }) },
    { ...environment, POWERSYNC_SIGNING_JWK: JSON.stringify({ ...key, d: undefined }) },
    { ...environment, POWERSYNC_URL: 'http://sync.example.invalid' },
    { ...environment, POWERSYNC_URL: 'https://sync.example.invalid/unexpected' },
    { ...environment, POWERSYNC_URL: 'https://user:password@sync.example.invalid' },
  ]) {
    it('fails closed on invalid signing or endpoint configuration', async () => {
      const response = await post(config);
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ error: 'SYNC_CREDENTIALS_UNAVAILABLE' });
      expect((await app.request('/sync-jwks', {}, config)).status).toBe(503);
    });
  }
});
