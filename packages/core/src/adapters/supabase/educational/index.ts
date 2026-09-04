import { createAssignmentRepository } from '@repo/core/adapters/supabase/educational/assignmentRepository';
import { createAttendanceRepository } from '@repo/core/adapters/supabase/educational/attendanceRepository';
import { createSupabaseClassroomNotesRepository } from '@repo/core/adapters/supabase/educational/classroomNotesRepository';
import { createClassroomRepository } from '@repo/core/adapters/supabase/educational/classroomRepository';
import { createEnrollmentRepository } from '@repo/core/adapters/supabase/educational/enrollmentRepository';
import { createGradingRepository } from '@repo/core/adapters/supabase/educational/gradingRepository';
import { createLessonRepository } from '@repo/core/adapters/supabase/educational/lessonRepository';
import { createMaterialRepository } from '@repo/core/adapters/supabase/educational/materialRepository';
import { createSchoolRepository } from '@repo/core/adapters/supabase/educational/schoolRepository';
import { createStatsRepository } from '@repo/core/adapters/supabase/educational/statsRepository';
import type { EducationalRepository } from '@repo/core/logic/domains/educational/ports';
import type { SupabaseClient } from '@supabase/supabase-js';

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
