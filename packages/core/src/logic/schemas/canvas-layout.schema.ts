import { z } from 'zod';
import { WorkspaceLayoutZoneSchema } from './workspace-layout.schema';

export const CanvasSurfaceKindSchema = z.enum(['widget', 'section', 'mode', 'shortcut', 'tool', 'group']);

export const CanvasSurfaceMetadataSchema = z.object({
  kind: CanvasSurfaceKindSchema.default('widget'),
  domain: z.string().optional(),
  capabilityKey: z.string().optional(),
  defaultZone: WorkspaceLayoutZoneSchema,
  defaultOrder: z.number().default(0),
  platformSupport: z
    .object({
      mobile: z.boolean().default(true),
      tablet: z.boolean().default(true),
      web: z.boolean().default(true),
    })
    .default({ mobile: true, tablet: true, web: true }),
  groupId: z.string().optional(),
});

export const CanvasPersistedLayoutSchema = z.object({
  isDefault: z.boolean().default(true),
  order: z.array(z.string()).default([]),
  hidden: z.array(z.string()).default([]),
  pinned: z.array(z.string()).default([]),
  zoneBySurface: z.record(z.string(), WorkspaceLayoutZoneSchema).default({}),
  surfaceMetadata: z.record(z.string(), CanvasSurfaceMetadataSchema).default({}),
  layoutVersion: z.number().default(2),
  updatedAt: z.string(),
});

export type CanvasSurfaceMetadata = z.infer<typeof CanvasSurfaceMetadataSchema>;
export type CanvasPersistedLayout = z.infer<typeof CanvasPersistedLayoutSchema>;
