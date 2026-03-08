/**
 * Classroom Notes API
 *
 * Persistent, date-stamped logbook per classroom.
 * Teachers can write private notes or class-wide announcements.
 * Students can write personal study notes and read teacher announcements.
 * Nothing is ever deleted — old notes scroll back in time.
 */

import { supabase } from '../lib/supabase';
import { identityAPI } from './identity';
import { APIError } from './types';
import type { ClassroomNote } from '../types/ClassroomNote';

export type { ClassroomNote };

export const classroomNotesAPI = {
    /**
     * Fetch notes for a classroom visible to the current user.
     * Returns: own private notes + all class-visible notes, newest first.
     */
    async getAll(classroomId: string): Promise<ClassroomNote[]> {
        const myId = await identityAPI.getMyInternalId();
        if (!myId) throw new APIError('Not authenticated', 'AUTH_REQUIRED');

        const { data, error } = await supabase
            .from('classroom_notes')
            .select('*, author:users(full_name, role)')
            .eq('classroom_id', classroomId)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw new APIError('Failed to fetch classroom notes', error.code, error);
        return (data || []) as ClassroomNote[];
    },

    /**
     * Create a new note in a classroom.
     */
    async create(note: {
        classroom_id: string;
        content: string;
        note_type: ClassroomNote['note_type'];
        visibility: ClassroomNote['visibility'];
    }): Promise<ClassroomNote> {
        const myId = await identityAPI.getMyInternalId();
        if (!myId) throw new APIError('Not authenticated', 'AUTH_REQUIRED');

        const { data, error } = await supabase
            .from('classroom_notes')
            .insert([{ ...note, author_id: myId, is_pinned: false }])
            .select('*, author:users(full_name, role)')
            .single();

        if (error) throw new APIError('Failed to create classroom note', error.code, error);
        return data as ClassroomNote;
    },

    /**
     * Update a note's content, pinned state, or visibility.
     * Only the author can update their own notes (enforced by RLS).
     */
    async update(
        id: string,
        updates: Partial<Pick<ClassroomNote, 'content' | 'is_pinned' | 'visibility'>>
    ): Promise<ClassroomNote> {
        const { data, error } = await supabase
            .from('classroom_notes')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select('*, author:users(full_name, role)')
            .single();

        if (error) throw new APIError('Failed to update classroom note', error.code, error);
        return data as ClassroomNote;
    },

    /**
     * Delete a note. Only the author can delete (enforced by RLS).
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('classroom_notes')
            .delete()
            .eq('id', id);

        if (error) throw new APIError('Failed to delete classroom note', error.code, error);
    },
};
