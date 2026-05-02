import { createSupabaseClassroomNotesRepository } from '../../adapters/supabase/classroomNotesRepository';
import { supabase } from '../supabase';
import { createClassroomNotesServices } from '../../logic/domains/classroomNotes/services';

const classroomNotesRepository = createSupabaseClassroomNotesRepository(supabase);

export const classroomNotesServices = createClassroomNotesServices(classroomNotesRepository);
