import { createSupabaseGradingProjectionRepository } from '@/adapters/supabase/gradingProjectionRepository';
import { createGradingProjectionServices } from '@/logic/domains/gradingProjection/services';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@/api/supabase';

const gradingProjectionRepository = createSupabaseGradingProjectionRepository(
  __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__,
);

export const gradingProjectionServices = createGradingProjectionServices(
  gradingProjectionRepository,
);
