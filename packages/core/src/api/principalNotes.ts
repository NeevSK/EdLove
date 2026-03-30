/**
 * Principal Notes API
 *
 * The principal's private school logbook \u2014 a personal memory-offload
 * layer scoped to school_id. Mirrors the classroom notes topology:
 *   classroom \u2192 ClassroomNote  (teacher + student, per classroom)
 *   school    \u2192 PrincipalNote  (principal only, per school)
 *
 * Notes are never deleted. Todos are checked off with is_done=true
 * but remain in the record forever (the history matters).
 */

import { supabase } from '../lib/supabase';
import { identityAPI } from './identity';
import { APIError } from './types';
import type { PrincipalNote } from '../types/PrincipalNote';

export type { PrincipalNote };

export const principalNotesAPI = {
    /**
     * Fetch all notes for a school, newest first.
     * Pinned notes are sorted to the top.
     * RLS guarantees only the author ever sees their own notes.
     */
    async getAll(schoolId: string): Promise<PrincipalNote[]> {
        const myId = await identityAPI.getMyInternalId();
        if (!myId) throw new APIError('Not authenticated', 'AUTH_REQUIRED');

        const { data, error } = await supabase
            .from('principal_notes')
            .select(`
                *,
                context_teacher:users!principal_notes_context_teacher_id_fkey(full_name),
                context_classroom:classrooms!principal_notes_context_classroom_id_fkey(name)
            `)
            .eq('school_id', schoolId)
            .eq('author_id', myId)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw new APIError('Failed to fetch principal notes', error.code, error);
        return (data || []) as PrincipalNote[];
    },

    /**
     * Fetch only the most recent N notes \u2014 used for the compact
     * dashboard preview strip.
     */
    async getRecent(schoolId: string, limit = 3): Promise<PrincipalNote[]> {
        const myId = await identityAPI.getMyInternalId();
        if (!myId) throw new APIError('Not authenticated', 'AUTH_REQUIRED');

        const { data, error } = await supabase
            .from('principal_notes')
            .select('*')
            .eq('school_id', schoolId)
            .eq('author_id', myId)
            .eq('is_done', false)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw new APIError('Failed to fetch recent principal notes', error.code, error);
        return (data || []) as PrincipalNote[];
    },

    /**
     * Create a new note in the school logbook.
     */
    async create(note: {
        school_id: string;
        content: string;
        note_type: PrincipalNote['note_type'];
        context_teacher_id?: string | null;
        context_classroom_id?: string | null;
    }): Promise<PrincipalNote> {
        const myId = await identityAPI.getMyInternalId();
        if (!myId) throw new APIError('Not authenticated', 'AUTH_REQUIRED');

        const { data, error } = await supabase
            .from('principal_notes')
            .insert([{
                ...note,
                author_id: myId,
                is_pinned: false,
                is_done: false,
            }])
            .select('*')
            .single();

        if (error) throw new APIError('Failed to create principal note', error.code, error);
        return data as PrincipalNote;
    },

    /**
     * Update a note \u2014 content, pinned state, or done state.
     * Only the author can update (enforced by RLS).
     */
    async update(
        id: string,
        updates: Partial<Pick<PrincipalNote, 'content' | 'is_pinned' | 'is_done'>
    ): Promise<PrincipalNote> {
        const { data, error } = await supabase
            .from('principal_notes')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select('*')
            .single();

        if (error) throw new APIError('Failed to update principal note', error.code, error);
        return data as PrincipalNote;
    },

    /**
     * Delete a note. Only the author can delete (enforced by RLS).
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('principal_notes')
            .delete()
            .eq('id', id);

        if (error) throw new APIError('Failed to delete principal note', error.code, error);
    },
};
