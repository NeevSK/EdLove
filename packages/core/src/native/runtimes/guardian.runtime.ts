import { createSupabaseGuardianRepository } from '../../adapters/supabase/guardianRepository';
import { createGuardianServices } from '../../logic/domains/guardian/services';

const guardianRepository = createSupabaseGuardianRepository();

export const guardianServices = createGuardianServices(guardianRepository);
