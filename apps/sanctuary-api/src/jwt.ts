import { assertSecureApiUrl } from '@repo/core/api/transportSecurity';
import { fetchWithTrace } from './telemetry/otel';

export interface VerifiedJwtPayload {
  sub: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

interface JwksState {
  keys: Map<string, CryptoKey>;
  expiresAt: number;
  retryAfter: number;
  activeFetch: Promise<void> | null;
}

const jwkAuthorities = new Map<string, JwksState>();
const testPublicKeys = new Map<string, CryptoKey>();
let jwksGeneration = 0;
const JWKS_CACHE_TTL = 10 * 60 * 1000;
const JWKS_REFRESH_COOLDOWN = 30 * 1000;

// Memory cache for cryptographically verified tokens to prevent signature validation CPU saturation
const tokenVerificationCache = new Map<
  string,
  { payload: VerifiedJwtPayload; expiresAt: number }
>();
const VERIFIED_TOKEN_CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes cache lifetime

/**
 * Helper to retrieve environment variables safely across runtimes.
 */
function getEnv(key: string, envOverrides?: Record<string, string>): string | undefined {
  if (envOverrides && key in envOverrides) {
    return envOverrides[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  if (typeof globalThis !== 'undefined' && (globalThis as any).ENV) {
    return (globalThis as any).ENV[key];
  }
  return undefined;
}

/**
 * Periodically purges expired entries from the token verification cache to prevent memory leaks.
 */
function cleanExpiredVerificationCache() {
  const now = Date.now();
  for (const [hash, entry] of tokenVerificationCache.entries()) {
    if (entry.expiresAt < now) {
      tokenVerificationCache.delete(hash);
    }
  }
  // Enforce capacity bounds (max 1000 entries)
  while (tokenVerificationCache.size > 1000) {
    const oldestKey = tokenVerificationCache.keys().next().value;
    if (oldestKey) {
      tokenVerificationCache.delete(oldestKey);
    } else {
      break;
    }
  }
}

/**
 * Helper to generate a SHA-256 hash string for caching.
 */
async function computeSha256(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Decodes base64url string to standard UTF-8 string.
 */
function decodeBase64Url(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

/**
 * Decodes base64url to Uint8Array.
 */
function base64UrlToUint8Array(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Helper to convert standard UTF-8 string to Uint8Array.
 */
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Convert PEM public key to DER binary.
 */
function pemToDer(pem: string): Uint8Array {
  const pemHeader = '-----BEGIN PUBLIC KEY-----';
  const pemFooter = '-----END PUBLIC KEY-----';
  const pemContents = pem.replace(pemHeader, '').replace(pemFooter, '').replace(/\s+/g, '');
  const binaryString = atob(pemContents);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Fetches JWKS from the Supabase Auth well-known endpoint and caches public keys.
 * Coalesces parallel requests to prevent cache stampedes under high load.
 */
async function getPublicKeyFromJwks(
  kid: string,
  envOverrides?: Record<string, string>,
): Promise<{ key: CryptoKey; expiresAt: number } | null> {
  const testKey = process.env.NODE_ENV === 'test' ? testPublicKeys.get(kid) : undefined;
  if (testKey) return { key: testKey, expiresAt: Number.POSITIVE_INFINITY };
  const supabaseUrl = getEnv('SUPABASE_URL', envOverrides);
  if (!supabaseUrl) return null;
  assertSecureApiUrl(supabaseUrl);
  const jwksUrl = new URL('auth/v1/.well-known/jwks.json', `${supabaseUrl.replace(/\/$/, '')}/`)
    .href;
  let state = jwkAuthorities.get(jwksUrl);
  if (!state) {
    state = { keys: new Map(), expiresAt: 0, retryAfter: 0, activeFetch: null };
    jwkAuthorities.set(jwksUrl, state);
  }
  const now = Date.now();
  const cached = state.keys.get(kid);
  if (cached && state.expiresAt > now) return { key: cached, expiresAt: state.expiresAt };

  // Unknown kids can trigger rotation discovery without letting arbitrary tokens flood the issuer.
  if (!state.activeFetch && now >= state.retryAfter) {
    state.retryAfter = now + JWKS_REFRESH_COOLDOWN;
    const authority = state;
    authority.activeFetch = (async () => {
      try {
        const response = await fetchWithTrace(jwksUrl, {
          signal: AbortSignal.timeout(4000),
          redirect: 'error',
        });
        if (!response.ok) throw new Error('JWKS_FETCH_FAILED');
        const document: unknown = await response.json();
        if (
          !document ||
          typeof document !== 'object' ||
          !('keys' in document) ||
          !Array.isArray(document.keys)
        ) {
          throw new Error('JWKS_INVALID_DOCUMENT');
        }
        const keys = new Map<string, CryptoKey>();
        for (const candidate of document.keys) {
          if (!candidate || typeof candidate !== 'object') continue;
          const jwk = candidate as JsonWebKey & { kid?: unknown };
          if (
            typeof jwk.kid !== 'string' ||
            !jwk.kid ||
            (jwk.use && jwk.use !== 'sig') ||
            (jwk.key_ops && !jwk.key_ops.includes('verify'))
          )
            continue;
          if (
            !(
              (jwk.kty === 'RSA' && (!jwk.alg || jwk.alg === 'RS256')) ||
              (jwk.kty === 'EC' && jwk.crv === 'P-256' && (!jwk.alg || jwk.alg === 'ES256'))
            )
          )
            continue;
          if (keys.has(jwk.kid)) throw new Error('JWKS_DUPLICATE_KID');
          try {
            const key = await globalThis.crypto.subtle.importKey(
              'jwk',
              jwk,
              jwk.kty === 'EC'
                ? { name: 'ECDSA', namedCurve: 'P-256' }
                : { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
              false,
              ['verify'],
            );
            keys.set(jwk.kid, key);
          } catch {
            console.warn('[JWT] Ignored an unusable verification key from the identity provider.');
          }
        }
        authority.keys = keys;
        authority.expiresAt = Date.now() + JWKS_CACHE_TTL;
        jwksGeneration += 1;
        tokenVerificationCache.clear();
      } catch {
        console.warn('[JWT] Verification-key refresh failed.');
      } finally {
        authority.activeFetch = null;
      }
    })();
  }
  await state.activeFetch;
  const key = state.keys.get(kid);
  return key && state.expiresAt > Date.now() ? { key, expiresAt: state.expiresAt } : null;
}

function hasExpectedClaims(
  payload: Record<string, unknown>,
  envOverrides?: Record<string, string>,
): boolean {
  const now = Math.floor(Date.now() / 1000);
  if (
    typeof payload.sub !== 'string' ||
    payload.sub.trim().length === 0 ||
    typeof payload.exp !== 'number' ||
    !Number.isFinite(payload.exp) ||
    payload.exp <= now ||
    (payload.nbf !== undefined &&
      (typeof payload.nbf !== 'number' || !Number.isFinite(payload.nbf) || payload.nbf > now)) ||
    payload.client_id !== undefined
  ) {
    return false;
  }
  const expectedIssuer = getEnv('SUPABASE_JWT_ISSUER', envOverrides);
  const expectedAudience = getEnv('SUPABASE_JWT_AUDIENCE', envOverrides);
  const isProduction = getEnv('NODE_ENV', envOverrides) === 'production';

  if (isProduction && (!expectedIssuer || !expectedAudience)) {
    console.error('[JWT] JWT issuer and audience configuration is required in production.');
    return false;
  }

  if (expectedIssuer && payload.iss !== expectedIssuer) {
    console.warn('[JWT] Rejected token with an unexpected issuer.');
    return false;
  }

  if (expectedAudience) {
    const audience = payload.aud;
    const hasExpectedAudience =
      audience === expectedAudience ||
      (Array.isArray(audience) && audience.some((value) => value === expectedAudience));
    if (!hasExpectedAudience) {
      console.warn('[JWT] Rejected token with an unexpected audience.');
      return false;
    }
  }

  return true;
}

/**
 * Robust asymmetric RS256/ES256 cryptographic verification of Supabase JWT tokens.
 * Verifies authenticity, integrity, and standard claims (exp, nbf, aud).
 * Integrates a SHA-256 token verification cache to prevent cryptographic CPU saturation.
 */
export async function verifySupabaseJwt(
  token: string,
  envOverrides?: Record<string, string>,
): Promise<VerifiedJwtPayload | null> {
  // Synthetic identities exist only in the test harness, never a dev server.
  const nodeEnv = getEnv('NODE_ENV', envOverrides);
  const isTestOrDev = nodeEnv === 'test';
  if (
    isTestOrDev &&
    (token === 'admin-user-1' ||
      token === 'student-user-1' ||
      token === 'teacher-user-1' ||
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(token))
  ) {
    console.info('[JWT] Using an approved non-production test identity.');
    return { sub: token, role: 'authenticated' };
  }

  // 1. Assert memory caching of verified token hashes (mitigates Signature Verification CPU Saturation)
  const tokenHash = await computeSha256(
    JSON.stringify([
      token,
      getEnv('SUPABASE_URL', envOverrides),
      getEnv('SUPABASE_JWT_ISSUER', envOverrides),
      getEnv('SUPABASE_JWT_AUDIENCE', envOverrides),
      getEnv('SUPABASE_JWT_PUBLIC_KEY', envOverrides),
      nodeEnv,
    ]),
  );

  const cachedResult = tokenVerificationCache.get(tokenHash);
  if (cachedResult && cachedResult.expiresAt > Date.now()) {
    const nowSec = Math.floor(Date.now() / 1000);
    if (
      (!cachedResult.payload.exp || cachedResult.payload.exp > nowSec) &&
      hasExpectedClaims(cachedResult.payload, envOverrides)
    ) {
      return cachedResult.payload;
    }
    tokenVerificationCache.delete(tokenHash);
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('[JWT] Rejected a malformed authentication token.');
      return null;
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    const headerJson = decodeBase64Url(headerB64);
    const payloadJson = decodeBase64Url(payloadB64);

    const header = JSON.parse(headerJson);
    const payload = JSON.parse(payloadJson);

    if (!hasExpectedClaims(payload, envOverrides)) {
      return null;
    }

    // Assert authentic cryptographic algorithms (RS256 or ES256)
    if (header.alg !== 'RS256' && header.alg !== 'ES256') {
      console.warn('[JWT] Rejected an authentication token with an unsupported algorithm.');
      return null;
    }

    // Assert token is not expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.warn('[JWT] Rejected an expired authentication token.');
      return null;
    }

    // Assert token activation
    if (payload.nbf && payload.nbf > now) {
      console.warn('[JWT] Rejected an authentication token that is not active yet.');
      return null;
    }

    // Resolve cryptographic verification key
    let publicKey: CryptoKey | null = null;
    let keyExpiresAt = Number.POSITIVE_INFINITY;

    // A. Check for static public key override in environment (e.g. PEM format or JWK JSON)
    const envKey = getEnv('SUPABASE_JWT_PUBLIC_KEY', envOverrides);
    if (envKey) {
      try {
        if (envKey.trim().startsWith('{')) {
          const parsedJwk = JSON.parse(envKey);
          publicKey = await globalThis.crypto.subtle.importKey(
            'jwk',
            parsedJwk,
            {
              name: parsedJwk.kty === 'EC' ? 'ECDSA' : 'RSASSA-PKCS1-v1_5',
              namedCurve: parsedJwk.kty === 'EC' ? 'P-256' : undefined,
              hash: { name: 'SHA-256' },
            },
            true,
            ['verify'],
          );
        } else {
          try {
            const cleanPem = envKey
              .replace(/-----BEGIN RSA PUBLIC KEY-----/, '-----BEGIN PUBLIC KEY-----')
              .replace(/-----END RSA PUBLIC KEY-----/, '-----END PUBLIC KEY-----');
            const der = pemToDer(cleanPem);
            publicKey = await globalThis.crypto.subtle.importKey(
              'spki',
              der as BufferSource,
              {
                name: 'RSASSA-PKCS1-v1_5',
                hash: { name: 'SHA-256' },
              },
              true,
              ['verify'],
            );
          } catch (webCryptoErr) {
            // Fall back to Node's crypto to parse non-SPKI PEM formats (like PKCS#1) if running in Node/Bun
            try {
              if (typeof require !== 'undefined') {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const nodeCrypto = require('node:crypto');
                const nodeKey = nodeCrypto.createPublicKey(envKey);
                const jwk = nodeKey.export({ format: 'jwk' });
                publicKey = await globalThis.crypto.subtle.importKey(
                  'jwk',
                  jwk,
                  {
                    name: 'RSASSA-PKCS1-v1_5',
                    hash: { name: 'SHA-256' },
                  },
                  true,
                  ['verify'],
                );
              } else {
                throw webCryptoErr;
              }
            } catch (fallbackErr) {
              throw webCryptoErr;
            }
          }
        }
      } catch {
        console.error('[JWT] Failed to load the configured verification key.');
        return null;
      }
    }

    // B. Resolve key from JWKS if not overridden
    if (!publicKey && typeof header.kid === 'string' && header.kid.length > 0) {
      const resolved = await getPublicKeyFromJwks(header.kid, envOverrides);
      publicKey = resolved?.key ?? null;
      keyExpiresAt = resolved?.expiresAt ?? 0;
    }

    if (!publicKey) {
      console.warn('[JWT] ❌ No valid cryptographic public key found for verification.');
      return null;
    }

    // Perform signature validation using Web Crypto APIs
    const dataToVerify = stringToUint8Array(`${headerB64}.${payloadB64}`);
    const signature = base64UrlToUint8Array(signatureB64);
    const verificationGeneration = jwksGeneration;

    const isVerified = await globalThis.crypto.subtle.verify(
      header.alg === 'ES256'
        ? { name: 'ECDSA', hash: { name: 'SHA-256' } }
        : { name: 'RSASSA-PKCS1-v1_5' },
      publicKey,
      signature as BufferSource,
      dataToVerify as BufferSource,
    );

    if (!isVerified || !hasExpectedClaims(payload, envOverrides)) {
      console.warn('[JWT] Asymmetric signature verification failed.');
      return null;
    }

    // Ensure subject user ID claim is present
    if (!payload.sub) {
      console.warn('[JWT] ❌ Missing subject user ID ("sub") claim.');
      return null;
    }

    const verifiedPayload = payload as VerifiedJwtPayload;

    // Cache the verified token signature to optimize next executions
    const cacheExpiresAt = Math.min(
      keyExpiresAt,
      Date.now() + VERIFIED_TOKEN_CACHE_MAX_AGE,
      verifiedPayload.exp ? verifiedPayload.exp * 1000 : Date.now() + VERIFIED_TOKEN_CACHE_MAX_AGE,
    );
    if (verificationGeneration === jwksGeneration) {
      tokenVerificationCache.set(tokenHash, {
        payload: verifiedPayload,
        expiresAt: cacheExpiresAt,
      });
    }
    cleanExpiredVerificationCache();

    return verifiedPayload;
  } catch {
    console.error('[JWT] Authentication token verification failed.');
    return null;
  }
}

/**
 * Manually populates the cache for testing.
 */
export async function setTestPublicKey(kid: string, key: any) {
  if (process.env.NODE_ENV !== 'test') throw new Error('TEST_KEY_INJECTION_FORBIDDEN');
  let cryptoKey: any = key;
  if (key && typeof key.export === 'function') {
    // If it's a Node.js KeyObject, export it to JWK and import it as a standard Web CryptoKey
    try {
      const jwk = key.export({ format: 'jwk' });
      cryptoKey = await globalThis.crypto.subtle.importKey(
        'jwk',
        jwk,
        {
          name: jwk.kty === 'EC' ? 'ECDSA' : 'RSASSA-PKCS1-v1_5',
          namedCurve: jwk.kty === 'EC' ? 'P-256' : undefined,
          hash: { name: 'SHA-256' },
        },
        true,
        ['verify'],
      );
    } catch (err) {
      console.error('[JWT] Failed to convert test key from KeyObject to CryptoKey:', err);
    }
  }
  testPublicKeys.set(kid, cryptoKey);
}

/**
 * Clears both JWKS and Token Verification caches.
 */
export function clearJwkCache() {
  jwksGeneration += 1;
  jwkAuthorities.clear();
  testPublicKeys.clear();
  tokenVerificationCache.clear();
}
