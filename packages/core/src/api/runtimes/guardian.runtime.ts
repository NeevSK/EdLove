import { createSupabaseGuardianRepository } from '@repo/core/adapters/supabase/guardianRepository';
import { createGuardianServices } from '@repo/core/logic/domains/guardian/services';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';

const guardianRepository = createSupabaseGuardianRepository(
  supabaseClient,
);

export const guardianServices = createGuardianServices(guardianRepository);
