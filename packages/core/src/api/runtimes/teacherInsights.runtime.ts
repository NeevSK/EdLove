import { createSupabaseTeacherInsightsRepository } from '@repo/core/adapters/supabase/teacherInsightsRepository';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { createTeacherInsightsServices } from '@repo/core/logic/domains/teacherInsights/services';

const teacherInsightsRepository = createSupabaseTeacherInsightsRepository(supabaseClient);

export const teacherInsightsServices = createTeacherInsightsServices(teacherInsightsRepository);
