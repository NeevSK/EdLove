import { CommunityManager } from './CommunityManager';
import { SupabaseCommunityRepository } from '../../adapters/supabase/communityRepository';
import { growth } from './growth.factory';

/**
 * community: The Global Sovereign Community Instance.
 */
export const community = new CommunityManager(new SupabaseCommunityRepository(), growth);
