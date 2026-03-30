import type { Lesson } from './types';
import { ClassroomStudent } from './schemas/classroom.schema';
import { educationalContract } from './educational.contract';
import { educationalServices } from '../domains/educational/runtime';

// ============================================================================
// LESSONS API
// ============================================================================

export const lessonsAPI = {
    /**
     * @authority read Lesson
     */
    async getAll(classroomId: string): Promise<Lesson[]> {
        return (await educationalServices.lessons.getAll(classroomId)) as unknown as Lesson[];
    },

    /**
     * @authority read Lesson
     */
    async getByDate(classroomId: string, date: string): Promise<Lesson[]> {
        return (await educationalServices.lessons.getByDate(classroomId, date)) as unknown as Lesson[];
    },

    /**
     * @authority create Lesson
     */
    async create(lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>): Promise<Lesson> {
        return (await educationalServices.lessons.create(lesson as Omit<Lesson, 'id' | 'created_at'>)) as unknown as Lesson;
    },

    /**
     * @authority update Lesson
     */
    async update(id: string, updates: Partial<Lesson>): Promise<Lesson> {
        return (await educationalServices.lessons.update(id, updates)) as unknown as Lesson;
    },

    /**
     * @authority delete Lesson
     */
    async delete(id: string): Promise<void> {
        return educationalServices.lessons.delete(id);
    },
};

// ============================================================================
// STUDENTS API
// ============================================================================

export const studentsAPI = {
    /**
     * @authority read Classroom
     */
    async getAll(classroomId: string): Promise<ClassroomStudent[]> {
        return (await educationalServices.students.getAll(classroomId)) as unknown as ClassroomStudent[];
    },

    /**
     * @authority update Classroom
     */
    async enroll(classroomId: string, studentId: string): Promise<ClassroomStudent> {
        return (await educationalServices.students.enroll(classroomId, studentId)) as unknown as ClassroomStudent;
    },

    /**
     * @authority update Classroom
     */
    async remove(classroomId: string, studentId: string): Promise<void> {
        return educationalServices.students.remove(classroomId, studentId);
    },

    /**
     * @authority update Classroom
     */
    async create(vars: { classroom_id: string; student_id: string; roll_number?: number; notes?: string }): Promise<any> {
        return educationalServices.classroomStudents.add(
            vars.classroom_id,
            vars.student_id,
            vars.roll_number,
            vars.notes
        );
    },

    /**
     * @authority update Classroom
     */
    async update(id: string, updates: { roll_number?: number; notes?: string; classroom_id: string; student_id: string }): Promise<any> {
        // The registry passes 'id' but our service needs classroomId and studentId or a record ID
        // If 'id' is a combined key or a record ID, we use updateById
        return educationalServices.classroomStudents.updateById(id, updates);
    },
};

// Satisfy linter
void educationalContract;
