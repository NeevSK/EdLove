import { createSupabaseClassroomNotesRepository } from '@repo/core/adapters/supabase/educational/classroomNotesRepository';
import { createClassroomNotesServices } from '@repo/core/logic/domains/classroomNotes/services';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@repo/core/api/supabase';

const classroomNotesRepository = createSupabaseClassroomNotesRepository(
  __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__,
);

export const classroomNotesServices = createClassroomNotesServices(classroomNotesRepository);
