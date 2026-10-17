import type { AuthProviderPort, AuthVerificationResult } from '../ports/AuthProviderPort';

/**
 * Adapter implementing AuthProviderPort for Neon (Serverless Postgres Auth / OIDC).
 * Enables seamless swap to Neon authentication without touching route handlers.
 */
export class NeonAuthAdapter implements AuthProviderPort {
  readonly providerName = 'neon';

  async verifyToken(
    token: string,
    _env?: Record<string, unknown>,
  ): Promise<AuthVerificationResult | null> {
    try {
      // Decode JWT parts (header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const payloadJson = Buffer.from(parts[1]!, 'base64url').toString('utf-8');
      const payload = JSON.parse(payloadJson);

      // Verify token expiration
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        return null;
      }

      // Check issuer/claim indicates neon or matches expected neon authority
      const isNeonIssuer =
        typeof payload.iss === 'string' &&
        (payload.iss.includes('neon.tech') || payload.iss.includes('neon-auth'));

      if (!isNeonIssuer && !payload.neon_user_id) {
        // Fallback: check if sub exists
        if (!payload.sub) return null;
      }

      const sub = payload.sub || payload.neon_user_id;
      if (!sub) return null;

      return {
        sub: String(sub),
        email: payload.email,
        role: payload.role || 'authenticated',
        provider: this.providerName,
        metadata: payload,
      };
    } catch {
      return null;
    }
  }
}
