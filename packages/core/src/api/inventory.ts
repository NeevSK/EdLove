/**
 * INVENTORY API (Protocol-Oriented Authority)
 */

import { operationsContract } from './operations.contract';
import { supabase } from '../lib/supabase';
import { APIError } from './types';
import type { InventoryItem } from './types';
import { InventoryItemSchema } from './schemas/inventory_item.schema';
import { z } from 'zod';

/**
 * API methods for Managing Classroom Inventory.
 * Following Protocol-Oriented Authority.
 */
export const inventoryAPI = {
    /**
     * Get all inventory items for a classroom
     * @authority read Inventory
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

        return z.array(InventoryItemSchema).parse(data || []) as unknown as InventoryItem[];
    },

    /**
     * Update an inventory item
     * @authority update Inventory
     */
    async update(
        id: string,
        updates: Partial<InventoryItem    ): Promise<InventoryItem> {
        const { data, error } = await supabase
            .from('classroom_inventory')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to update inventory item', error.code, error);
        }

        return InventoryItemSchema.parse(data) as unknown as InventoryItem;
    },

    /**
     * Get aggregated resource needs for a school
     * @authority read Inventory
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
     * Create an inventory request
     * @authority create Inventory
     */
    async createRequest(vars: { item_id: string; quantity: number; notes?: string }): Promise<any> {
        const { data, error } = await supabase
            .from('inventory_requests')
            .insert({
                item_id: vars.item_id,
                quantity: vars.quantity,
                notes: vars.notes,
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            throw new APIError('Failed to create inventory request', error.code, error);
        }

        return data;
    },
};

// Satisfy linter for POA metadata linking
void operationsContract;
