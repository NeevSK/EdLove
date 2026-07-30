import { SupabaseCommunityRepository } from '@repo/core/adapters/supabase/communityRepository';
import { CommunityManager } from '@repo/core/logic/managers/CommunityManager';
import { growth } from '@repo/core/logic/managers/growth.factory';

/**
 * community: The Global Sovereign Community Instance.
 */
export const community = new CommunityManager(new SupabaseCommunityRepository(), growth);
