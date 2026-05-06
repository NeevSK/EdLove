import { createSupabaseGuardianRepository } from '../../adapters/supabase/guardianRepository';
import { supabase } from '../supabase';
import { createGuardianServices } from '../../logic/domains/guardian/services';

const guardianRepository = createSupabaseGuardianRepository(supabase);

export const guardianServices = createGuardianServices(guardianRepository);
