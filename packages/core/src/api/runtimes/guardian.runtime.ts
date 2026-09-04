import { createSupabaseGuardianRepository } from '@repo/core/adapters/supabase/guardianRepository';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { createGuardianServices } from '@repo/core/logic/domains/guardian/services';

const guardianRepository = createSupabaseGuardianRepository(supabaseClient);

export const guardianServices = createGuardianServices(guardianRepository);
