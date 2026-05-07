import { createSupabaseTeacherInsightsRepository } from '../../adapters/supabase/teacherInsightsRepository';
import { supabase } from '../supabase';
import { createTeacherInsightsServices } from '../../logic/domains/teacherInsights/services';

const teacherInsightsRepository = createSupabaseTeacherInsightsRepository(supabase);

export const teacherInsightsServices = createTeacherInsightsServices(teacherInsightsRepository);
