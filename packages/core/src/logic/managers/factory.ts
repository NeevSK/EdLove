import { IdentityManager } from './IdentityManager';
import { SupabaseIdentityAdapter } from '../../adapters/supabaseIdentity.adapter';

/**
 * identity: The Global Sovereign Identity Instance.
 * This is the primary entry point for all identity-related logic.
 */
export const identity = new IdentityManager(new SupabaseIdentityAdapter());
