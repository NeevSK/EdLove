import { createSupabaseEducationalRepository } from '@repo/core/adapters/supabase/educational';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { community } from '@repo/core/logic/managers/community.factory';
import { EducationalManager } from '@repo/core/logic/managers/EducationalManager';
import { growth } from '@repo/core/logic/managers/growth.factory';
import { identity } from '@repo/core/logic/managers/identity.factory';
import { notification } from '@repo/core/logic/managers/notification.factory';
import { profile } from '@repo/core/logic/managers/profile.factory';

/**
 * educational: The Global Sovereign Educational Instance.
 */
export const educational = new EducationalManager(
  createSupabaseEducationalRepository(supabaseClient),
  identity, // session

  growth,
  community,
  notification,
  profile,
);
