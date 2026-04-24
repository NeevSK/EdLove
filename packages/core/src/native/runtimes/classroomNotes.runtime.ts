import { createSupabaseClassroomNotesRepository } from '../../adapters/supabase/classroomNotesRepository';
import { createClassroomNotesServices } from '../../logic/domains/classroomNotes/services';
import { supabase } from '../supabase';

const classroomNotesRepository = createSupabaseClassroomNotesRepository(supabase);

export const classroomNotesServices = createClassroomNotesServices(classroomNotesRepository);
