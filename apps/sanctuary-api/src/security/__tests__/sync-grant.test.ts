import { generateKeyPairSync } from 'node:crypto';
import { edloveUuidV8ProfileV1AccountVector } from '@repo/core/logic/schemas/edloveUuidV8ProfileV1Vectors';
import { createLocalJWKSet, decodeProtectedHeader, jwtVerify } from 'jose';
import { call } from '@orpc/server';
import { describe, expect, it } from 'vitest';
import type { APIContext } from '../../core/context';
import { router } from '../../core/router';
import { SYNC_GRANT_LIFETIME_SECONDS, type SyncGrants, createSyncGrants } from '../syncGrant';
import type { AuthenticatedIdentity } from '../security';

const ENDPOINT = 'https://sync.example.com';
const NOW = 1_800_000_000_000;
const accountId = edloveUuidV8ProfileV1AccountVector.uuid;

function signingJwk(kid = 'gurudevi-sync-test') {
  const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  return JSON.stringify({ ...privateKey.export({ format: 'jwk' }), kid });
}

function identity(expiresAt: number): AuthenticatedIdentity {
  return { accountId, subject: crypto.randomUUID(), sessionId: crypto.randomUUID(), expiresAt };
}

describe('sync grants / G1, real ES256 signing and jose verification, no PowerSync service', () => {
  const grants = createSyncGrants({ endpoint: ENDPOINT, signingJwk: signingJwk(), now: () => NOW });

  it('signs a token the PowerSync service can verify with the public key', async () => {
    const grant = await grants.issue(identity(NOW / 1000 + 3600));
    const { payload } = await jwtVerify(
      grant.token,
      createLocalJWKSet({ keys: [grants.publicJwk()] }),
      {
        audience: ENDPOINT,
        algorithms: ['ES256'],
        currentDate: new Date(NOW),
      },
    );
    expect(payload).toMatchObject({
      sub: accountId,
      canonical_account_id: accountId,
      aud: ENDPOINT,
    });
    expect(decodeProtectedHeader(grant.token)).toMatchObject({
      alg: 'ES256',
      kid: 'gurudevi-sync-test',
    });
    expect(grant).toMatchObject({ accountId, endpoint: ENDPOINT });
  });

  it('lasts at most the grant lifetime', async () => {
    const grant = await grants.issue(identity(NOW / 1000 + 3600));
    expect(grant.expiresAt).toBe(NOW / 1000 + SYNC_GRANT_LIFETIME_SECONDS);
  });

  it('never outlives the session that asked for it', async () => {
    const grant = await grants.issue(identity(NOW / 1000 + 60));
    expect(grant.expiresAt).toBe(NOW / 1000 + 60);
  });

  it('refuses a session that has already ended', async () => {
    await expect(grants.issue(identity(NOW / 1000))).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });

  it('publishes only the public half of the key', () => {
    expect(grants.publicJwk()).not.toHaveProperty('d');
  });

  it.each([
    ['a plain-HTTP remote endpoint', 'http://sync.example.com'],
    ['an endpoint with a path', 'https://sync.example.com/v1'],
  ])('refuses %s at startup', (_name, endpoint) => {
    expect(() => createSyncGrants({ endpoint, signingJwk: signingJwk() })).toThrow();
  });

  it('accepts a local development endpoint', () => {
    expect(() =>
      createSyncGrants({ endpoint: 'http://localhost:8080', signingJwk: signingJwk() }),
    ).not.toThrow();
  });

  it('refuses a key that is not a private P-256 JWK at startup', () => {
    const { publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
    const publicOnly = JSON.stringify({ ...publicKey.export({ format: 'jwk' }), kid: 'k' });
    expect(() => createSyncGrants({ endpoint: ENDPOINT, signingJwk: publicOnly })).toThrow();
    expect(() => createSyncGrants({ endpoint: ENDPOINT, signingJwk: 'not json' })).toThrow();
  });
});

describe('identity.syncGrant / G1, real router and signer, substituted platform', () => {
  const context = (syncGrants: SyncGrants | undefined) =>
    ({
      requestId: 'test',
      identity: identity(Date.now() / 1000 + 3600),
      platform: { security: {}, executeAccountCommand: async () => undefined, syncGrants },
    }) as unknown as APIContext; // Only the parts the procedure reads.

  it('issues a grant for the signed-in account', async () => {
    const grants = createSyncGrants({ endpoint: ENDPOINT, signingJwk: signingJwk() });
    await expect(
      call(router.identity.syncGrant, undefined, { context: context(grants) }),
    ).resolves.toMatchObject({
      accountId,
      endpoint: ENDPOINT,
    });
  });

  it('is unavailable until sync is configured', async () => {
    await expect(
      call(router.identity.syncGrant, undefined, { context: context(undefined) }),
    ).rejects.toMatchObject({
      code: 'SERVICE_UNAVAILABLE',
    });
  });
});
