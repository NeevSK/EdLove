import type { SupabaseClient } from '@supabase/supabase-js';
import type { EducationalRepository } from '../../../logic/domains/educational/ports';
import { createClassroomRepository } from './classroomRepository';
import { createLessonRepository } from './lessonRepository';
import { createAssignmentRepository } from './assignmentRepository';
import { createEnrollmentRepository } from './enrollmentRepository';
import { createMaterialRepository } from './materialRepository';
import { createAttendanceRepository } from './attendanceRepository';
import { createGradingRepository } from './gradingRepository';
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

  return {
    ...classrooms,
    ...lessons,
    ...assignments,
    ...enrollments,
    ...materials,
    ...attendance,
    ...grading,
    ...stats,
  };
};
