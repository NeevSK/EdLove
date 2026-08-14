import type { SovereignContract } from '@repo/core/api/contracts';
import { z } from 'zod';

const inventoryAuthority = (
  action: 'read' | 'create' | 'update',
  subject: 'InventoryItem' | 'InventoryRequest' = 'InventoryItem',
) => ({ policy: { action, subject } }) as const;

const inventoryItem = z.object({
  id: z.string(),
  school_id: z.string(),
  classroom_id: z.string().nullable(),
  name: z.string(),
  category: z.string(),
  quantity: z.number().int(),
  unit: z.string().nullable(),
  condition: z.string(),
  location: z.string().nullable(),
  last_audit_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const inventoryRequest = z.object({
  id: z.string(),
  school_id: z.string().nullable(),
  classroom_id: z.string().nullable(),
  teacher_id: z.string().nullable(),
  item_name: z.string(),
  quantity: z.string(),
  reason: z.string().nullable(),
  status: z.string().nullable(),
  priority: z.string().nullable(),
  created_at: z.string().datetime(),
});

export const inventoryContract = {
  getAll: {
    method: 'get',
    path: '/inventory/classrooms/:classroomId/items',
    request: { params: z.object({ classroomId: z.string().uuid() }) },
    responses: { 200: { schema: z.array(inventoryItem), description: 'List classroom inventory' } },
    metadata: inventoryAuthority('read'),
  },
  update: {
    method: 'patch',
    path: '/inventory/items/:id',
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: z.object({
        name: z.string().trim().min(1).max(200).optional(),
        category: z.string().trim().min(1).max(100).optional(),
        quantity: z.number().int().min(0).optional(),
        unit: z.string().max(50).nullable().optional(),
        condition: z.string().max(50).optional(),
        location: z.string().max(200).nullable().optional(),
        lastAuditAt: z.string().datetime().nullable().optional(),
      }),
    },
    responses: { 200: { schema: inventoryItem, description: 'Update an inventory item' } },
    metadata: inventoryAuthority('update'),
  },
  getSchoolResourceNeeds: {
    method: 'get',
    path: '/inventory/schools/:schoolId/resource-needs',
    request: { params: z.object({ schoolId: z.string().uuid() }) },
    responses: {
      200: {
        schema: z.array(
          z.object({
            resource_type: z.string(),
            description: z.string(),
            requested_by_count: z.number().int(),
            school_id: z.string(),
          }),
        ),
        description: 'Aggregate pending resource needs for a school',
      },
    },
    metadata: inventoryAuthority('read', 'InventoryRequest'),
  },
  createRequest: {
    method: 'post',
    path: '/inventory/requests',
    request: {
      body: z.object({
        itemId: z.string().uuid(),
        quantity: z.string().trim().min(1).max(50),
        notes: z.string().max(1000).optional().nullable(),
      }),
    },
    responses: { 201: { schema: inventoryRequest, description: 'Create an inventory request' } },
    metadata: inventoryAuthority('create'),
  },
  getSchoolRequests: {
    method: 'get',
    path: '/inventory/schools/:schoolId/requests',
    request: { params: z.object({ schoolId: z.string().uuid() }) },
    responses: {
      200: { schema: z.array(inventoryRequest), description: 'List school inventory requests' },
    },
    metadata: inventoryAuthority('read', 'InventoryRequest'),
  },
} as const satisfies SovereignContract;

export { inventoryItem, inventoryRequest };
