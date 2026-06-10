import type { SupabaseClient } from '@supabase/supabase-js';
import type { EducationalRepository } from '../../../logic/domains/educational/ports';
import { createAssignmentRepository } from './assignmentRepository';
import { createAttendanceRepository } from './attendanceRepository';
import { createSupabaseClassroomNotesRepository } from './classroomNotesRepository';
import { createClassroomRepository } from './classroomRepository';
import { createEnrollmentRepository } from './enrollmentRepository';
import { createGradingRepository } from './gradingRepository';
import { createLessonRepository } from './lessonRepository';
import { createMaterialRepository } from './materialRepository';
import { createSchoolRepository } from './schoolRepository';
import { createStatsRepository } from './statsRepository';

export const createSupabaseEducationalRepository = (
  supabase: SupabaseClient,
): EducationalRepository => {
  const classrooms = createClassroomRepository(supabase);
  const lessons = createLessonRepository(supabase);
  const assignments = createAssignmentRepository(supabase);
  const enrollments = createEnrollmentRepository(supabase);
  const materials = createMaterialRepository(supabase);
  const attendance = createAttendanceRepository(supabase);
  const grading = createGradingRepository(supabase);
  const stats = createStatsRepository(supabase);
  const schools = createSchoolRepository(supabase);
  const classroomNotes = createSupabaseClassroomNotesRepository(supabase);

  return {
    ...classrooms,
    ...lessons,
    ...assignments,
    ...enrollments,
    ...materials,
    ...attendance,
    ...grading,
    ...stats,
    ...schools,
    ...classroomNotes,
  };
};
