import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  ProClaimResultSchema,
  ProGiftSchema,
  UserEntitlementsSchema,
} from '../logic/schemas/pro.schema';
import { POAMetadataSchema } from './contract';

const c = initContract();

const proAuthority = (
  action: 'manage' | 'create' | 'read' | 'update' | 'delete' | 'submit' | 'verify',
) => POAMetadataSchema.parse({ authority: { action, subject: 'Pro' } });

export const proContract = c.router({
  // --- ENTITLEMENTS ---
  getEntitlements: {
    method: 'GET',
    path: '/pro/entitlements/:userId',
    responses: {
      200: UserEntitlementsSchema,
      404: z.object({ message: z.string() }),
    },
    metadata: proAuthority('read'),
  },
  verifyProStatus: {
    method: 'GET',
    path: '/pro/verify/:userId',
    responses: { 200: z.object({ is_pro: z.boolean(), tier: z.string() }) },
    metadata: proAuthority('read'),
  },

  // --- THUTHIMAL (GIFTING PRO) ---
  getAllReceivedGifts: {
    method: 'GET',
    path: '/pro/gifts/received/:userId',
    responses: { 200: z.array(ProGiftSchema) },
    metadata: proAuthority('read'),
  },
  previewGift: {
    method: 'GET',
    path: '/pro/gifts/preview/:token',
    responses: {
      200: ProGiftSchema.pick({ gifter_name: true, gift_message: true, recipient_role: true }),
      404: z.object({ message: z.string() }),
    },
    metadata: proAuthority('read'),
  },
  giftPro: {
    method: 'POST',
    path: '/pro/gifts',
    body: z.object({
      gifter_id: z.string(),
      recipient_id: z.string().optional(),
      recipient_email: z.string().optional(),
      recipient_role: z.string(),
      gift_message: z.string().optional(),
    }),
    responses: { 201: z.object({ gift_token: z.string() }) },
    metadata: proAuthority('create'),
  },
  claimProGift: {
    method: 'POST',
    path: '/pro/gifts/claim',
    body: z.object({ gift_token: z.string(), recipient_id: z.string() }),
    responses: { 200: ProClaimResultSchema },
    metadata: proAuthority('update'),
  },
});
