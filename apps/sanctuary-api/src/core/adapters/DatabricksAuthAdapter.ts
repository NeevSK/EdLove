import type { AuthProviderPort, AuthVerificationResult } from '../ports/AuthProviderPort';

/** Reserved port: provider verification must be implemented before enabling this issuer. */
export class DatabricksAuthAdapter implements AuthProviderPort {
  readonly providerName = 'databricks';

  async verifyToken(
    _token: string,
    _env?: Record<string, unknown>,
  ): Promise<AuthVerificationResult | null> {
    throw new Error('DATABRICKS_AUTH_NOT_IMPLEMENTED');
  }
}
