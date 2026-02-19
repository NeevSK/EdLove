/**
 * Lesson Materials API
 * 
 * API methods for managing academic materials (PDFs, Links, Notes)
 */

import { supabase } from '@repo/core';
import { APIError, LessonMaterial } from './types';

export const lessonMaterialsAPI = {
    /**
     * Get all materials for a classroom
     */
    async getAll(classroomId: string): Promise<LessonMaterial[]> {
        const { data, error } = await supabase
            .from('lesson_materials')
            .select('*')
            .eq('classroom_id', classroomId)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            throw new APIError('Failed to fetch lesson materials', error.code, error);
        }

        return data || [];
    },

    /**
     * Get materials for a specific lesson (Month)
     */
    async getByLesson(lessonId: string): Promise<LessonMaterial[]> {
        const { data, error } = await supabase
            .from('lesson_materials')
            .select('*')
            .eq('lesson_id', lessonId)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            throw new APIError('Failed to fetch materials for lesson', error.code, error);
        }

        return data || [];
    },

    /**
     * Create new material
     */
    async create(
        material: Omit<LessonMaterial, 'id' | 'created_at' | 'updated_at'>
    ): Promise<LessonMaterial> {
        const { data, error } = await supabase
            .from('lesson_materials')
            .insert([material])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to create lesson material', error.code, error);
        }

        return data;
    },

    /**
     * Update material
     */
    async update(
        id: string,
        updates: Partial<LessonMaterial>
    ): Promise<LessonMaterial> {
        const { data, error } = await supabase
            .from('lesson_materials')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to update lesson material', error.code, error);
        }

        return data;
    },

    /**
     * Delete material
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('lesson_materials')
            .delete()
            .eq('id', id);

        if (error) {
            throw new APIError('Failed to delete lesson material', error.code, error);
        }
    },
};
