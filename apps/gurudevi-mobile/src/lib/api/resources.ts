/**
 * Resources API
 * 
 * API methods for managing classroom resources
 */

import { supabase } from '@repo/core';
import { APIError } from './types';
import type { ClassroomResource } from './types';

export const resourcesAPI = {
    /**
     * Get all resources for a classroom
     */
    async getAll(classroomId: string): Promise<ClassroomResource[]> {
        const { data, error } = await supabase
            .from('classroom_resources')
            .select('*')
            .eq('classroom_id', classroomId)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            throw new APIError('Failed to fetch resources', error.code, error);
        }

        return data || [];
    },

    /**
     * Create a new resource
     */
    async create(
        resource: Omit<ClassroomResource, 'id' | 'created_at' | 'updated_at'>
    ): Promise<ClassroomResource> {
        const { data, error } = await supabase
            .from('classroom_resources')
            .insert([resource])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to create resource', error.code, error);
        }

        return data;
    },

    /**
     * Update a resource
     */
    async update(
        id: string,
        updates: Partial<ClassroomResource>
    ): Promise<ClassroomResource> {
        const { data, error } = await supabase
            .from('classroom_resources')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to update resource', error.code, error);
        }

        return data;
    },

    /**
     * Toggle pin status
     */
    async togglePin(id: string, isPinned: boolean): Promise<ClassroomResource> {
        return this.update(id, { is_pinned: isPinned });
    },

    /**
     * Delete a resource
     */
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('classroom_resources')
            .delete()
            .eq('id', id);

        if (error) {
            throw new APIError('Failed to delete resource', error.code, error);
        }
    },
};
