import { z } from 'zod';

/**
 * InventoryItemSchema  A tangible asset within the sanctuary.
 */
export const InventoryItemSchema = z.object({
  id: z.string().uuid(),
  classroom_id: z.string().uuid(),
  name: z.string().min(1),
  category: z.string(),
  quantity: z.number().int().nonnegative(),
  condition: z.enum(['good', 'fair', 'poor', 'broken']),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type InventoryItemZod = z.infer<typeof InventoryItemSchema>;
