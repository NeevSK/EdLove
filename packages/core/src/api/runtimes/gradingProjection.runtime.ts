import { createSupabaseGradingProjectionRepository } from '../../adapters/supabase/gradingProjectionRepository';
import { supabase } from '../supabase';
import { createGradingProjectionServices } from '../../logic/domains/gradingProjection/services';

const gradingProjectionRepository = createSupabaseGradingProjectionRepository(supabase);

export const gradingProjectionServices = createGradingProjectionServices(
  gradingProjectionRepository,
);
