import { createSupabaseProfileRepository } from '@/adapters/supabase/profileRepository';
import {
  createZenStackProfileRepository,
  isZenStackProfileRepositoryAvailable,
} from '@/adapters/zenstack/profileRepository';
import { storage } from '@/lib/storage';
import { media } from '@/logic/managers/media.factory';
import { ProfileManager } from '@/logic/managers/ProfileManager';

/**
 * profile: The Global Sovereign Profile Instance.
 */
export const profile = new ProfileManager(
  isZenStackProfileRepositoryAvailable()
    ? createZenStackProfileRepository(
        () => ({ id: storage.getString('user_id') || null }),
        media.adapter,
      )
    : createSupabaseProfileRepository(),
);
