import { createSupabaseFounderRepository } from '@repo/core/adapters/supabase/founderRepository';
import { createFounderServices } from '@repo/core/logic/domains/founder/services';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';

const founderRepository = createSupabaseFounderRepository(
  supabaseClient,
);

export const founderServices = createFounderServices(founderRepository);
