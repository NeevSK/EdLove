export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
  provider: 'supabase' | 'neon' | 'databricks' | string;
  metadata?: Record<string, unknown>;
}

export interface AuthVerificationResult {
  /** The verified user subject/identity from the provider */
  sub: string;
  email?: string;
  role?: string;
  provider: string;
  metadata?: Record<string, unknown>;
}

/**
 * Hexagonal Port for authentication and cryptographic identity verification.
 * Decouples core routing and domain logic from specific identity providers
 * (e.g., Supabase, Neon Auth, Databricks M2M/PAT).
 */
export interface AuthProviderPort {
  readonly providerName: string;

  /**
   * Authoritatively verifies an incoming cryptographic bearer token.
   * Returns verified claims or null if verification fails.
   */
  verifyToken(
    token: string,
    env?: Record<string, unknown>,
  ): Promise<AuthVerificationResult | null>;
}
