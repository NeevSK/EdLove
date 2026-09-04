import { createSupabaseClassroomNotesRepository } from '@repo/core/adapters/supabase/educational/classroomNotesRepository';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { createClassroomNotesServices } from '@repo/core/logic/domains/classroomNotes/services';

const classroomNotesRepository = createSupabaseClassroomNotesRepository(supabaseClient);

export const classroomNotesServices = createClassroomNotesServices(classroomNotesRepository);
