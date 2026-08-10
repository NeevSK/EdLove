import { createSupabaseTeacherInsightsRepository } from '@repo/core/adapters/supabase/teacherInsightsRepository';
import { createTeacherInsightsServices } from '@repo/core/logic/domains/teacherInsights/services';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';

const teacherInsightsRepository = createSupabaseTeacherInsightsRepository(
  supabaseClient,
);

export const teacherInsightsServices = createTeacherInsightsServices(teacherInsightsRepository);
