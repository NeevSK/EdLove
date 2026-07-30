import { createSupabaseProfileRepository } from '@repo/core/adapters/supabase/profileRepository';
import {
  createZenStackProfileRepository,
  isZenStackProfileRepositoryAvailable,
} from '@repo/core/adapters/zenstack/profileRepository';
import { storage } from '@repo/core/lib/storage';
import { media } from '@repo/core/logic/managers/media.factory';
import { ProfileManager } from '@repo/core/logic/managers/ProfileManager';

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
