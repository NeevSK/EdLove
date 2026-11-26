import { createPrivateKey, createPublicKey, type KeyObject } from 'node:crypto';
import { ORPCError } from '@orpc/server';
import { SyncGrant } from '@repo/core/api/v1/contract';
import { SignJWT } from 'jose';
import { z } from 'zod';
import type { AuthenticatedIdentity } from './security';

/**
 * Issues the short-lived token a device presents to the PowerSync service. The service trusts
 * our key (`powersync/service.yaml` `client_auth.jwks`), not Supabase's, so authority over what a
 * device may download stays with this API. The sync streams read `canonical_account_id`.
 *
 * A grant never outlives the session that asked for it, and lasts at most five minutes; the
 * device asks again when PowerSync needs a fresh one.
 */

export const SYNC_GRANT_LIFETIME_SECONDS = 300;

const coordinate = z.string().regex(/^[A-Za-z0-9_-]{43}$/);
const SigningJwk = z.strictObject({
  kty: z.literal('EC'),
  crv: z.literal('P-256'),
  kid: z.string().min(1).max(128),
  x: coordinate,
  y: coordinate,
  d: coordinate,
  alg: z.literal('ES256').optional(),
  use: z.literal('sig').optional(),
});

export interface SyncGrantOptions {
  /** The PowerSync instance URL: an origin, HTTPS except for local development. */
  readonly endpoint: string;
  /** The private ES256 JWK (JSON), held in Doppler. Its public half is in `service.yaml`. */
  readonly signingJwk: string;
  readonly now?: () => number;
}

export type SyncGrants = ReturnType<typeof createSyncGrants>;

function syncEndpoint(value: string): string {
  const url = new URL(value);
  const local = url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !local) || url.origin !== value.replace(/\/$/, ''))
    throw new Error('Invalid sync configuration');
  return url.origin;
}

/** Validates the configuration at startup, so a bad key stops the server, not a sign-in. */
export function createSyncGrants(options: SyncGrantOptions) {
  const endpoint = syncEndpoint(options.endpoint);
  const jwk = SigningJwk.parse(JSON.parse(options.signingJwk));
  const key: KeyObject = createPrivateKey({ key: jwk, format: 'jwk' });
  const now = options.now ?? Date.now;

  async function issue(identity: AuthenticatedIdentity) {
    const issuedAt = Math.floor(now() / 1000);
    const expiresAt = Math.min(identity.expiresAt, issuedAt + SYNC_GRANT_LIFETIME_SECONDS);
    if (expiresAt <= issuedAt)
      throw new ORPCError('UNAUTHORIZED', { message: 'Authentication is required.' });
    const token = await new SignJWT({ canonical_account_id: identity.accountId })
      .setProtectedHeader({ alg: 'ES256', kid: jwk.kid, typ: 'JWT' })
      .setSubject(identity.accountId)
      .setAudience(endpoint)
      .setIssuedAt(issuedAt)
      .setExpirationTime(expiresAt)
      .sign(key);
    return SyncGrant.parse({ accountId: identity.accountId, endpoint, token, expiresAt });
  }

  return {
    issue,
    /** The public half, for `service.yaml` and for tests. Never the private key. */
    publicJwk: () => ({
      ...createPublicKey(key).export({ format: 'jwk' }),
      kid: jwk.kid,
      alg: 'ES256',
      use: 'sig',
    }),
  };
}
