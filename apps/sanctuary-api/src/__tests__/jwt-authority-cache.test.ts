import crypto from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearJwkCache, verifySupabaseJwt } from '../jwt';

const primary = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const rotated = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const issuerA = 'https://issuer-a.example.test';
const issuerB = 'https://issuer-b.example.test';

function environment(url = issuerA, publicKey = '') {
  return {
    NODE_ENV: 'production',
    SUPABASE_URL: url,
    SUPABASE_JWT_ISSUER: `${url}/auth/v1`,
    SUPABASE_JWT_AUDIENCE: 'authenticated',
    SUPABASE_JWT_PUBLIC_KEY: publicKey,
  };
}

function token(url = issuerA, keys = primary, kid = 'shared-kid') {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', kid })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: 'credential-subject',
      iss: `${url}/auth/v1`,
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  ).toString('base64url');
  const data = `${header}.${payload}`;
  return `${data}.${crypto.sign('sha256', Buffer.from(data), keys.privateKey).toString('base64url')}`;
}

function jwks(keys = primary, kid = 'shared-kid') {
  return new Response(
    JSON.stringify({
      keys: [{ ...keys.publicKey.export({ format: 'jwk' }), kid, alg: 'RS256', use: 'sig' }],
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
}

afterEach(() => {
  clearJwkCache();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('G1 issuer-bound JWT verification caches', () => {
  it('does not reuse a key from issuer A for issuer B with the same kid', async () => {
    const fetcher = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jwks())
      .mockResolvedValueOnce(jwks(rotated));
    expect(await verifySupabaseJwt(token(), environment())).not.toBeNull();
    expect(await verifySupabaseJwt(token(issuerB), environment(issuerB))).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(await verifySupabaseJwt(token(issuerB, rotated), environment(issuerB))).not.toBeNull();
  });

  it('does not reuse a verified token when the configured static key changes', async () => {
    const signed = token();
    const keyA = JSON.stringify(primary.publicKey.export({ format: 'jwk' }));
    const keyB = JSON.stringify(rotated.publicKey.export({ format: 'jwk' }));
    expect(await verifySupabaseJwt(signed, environment(issuerA, keyA))).not.toBeNull();
    expect(await verifySupabaseJwt(signed, environment(issuerA, keyB))).toBeNull();
  });

  it('discovers a rotated unknown kid after the bounded refresh cooldown', async () => {
    vi.useFakeTimers();
    const fetcher = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jwks())
      .mockResolvedValueOnce(jwks(rotated, 'new-kid'));
    expect(await verifySupabaseJwt(token(), environment())).not.toBeNull();
    vi.advanceTimersByTime(30_001);
    expect(
      await verifySupabaseJwt(token(issuerA, rotated, 'new-kid'), environment()),
    ).not.toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(await verifySupabaseJwt(token(), environment())).toBeNull();
  });

  it('does not let cached tokens extend a removed signing key beyond the JWKS TTL', async () => {
    vi.useFakeTimers();
    const fetcher = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jwks())
      .mockResolvedValueOnce(new Response('{"keys":[]}'));
    const signed = token();
    expect(await verifySupabaseJwt(signed, environment())).not.toBeNull();
    vi.advanceTimersByTime(599_000);
    expect(await verifySupabaseJwt(signed, environment())).not.toBeNull();
    vi.advanceTimersByTime(2_000);
    expect(await verifySupabaseJwt(signed, environment())).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('rejects expired cached keys during an issuer outage and bounds retries', async () => {
    vi.useFakeTimers();
    const fetcher = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jwks())
      .mockResolvedValue(new Response(null, { status: 503 }));
    const signed = token();
    expect(await verifySupabaseJwt(signed, environment())).not.toBeNull();
    vi.advanceTimersByTime(600_001);
    expect(await verifySupabaseJwt(signed, environment())).toBeNull();
    expect(await verifySupabaseJwt(signed, environment())).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('coalesces parallel key discovery for one authority', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => jwks());
    const results = await Promise.all(
      Array.from({ length: 12 }, () => verifySupabaseJwt(token(), environment())),
    );
    expect(results.every((result) => result?.sub === 'credential-subject')).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('does not fall back to remote keys when the configured static key is invalid', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => jwks());
    expect(await verifySupabaseJwt(token(), environment(issuerA, '{invalid'))).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
