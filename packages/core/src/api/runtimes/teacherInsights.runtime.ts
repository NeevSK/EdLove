import { createSupabaseTeacherInsightsRepository } from '@repo/core/adapters/supabase/teacherInsightsRepository';
import { createTeacherInsightsServices } from '@repo/core/logic/domains/teacherInsights/services';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@repo/core/api/supabase';

const teacherInsightsRepository = createSupabaseTeacherInsightsRepository(
  __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__,
);

export const teacherInsightsServices = createTeacherInsightsServices(teacherInsightsRepository);
