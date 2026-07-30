import { SupabaseIdentityAdapter } from '@repo/core/adapters/supabaseIdentity.adapter';
import { IdentityManager } from '@repo/core/logic/managers/IdentityManager';

/**
 * identity: The Global Sovereign Identity Instance.
 */
export const identity = new IdentityManager(new SupabaseIdentityAdapter());
