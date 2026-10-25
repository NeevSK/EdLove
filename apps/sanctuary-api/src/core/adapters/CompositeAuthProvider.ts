import type { AuthProviderPort, AuthVerificationResult } from '../ports/AuthProviderPort';
import { DatabricksAuthAdapter } from './DatabricksAuthAdapter';
import { NeonAuthAdapter } from './NeonAuthAdapter';
import { SupabaseAuthAdapter } from './SupabaseAuthAdapter';

/**
 * Selects one configured verifier. Rejection must never change the trust authority.
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
    const provider = env?.AUTH_PROVIDER ?? this.defaultProvider;
    const adapter = typeof provider === 'string' ? this.adapters.get(provider) : undefined;
    if (!adapter) {
      throw new Error('AUTH_PROVIDER_NOT_CONFIGURED');
    }
    return adapter.verifyToken(token, env);
  }
}
