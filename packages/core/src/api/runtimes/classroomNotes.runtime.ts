import { createSupabaseClassroomNotesRepository } from '../../adapters/supabase/educational/classroomNotesRepository';
import { createClassroomNotesServices } from '../../logic/domains/classroomNotes/services';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../supabase';

const classroomNotesRepository = createSupabaseClassroomNotesRepository(
  __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__,
);

export const classroomNotesServices = createClassroomNotesServices(classroomNotesRepository);
