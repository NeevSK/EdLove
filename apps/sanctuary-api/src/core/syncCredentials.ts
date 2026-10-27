import { SyncCredentialsSchema } from '@repo/core/api/syncCredentials';
import { assertSecureApiUrl } from '@repo/core/api/transportSecurity';
import { CanonicalAccountIdSchema } from '@repo/core/logic/schemas/identity.schema';
import { z } from 'zod';

const coordinate = z.string().regex(/^[A-Za-z0-9_-]{43}$/);
const publicJwk = z.strictObject({
  kty: z.literal('EC'),
  crv: z.literal('P-256'),
  kid: z.string().min(1).max(128),
  x: coordinate,
  y: coordinate,
  alg: z.literal('ES256').optional(),
  use: z.literal('sig').optional(),
});
const signingJwk = publicJwk.extend({ d: coordinate });
const verificationJwks = z.strictObject({ keys: z.array(publicJwk).min(1).max(3) });
const SYNC_GRANT_LIFETIME_SECONDS = 300;

async function configuration(environment: Record<string, string>) {
  const value = (name: string) => environment[name] ?? process.env[name];
  const endpoint = new URL(value('POWERSYNC_URL') ?? value('EXPO_PUBLIC_POWERSYNC_URL') ?? '');
  assertSecureApiUrl(endpoint.toString());
  if (
    endpoint.pathname !== '/' ||
    endpoint.search ||
    endpoint.hash ||
    endpoint.username ||
    endpoint.password
  )
    throw new Error('INVALID_SYNC_ENDPOINT');
  const key = signingJwk.parse(JSON.parse(value('POWERSYNC_SIGNING_JWK') ?? 'null'));
  const configuredKeys = value('POWERSYNC_VERIFYING_JWKS');
  const keys =
    configuredKeys === undefined
      ? [publicSigningKey(key)]
      : verificationJwks.parse(JSON.parse(configuredKeys)).keys.map(publicSigningKey);
  if (new Set(keys.map((candidate) => candidate.kid)).size !== keys.length)
    throw new Error('SYNC_DUPLICATE_KEY_ID');
  const active = keys.find((candidate) => candidate.kid === key.kid);
  if (!active || active.x !== key.x || active.y !== key.y)
    throw new Error('SYNC_ACTIVE_VERIFICATION_KEY_MISSING');
  await Promise.all(
    keys.map((candidate) =>
      crypto.subtle.importKey('jwk', candidate, { name: 'ECDSA', namedCurve: 'P-256' }, false, [
        'verify',
      ]),
    ),
  );
  return { endpoint: endpoint.origin, key, keys };
}

function encodeJson(value: object) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
}

function publicSigningKey(key: z.infer<typeof publicJwk>) {
  // Project fields explicitly: a private JWK must never leave the signing boundary.
  return { kty: key.kty, crv: key.crv, kid: key.kid, x: key.x, y: key.y, alg: 'ES256', use: 'sig' };
}

export async function createSyncCredentials(
  accountId: string,
  sessionExpiresAt: number,
  environment: Record<string, string>,
) {
  CanonicalAccountIdSchema.parse(accountId);
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = Math.min(
    z.number().int().positive().parse(sessionExpiresAt),
    now + SYNC_GRANT_LIFETIME_SECONDS,
  );
  if (expiresAt <= now) throw new Error('SYNC_SESSION_EXPIRED');
  const { endpoint, key } = await configuration(environment);
  const privateKey = await crypto.subtle.importKey(
    'jwk',
    key,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );
  const payload = `${encodeJson({ alg: 'ES256', kid: key.kid, typ: 'JWT' })}.${encodeJson({
    sub: accountId,
    canonical_account_id: accountId,
    aud: endpoint,
    iat: now,
    exp: expiresAt,
  })}`;
  const signature = new Uint8Array(
    await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      privateKey,
      new TextEncoder().encode(payload),
    ),
  );
  const publicKey = await crypto.subtle.importKey(
    'jwk',
    publicSigningKey(key),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['verify'],
  );
  if (
    !(await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      publicKey,
      signature,
      new TextEncoder().encode(payload),
    ))
  )
    throw new Error('SYNC_SIGNING_KEY_MISMATCH');
  const encodedSignature = btoa(String.fromCharCode(...signature))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
  return SyncCredentialsSchema.parse({
    accountId,
    endpoint,
    token: `${payload}.${encodedSignature}`,
    expiresAt,
  });
}

export async function getSyncPublicKeys(environment: Record<string, string>) {
  const { keys } = await configuration(environment);
  return { keys };
}
