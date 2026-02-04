/**
 * Lessons API
 * 
 * API methods for managing lessons
 */

import { supabase } from '../supabase';
import { APIError } from './errors';
import type { Lesson } from './types';

export const lessonsAPI = {
    /**
     * Get all lessons for a teacher
     */
    async getAll(teacherId: string): Promise<Lesson[]> {
        const { data, error } = await supabase
            .from('lessons')
            .select('*')
            .eq('teacher_id', teacherId)
            .order('date', { ascending: false });

        if (error) {
            throw new APIError('Failed to fetch lessons', error.code, error);
        }

        return data || [];
    },

    /**
     * Get lessons for a specific date
     */
    async getByDate(teacherId: string, date: string): Promise<Lesson[]> {
        const { data, error } = await supabase
            .from('lessons')
            .select('*')
            .eq('teacher_id', teacherId)
            .eq('date', date);

        if (error) {
            throw new APIError('Failed to fetch lessons by date', error.code, error);
        }

        return data || [];
    },

    /**
     * Create a new lesson
     */
    async create(lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>): Promise<Lesson> {
        const { data, error } = await supabase
            .from('lessons')
            .insert([lesson])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to create lesson', error.code, error);
        }

        return data;
    },

    /**
     * Update a lesson
     */
    async update(id: string, updates: Partial<Lesson>): Promise<Lesson> {
        const { data, error } = await supabase
            .from('lessons')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to update lesson', error.code, error);
        }

        return data;
    },

    /**
     * Delete a lesson
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('lessons')
            .delete()
            .eq('id', id);

        if (error) {
            throw new APIError('Failed to delete lesson', error.code, error);
        }
    },
};
