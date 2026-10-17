/**
 * Inventory API client. Database authority lives in Sanctuary; this adapter
 * preserves the legacy caller shapes while using the typed HTTP contract.
 */
import { orpcClient } from '@repo/core/api/orpcClient';
import {
  inventoryContract,
  inventoryItem,
  inventoryRequest,
} from '@repo/core/api/inventory.contract';
import type { InventoryItem } from '@repo/core/types';
import { APIError } from '@repo/core/types/API';

const mapItem = (row: ReturnType<typeof inventoryItem.parse>): InventoryItem => ({
  id: row.id,
  classroom_id: row.classroom_id ?? '',
  name: row.name,
  category: row.category as InventoryItem['category'],
  quantity: row.quantity,
  condition: row.condition as InventoryItem['condition'],
  last_checked: row.last_audit_at ?? row.updated_at,
});

export const inventoryAPI = {
  async getAll(classroomId: string): Promise<InventoryItem[]> {
    try {
      const res = await orpcClient.inventory.getAll({
        params: { classroomId },
      });
      return (res as unknown[]).map((row: unknown) => mapItem(inventoryItem.parse(row)));
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to fetch inventory',
        error.status?.toString() || error.code || 'INVENTORY_FETCH_FAILED',
      );
    }
  },

  async update(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      const res = await orpcClient.inventory.update({
        params: { id },
        body: {
          name: updates.name,
          category: updates.category,
          quantity: updates.quantity,
          condition: updates.condition,
          lastAuditAt: updates.last_checked
            ? new Date(updates.last_checked).toISOString()
            : undefined,
        },
      });
      return mapItem(inventoryItem.parse(res));
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to update inventory item',
        error.status?.toString() || error.code || 'INVENTORY_UPDATE_FAILED',
      );
    }
  },

  async getSchoolResourceNeeds(schoolId: string): Promise<any[]> {
    try {
      const res = await orpcClient.inventory.getSchoolResourceNeeds({
        params: { schoolId },
      });
      return res as any[];
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to fetch school resource needs',
        error.status?.toString() || error.code || 'INVENTORY_FETCH_FAILED',
      );
    }
  },

  async createRequest(vars: { item_id: string; quantity: number; notes?: string }): Promise<any> {
    try {
      const res = await orpcClient.inventory.createRequest({
        body: { itemId: vars.item_id, quantity: String(vars.quantity), notes: vars.notes },
      });
      return inventoryRequest.parse(res);
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to create inventory request',
        error.status?.toString() || error.code || 'INVENTORY_REQUEST_FAILED',
      );
    }
  },

  async getSchoolRequests(schoolId: string): Promise<any[]> {
    try {
      const res = await orpcClient.inventory.getSchoolRequests({
        params: { schoolId },
      });
      return (res as unknown[]).map((row: unknown) => inventoryRequest.parse(row));
    } catch (error: any) {
      throw new APIError(
        error.message || 'Failed to fetch school inventory requests',
        error.status?.toString() || error.code || 'INVENTORY_FETCH_FAILED',
      );
    }
  },
};

void inventoryContract;
