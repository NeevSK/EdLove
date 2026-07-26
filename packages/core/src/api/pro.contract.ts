import { z } from 'zod';
import {
  ProClaimResultSchema,
  ProGiftSchema,
  UserEntitlementsSchema,
} from '@/logic/schemas/pro.schema';
import type { SovereignContract } from '@/api/contract';

const proAuthority = (
  action: 'manage' | 'create' | 'read' | 'update' | 'delete' | 'submit' | 'verify',
) => ({ policy: { action, subject: 'Pro' } }) as const;

export const proContract = {
  // --- ENTITLEMENTS ---
  getEntitlements: {
    method: 'get',
    path: '/pro/entitlements/:userId',
    request: {
      params: z.object({ userId: z.string() }),
    },
    responses: {
      200: {
        schema: UserEntitlementsSchema,
        description: 'Get user entitlements',
      },
      404: {
        schema: z.object({ message: z.string() }),
        description: 'Entitlements not found',
      },
    },
    metadata: proAuthority('read'),
  },
  verifyProStatus: {
    method: 'get',
    path: '/pro/verify/:userId',
    request: {
      params: z.object({ userId: z.string() }),
    },
    responses: {
      200: {
        schema: z.object({ is_pro: z.boolean(), tier: z.string() }),
        description: 'Verify pro status',
      },
    },
    metadata: proAuthority('read'),
  },

  // --- THUTHIMAL (GIFTING PRO) ---
  getAllReceivedGifts: {
    method: 'get',
    path: '/pro/gifts/received/:userId',
    request: {
      params: z.object({ userId: z.string() }),
    },
    responses: {
      200: {
        schema: z.array(ProGiftSchema),
        description: 'Get all received gifts',
      },
    },
    metadata: proAuthority('read'),
  },
  previewGift: {
    method: 'get',
    path: '/pro/gifts/preview/:token',
    request: {
      params: z.object({ token: z.string() }),
    },
    responses: {
      200: {
        schema: ProGiftSchema.pick({
          gifter_name: true,
          gift_message: true,
          recipient_role: true,
        }),
        description: 'Preview gift',
      },
      404: {
        schema: z.object({ message: z.string() }),
        description: 'Gift not found',
      },
    },
    metadata: proAuthority('read'),
  },
  giftPro: {
    method: 'post',
    path: '/pro/gifts',
    request: {
      body: z.object({
        gifter_id: z.string(),
        recipient_id: z.string().optional(),
        recipient_email: z.string().optional(),
        recipient_role: z.string(),
        gift_message: z.string().optional(),
      }),
    },
    responses: {
      201: {
        schema: z.object({ gift_token: z.string() }),
        description: 'Pro gifted successfully',
      },
    },
    metadata: proAuthority('create'),
  },
  claimProGift: {
    method: 'post',
    path: '/pro/gifts/claim',
    request: {
      body: z.object({ gift_token: z.string(), recipient_id: z.string() }),
    },
    responses: {
      200: {
        schema: ProClaimResultSchema,
        description: 'Pro gift claimed successfully',
      },
    },
    metadata: proAuthority('update'),
  },
} as const satisfies SovereignContract;
