import { createSupabaseGuardianRepository } from '@repo/core/adapters/supabase/guardianRepository';
import { createGuardianServices } from '@repo/core/logic/domains/guardian/services';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@repo/core/api/supabase';

const guardianRepository = createSupabaseGuardianRepository(
  __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__,
);

export const guardianServices = createGuardianServices(guardianRepository);
