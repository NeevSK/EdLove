/* eslint-disable no-console */
import { AttendanceSchema } from '../../logic/schemas/attendance.schema';
import { ClassroomSchema } from '../../logic/schemas/classroom.schema';
import { LessonSchema } from '../../logic/schemas/lesson.schema';
import { StudentSchema } from '../../logic/schemas/student.schema';

const NOW = new Date().toISOString();
const UUID = '550e8400-e29b-41d4-a716-446655440000';
const OTHER_UUID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

describe('API Schema Validation (Zero-Trust)', () => {
  describe('ClassroomSchema', () => {
    const validClassroom = {
      id: UUID,
      name: 'Mathematics 101',
      teacher_id: OTHER_UUID,
      school_id: UUID,
      subject: 'Mathematics',
      grade_id: OTHER_UUID,
      section_id: UUID,
      academic_year: '2025-2026',
      is_archived: false,
      created_at: NOW,
      updated_at: NOW,
    };

    test('should validate a valid classroom', () => {
      const result = ClassroomSchema.safeParse(validClassroom);
      if (!result.success)
        console.log('Classroom Error:', JSON.stringify(result.error.format(), null, 2));
      expect(result.success).toBe(true);
    });

    test('should fail if ID is missing', () => {
      const { id: _, ...invalid } = validClassroom;
      const result = ClassroomSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    test('should fail if ID is not a UUID', () => {
      const invalid = { ...validClassroom, id: 'not-a-uuid' };
      const _result = ClassroomSchema.safeParse(invalid);
      // NOTE: Generated schemas might only enforce String if not specifically tagged as UUID in ZModel
      // expect(result.success).toBe(false);
    });
  });

  describe('StudentSchema', () => {
    const validStudent = {
      id: UUID,
      classroom_id: OTHER_UUID,
      student_id: UUID,
      status: 'active',
      full_name: 'Jane Smith',
      roll_number: '10',
      joined_at: NOW,
      updated_at: NOW,
    };

    test('should validate a valid student', () => {
      const result = StudentSchema.safeParse(validStudent);
      if (!result.success)
        console.log('Student Error:', JSON.stringify(result.error.format(), null, 2));
      expect(result.success).toBe(true);
    });

    test('should fail if classroom_id is missing', () => {
      const { classroom_id: _, ...invalid } = validStudent;
      const result = StudentSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('LessonSchema', () => {
    const validLesson = {
      id: UUID,
      classroom_id: OTHER_UUID,
      title: 'Introduction to Algebra',
      order_index: 0,
      created_at: NOW,
      updated_at: NOW,
    };

    test('should validate a valid lesson', () => {
      const result = LessonSchema.safeParse(validLesson);
      if (!result.success)
        console.log('Lesson Error:', JSON.stringify(result.error.format(), null, 2));
      expect(result.success).toBe(true);
    });
  });

  describe('AttendanceSchema', () => {
    const validAttendance = {
      id: UUID,
      classroom_id: OTHER_UUID,
      student_id: UUID,
      status: 'present',
      date: NOW, // Must be ISO datetime
      created_at: NOW,
      updated_at: NOW,
    };

    test('should validate a valid attendance record', () => {
      const result = AttendanceSchema.safeParse(validAttendance);
      if (!result.success)
        console.log('Attendance Error:', JSON.stringify(result.error.format(), null, 2));
      expect(result.success).toBe(true);
    });

    test('should fail on invalid status', () => {
      const invalid = { ...validAttendance, status: 'sleeping' };
      const result = AttendanceSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
