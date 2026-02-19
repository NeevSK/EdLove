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
     * Get all requests for a classroom
     */
    async getRequests(classroomId: string): Promise<InventoryRequest[]> {
        const { data, error } = await supabase
            .from('inventory_requests')
            .select('*')
            .eq('classroom_id', classroomId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new APIError('Failed to fetch requests', error.code, error);
        }

        return data || [];
    },

    /**
     * Create a new supply request
     */
    async createRequest(
        request: Omit<InventoryRequest, 'id' | 'created_at' | 'status'>
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
