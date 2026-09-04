import type { SovereignContract } from '@repo/core/api/contracts';
import { z } from 'zod';

const thuthimalAuthority = (action: 'create' | 'read' | 'update') =>
  ({ policy: { action, subject: 'User' } }) as const;

const giftSummary = z.object({
  id: z.string(),
  gift_token: z.string(),
  gifter_id: z.string(),
  gifter_name: z.string(),
  recipient_tier: z.enum(['teacher', 'principal']),
  recipient_id: z.string().nullable(),
  claimed: z.boolean(),
  claimed_at: z.string().nullable(),
  expires_at: z.string().nullable(),
  message: z.string().nullable(),
  created_at: z.string(),
});

export const thuthimalContract = {
  createGift: {
    method: 'post',
    path: '/thuthimal/gifts',
    request: {
      body: z.object({
        gifterName: z.string().trim().min(1).max(120),
        recipientTier: z.enum(['teacher', 'principal']),
        recipientId: z.string().optional().nullable(),
        expiresAt: z.string().datetime().optional().nullable(),
        message: z.string().max(1000).optional().nullable(),
      }),
    },
    responses: {
      201: {
        schema: z.object({ gift_token: z.string() }),
        description: 'Create a gratitude gift token',
      },
    },
    metadata: thuthimalAuthority('create'),
  },
  claimGift: {
    method: 'post',
    path: '/thuthimal/gifts/claim',
    request: { body: z.object({ giftToken: z.string() }) },
    responses: {
      200: {
        schema: z.object({
          success: z.boolean(),
          gifter_name: z.string().optional(),
          recipient_id: z.string().optional(),
          error: z.string().optional(),
        }),
        description: 'Atomically claim a gratitude gift for the authenticated recipient',
      },
    },
    metadata: thuthimalAuthority('update'),
  },
  getMyGifts: {
    method: 'get',
    path: '/thuthimal/gifts',
    responses: {
      200: {
        schema: z.array(giftSummary),
        description: 'List gifts created by the authenticated user',
      },
    },
    metadata: thuthimalAuthority('read'),
  },
  previewGift: {
    method: 'get',
    path: '/thuthimal/gifts/:giftToken/preview',
    request: { params: z.object({ giftToken: z.string() }) },
    responses: {
      200: {
        schema: z
          .object({ gifter_name: z.string(), recipient_tier: z.enum(['teacher', 'principal']) })
          .nullable(),
        description: 'Preview an unclaimed, unexpired gratitude gift',
      },
    },
    metadata: thuthimalAuthority('read'),
  },
} as const satisfies SovereignContract;
