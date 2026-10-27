import { generateKeyPairSync } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSyncCredentials, getSyncPublicKeys } from '../core/syncCredentials';

const accountId = '123e4567-e89b-8101-8100-426614174000';
const now = 1792965600;
const previous = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const next = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const oldPrivate = { ...previous.privateKey.export({ format: 'jwk' }), kid: 'previous' };
const newPrivate = { ...next.privateKey.export({ format: 'jwk' }), kid: 'next' };
const oldPublic = { ...previous.publicKey.export({ format: 'jwk' }), kid: 'previous' };
const newPublic = { ...next.publicKey.export({ format: 'jwk' }), kid: 'next' };
const environment = {
  POWERSYNC_URL: 'https://sync.example.invalid',
  POWERSYNC_SIGNING_JWK: JSON.stringify(oldPrivate),
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now * 1000);
});
afterEach(() => vi.useRealTimers());

async function verifySignature(
  token: string,
  configuration: typeof environment & { POWERSYNC_VERIFYING_JWKS?: string },
) {
  const [header, payload, signature] = token.split('.');
  const metadata: { kid: string } = JSON.parse(Buffer.from(header!, 'base64url').toString());
  const published = await getSyncPublicKeys(configuration);
  const key = published.keys.find((candidate) => candidate.kid === metadata.kid);
  if (!key) return false;
  const publicKey = await crypto.subtle.importKey(
    'jwk',
    key,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['verify'],
  );
  return crypto.subtle.verify(
    { name: 'ECDSA', hash: 'SHA-256' },
    publicKey,
    Buffer.from(signature!, 'base64url'),
    new TextEncoder().encode(`${header}.${payload}`),
  );
}

describe('G2 local key rotation / real WebCrypto and virtual clock, no remote verifier', () => {
  it('publishes both keys, switches signer, then retires the old key after expiry', async () => {
    const initial = await createSyncCredentials(accountId, now + 3600, environment);
    const overlap = {
      ...environment,
      POWERSYNC_VERIFYING_JWKS: JSON.stringify({ keys: [oldPublic, newPublic] }),
    };
    expect(await verifySignature(initial.token, overlap)).toBe(true);
    const switched = { ...overlap, POWERSYNC_SIGNING_JWK: JSON.stringify(newPrivate) };
    const renewed = await createSyncCredentials(accountId, now + 3600, switched);
    expect(JSON.parse(Buffer.from(renewed.token.split('.')[0]!, 'base64url').toString()).kid).toBe(
      'next',
    );
    expect(await verifySignature(initial.token, switched)).toBe(true);
    expect(await verifySignature(renewed.token, switched)).toBe(true);
    vi.setSystemTime((now + 361) * 1000);
    expect(initial.expiresAt).toBeLessThan(Math.floor(Date.now() / 1000) - 60);
    const retired = {
      ...switched,
      POWERSYNC_VERIFYING_JWKS: JSON.stringify({ keys: [newPublic] }),
    };
    expect(await verifySignature(initial.token, retired)).toBe(false);
    const current = await createSyncCredentials(accountId, now + 3600, retired);
    expect(await verifySignature(current.token, retired)).toBe(true);
    const published = await getSyncPublicKeys(retired);
    expect(published.keys.map((candidate) => candidate.kid)).toEqual(['next']);
    expect(JSON.stringify(published)).not.toContain('"d"');
  });
});

describe('G1 verification key configuration boundary / real key import', () => {
  it.each([
    { keys: [] },
    { keys: [newPublic] },
    { keys: [oldPublic, oldPublic] },
    { keys: [{ ...newPublic, kid: 'previous' }] },
    { keys: [oldPrivate] },
    { keys: [{ ...oldPublic, alg: 'HS256' }] },
    { keys: [{ ...oldPublic, use: 'enc' }] },
    { keys: [{ ...oldPublic, crv: 'P-384' }] },
    { keys: [oldPublic, { ...newPublic, x: 'A'.repeat(43), y: 'A'.repeat(43) }] },
    {
      keys: [
        oldPublic,
        { ...newPublic, kid: 'two' },
        { ...newPublic, kid: 'three' },
        { ...newPublic, kid: 'four' },
      ],
    },
    { keys: [oldPublic], privateKey: oldPrivate },
  ])('denies malformed, ambiguous or private verification material', async (jwks) => {
    const config = { ...environment, POWERSYNC_VERIFYING_JWKS: JSON.stringify(jwks) };
    await expect(getSyncPublicKeys(config)).rejects.toBeDefined();
    await expect(createSyncCredentials(accountId, now + 3600, config)).rejects.toBeDefined();
  });
  it.each(['', '{malformed'])('denies invalid serialized verification material', async (jwks) => {
    const config = { ...environment, POWERSYNC_VERIFYING_JWKS: jwks };
    await expect(getSyncPublicKeys(config)).rejects.toBeDefined();
    await expect(createSyncCredentials(accountId, now + 3600, config)).rejects.toBeDefined();
  });
  it('preserves the existing single-key configuration', async () => {
    const result = await createSyncCredentials(accountId, now + 3600, environment);
    expect(await verifySignature(result.token, environment)).toBe(true);
    expect((await getSyncPublicKeys(environment)).keys).toHaveLength(1);
  });
});
