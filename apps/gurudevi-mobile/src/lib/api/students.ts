/**
 * Students API
 * 
 * API methods for managing students
 */

import { supabase } from '../supabase';
import { APIError } from './errors';
import type { Student } from './types';

export const studentsAPI = {
    /**
     * Get all students (optionally by class)
     */
    async getAll(classId?: string): Promise<Student[]> {
        let query = supabase
            .from('students')
            .select('*')
            .order('full_name', { ascending: true });

        if (classId) {
            query = query.eq('class_id', classId);
        }

        const { data, error } = await query;

        if (error) {
            throw new APIError('Failed to fetch students', error.code, error);
        }

        return data || [];
    },

    /**
     * Get a single student
     */
    async getById(id: string): Promise<Student> {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw new APIError('Failed to fetch student', error.code, error);
        }

        return data;
    },

    /**
     * Create a new student
     */
    async create(student: Omit<Student, 'id' | 'created_at'>): Promise<Student> {
        const { data, error } = await supabase
            .from('students')
            .insert([student])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to create student', error.code, error);
        }

        return data;
    },

    /**
     * Update student information
     */
    async update(id: string, updates: Partial<Student>): Promise<Student> {
        const { data, error } = await supabase
            .from('students')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to update student', error.code, error);
        }

        return data;
    },

    /**
     * Delete a student
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', id);

        if (error) {
            throw new APIError('Failed to delete student', error.code, error);
        }
    },
};
