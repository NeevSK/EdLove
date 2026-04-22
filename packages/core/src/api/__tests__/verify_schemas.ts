import { AttendanceSchema } from '../schemas/attendance.schema';
import { ClassroomSchema } from '../schemas/classroom.schema';
import { LessonSchema } from '../schemas/lesson.schema';
import { StudentSchema } from '../schemas/student.schema';

const NOW = new Date().toISOString();
const UUID = '550e8400-e29b-41d4-a716-446655440000';
const OTHER_UUID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

const validClassroom = {
  id: UUID,
  name: 'Mathematics 101',
  teacher_id: OTHER_UUID,
  school_id: UUID,
  subject: 'Mathematics',
  grade_id: UUID,
  section_id: OTHER_UUID,
  created_at: NOW,
  updated_at: NOW,
  teacher: {
    full_name: 'John Doe',
  },
};

const validStudent = {
  id: OTHER_UUID,
  class_id: UUID,
  full_name: 'Jane Smith',
  roll_number: '10',
  created_at: NOW,
  updated_at: NOW,
};

const validLesson = {
  id: UUID,
  classroom_id: OTHER_UUID,
  title: 'Introduction to Algebra',
  order_index: 0,
  created_at: NOW,
};

const validAttendance = {
  id: UUID,
  classroom_id: OTHER_UUID,
  student_id: UUID,
  status: 'present',
  date: '2026-03-26',
  created_at: NOW,
  updated_at: NOW,
};

function verify() {
  process.stdout.write('--- Verifying Schemas ---\n');

  const results = [
    { name: 'ClassroomSchema', result: ClassroomSchema.safeParse(validClassroom) },
    { name: 'StudentSchema', result: StudentSchema.safeParse(validStudent) },
    { name: 'LessonSchema', result: LessonSchema.safeParse(validLesson) },
    { name: 'AttendanceSchema', result: AttendanceSchema.safeParse(validAttendance) },
  ];

  let allPassed = true;
  for (const { name, result } of results) {
    process.stdout.write(`${name} valid: ${result.success}\n`);
    if (!result.success) {
      allPassed = false;
      process.stderr.write(`${name} errors: ${JSON.stringify(result.error.format(), null, 2)}\n`);
    }
  }

  process.exit(allPassed ? 0 : 1);
}

verify();
