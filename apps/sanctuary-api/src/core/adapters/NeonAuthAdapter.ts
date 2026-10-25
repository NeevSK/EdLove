import type { AuthProviderPort, AuthVerificationResult } from '../ports/AuthProviderPort';

/** Reserved port: provider verification must be implemented before enabling this issuer. */
export class NeonAuthAdapter implements AuthProviderPort {
  readonly providerName = 'neon';

  async verifyToken(
    _token: string,
    _env?: Record<string, unknown>,
  ): Promise<AuthVerificationResult | null> {
    throw new Error('NEON_AUTH_NOT_IMPLEMENTED');
  }
}
