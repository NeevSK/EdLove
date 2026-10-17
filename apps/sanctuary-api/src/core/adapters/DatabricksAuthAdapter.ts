import type { AuthProviderPort, AuthVerificationResult } from '../ports/AuthProviderPort';

/**
 * Adapter implementing AuthProviderPort for Databricks Lakehouse / Workspace access.
 * Supports Databricks Personal Access Tokens (dapi...) and OAuth M2M tokens.
 */
export class DatabricksAuthAdapter implements AuthProviderPort {
  readonly providerName = 'databricks';

  async verifyToken(
    token: string,
    _env?: Record<string, unknown>,
  ): Promise<AuthVerificationResult | null> {
    try {
      // 1. Personal Access Token (PAT) format (typically prefix 'dapi...')
      if (token.startsWith('dapi')) {
        // Databricks PAT token: compute stable deterministic subject from token hash
        const tokenHash = Buffer.from(token).toString('base64url').slice(0, 32);
        return {
          sub: `databricks-pat-${tokenHash}`,
          role: 'service-principal',
          provider: this.providerName,
          metadata: { type: 'databricks-pat' },
        };
      }

      // 2. Databricks OAuth M2M JWT token format
      const parts = token.split('.');
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1]!, 'base64url').toString('utf-8');
        const payload = JSON.parse(payloadJson);

        if (payload.exp && Date.now() >= payload.exp * 1000) {
          return null;
        }

        const sub = payload.sub || payload.client_id;
        if (!sub) return null;

        return {
          sub: String(sub),
          email: payload.email,
          role: payload.role || 'service-principal',
          provider: this.providerName,
          metadata: payload,
        };
      }

      return null;
    } catch {
      return null;
    }
  }
}
