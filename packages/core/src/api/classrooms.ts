import type { Classroom, TeacherStats } from '../logic/schemas/classroom.schema';
import { educationalServices } from './runtimes/educational.runtime';
import type { PaginationParams } from '../types';
import { educationalContract } from './educational.contract';

export const classroomsAPI = {
  /**
   * @authority read Classroom
   */
  async getByTeacher(teacherId: string, params: PaginationParams = {}): Promise<Classroom[]> {
    return (await educationalServices.classrooms.getByTeacher(
      teacherId,
      params,
    )) as unknown as Classroom[];
  },

  /**
   * @authority read Classroom
   */
  async getByStudent(studentId: string, params: PaginationParams = {}): Promise<Classroom[]> {
    return (await educationalServices.classrooms.getByStudent(
      studentId,
      params,
    )) as unknown as Classroom[];
  },

  /**
   * @authority read School
   */
  async getBySchool(schoolId: string, params: PaginationParams = {}): Promise<Classroom[]> {
    return (await educationalServices.classrooms.getBySchool(
      schoolId,
      params,
    )) as unknown as Classroom[];
  },

  /**
   * @authority read Classroom
   */
  async getAvailableByGrade(gradeId: string): Promise<Classroom[]> {
    return (await educationalServices.classrooms.getAvailableByGrade(
      gradeId,
    )) as unknown as Classroom[];
  },

  /**
   * @authority read Classroom
   */
  async getById(id: string): Promise<Classroom> {
    return (await educationalServices.classrooms.getById(id)) as unknown as Classroom;
  },

  /**
   * @authority create Classroom
   */
  async create(classroom: Omit<Classroom, 'id' | 'created_at' | 'updated_at'>): Promise<Classroom> {
    return (await educationalServices.classrooms.create(classroom)) as unknown as Classroom;
  },

  /**
   * @authority update Classroom
   */
  async update(id: string, updates: Partial<Classroom>): Promise<Classroom> {
    return (await educationalServices.classrooms.update(id, updates)) as unknown as Classroom;
  },

  /**
   * @authority delete Classroom
   */
  async delete(id: string): Promise<void> {
    return educationalServices.classrooms.delete(id);
  },

  async getTeacherClassrooms(
    teacherId: string,
    params: PaginationParams = {},
  ): Promise<Classroom[]> {
    return (await educationalServices.classrooms.getByTeacher(
      teacherId,
      params,
    )) as unknown as Classroom[];
  },

  async getTeacherStats(teacherId: string): Promise<TeacherStats> {
    return (await educationalServices.classrooms.getTeacherStats(teacherId)) as TeacherStats;
  },
};

// Satisfy linter for architectural linking
void educationalContract;
