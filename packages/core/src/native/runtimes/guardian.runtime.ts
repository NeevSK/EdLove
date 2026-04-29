import { createSupabaseGuardianRepository } from '../../adapters/supabase/guardianRepository';
import { createGuardianServices } from '../../logic/domains/guardian/services';
import { supabase } from '../../api/supabase';

const guardianRepository = createSupabaseGuardianRepository(supabase);

export const guardianServices = createGuardianServices(guardianRepository);
