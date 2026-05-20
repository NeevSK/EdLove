/**
 * Principal Notes API
 *
 * The principal's private school logbook — a personal memory-offload
 * layer scoped to school_id. Mirrors the classroom notes topology:
 *   classroom → ClassroomNote  (teacher + student, per classroom)
 *   school    → PrincipalNote  (principal only, per school)
 *
 * Notes are never deleted. Todos are checked off with is_done=true
 * but remain in the record forever (the history matters).
 */

import { APIError } from '../types/API';
import type { PrincipalNote } from '../types/PrincipalNote';
export type { PrincipalNote };
import { identityAPI } from './identity';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from './supabase';


export const principalNotesAPI = {
  /**
   * Fetch all notes for a school, newest first.
   * Pinned notes are sorted to the top.
   * RLS guarantees only the author ever sees their own notes.
   */
  async getAll(schoolId: string): Promise<PrincipalNote[]> {
    const identity = await identityAPI.identifyActiveCitizen();
    if (!identity) throw new APIError('Not authenticated', 'AUTH_REQUIRED');

    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('principal_notes')
      .select(`
                *,
                context_teacher:users!principal_notes_context_teacher_id_fkey(full_name),
                context_classroom:classrooms!principal_notes_context_classroom_id_fkey(name)
            `)
      .eq('school_id', schoolId)
      .eq('author_id', identity.id)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw new APIError('Failed to fetch principal notes', error.code, error);
    return (data || []) as PrincipalNote[];
  },

  /**
   * Fetch only the most recent N notes — used for the compact
   * dashboard preview strip.
   */
  async getRecent(schoolId: string, limit = 3): Promise<PrincipalNote[]> {
    const identity = await identityAPI.identifyActiveCitizen();
    if (!identity) throw new APIError('Not authenticated', 'AUTH_REQUIRED');

    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('principal_notes')
      .select('*')
      .eq('school_id', schoolId)
      .eq('author_id', identity.id)
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
    const identity = await identityAPI.identifyActiveCitizen();
    if (!identity) throw new APIError('Not authenticated', 'AUTH_REQUIRED');

    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('principal_notes')
      .insert([
        {
          ...note,
          author_id: identity.id,
          is_pinned: false,
          is_done: false,
        },
      ])
      .select('*')
      .single();

    if (error) throw new APIError('Failed to create principal note', error.code, error);
    return data as PrincipalNote;
  },

  /**
   * Update a note — content, pinned state, or done state.
   * Only the author can update (enforced by RLS).
   */
  async update(
    id: string,
    updates: Partial<Pick<PrincipalNote, 'content' | 'is_pinned' | 'is_done'>>,
  ): Promise<PrincipalNote> {
    const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
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
    const { error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
      .from('principal_notes')
      .delete()
      .eq('id', id);

    if (error) throw new APIError('Failed to delete principal note', error.code, error);
  },
};
