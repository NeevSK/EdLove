import { createSupabaseGuardianRepository } from '@/adapters/supabase/guardianRepository';
import { createGuardianServices } from '@/logic/domains/guardian/services';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@/api/supabase';

const guardianRepository = createSupabaseGuardianRepository(
  __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__,
);

export const guardianServices = createGuardianServices(guardianRepository);
