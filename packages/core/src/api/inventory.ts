/**
 * Inventory API
 * 
 * API methods for managing physical classroom inventory
 */

import { supabase } from '../lib/supabase';
import { APIError } from './types';
import type { InventoryItem, InventoryRequest } from './types';

export const inventoryAPI = {
    /**
     * Get all inventory items for a classroom
     */
    async getAll(classroomId: string): Promise<InventoryItem[]> {
        const { data, error } = await supabase
            .from('classroom_inventory')
            .select('*')
            .eq('classroom_id', classroomId)
            .order('name', { ascending: true });

        if (error) {
            throw new APIError('Failed to fetch inventory', error.code, error);
        }

        return data || [];
    },

    /**
     * Update an inventory item (e.g., report damage)
     */
    async update(
        id: string,
        updates: Partial<InventoryItem>
    ): Promise<InventoryItem> {
        const { data, error } = await supabase
            .from('classroom_inventory')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to update inventory item', error.code, error);
        }

        return data;
    },

    /**
     * Get all requests for a school (Principal View)
     */
    async getSchoolRequests(schoolId: string): Promise<InventoryRequest[]> {
        const { data, error } = await supabase
            .from('inventory_requests')
            .select('*')
            .eq('school_id', schoolId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new APIError('Failed to fetch school requests', error.code, error);
        }

        return data || [];
    },

    /**
     * Get aggregated resource needs for a school (Principal Dashboard)
     */
    async getSchoolResourceNeeds(schoolId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('resource_needs')
            .select('*')
            .eq('school_id', schoolId)
            .order('priority', { ascending: false });

        if (error) {
            throw new APIError('Failed to fetch school resource needs', error.code, error);
        }

        return data || [];
    },

    /**
     * Create a new supply request
     */
    async createRequest(
        request: Omit<InventoryRequest, 'id' | 'created_at' | 'status'> & { school_id: string }
    ): Promise<InventoryRequest> {
        const { data, error } = await supabase
            .from('inventory_requests')
            .insert([{ ...request, status: 'pending' }])
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to create supply request', error.code, error);
        }

        return data;
    },
};
