import { createSupabaseGradingProjectionRepository } from '@repo/core/adapters/supabase/gradingProjectionRepository';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { createGradingProjectionServices } from '@repo/core/logic/domains/gradingProjection/services';

const gradingProjectionRepository = createSupabaseGradingProjectionRepository(supabaseClient);

export const gradingProjectionServices = createGradingProjectionServices(
  gradingProjectionRepository,
);
