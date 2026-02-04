/**
 * Classroom Students API
 * 
 * API methods for managing students in classrooms
 */

import { supabase } from '../supabase';
import { APIError } from './errors';
import type { ClassroomStudent } from './types';

export const classroomStudentsAPI = {
    /**
     * Get all students in a classroom
     */
    async getAll(classroomId: string): Promise<ClassroomStudent[]> {
        const { data, error } = await supabase
            .from('classroom_students')
            .select('*')
            .eq('classroom_id', classroomId)
            .order('roll_number', { ascending: true });

        if (error) {
            throw new APIError('Failed to fetch classroom students', error.code, error);
        }

        return data || [];
    },

    /**
     * Add a student to a classroom
     */
    async add(
        classroomId: string,
        studentId: string,
        rollNumber?: number
    ): Promise<ClassroomStudent> {
        const { data, error } = await supabase
            .from('classroom_students')
            .insert([
                {
                    classroom_id: classroomId,
                    student_id: studentId,
                    roll_number: rollNumber,
                },
            ])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to add student to classroom', error.code, error);
        }

        return data;
    },

    /**
     * Remove a student from a classroom
     */
    async remove(classroomId: string, studentId: string): Promise<void> {
        const { error } = await supabase
            .from('classroom_students')
            .delete()
            .eq('classroom_id', classroomId)
            .eq('student_id', studentId);

        if (error) {
            throw new APIError('Failed to remove student from classroom', error.code, error);
        }
    },
};
