import { z } from 'zod';
import { makeModelSchema } from '@repo/schema';

/**
 * ProGiftSchema - A token of premium access.
 * Derived from ZenStack ProGift model.
 */
export const ProGiftSchema = makeModelSchema('ProGift');

/**
 * UserEntitlementsSchema - The current premium state of a user.
 */
export const UserEntitlementsSchema = z.object({
  user_id: z.string(),
  is_pro: z.boolean().default(false),
  pro_since: z.string().or(z.date()).optional().nullable(),
  pro_expires: z.string().or(z.date()).optional().nullable(),
  current_tier: z.string().default('lite'),
  features: z.array(z.string()).default([]),
});

/**
 * ProClaimResultSchema - The outcome of claiming a gift.
 */
export const ProClaimResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  new_role: z.string().optional(),
  expiry: z.string().or(z.date()).optional().nullable(),
});

export type ProGift = z.infer<typeof ProGiftSchema>;
export type UserEntitlements = z.infer<typeof UserEntitlementsSchema>;
export type ProClaimResult = z.infer<typeof ProClaimResultSchema>;
