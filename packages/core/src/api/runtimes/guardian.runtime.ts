import { createSupabaseGuardianRepository } from '../../adapters/supabase/guardianRepository';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../supabase';
import { createGuardianServices } from '../../logic/domains/guardian/services';

const guardianRepository = createSupabaseGuardianRepository(__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__);

export const guardianServices = createGuardianServices(guardianRepository);
