import { PaginationParams } from './types';
import type { Classroom } from './types';
import type { Classroom as ClassroomRecord } from './schemas/classroom.schema';
import { educationalContract } from './educational.contract';
import { educationalServices } from '../domains/educational/runtime';

export const classroomsAPI = {
    /**
     * @authority read Classroom
     */
    async getByTeacher(teacherId: string, params: PaginationParams = {}): Promise<Classroom[]> {
        return (await educationalServices.classrooms.getByTeacher(teacherId, params)) as unknown as Classroom[];
    },

    /**
     * @authority read Classroom
     */
    async getByStudent(studentId: string, params: PaginationParams = {}): Promise<Classroom[]> {
        return (await educationalServices.classrooms.getByStudent(studentId, params)) as unknown as Classroom[];
    },

    /**
     * @authority read School
     */
    async getBySchool(schoolId: string, params: PaginationParams = {}): Promise<Classroom[]> {
        return (await educationalServices.classrooms.getBySchool(schoolId, params)) as unknown as Classroom[];
    },

    /**
     * @authority read Classroom
     */
    async getAvailableByGrade(gradeId: string): Promise<Classroom[]> {
        return (await educationalServices.classrooms.getAvailableByGrade(gradeId)) as unknown as Classroom[];
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
        return (await educationalServices.classrooms.create(classroom as Omit<ClassroomRecord, 'id' | 'created_at' | 'updated_at'>)) as unknown as Classroom;
    },

    /**
     * @authority update Classroom
     */
    async update(id: string, updates: Partial<Classroom>): Promise<Classroom> {
        return (await educationalServices.classrooms.update(id, updates as Partial<ClassroomRecord>)) as unknown as Classroom;
    },

    /**
     * @authority delete Classroom
     */
    async delete(id: string): Promise<void> {
        return educationalServices.classrooms.delete(id);
    },
};

// Satisfy linter for architectural linking
void educationalContract;
