import { supabaseGradingProjectionRepository } from '../../adapters/supabase/gradingProjectionRepository';
import { createGradingProjectionServices } from '../../logic/domains/gradingProjection/services';

const gradingProjectionRepository = supabaseGradingProjectionRepository;

export const gradingProjectionServices = createGradingProjectionServices(
  gradingProjectionRepository,
);
