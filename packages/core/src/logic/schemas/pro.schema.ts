import { z } from 'zod';

export const ProGiftSchema = z.object({
  id: z.string().uuid(),
  gifter_id: z.string(),
  recipient_id: z.string().optional().nullable(),
  gifter_name: z.string().optional().nullable(),
  recipient_role: z.string().optional(),
  gift_message: z.string().optional().nullable(),
  gift_token: z.string().optional(),
  claimed: z.boolean().default(false),
  claimed_at: z.string().or(z.date()).optional().nullable(),
  expires_at: z.string().or(z.date()).optional().nullable(),
  created_at: z.string().or(z.date()),
});

export const UserEntitlementsSchema = z.object({
  user_id: z.string(),
  is_pro: z.boolean().default(false),
  pro_since: z.string().or(z.date()).optional().nullable(),
  pro_expires: z.string().or(z.date()).optional().nullable(),
  current_tier: z.string().default('lite'),
  features: z.array(z.string()).default([]),
});

export const ProClaimResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  new_role: z.string().optional(),
  expiry: z.string().or(z.date()).optional().nullable(),
});
