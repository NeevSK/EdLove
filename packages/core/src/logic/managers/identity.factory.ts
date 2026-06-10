import { SupabaseIdentityAdapter } from '../../adapters/supabaseIdentity.adapter';
import { IdentityManager } from './IdentityManager';

/**
 * identity: The Global Sovereign Identity Instance.
 */
export const identity = new IdentityManager(new SupabaseIdentityAdapter());
