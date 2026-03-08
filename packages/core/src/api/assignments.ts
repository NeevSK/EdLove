/**
 * Assignments API
 * 
 * API methods for managing classroom assignments
 */

import { supabase } from '../lib/supabase';
import { identityAPI } from './identity';
import { APIError, Assignment } from './types';
import { growthSignalsAPI } from './growthSignals';

export const assignmentsAPI = {
    /**
     * Get all assignments for a classroom
     */
    async getAll(classroomId: string): Promise<Assignment[]> {
        const { data, error } = await supabase
            .from('assignments')
            .select('*')
            .eq('classroom_id', classroomId)
            .order('due_date', { ascending: true });

        if (error) {
            throw new APIError('Failed to fetch assignments', error.code, error);
        }

        return data || [];
    },

    /**
     * Get assignments for a specific lesson (Month)
     */
    async getByLesson(lessonId: string): Promise<Assignment[]> {
        const { data, error } = await supabase
            .from('assignments')
            .select('*')
            .eq('lesson_id', lessonId)
            .order('due_date', { ascending: true });

        if (error) {
            throw new APIError('Failed to fetch assignments for lesson', error.code, error);
        }

        return data || [];
    },

    /**
     * Create new assignment
     */
    async create(
        assignment: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>
    ): Promise<Assignment> {
        const { data, error } = await supabase
            .from('assignments')
            .insert([assignment])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to create assignment', error.code, error);
        }

        // Growth signal: teacher designed work for their students (Nourishing dimension)
        const myId = await identityAPI.getMyInternalId();
        if (myId) {
            void growthSignalsAPI.emitSignal(myId, 'assignment_created', {
                classroom_id: assignment.classroom_id,
            }).catch(() => { });
        }

        return data;
    },

    /**
     * Update assignment
     */
    async update(
        id: string,
        updates: Partial<Assignment>
    ): Promise<Assignment> {
        const { data, error } = await supabase
            .from('assignments')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to update assignment', error.code, error);
        }

        return data;
    },

    /**
     * Delete assignment
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('assignments')
            .delete()
            .eq('id', id);

        if (error) {
            throw new APIError('Failed to delete assignment', error.code, error);
        }
    },
};
