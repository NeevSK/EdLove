import { createSupabaseTeacherInsightsRepository } from '@/adapters/supabase/teacherInsightsRepository';
import { createTeacherInsightsServices } from '@/logic/domains/teacherInsights/services';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@/api/supabase';

const teacherInsightsRepository = createSupabaseTeacherInsightsRepository(
  __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__,
);

export const teacherInsightsServices = createTeacherInsightsServices(teacherInsightsRepository);
