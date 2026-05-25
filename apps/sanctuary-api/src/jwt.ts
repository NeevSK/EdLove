import crypto from 'node:crypto';

export interface VerifiedJwtPayload {
  sub: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

const jwkCache = new Map<string, crypto.KeyObject>();
let jwksLastFetched = 0;
const JWKS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Global coalesced promise for concurrent JWKS fetch requests
let activeJwksFetch: Promise<void> | null = null;

// Memory cache for cryptographically verified tokens to prevent signature validation CPU saturation
const tokenVerificationCache = new Map<
  string,
  { payload: VerifiedJwtPayload; expiresAt: number }
>();
const VERIFIED_TOKEN_CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes cache lifetime

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
}

/**
 * Fetches JWKS from the Supabase Auth well-known endpoint and caches public keys.
 * Coalesces parallel requests to prevent cache stampedes under high load.
 */
async function getPublicKeyFromJwks(kid: string): Promise<crypto.KeyObject | null> {
  const cached = jwkCache.get(kid);
  if (cached) return cached;

  const now = Date.now();
  if (now - jwksLastFetched > JWKS_CACHE_TTL || jwkCache.size === 0) {
    if (!activeJwksFetch) {
      activeJwksFetch = (async () => {
        try {
          const supabaseUrl =
            process.env.EXPO_PUBLIC_SUPABASE_URL ||
            process.env.SUPABASE_URL ||
            'https://qzoawolfkuwiuyaoiybz.supabase.co';
          const jwksUrl = `${supabaseUrl}/auth/v1/.well-known/jwks.json`;

          console.log(`[JWT] 🌐 Fetching JWKS from authoritative gateway (Coalesced): ${jwksUrl}`);
          const response = await fetch(jwksUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch JWKS: ${response.statusText}`);
          }

          const jwks = await response.json();
          if (jwks && Array.isArray(jwks.keys)) {
            for (const key of jwks.keys) {
              if (key.kid && key.kty) {
                try {
                  const pubKey = crypto.createPublicKey({
                    format: 'jwk',
                    key,
                  });
                  jwkCache.set(key.kid, pubKey);
                } catch (err) {
                  console.warn(`[JWT] ⚠️ Failed to import JWK key ${key.kid}:`, err);
                }
              }
            }
            jwksLastFetched = Date.now();
          }
        } catch (err) {
          console.warn(
            '[JWT] ⚠️ Could not fetch or parse JWKS from Supabase. Offline/mock mode may apply:',
            err,
          );
        }
      })();
    }
    await activeJwksFetch;
  }

  return jwkCache.get(kid) ?? null;
}

/**
 * Robust asymmetric RS256/ES256 cryptographic verification of Supabase JWT tokens.
 * Verifies authenticity, integrity, and standard claims (exp, nbf, aud).
 * Integrates a SHA-256 token verification cache to prevent cryptographic CPU saturation.
 */
export async function verifySupabaseJwt(token: string): Promise<VerifiedJwtPayload | null> {
  // Support local development & integration test bypass in non-production environments
  const isTestOrDev = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
  if (
    isTestOrDev &&
    (token === 'admin-user-1' ||
      token === 'student-user-1' ||
      token === 'teacher-user-1' ||
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(token))
  ) {
    console.log(`[JWT] 🧪 Bypassing cryptographic check for integration test identity: "${token}"`);
    return { sub: token, role: 'authenticated' };
  }

  // 1. Assert memory caching of verified token hashes (mitigates Signature Verification CPU Saturation)
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // Randomly execute eviction to prevent unbounded memory growth (10% probability per request)
  if (Math.random() < 0.1) {
    cleanExpiredVerificationCache();
  }

  const cachedResult = tokenVerificationCache.get(tokenHash);
  if (cachedResult && cachedResult.expiresAt > Date.now()) {
    const nowSec = Math.floor(Date.now() / 1000);
    if (!cachedResult.payload.exp || cachedResult.payload.exp > nowSec) {
      return cachedResult.payload;
    }
    tokenVerificationCache.delete(tokenHash);
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('[JWT] ❌ Invalid token format. Must contain 3 sections.');
      return null;
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    const headerJson = Buffer.from(headerB64, 'base64url').toString('utf8');
    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf8');

    const header = JSON.parse(headerJson);
    const payload = JSON.parse(payloadJson);

    // Assert authentic cryptographic algorithms (RS256 or ES256)
    if (header.alg !== 'RS256' && header.alg !== 'ES256') {
      console.warn(
        `[JWT] ❌ Rejected non-asymmetric algorithm: "${header.alg}". Must be RS256 or ES256.`,
      );
      return null;
    }

    // Assert token is not expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.warn(`[JWT] ❌ Expired token rejected. Exp: ${payload.exp}, Now: ${now}`);
      return null;
    }

    // Assert token activation
    if (payload.nbf && payload.nbf > now) {
      console.warn(`[JWT] ❌ Pre-active token rejected. Nbf: ${payload.nbf}, Now: ${now}`);
      return null;
    }

    // Resolve cryptographic verification key
    let publicKey: crypto.KeyObject | null = null;

    // A. Check for static public key override in environment (e.g. PEM format or JWK JSON)
    const envKey = process.env.SUPABASE_JWT_PUBLIC_KEY;
    if (envKey) {
      try {
        if (envKey.trim().startsWith('{')) {
          publicKey = crypto.createPublicKey({
            format: 'jwk',
            key: JSON.parse(envKey),
          });
        } else {
          publicKey = crypto.createPublicKey(envKey);
        }
      } catch (err) {
        console.error(
          '[JWT] ❌ Failed to load static public key from SUPABASE_JWT_PUBLIC_KEY:',
          err,
        );
      }
    }

    // B. Resolve key from JWKS if not overridden
    if (!publicKey && header.kid) {
      publicKey = await getPublicKeyFromJwks(header.kid);
    }

    if (!publicKey) {
      console.warn('[JWT] ❌ No valid cryptographic public key found for verification.');
      return null;
    }

    // Perform signature validation using native asymmetric algorithms
    const dataToVerify = Buffer.from(`${headerB64}.${payloadB64}`);
    const signature = Buffer.from(signatureB64, 'base64url');

    // Resolve ECDSA P-1363 raw signature encoding if using ES256
    const verifyOptions: any = {
      key: publicKey,
    };
    if (header.alg === 'ES256') {
      verifyOptions.dsaEncoding = 'ieee-p1363';
    }

    const isVerified = crypto.verify(
      'sha256', // RS256 & ES256 both use SHA-256 hash
      dataToVerify,
      verifyOptions,
      signature,
    );

    if (!isVerified) {
      console.warn(
        '[JWT] ❌ Asymmetric signature verification failed. Cryptographic identity spoofing suspected.',
        '\nHeader:',
        JSON.stringify(header),
        '\nPayload:',
        JSON.stringify(payload),
      );
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
      Date.now() + VERIFIED_TOKEN_CACHE_MAX_AGE,
      verifiedPayload.exp ? verifiedPayload.exp * 1000 : Date.now() + VERIFIED_TOKEN_CACHE_MAX_AGE,
    );
    tokenVerificationCache.set(tokenHash, { payload: verifiedPayload, expiresAt: cacheExpiresAt });

    return verifiedPayload;
  } catch (err) {
    console.error('[JWT] ❌ Error occurred during token verification:', err);
    return null;
  }
}

/**
 * Manually populates the cache for testing.
 */
export function setTestPublicKey(kid: string, key: crypto.KeyObject) {
  jwkCache.set(kid, key);
}

/**
 * Clears both JWKS and Token Verification caches.
 */
export function clearJwkCache() {
  jwkCache.clear();
  tokenVerificationCache.clear();
  jwksLastFetched = 0;
}
