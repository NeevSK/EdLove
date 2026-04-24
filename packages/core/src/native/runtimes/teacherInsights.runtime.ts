import { createSupabaseTeacherInsightsRepository } from '../../adapters/supabase/teacherInsightsRepository';
import { createTeacherInsightsServices } from '../../logic/domains/teacherInsights/services';
import { supabase } from '../supabase';

const teacherInsightsRepository = createSupabaseTeacherInsightsRepository(supabase);

export const teacherInsightsServices = createTeacherInsightsServices(teacherInsightsRepository);
