import { createSupabaseTeacherInsightsRepository } from '../../adapters/supabase/teacherInsightsRepository';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../supabase';
import { createTeacherInsightsServices } from '../../logic/domains/teacherInsights/services';

const teacherInsightsRepository = createSupabaseTeacherInsightsRepository(__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__);

export const teacherInsightsServices = createTeacherInsightsServices(teacherInsightsRepository);
