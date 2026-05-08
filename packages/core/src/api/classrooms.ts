import type { Classroom, TeacherStats } from '../logic/schemas/classroom.schema';
import { educational } from '../logic/managers/factory';
import type { PaginationParams } from '../types';

/**
 * Classrooms API
 * 
 * Thin delegation layer to the Sovereign Educational Manager.
 */
export const classroomsAPI = {
  async getByTeacher(teacherId: string, params: PaginationParams = {}): Promise<Classroom[]> {
    return educational.classrooms.getByTeacher(teacherId, params) as unknown as Classroom[];
  },

  async getByStudent(studentId: string, params: PaginationParams = {}): Promise<Classroom[]> {
    return educational.classrooms.getByStudent(studentId, params) as unknown as Classroom[];
  },

  async getBySchool(schoolId: string, params: PaginationParams = {}): Promise<Classroom[]> {
    return educational.classrooms.getBySchool(schoolId, params) as unknown as Classroom[];
  },

  async getAvailableByGrade(gradeId: string): Promise<Classroom[]> {
    return educational.classrooms.getAvailableByGrade(gradeId) as unknown as Classroom[];
  },

  async getById(id: string): Promise<Classroom> {
    return educational.classrooms.getById(id) as unknown as Classroom;
  },

  async create(classroom: Omit<Classroom, 'id' | 'created_at' | 'updated_at'>): Promise<Classroom> {
    return educational.classrooms.create(classroom) as unknown as Classroom;
  },

  async update(id: string, updates: Partial<Classroom>): Promise<Classroom> {
    return educational.classrooms.update(id, updates) as unknown as Classroom;
  },

  async delete(id: string): Promise<void> {
    return educational.classrooms.delete(id);
  },

  async getTeacherClassrooms(
    teacherId: string,
    params: PaginationParams = {},
  ): Promise<Classroom[]> {
    return educational.classrooms.getByTeacher(teacherId, params) as unknown as Classroom[];
  },

  async getTeacherStats(teacherId: string): Promise<TeacherStats> {
    return (await educational.classrooms.getTeacherStats(teacherId)) as TeacherStats;
  },
};
