import { createSupabaseClassroomNotesRepository } from '../../adapters/supabase/classroomNotesRepository';
import { createClassroomNotesServices } from './services';

const classroomNotesRepository = createSupabaseClassroomNotesRepository();

export const classroomNotesServices = createClassroomNotesServices(classroomNotesRepository);
