import { createSupabaseFounderRepository } from '@repo/core/adapters/supabase/founderRepository';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { createFounderServices } from '@repo/core/logic/domains/founder/services';

const founderRepository = createSupabaseFounderRepository(supabaseClient);

export const founderServices = createFounderServices(founderRepository);
