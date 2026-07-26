import type { SupabaseClient } from '@supabase/supabase-js';
import type { EducationalRepository } from '@/logic/domains/educational/ports';
import { createAssignmentRepository } from '@/adapters/supabase/educational/assignmentRepository';
import { createAttendanceRepository } from '@/adapters/supabase/educational/attendanceRepository';
import { createSupabaseClassroomNotesRepository } from '@/adapters/supabase/educational/classroomNotesRepository';
import { createClassroomRepository } from '@/adapters/supabase/educational/classroomRepository';
import { createEnrollmentRepository } from '@/adapters/supabase/educational/enrollmentRepository';
import { createGradingRepository } from '@/adapters/supabase/educational/gradingRepository';
import { createLessonRepository } from '@/adapters/supabase/educational/lessonRepository';
import { createMaterialRepository } from '@/adapters/supabase/educational/materialRepository';
import { createSchoolRepository } from '@/adapters/supabase/educational/schoolRepository';
import { createStatsRepository } from '@/adapters/supabase/educational/statsRepository';

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
