import { z } from 'zod';

export const WorkspaceLayoutVersionSchema = z.union([z.literal(1), z.literal(2)]);

export const WorkspaceWallpaperSchema = z.object({
  // `preset`: a photo that ships with the app (a site path); `custom`: an upload kept on a device,
  // sent as a `device:` reference (see `appearanceForSync`).
  provider: z.enum(['cloudinary', 'preset', 'custom']),
  url: z.string().min(1),
  publicId: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  name: z.string().optional(),
});

export const FloorWallpaperConfigSchema = z.object({
  mode: z.enum(['single', 'slideshow', 'off']),
  activeId: z.string().nullable().optional(),
  items: z.array(WorkspaceWallpaperSchema),
  slideshowIntervalSeconds: z.number().nonnegative(),
  customWashColor: z.string().nullable().optional(),
  washOpacity: z.number().min(0).max(1).optional(),
  wallpaperOpacity: z.number().min(0).max(1).optional(),
});

export const WorkspaceAppearanceSchema = z.object({
  preset: z.enum(['default', 'dawn', 'garden', 'night', 'none']).default('default'),
  motion: z.enum(['off', 'subtle']).default('off'),
  wallpaper: WorkspaceWallpaperSchema.nullable().optional(),
  groundMode: z.enum(['live', 'still', 'image', 'quiet']).optional(),
  worldId: z.string().optional(),
  wallpaperConfig: FloorWallpaperConfigSchema.nullable().optional(),
  atmosphere: z.string().optional(),
  groundScope: z.enum(['world', 'room']).optional(),
  changedAt: z.string().optional(),
});

export const WorkspaceLayoutTargetSchema = z.enum(['shared', 'web', 'mobile']);

export const WorkspaceLayoutZoneSchema = z.enum([
  'today',
  'work',
  'institution',
  'outlook',
  'private',
]);

export const WorkspaceLayoutRecordSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  workspace_id: z.string().min(1),
  layout_target: WorkspaceLayoutTargetSchema.default('shared'),
  order: z.array(z.string()),
  hidden: z.array(z.string()),
  pinned: z.array(z.string()),
  zone_by_surface: z
    .record(z.string(), z.union([WorkspaceLayoutZoneSchema, z.string(), z.number()]))
    .default({}),
  is_default: z.boolean().default(true),
  surface_metadata: z.record(z.string(), z.unknown()).default({}),
  layout_version: WorkspaceLayoutVersionSchema.default(2),
  revision: z.number().int().nonnegative().default(0),
  last_operation_id: z.uuid().nullable().default(null),
  created_at: z.string(),
  updated_at: z.string(),
});

export const WorkspaceLayoutUpsertSchema = z.object({
  userId: z.uuid(),
  workspaceId: z.string().min(1),
  layoutTarget: WorkspaceLayoutTargetSchema.default('shared'),
  order: z.array(z.string()),
  hidden: z.array(z.string()).default([]),
  pinned: z.array(z.string()).default([]),
  zoneBySurface: z
    .record(z.string(), z.union([WorkspaceLayoutZoneSchema, z.string(), z.number()]))
    .default({}),
  isDefault: z.boolean().default(true),
  surfaceMetadata: z.record(z.string(), z.unknown()).default({}),
  layoutVersion: WorkspaceLayoutVersionSchema.default(2),
  updatedAt: z.string().min(1),
});

export const WorkspaceLayoutDeleteSchema = z.object({
  userId: z.uuid(),
  workspaceId: z.string().min(1),
  layoutTarget: WorkspaceLayoutTargetSchema.default('shared'),
});

export type WorkspaceLayoutRecord = z.infer<typeof WorkspaceLayoutRecordSchema>;
export type WorkspaceLayoutUpsert = z.infer<typeof WorkspaceLayoutUpsertSchema>;
export type WorkspaceLayoutDelete = z.infer<typeof WorkspaceLayoutDeleteSchema>;
export type WorkspaceLayoutTarget = z.infer<typeof WorkspaceLayoutTargetSchema>;
