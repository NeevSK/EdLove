// Short-lived grants for the PowerSync instance. PowerSync verifies them against the public
// half of POWERSYNC_SIGNING_JWK, held inline in powersync/service.yaml, and its sync streams
// filter by `canonical_account_id`. Design kept from the retired 2026-10-26 boundary:
// apps/sanctuary-api/docs/current_progress/2026-10-26-owned-sync-credential-boundary.md
import { createPrivateKey, createPublicKey } from 'node:crypto';
import { jwtVerify, SignJWT } from 'jose';
import { z } from 'zod';

const GRANT_LIFETIME_SECONDS = 300;

const coordinate = z.string().regex(/^[A-Za-z0-9_-]{43}$/);
const signingJwk = z.object({
  kty: z.literal('EC'),
  crv: z.literal('P-256'),
  kid: z.string().min(1).max(128),
  x: coordinate,
  y: coordinate,
  d: coordinate,
});

export interface SyncCredentials {
  endpoint: string;
  token: string;
  expiresAt: number;
}

function bareHttpsOrigin(value: string): string {
  const url = new URL(value);
  if (
    url.protocol !== 'https:' ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  )
    throw new Error('POWERSYNC_URL must be a bare https origin');
  return url.origin;
}

/** Validates the endpoint and key when the API starts, so a bad configuration never serves. */
export function createSyncCredentialIssuer(options: { endpoint: string; signingJwk: string }) {
  const endpoint = bareHttpsOrigin(options.endpoint);
  const key = signingJwk.parse(JSON.parse(options.signingJwk));
  const privateKey = createPrivateKey({ key, format: 'jwk' });
  // Only the public coordinates; the private `d` never leaves this closure.
  const publicKey = createPublicKey({
    key: { kty: key.kty, crv: key.crv, x: key.x, y: key.y },
    format: 'jwk',
  });

  return {
    async issue(accountId: string, sessionExpiresAt: number): Promise<SyncCredentials> {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = Math.min(sessionExpiresAt, now + GRANT_LIFETIME_SECONDS);
      if (expiresAt <= now) throw new Error('Session expired before a sync grant could be issued');
      const token = await new SignJWT({ canonical_account_id: accountId })
        .setProtectedHeader({ alg: 'ES256', kid: key.kid, typ: 'JWT' })
        .setSubject(accountId)
        .setAudience(endpoint)
        .setIssuedAt(now)
        .setExpirationTime(expiresAt)
        .sign(privateKey);
      // A grant PowerSync would reject is a configuration fault; surface it here instead.
      await jwtVerify(token, publicKey, { audience: endpoint });
      return { endpoint, token, expiresAt };
    },
  };
}

export type SyncCredentialIssuer = ReturnType<typeof createSyncCredentialIssuer>;
