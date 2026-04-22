import { createSupabaseClassroomNotesRepository } from '../../adapters/supabase/classroomNotesRepository';
import { createClassroomNotesServices } from '../../logic/domains/classroomNotes/services';

const classroomNotesRepository = createSupabaseClassroomNotesRepository();

export const classroomNotesServices = createClassroomNotesServices(classroomNotesRepository);
