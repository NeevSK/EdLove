import { supabaseGradingProjectionRepository } from '../../adapters/supabase/gradingProjectionRepository';
import { createGradingProjectionServices } from './services';

export const gradingProjectionServices = createGradingProjectionServices(
    supabaseGradingProjectionRepository
);
