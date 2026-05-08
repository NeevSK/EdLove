import type { ClassroomStudent, TeacherStats } from '../logic/schemas/classroom.schema';
import { educational } from '../logic/managers/factory';
import type { Lesson } from '../types';

// ============================================================================
// LESSONS API
// ============================================================================

export const lessonsAPI = {
  async getAll(classroomId: string): Promise<Lesson[]> {
    return educational.lessons.getAll(classroomId) as unknown as Lesson[];
  },

  async getByDate(classroomId: string, date: string): Promise<Lesson[]> {
    return educational.lessons.getByDate(classroomId, date) as unknown as Lesson[];
  },

  async create(lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>): Promise<Lesson> {
    return educational.lessons.create(lesson as Omit<Lesson, 'id' | 'created_at'>) as unknown as Lesson;
  },

  async update(id: string, updates: Partial<Lesson>): Promise<Lesson> {
    return educational.lessons.update(id, updates) as unknown as Lesson;
  },

  async delete(id: string): Promise<void> {
    return educational.lessons.delete(id);
  },
};

// ============================================================================
// STUDENTS API
// ============================================================================

export const studentsAPI = {
  async getAll(classroomId: string): Promise<ClassroomStudent[]> {
    return educational.students.getAll(classroomId) as unknown as ClassroomStudent[];
  },

  async enroll(classroomId: string, studentId: string): Promise<ClassroomStudent> {
    return educational.students.enroll(classroomId, studentId) as unknown as ClassroomStudent;
  },

  async remove(classroomId: string, studentId: string): Promise<void> {
    return educational.students.remove(classroomId, studentId);
  },

  async create(student: {
    full_name: string;
    roll_number?: string;
    notes?: string;
    classroom_id: string;
  }) {
    return educational.classroomStudents.addShadowStudent(
      student.classroom_id,
      student.full_name,
      student.roll_number,
      student.notes,
    );
  },

  async update(id: string, updates: { roll_number?: string; notes?: string }) {
    return educational.classroomStudents.updateById(id, updates);
  },

  async getTeacherStats(teacherId: string): Promise<TeacherStats> {
    return educational.classrooms.getTeacherStats(teacherId);
  },

  async getHistoricalAcademicRecords(studentId: string) {
    return educational.students.getHistoricalAcademicRecords(studentId);
  },

  async getHistoricalProfessionalRecords(teacherId: string) {
    return educational.teachers.getHistoricalProfessionalRecords(teacherId);
  },

  async getHistoricalGovernanceRecords(principalId: string) {
    return educational.teachers.getHistoricalGovernanceRecords(principalId);
  },

  async getSchoolLegacyHistory(schoolId: string) {
    return educational.institutions.getSchoolLegacyHistory(schoolId);
  },

  async getClassroomLegacyHistory(classroomId: string) {
    return educational.institutions.getClassroomLegacyHistory(classroomId);
  },
};
