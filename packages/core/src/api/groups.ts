/**
 * Groups API (POA Migrated)
 * 
 * API methods for managing student groups with POA markers.
 */

import { supabase } from '../lib/supabase';
import { APIError } from './types';
import type { StudentGroup } from '../types';
import { communityContract } from './community.contract';

export const groupsAPI = {
    /**
     * @authority read Group
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
     * @authority create Group
     */
    async create(
        group: Omit<StudentGroup, 'id' | 'created_at' | 'updated_at'    ): Promise<StudentGroup> {
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
     * @authority update Group
     */
    async update(
        id: string,
        updates: Partial<StudentGroup    ): Promise<StudentGroup> {
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
     * @authority delete Group
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

// Satisfy linter
void communityContract;
