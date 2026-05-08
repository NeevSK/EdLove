import { createSupabaseClassroomNotesRepository } from '../../adapters/supabase/classroomNotesRepository';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../supabase';
import { createClassroomNotesServices } from '../../logic/domains/classroomNotes/services';

const classroomNotesRepository = createSupabaseClassroomNotesRepository(__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__);

export const classroomNotesServices = createClassroomNotesServices(classroomNotesRepository);
