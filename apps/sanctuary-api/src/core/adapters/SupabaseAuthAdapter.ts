import { verifySupabaseJwt } from '../../jwt';
import type { AuthProviderPort, AuthVerificationResult } from '../ports/AuthProviderPort';

/**
 * Adapter implementing AuthProviderPort using Supabase Asymmetric Cryptographic JWT Verification.
 * Supports ES256/RS256 signature verification with in-memory caching and JWKS retrieval.
 */
export class SupabaseAuthAdapter implements AuthProviderPort {
  readonly providerName = 'supabase';

  async verifyToken(
    token: string,
    env?: Record<string, unknown>,
  ): Promise<AuthVerificationResult | null> {
    const verifiedPayload = await verifySupabaseJwt(token, env as Record<string, string> | undefined);
    if (!verifiedPayload || !verifiedPayload.sub) {
      return null;
    }

    return {
      sub: verifiedPayload.sub,
      email: verifiedPayload.email,
      role: verifiedPayload.role,
      provider: this.providerName,
      metadata: verifiedPayload,
    };
  }
}
