import { createSupabaseTeacherInsightsRepository } from '../../adapters/supabase/teacherInsightsRepository';
import { createTeacherInsightsServices } from '../../logic/domains/teacherInsights/services';

const teacherInsightsRepository = createSupabaseTeacherInsightsRepository();

export const teacherInsightsServices = createTeacherInsightsServices(teacherInsightsRepository);
