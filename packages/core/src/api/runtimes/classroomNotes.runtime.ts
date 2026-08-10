import { createSupabaseClassroomNotesRepository } from '@repo/core/adapters/supabase/educational/classroomNotesRepository';
import { createClassroomNotesServices } from '@repo/core/logic/domains/classroomNotes/services';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';

const classroomNotesRepository = createSupabaseClassroomNotesRepository(
  supabaseClient,
);

export const classroomNotesServices = createClassroomNotesServices(classroomNotesRepository);
