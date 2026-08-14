/**
 * Inventory API client. Database authority lives in Sanctuary; this adapter
 * preserves the legacy caller shapes while using the typed HTTP contract.
 */
import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@repo/core/api/base';
import {
  inventoryContract,
  inventoryItem,
  inventoryRequest,
} from '@repo/core/api/inventory.contract';
import type { InventoryItem } from '@repo/core/types';
import { APIError } from '@repo/core/types/API';

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

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
    const res = await (client.api as any).inventory.classrooms[':classroomId'].items.$get({
      param: { classroomId },
    });
    if (!res.ok) throw new APIError('Failed to fetch inventory', res.status.toString());
    return (await res.json()).map((row: unknown) => mapItem(inventoryItem.parse(row)));
  },

  async update(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const res = await (client.api as any).inventory.items[':id'].$patch({
      param: { id },
      json: {
        name: updates.name,
        category: updates.category,
        quantity: updates.quantity,
        condition: updates.condition,
        lastAuditAt: updates.last_checked
          ? new Date(updates.last_checked).toISOString()
          : undefined,
      },
    });
    if (!res.ok) throw new APIError('Failed to update inventory item', res.status.toString());
    return mapItem(inventoryItem.parse(await res.json()));
  },

  async getSchoolResourceNeeds(schoolId: string): Promise<any[]> {
    const res = await (client.api as any).inventory.schools[':schoolId']['resource-needs'].$get({
      param: { schoolId },
    });
    if (!res.ok) throw new APIError('Failed to fetch school resource needs', res.status.toString());
    return await res.json();
  },

  async createRequest(vars: { item_id: string; quantity: number; notes?: string }): Promise<any> {
    const res = await (client.api as any).inventory.requests.$post({
      json: { itemId: vars.item_id, quantity: String(vars.quantity), notes: vars.notes },
    });
    if (!res.ok) throw new APIError('Failed to create inventory request', res.status.toString());
    return inventoryRequest.parse(await res.json());
  },

  async getSchoolRequests(schoolId: string): Promise<any[]> {
    const res = await (client.api as any).inventory.schools[':schoolId'].requests.$get({
      param: { schoolId },
    });
    if (!res.ok)
      throw new APIError('Failed to fetch school inventory requests', res.status.toString());
    return (await res.json()).map((row: unknown) => inventoryRequest.parse(row));
  },
};

void inventoryContract;
