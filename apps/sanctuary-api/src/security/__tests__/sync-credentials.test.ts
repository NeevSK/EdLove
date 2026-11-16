import { exportJWK, generateKeyPair, importJWK, jwtVerify } from 'jose';
import { describe, expect, it } from 'vitest';
import { capabilityTag } from '../../conformance/evidence';
import { createSyncCredentialIssuer } from '../syncCredentials';

const ACCOUNT = '0190f3a8-7c1d-8a2b-9c3d-4e5f6a7b8c9d';
const ENDPOINT = 'https://instance.powersync.journeyapps.com';

async function signingJwk(kid = 'sync-2026-11') {
  const { privateKey } = await generateKeyPair('ES256', { extractable: true });
  return { ...(await exportJWK(privateKey)), kid, alg: 'ES256' };
}

describe(`PowerSync credentials ${capabilityTag('identity.syncCredentials')}`, () => {
  it('signs an ES256 grant PowerSync can verify, bound to the account and the instance', async () => {
    const jwk = await signingJwk();
    const issuer = createSyncCredentialIssuer({
      endpoint: ENDPOINT,
      signingJwk: JSON.stringify(jwk),
    });
    const now = Math.floor(Date.now() / 1000);

    const credentials = await issuer.issue(ACCOUNT, now + 3600);

    const { d: _private, ...publicJwk } = jwk;
    const { payload, protectedHeader } = await jwtVerify(
      credentials.token,
      await importJWK(publicJwk, 'ES256'),
      {
        audience: ENDPOINT,
      },
    );
    expect(protectedHeader).toMatchObject({ alg: 'ES256', kid: 'sync-2026-11' });
    expect(payload).toMatchObject({ sub: ACCOUNT, canonical_account_id: ACCOUNT, aud: ENDPOINT });
    expect(credentials.endpoint).toBe(ENDPOINT);
    expect(credentials.expiresAt).toBe(payload.exp);
  });

  it('lives five minutes at most, and never past the session it was issued for', async () => {
    const issuer = createSyncCredentialIssuer({
      endpoint: ENDPOINT,
      signingJwk: JSON.stringify(await signingJwk()),
    });
    const now = Math.floor(Date.now() / 1000);

    expect((await issuer.issue(ACCOUNT, now + 3600)).expiresAt).toBeLessThanOrEqual(now + 301);
    expect((await issuer.issue(ACCOUNT, now + 42)).expiresAt).toBe(now + 42);
    await expect(issuer.issue(ACCOUNT, now)).rejects.toThrow('expired');
  });

  it('refuses at startup a key that is not a private ES256 P-256 key', async () => {
    const { d: _private, ...publicOnly } = await signingJwk();
    expect(() =>
      createSyncCredentialIssuer({ endpoint: ENDPOINT, signingJwk: JSON.stringify(publicOnly) }),
    ).toThrow();
    expect(() =>
      createSyncCredentialIssuer({ endpoint: ENDPOINT, signingJwk: 'not json' }),
    ).toThrow();
    const rsa = await generateKeyPair('RS256', { extractable: true });
    const rsaJwk = JSON.stringify({ ...(await exportJWK(rsa.privateKey)), kid: 'k' });
    expect(() => createSyncCredentialIssuer({ endpoint: ENDPOINT, signingJwk: rsaJwk })).toThrow();
  });

  it('refuses an endpoint that is not a bare https origin', async () => {
    const signing = JSON.stringify(await signingJwk());
    for (const endpoint of [
      'http://instance.powersync.journeyapps.com',
      'https://instance.powersync.journeyapps.com/path',
      'https://user:pass@instance.powersync.journeyapps.com',
      'https://instance.powersync.journeyapps.com/?q=1',
    ])
      expect(
        () => createSyncCredentialIssuer({ endpoint, signingJwk: signing }),
        endpoint,
      ).toThrow();
  });

  it('never returns the private key material', async () => {
    const jwk = await signingJwk();
    const issuer = createSyncCredentialIssuer({
      endpoint: ENDPOINT,
      signingJwk: JSON.stringify(jwk),
    });
    const credentials = await issuer.issue(ACCOUNT, Math.floor(Date.now() / 1000) + 600);
    expect(JSON.stringify(credentials)).not.toContain(String(jwk.d));
  });
});
