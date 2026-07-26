import { SupabaseCommunityRepository } from '@/adapters/supabase/communityRepository';
import { CommunityManager } from '@/logic/managers/CommunityManager';
import { growth } from '@/logic/managers/growth.factory';

/**
 * community: The Global Sovereign Community Instance.
 */
export const community = new CommunityManager(new SupabaseCommunityRepository(), growth);
