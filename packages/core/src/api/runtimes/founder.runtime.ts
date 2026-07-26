import { createSupabaseFounderRepository } from '@/adapters/supabase/founderRepository';
import { createFounderServices } from '@/logic/domains/founder/services';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@/api/supabase';

const founderRepository = createSupabaseFounderRepository(
  __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__,
);

export const founderServices = createFounderServices(founderRepository);
