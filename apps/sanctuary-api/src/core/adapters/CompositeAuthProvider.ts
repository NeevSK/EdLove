import type { AuthProviderPort, AuthVerificationResult } from '../ports/AuthProviderPort';
import { DatabricksAuthAdapter } from './DatabricksAuthAdapter';
import { NeonAuthAdapter } from './NeonAuthAdapter';
import { SupabaseAuthAdapter } from './SupabaseAuthAdapter';

/**
 * Composite Auth Provider that multiplexes between Supabase, Neon, and Databricks.
 * Inspects token format or environment configuration to route to the appropriate adapter.
 */
export class CompositeAuthProvider implements AuthProviderPort {
  readonly providerName = 'composite';

  private readonly adapters: Map<string, AuthProviderPort> = new Map();
  private readonly defaultProvider: string;

  constructor(defaultProvider: string = 'supabase') {
    this.defaultProvider = defaultProvider;
    this.registerAdapter(new SupabaseAuthAdapter());
    this.registerAdapter(new NeonAuthAdapter());
    this.registerAdapter(new DatabricksAuthAdapter());
  }

  registerAdapter(adapter: AuthProviderPort): void {
    this.adapters.set(adapter.providerName, adapter);
  }

  async verifyToken(
    token: string,
    env?: Record<string, unknown>,
  ): Promise<AuthVerificationResult | null> {
    // 1. Detect Databricks PAT
    if (token.startsWith('dapi')) {
      const databricks = this.adapters.get('databricks');
      if (databricks) return databricks.verifyToken(token, env);
    }

    // 2. Check explicit provider hint in env if present
    const explicitProvider = env?.AUTH_PROVIDER as string | undefined;
    if (explicitProvider && this.adapters.has(explicitProvider)) {
      return this.adapters.get(explicitProvider)!.verifyToken(token, env);
    }

    // 3. Try default provider first (Supabase)
    const primary = this.adapters.get(this.defaultProvider);
    if (primary) {
      const result = await primary.verifyToken(token, env);
      if (result) return result;
    }

    // 4. Fallback across all other registered adapters
    for (const [name, adapter] of this.adapters.entries()) {
      if (name !== this.defaultProvider) {
        const result = await adapter.verifyToken(token, env);
        if (result) return result;
      }
    }

    return null;
  }
}
