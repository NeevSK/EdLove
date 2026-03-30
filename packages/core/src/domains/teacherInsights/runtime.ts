import { createSupabaseTeacherInsightsRepository } from '../../adapters/supabase/teacherInsightsRepository';
import { createTeacherInsightsServices } from './services';

const teacherInsightsRepository = createSupabaseTeacherInsightsRepository();

export const teacherInsightsServices = createTeacherInsightsServices(teacherInsightsRepository);
