import type { AuthProviderPort, AuthVerificationResult } from '../ports/AuthProviderPort';
import { verifySupabaseSession } from './verifySupabaseSession';

/**
 * Verifies Supabase signatures, then checks the live provider session without caching it.
 */
export class SupabaseAuthAdapter implements AuthProviderPort {
  readonly providerName = 'supabase';

  async verifyToken(
    token: string,
    env?: Record<string, unknown>,
  ): Promise<AuthVerificationResult | null> {
    const verifiedPayload = await verifySupabaseSession(
      token,
      env as Record<string, string> | undefined,
    );
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
