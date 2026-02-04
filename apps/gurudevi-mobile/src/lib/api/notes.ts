/**
 * Notes API
 * 
 * API methods for managing teacher notes (venting, reflections)
 */

import { supabase } from '../supabase';
import { APIError } from './errors';
import type { TeacherNote } from './types';

export const notesAPI = {
    /**
     * Get all notes for a teacher
     */
    async getAll(teacherId: string, type?: TeacherNote['type']): Promise<TeacherNote[]> {
        let query = supabase
            .from('teacher_notes')
            .select('*')
            .eq('teacher_id', teacherId)
            .order('created_at', { ascending: false });

        if (type) {
            query = query.eq('type', type);
        }

        const { data, error } = await query;

        if (error) {
            throw new APIError('Failed to fetch notes', error.code, error);
        }

        return data || [];
    },

    /**
     * Create a new note
     */
    async create(
        teacherId: string,
        content: string,
        type: TeacherNote['type'] = 'note'
    ): Promise<TeacherNote> {
        const { data, error } = await supabase
            .from('teacher_notes')
            .insert([
                {
                    teacher_id: teacherId,
                    content,
                    type,
                },
            ])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to create note', error.code, error);
        }

        return data;
    },

    /**
     * Delete a note
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('teacher_notes')
            .delete()
            .eq('id', id);

        if (error) {
            throw new APIError('Failed to delete note', error.code, error);
        }
    },
};
