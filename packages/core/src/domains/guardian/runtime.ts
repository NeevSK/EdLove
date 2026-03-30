import { createSupabaseGuardianRepository } from '../../adapters/supabase/guardianRepository';
import { createGuardianServices } from './services';

const guardianRepository = createSupabaseGuardianRepository();

export const guardianServices = createGuardianServices(guardianRepository);
