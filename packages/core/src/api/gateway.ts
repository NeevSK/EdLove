import { authAPI } from './auth';
import { identityAPI } from './identity';

export type SovereignAuthGateway = typeof authAPI;
export type SovereignIdentityGateway = typeof identityAPI;

export interface SovereignGateway {
  auth: SovereignAuthGateway;
  identity: SovereignIdentityGateway;
}

/**
 * Sovereign Gateway
 *
 * This is the explicit two-lane boundary for auth/bootstrap and identity/security
 * concerns. App-data reads and writes should live behind local-first domain ports
 * and Sanctuary API contracts, not raw Supabase access.
 */
export const sovereignGateway: SovereignGateway = {
  auth: authAPI,
  identity: identityAPI,
};

export function createSovereignGateway(): SovereignGateway {
  return sovereignGateway;
}
