import { createSupabaseGradingProjectionRepository } from '../../adapters/supabase/gradingProjectionRepository';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../supabase';
import { createGradingProjectionServices } from '../../logic/domains/gradingProjection/services';

const gradingProjectionRepository = createSupabaseGradingProjectionRepository(__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__);

export const gradingProjectionServices = createGradingProjectionServices(
  gradingProjectionRepository,
);
