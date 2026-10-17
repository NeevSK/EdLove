import type { SovereignContract } from '@repo/core/api/contracts';
import { z } from 'zod';

const wallpaperMetadata = z.object({
  mimeType: z.enum(['image/avif', 'image/jpeg', 'image/png', 'image/webp']),
  byteLength: z
    .number()
    .int()
    .positive()
    .max(8 * 1024 * 1024),
  width: z.number().int().positive().max(16_000_000),
  height: z.number().int().positive().max(16_000_000),
});
const wallpaperAssetInput = wallpaperMetadata.extend({
  publicId: z.string().trim().min(1).max(512),
  secureUrl: z.string().url(),
  format: z.string().trim().min(1).max(32),
});
const wallpaperAsset = z.object({
  assetId: z.string().uuid(),
  publicId: z.string(),
  secureUrl: z.string().url(),
  format: z.string(),
  byteLength: z.number().int().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
const wallpaperAssetReconciliation = z.discriminatedUnion('status', [
  z.object({ status: z.literal('registered'), asset: wallpaperAsset }),
  z.object({ status: z.literal('cleaned') }),
]);

export const mediaUploadContract = {
  requestWallpaperUpload: {
    method: 'post',
    path: '/media/wallpapers/upload-intents',
    request: { body: wallpaperMetadata },
    responses: {
      200: {
        schema: z.object({
          provider: z.literal('cloudinary'),
          uploadUrl: z.string().url(),
          fields: z.record(z.string(), z.string()),
          expiresAt: z.string().datetime(),
        }),
        description: 'Short-lived signed parameters for an authenticated wallpaper upload',
      },
    },
    metadata: { policy: { action: 'update', subject: 'User' } },
  },
  registerWallpaperAsset: {
    method: 'post',
    path: '/media/wallpapers/assets',
    request: { body: wallpaperAssetInput },
    responses: {
      200: { schema: wallpaperAsset, description: 'Register an owned wallpaper asset' },
    },
    metadata: { policy: { action: 'update', subject: 'User' } },
  },
  reconcileWallpaperAsset: {
    method: 'post',
    path: '/media/wallpapers/assets/reconcile',
    request: { body: wallpaperAssetInput },
    responses: {
      200: {
        schema: wallpaperAssetReconciliation,
        description:
          'Resolve an ambiguous wallpaper registration without deleting a registered asset',
      },
    },
    metadata: { policy: { action: 'update', subject: 'User' } },
  },
  deleteWallpaperAsset: {
    method: 'post',
    path: '/media/wallpapers/assets/delete',
    request: { body: z.object({ publicId: z.string().trim().min(1).max(512) }) },
    responses: {
      200: {
        schema: z.object({ deleted: z.literal(true) }),
        description: 'Delete an owned wallpaper asset',
      },
    },
    metadata: { policy: { action: 'update', subject: 'User' } },
  },
} as const satisfies SovereignContract;

export type WallpaperUploadMetadata = z.infer<typeof wallpaperMetadata>;
