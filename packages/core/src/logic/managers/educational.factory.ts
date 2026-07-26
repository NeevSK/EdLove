import { createSupabaseEducationalRepository } from '@/adapters/supabase/educational';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@/api/supabase';
import { community } from '@/logic/managers/community.factory';
import { EducationalManager } from '@/logic/managers/EducationalManager';
import { growth } from '@/logic/managers/growth.factory';
import { identity } from '@/logic/managers/identity.factory';
import { notification } from '@/logic/managers/notification.factory';
import { profile } from '@/logic/managers/profile.factory';

/**
 * educational: The Global Sovereign Educational Instance.
 */
export const educational = new EducationalManager(
  createSupabaseEducationalRepository(__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__),
  identity, // session

  growth,
  community,
  notification,
  profile,
);
