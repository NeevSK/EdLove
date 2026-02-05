/**
 * Classrooms API
 * 
 * API methods for managing classrooms
 */

import { supabase } from '../supabase';
import { APIError, Classroom } from './types';

// Interface for the join result from classroom_students query
interface ClassroomStudentJoin {
    classroom: Classroom | null;
}

export const classroomsAPI = {
    /**
     * Get all classrooms for a teacher
     */
    async getByTeacher(teacherId: string): Promise<Classroom[]> {
        const { data, error } = await supabase
            .from('classrooms')
            .select('*')
            .eq('teacher_id', teacherId)
            .order('name', { ascending: true });

        if (error) {
            throw new APIError('Failed to fetch teacher classrooms', error.code, error);
        }

        return data || [];
    },

    /**
     * Get all classrooms for a student
     * Fetches through the classroom_students linking table
     */
    async getByStudent(studentId: string): Promise<Classroom[]> {
        const { data, error } = await supabase
            .from('classroom_students')
            .select(`
                classroom:classrooms (
                    id,
                    school_id,
                    grade_id,
                    teacher_id,
                    name,
                    subject,
                    description,
                    created_at,
                    updated_at
                )
            `)
            .eq('student_id', studentId);

        if (error) {
            throw new APIError('Failed to fetch student classrooms', error.code, error);
        }

        // Extract the classroom objects from the join result with proper typing
        return (data || [])
            .map((item: any) => item.classroom)
            .filter((classroom): classroom is Classroom => classroom !== null);
    },

    /**
     * Get all classrooms in a school
     * Used by principals to see all classrooms
     */
    async getBySchool(schoolId: string): Promise<Classroom[]> {
        const { data, error } = await supabase
            .from('classrooms')
            .select('*')
            .eq('school_id', schoolId)
            .order('name', { ascending: true });

        if (error) {
            throw new APIError('Failed to fetch school classrooms', error.code, error);
        }

        return data || [];
    },

    /**
     * Get a single classroom by ID
     */
    async getById(id: string): Promise<Classroom> {
        const { data, error } = await supabase
            .from('classrooms')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw new APIError('Failed to fetch classroom', error.code, error);
        }

        return data;
    },

    /**
     * Create a new classroom
     */
    async create(classroom: Omit<Classroom, 'id' | 'created_at' | 'updated_at'>): Promise<Classroom> {
        const { data, error } = await supabase
            .from('classrooms')
            .insert([classroom])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to create classroom', error.code, error);
        }

        return data;
    },

    /**
     * Update a classroom
     */
    async update(id: string, updates: Partial<Classroom>): Promise<Classroom> {
        const { data, error } = await supabase
            .from('classrooms')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to update classroom', error.code, error);
        }

        return data;
    },

    /**
     * Delete a classroom
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('classrooms')
            .delete()
            .eq('id', id);

        if (error) {
            throw new APIError('Failed to delete classroom', error.code, error);
        }
    },
};
