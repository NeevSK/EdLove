import { AttendanceSchema } from '../schemas/attendance.schema';
import { ClassroomSchema } from '../schemas/classroom.schema';
import { LessonSchema } from '../schemas/lesson.schema';
import { StudentSchema } from '../schemas/student.schema';

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
      created_at: NOW,
      updated_at: NOW,
      teacher: {
        full_name: 'John Doe',
      },
    };

    test('should validate a valid classroom', () => {
      const result = ClassroomSchema.safeParse(validClassroom);
      expect(result.success).toBe(true);
    });

    test('should fail if ID is missing', () => {
      const { id: _, ...invalid } = validClassroom;
      const result = ClassroomSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    test('should fail if ID is not a UUID', () => {
      const invalid = { ...validClassroom, id: 'not-a-uuid' };
      const result = ClassroomSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('StudentSchema', () => {
    const validStudent = {
      id: UUID,
      class_id: OTHER_UUID,
      full_name: 'Jane Smith',
      roll_number: '10',
      created_at: NOW,
      updated_at: NOW,
    };

    test('should validate a valid student', () => {
      const result = StudentSchema.safeParse(validStudent);
      expect(result.success).toBe(true);
    });

    test('should fail if class_id is missing', () => {
      const { class_id: _, ...invalid } = validStudent;
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
    };

    test('should validate a valid lesson', () => {
      const result = LessonSchema.safeParse(validLesson);
      expect(result.success).toBe(true);
    });
  });

  describe('AttendanceSchema', () => {
    const validAttendance = {
      id: UUID,
      classroom_id: OTHER_UUID,
      student_id: UUID,
      status: 'present',
      date: '2026-03-26',
      created_at: NOW,
      updated_at: NOW,
    };

    test('should validate a valid attendance record', () => {
      const result = AttendanceSchema.safeParse(validAttendance);
      expect(result.success).toBe(true);
    });

    test('should fail on invalid status', () => {
      const invalid = { ...validAttendance, status: 'sleeping' };
      const result = AttendanceSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
