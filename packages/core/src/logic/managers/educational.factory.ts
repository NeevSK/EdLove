import { createSupabaseEducationalRepository } from '../../adapters/supabase/educational';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../../api/supabase';
import { community } from './community.factory';
import { EducationalManager } from './EducationalManager';
import { growth } from './growth.factory';
import { identity } from './identity.factory';
import { notification } from './notification.factory';
import { profile } from './profile.factory';

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
