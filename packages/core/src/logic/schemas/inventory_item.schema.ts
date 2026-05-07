import { z } from 'zod';
import { makeModelSchema } from '@repo/schema';

/**
 * InventoryItemSchema - A tangible asset within the sanctuary.
 * Derived from ZenStack InventoryItem model.
 */
export const InventoryItemSchema = makeModelSchema('InventoryItem');

export type InventoryItemZod = z.infer<typeof InventoryItemSchema>;
