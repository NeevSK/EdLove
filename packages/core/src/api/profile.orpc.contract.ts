import type { SovereignContract } from '@repo/core/api/contracts';
import { profileContract } from '@repo/core/api/profile.contract';
import { z } from 'zod';

const socialLink = z.strictObject({
  id: z.uuid(),
  user_id: z.uuid(),
  platform: z.string().min(1).max(80),
  url: z.url(),
  is_public: z.boolean(),
  privacy_level: z.string().min(1).max(80),
  order_index: z.number().int().min(0),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

const profileAuthority = (action: 'read' | 'update' | 'delete') =>
  ({ policy: { action, subject: 'User' } }) as const;

/**
 * Native profile contract. The legacy profile contract remains the source for
 * its established profile routes while this adapter adds the active social-link
 * procedures used by the Sanctuary router.
 */
export const profileORPCContract = {
  ...profileContract,
  getSocialLinks: {
    method: 'get',
    path: '/profile/social-links',
    responses: { 200: { schema: z.array(socialLink), description: 'Current user social links' } },
    metadata: profileAuthority('read'),
  },
  upsertSocialLink: {
    method: 'put',
    path: '/profile/social-links',
    request: {
      body: z.strictObject({
        platform: z.string().trim().min(1).max(80),
        url: z.url(),
        is_public: z.boolean().optional(),
        privacy_level: z.string().trim().min(1).max(80).optional(),
        order_index: z.number().int().min(0).max(10_000).optional(),
      }),
    },
    responses: { 200: { schema: socialLink, description: 'Saved social link' } },
    metadata: profileAuthority('update'),
  },
  deleteSocialLink: {
    method: 'delete',
    path: '/profile/social-links/:id',
    request: { params: z.strictObject({ id: z.uuid() }) },
    responses: {
      200: {
        schema: z.strictObject({ success: z.literal(true) }),
        description: 'Deleted social link',
      },
    },
    metadata: profileAuthority('delete'),
  },
} as const satisfies SovereignContract;
