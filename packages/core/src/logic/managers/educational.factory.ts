import { EducationalManager } from './EducationalManager';
import { createSupabaseEducationalRepository } from '../../adapters/supabase/educationalRepository';
import { identity } from './identity.factory';
import { growth } from './growth.factory';
import { community } from './community.factory';
import { notification } from './notification.factory';
import { profile } from './profile.factory';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../../api/supabase';

/**
 * educational: The Global Sovereign Educational Instance.
 */
export const educational = new EducationalManager(
  createSupabaseEducationalRepository(__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__),
  identity, // session

  growth,
  community,
  notification,
  profile
);
