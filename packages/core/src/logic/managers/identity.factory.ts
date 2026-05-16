import { IdentityManager } from './IdentityManager';
import { SupabaseIdentityAdapter } from '../../adapters/supabaseIdentity.adapter';

/**
 * identity: The Global Sovereign Identity Instance.
 */
export const identity = new IdentityManager(new SupabaseIdentityAdapter());
