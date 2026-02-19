/**
 * Groups API
 * 
 * API methods for managing student groups
 */

import { supabase } from '@repo/core';
import { APIError } from './types';
import type { StudentGroup } from './types';

export const groupsAPI = {
    /**
     * Get all groups for a classroom
     */
    async getAll(classroomId: string): Promise<StudentGroup[]> {
        const { data, error } = await supabase
            .from('student_groups')
            .select('*')
            .eq('classroom_id', classroomId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new APIError('Failed to fetch groups', error.code, error);
        }

        return data || [];
    },

    /**
     * Create a new group
     */
    async create(
        group: Omit<StudentGroup, 'id' | 'created_at' | 'updated_at'>
    ): Promise<StudentGroup> {
        const { data, error } = await supabase
            .from('student_groups')
            .insert([group])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to create group', error.code, error);
        }

        return data;
    },

    /**
     * Update a group
     */
    async update(
        id: string,
        updates: Partial<StudentGroup>
    ): Promise<StudentGroup> {
        const { data, error } = await supabase
            .from('student_groups')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to update group', error.code, error);
        }

        return data;
    },

    /**
     * Delete a group
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('student_groups')
            .delete()
            .eq('id', id);

        if (error) {
            throw new APIError('Failed to delete group', error.code, error);
        }
    },
};
