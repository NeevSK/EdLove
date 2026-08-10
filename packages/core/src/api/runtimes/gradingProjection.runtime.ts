import { createSupabaseGradingProjectionRepository } from '@repo/core/adapters/supabase/gradingProjectionRepository';
import { createGradingProjectionServices } from '@repo/core/logic/domains/gradingProjection/services';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';

const gradingProjectionRepository = createSupabaseGradingProjectionRepository(
  supabaseClient,
);

export const gradingProjectionServices = createGradingProjectionServices(
  gradingProjectionRepository,
);
