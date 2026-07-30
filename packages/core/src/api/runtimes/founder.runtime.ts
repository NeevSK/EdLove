import { createSupabaseFounderRepository } from '@repo/core/adapters/supabase/founderRepository';
import { createFounderServices } from '@repo/core/logic/domains/founder/services';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@repo/core/api/supabase';

const founderRepository = createSupabaseFounderRepository(
  __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__,
);

export const founderServices = createFounderServices(founderRepository);
