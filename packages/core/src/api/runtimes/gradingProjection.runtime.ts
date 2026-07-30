import { createSupabaseGradingProjectionRepository } from '@repo/core/adapters/supabase/gradingProjectionRepository';
import { createGradingProjectionServices } from '@repo/core/logic/domains/gradingProjection/services';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@repo/core/api/supabase';

const gradingProjectionRepository = createSupabaseGradingProjectionRepository(
  __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__,
);

export const gradingProjectionServices = createGradingProjectionServices(
  gradingProjectionRepository,
);
