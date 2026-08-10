/**
 * INVENTORY API (Protocol-Oriented Authority)
 */

import { z } from 'zod';
import { InventoryItemSchema } from '@repo/core/logic/schemas/inventory_item.schema';
import type { InventoryItem } from '@repo/core/types';
import { APIError } from '@repo/core/types/API';
import { operationsContract } from '@repo/core/api/operations.contract';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';

/**
 * API methods for Managing Classroom Inventory.
 * Following Protocol-Oriented Authority.
 */
export const inventoryAPI = {
  /**
   * Get all inventory items for a classroom
   * @policy read Inventory
   */
  async getAll(classroomId: string): Promise<InventoryItem[]> {
    const { data, error } = await supabaseClient
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
   * @policy update Inventory
   */
  async update(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const { data, error } = await supabaseClient
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
   * @policy read Inventory
   */
  async getSchoolResourceNeeds(schoolId: string): Promise<any[]> {
    const { data, error } = await supabaseClient
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
   * @policy create Inventory
   */
  async createRequest(vars: { item_id: string; quantity: number; notes?: string }): Promise<any> {
    const { data, error } = await supabaseClient
      .from('inventory_requests')
      .insert({
        item_id: vars.item_id,
        quantity: vars.quantity,
        notes: vars.notes,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw new APIError('Failed to create inventory request', error.code, error);
    }

    return data;
  },

  /**
   * Get all inventory requests for a school
   * @policy read Inventory
   */
  async getSchoolRequests(schoolId: string): Promise<any[]> {
    const { data, error } = await supabaseClient
      .from('inventory_requests')
      .select(`
                *,
                item:classroom_inventory(name, school_id)
            `)
      .eq('item.school_id', schoolId);

    if (error) {
      throw new APIError('Failed to fetch school inventory requests', error.code, error);
    }

    return data || [];
  },
};

// Satisfy linter for POA metadata linking
void operationsContract;
