import { createSupabaseGradingProjectionRepository } from '../../adapters/supabase/gradingProjectionRepository';
import { createGradingProjectionServices } from '../../logic/domains/gradingProjection/services';
import { supabase } from '../supabase';

const gradingProjectionRepository = createSupabaseGradingProjectionRepository(supabase);

export const gradingProjectionServices = createGradingProjectionServices(
  gradingProjectionRepository,
);
