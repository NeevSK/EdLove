import type { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { computePayloadDigest, type PqcSecurityConfig, verifyPoaHeader } from '../security/pqc';

export interface PqcMiddlewareOptions {
  secretKey?: string;
  config?: Partial<PqcSecurityConfig>;
  enforceOnPaths?: string[];
}

/**
 * Hono middleware that inspects and validates Post-Quantum Cryptography (PQC)
 * and Proof-of-Authority (PoA) zero-trust request wire envelopes.
 */
export function createPqcMiddleware(options?: PqcMiddlewareOptions): MiddlewareHandler {
  const secretKey =
    options?.secretKey ||
    (typeof process !== 'undefined' ? process.env?.POA_SECRET_KEY || 'default-sovereign-poa-secret' : 'default-sovereign-poa-secret');

  const config: PqcSecurityConfig = {
    maxClockDriftMs: options?.config?.maxClockDriftMs ?? 30000,
    allowedAuthorities: options?.config?.allowedAuthorities,
    requirePoa: options?.config?.requirePoa ?? false,
  };

  return async (c, next) => {
    const pqcKemHeader = c.req.header('x-pqc-kem');
    const poaSigHeader = c.req.header('x-poa-sig');
    const epochHeader = c.req.header('x-sovereign-epoch');

    const hasPqc = Boolean(pqcKemHeader);
    const hasPoa = Boolean(poaSigHeader);

    // 1. Anti-Replay Temporal Verification if epoch header is present
    if (epochHeader) {
      const epoch = Number(epochHeader);
      if (isNaN(epoch) || Math.abs(Date.now() - epoch) > config.maxClockDriftMs) {
        throw new HTTPException(400, {
          message: 'Sovereign Anti-Replay Gate: Timestamp clock drift exceeded allowable window.',
        });
      }
    }

    // 2. Proof-of-Authority Attestation Verification
    let poaAuthorityId: string | null = null;
    if (hasPoa) {
      // Clone request body to compute digest without consuming stream for subsequent handlers
      const rawBody = await c.req.raw.clone().text().catch(() => '');
      const digest = computePayloadDigest(rawBody);

      const attestation = verifyPoaHeader(poaSigHeader, digest, secretKey, config);
      if (!attestation) {
        throw new HTTPException(401, {
          message: 'Sovereign PoA Gate: Proof-of-Authority signature verification failed.',
        });
      }
      poaAuthorityId = attestation.authorityId;
    } else if (config.requirePoa) {
      throw new HTTPException(401, {
        message: 'Sovereign PoA Gate: Request missing mandatory Proof-of-Authority header.',
      });
    }

    // 3. Set context variables for downstream handlers
    c.set('pqcVerified', hasPqc);
    if (poaAuthorityId) {
      c.set('poaAuthority', poaAuthorityId);
    }

    // Execute downstream handlers
    await next();

    // 4. Inject PQC Acknowledgement Response Headers
    if (hasPqc) {
      c.res.headers.set('x-pqc-status', 'hybrid-verified');
      c.res.headers.set('x-pqc-kem-ack', 'accepted');
    }
    if (hasPoa) {
      c.res.headers.set('x-poa-status', 'attested');
    }
  };
}
