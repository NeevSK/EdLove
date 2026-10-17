import { getConsistentIdempotencyKey } from '@repo/core/lib/sync/idempotency';
import {
  WorkspaceAppearanceSchema,
  WorkspaceLayoutTargetSchema,
  WorkspaceWallpaperSchema,
} from '@repo/core/logic/schemas/workspace-layout.schema';
import type { WorkspaceAppearance, WorkspaceLayout } from '@repo/core/types';
import { z } from 'zod';

export const WorkspaceLayoutPatchGroupSchema = z.enum(['arrangement', 'appearance', 'groups']);

/**
 * Retains the legacy row contract while patch migration is in progress. The
 * server must reject invalid values before applying a patch; projection must
 * never silently discard them.
 */
export const WorkspaceLayoutPatchZoneValueSchema = z.union([z.string(), z.number().finite()]);

export const WorkspaceLayoutArrangementSchema = z.object({
  order: z.array(z.string()),
  hidden: z.array(z.string()),
  pinned: z.array(z.string()),
  zoneBySurface: z.record(z.string(), WorkspaceLayoutPatchZoneValueSchema),
});

export const WorkspaceLayoutPatchAppearanceSchema = z.object({
  preset: WorkspaceAppearanceSchema.shape.preset,
  motion: WorkspaceAppearanceSchema.shape.motion,
  wallpaper: WorkspaceWallpaperSchema.nullable(),
});

export const WorkspaceLayoutPatchValuesSchema = z.object({
  arrangement: WorkspaceLayoutArrangementSchema,
  appearance: WorkspaceLayoutPatchAppearanceSchema,
  groups: z.array(z.string()),
});

const WorkspaceLayoutPatchChangeSchema = z.object({
  baseHash: z.string().regex(/^[a-f0-9]{64}$/),
  value: z.unknown(),
});

export const WorkspaceLayoutPatchSchema = z
  .object({
    userId: z.uuid(),
    workspaceId: z.string().min(1),
    layoutTarget: WorkspaceLayoutTargetSchema,
    operationId: z.uuid(),
    idempotencyKey: z.string().trim().min(1).max(256),
    inputHash: z.string().regex(/^[a-f0-9]{64}$/),
    baseRevision: z.number().int().nonnegative(),
    changes: z
      .object({
        arrangement: WorkspaceLayoutPatchChangeSchema.extend({
          value: WorkspaceLayoutArrangementSchema,
        }).optional(),
        appearance: WorkspaceLayoutPatchChangeSchema.extend({
          value: WorkspaceLayoutPatchAppearanceSchema,
        }).optional(),
        groups: WorkspaceLayoutPatchChangeSchema.extend({
          value: z.array(z.string()),
        }).optional(),
      })
      .strict(),
  })
  .strict()
  .refine((patch) => Object.keys(patch.changes).length > 0, {
    message: 'A workspace layout patch must change at least one named group.',
    path: ['changes'],
  });

export type WorkspaceLayoutPatchGroup = z.infer<typeof WorkspaceLayoutPatchGroupSchema>;
export type WorkspaceLayoutPatchValues = z.infer<typeof WorkspaceLayoutPatchValuesSchema>;
export type WorkspaceLayoutPatch = z.infer<typeof WorkspaceLayoutPatchSchema>;

export type WorkspaceLayoutPatchSource<TSurfaceId extends string = string> = Omit<
  WorkspaceLayout<TSurfaceId>,
  'appearance' | 'zoneBySurface'
> & {
  zoneBySurface: Partial<Record<TSurfaceId, string | number>>;
  appearance?: WorkspaceAppearance | WorkspaceLayoutPatchValues['appearance'];
};

export interface WorkspaceLayoutPatchAssessment {
  safe: boolean;
  conflictingGroups: WorkspaceLayoutPatchGroup[];
  currentHashes: Partial<Record<WorkspaceLayoutPatchGroup, string>>;
}

export function projectWorkspaceLayoutPatchValues<TSurfaceId extends string>(
  layout: WorkspaceLayoutPatchSource<TSurfaceId>,
): WorkspaceLayoutPatchValues {
  return WorkspaceLayoutPatchValuesSchema.parse({
    arrangement: {
      order: [...layout.order],
      hidden: [...layout.hidden],
      pinned: [...layout.pinned],
      zoneBySurface: Object.fromEntries(
        Object.entries(layout.zoneBySurface).map(([surfaceId, zone]) => {
          const parsed = WorkspaceLayoutPatchZoneValueSchema.safeParse(zone);
          if (!parsed.success) {
            throw new TypeError(`Workspace layout zone is not patch-compatible: ${surfaceId}`);
          }
          return [surfaceId, parsed.data];
        }),
      ),
    },
    appearance: {
      ...WorkspaceAppearanceSchema.parse(
        layout.appearance?.wallpaper === null
          ? { ...layout.appearance, wallpaper: undefined }
          : (layout.appearance ?? {}),
      ),
      wallpaper: layout.appearance?.wallpaper ?? null,
    },
    groups: [...(layout.groupOrder ?? [])],
  });
}

export function projectWorkspaceLayoutPatchGroup<TSurfaceId extends string>(
  layout: WorkspaceLayoutPatchSource<TSurfaceId>,
  group: WorkspaceLayoutPatchGroup,
): WorkspaceLayoutPatchValues[WorkspaceLayoutPatchGroup] {
  return projectWorkspaceLayoutPatchValues(layout)[group];
}

export async function hashWorkspaceLayoutPatchGroup(
  value: WorkspaceLayoutPatchValues[WorkspaceLayoutPatchGroup],
): Promise<string> {
  return getConsistentIdempotencyKey(value, 'workspace-layout-group');
}

export async function findChangedWorkspaceLayoutPatchGroups<TSurfaceId extends string>(
  baseline: WorkspaceLayoutPatchSource<TSurfaceId>,
  candidate: WorkspaceLayoutPatchSource<TSurfaceId>,
): Promise<WorkspaceLayoutPatchGroup[]> {
  const baselineValues = projectWorkspaceLayoutPatchValues(baseline);
  const candidateValues = projectWorkspaceLayoutPatchValues(candidate);
  const changed: WorkspaceLayoutPatchGroup[] = [];
  for (const group of ['arrangement', 'appearance', 'groups'] as const) {
    const baselineHash = await hashWorkspaceLayoutPatchGroup(baselineValues[group]);
    const candidateHash = await hashWorkspaceLayoutPatchGroup(candidateValues[group]);
    if (baselineHash !== candidateHash) changed.push(group);
  }
  return changed;
}

/**
 * Recomputes group hashes from the authoritative row. The server must call
 * this while holding its row lock; clients may use it only for preview UX.
 */
export async function assessWorkspaceLayoutPatch<TSurfaceId extends string>(
  layout: WorkspaceLayoutPatchSource<TSurfaceId>,
  patch: WorkspaceLayoutPatch,
): Promise<WorkspaceLayoutPatchAssessment> {
  const parsedPatch = WorkspaceLayoutPatchSchema.parse(patch);
  const currentValues = projectWorkspaceLayoutPatchValues(layout);
  const changedGroups = Object.keys(parsedPatch.changes) as WorkspaceLayoutPatchGroup[];
  const currentHashes: Partial<Record<WorkspaceLayoutPatchGroup, string>> = {};
  const conflictingGroups: WorkspaceLayoutPatchGroup[] = [];

  for (const group of changedGroups) {
    const currentHash = await hashWorkspaceLayoutPatchGroup(currentValues[group]);
    currentHashes[group] = currentHash;
    if (currentHash !== parsedPatch.changes[group]?.baseHash) {
      conflictingGroups.push(group);
    }
  }

  return {
    safe: conflictingGroups.length === 0,
    conflictingGroups,
    currentHashes,
  };
}

export function applyWorkspaceLayoutPatchValues<TSurfaceId extends string>(
  layout: WorkspaceLayoutPatchSource<TSurfaceId>,
  patch: WorkspaceLayoutPatch,
): WorkspaceLayoutPatchSource {
  const parsedPatch = WorkspaceLayoutPatchSchema.parse(patch);
  const appearanceChange = parsedPatch.changes.appearance?.value;
  const nextAppearance = appearanceChange
    ? appearanceChange.wallpaper === null
      ? { preset: appearanceChange.preset, motion: appearanceChange.motion, wallpaper: null }
      : {
          preset: appearanceChange.preset,
          motion: appearanceChange.motion,
          wallpaper: appearanceChange.wallpaper,
        }
    : undefined;
  return {
    ...layout,
    ...(parsedPatch.changes.arrangement
      ? {
          order: [...parsedPatch.changes.arrangement.value.order],
          hidden: [...parsedPatch.changes.arrangement.value.hidden],
          pinned: [...parsedPatch.changes.arrangement.value.pinned],
          zoneBySurface: { ...parsedPatch.changes.arrangement.value.zoneBySurface },
        }
      : {}),
    ...(nextAppearance
      ? {
          appearance: nextAppearance,
          surfaceMetadata: {
            ...(layout.surfaceMetadata ?? {}),
            __workspaceAppearance: nextAppearance,
          },
        }
      : {}),
    ...(parsedPatch.changes.groups ? { groupOrder: [...parsedPatch.changes.groups.value] } : {}),
  };
}

export function createWorkspaceLayoutPatchChange<TGroup extends WorkspaceLayoutPatchGroup>(
  value: WorkspaceLayoutPatchValues[TGroup],
  baseHash: string,
): { baseHash: string; value: WorkspaceLayoutPatchValues[TGroup] } {
  return {
    baseHash,
    value,
  };
}

export async function buildWorkspaceLayoutPatchChanges<TSurfaceId extends string = string>(
  baseLayout: WorkspaceLayoutPatchSource<TSurfaceId>,
  currentLayout: WorkspaceLayoutPatchSource<TSurfaceId>,
  groups: ReadonlySet<WorkspaceLayoutPatchGroup>,
): Promise<WorkspaceLayoutPatch['changes']> {
  const baseValues = projectWorkspaceLayoutPatchValues(baseLayout);
  const currentValues = projectWorkspaceLayoutPatchValues(currentLayout);
  const changes: WorkspaceLayoutPatch['changes'] = {};

  for (const group of groups) {
    if (group === 'arrangement') {
      changes.arrangement = createWorkspaceLayoutPatchChange<'arrangement'>(
        currentValues.arrangement,
        await hashWorkspaceLayoutPatchGroup(baseValues.arrangement),
      );
    } else if (group === 'appearance') {
      changes.appearance = createWorkspaceLayoutPatchChange<'appearance'>(
        currentValues.appearance,
        await hashWorkspaceLayoutPatchGroup(baseValues.appearance),
      );
    } else {
      changes.groups = createWorkspaceLayoutPatchChange<'groups'>(
        currentValues.groups,
        await hashWorkspaceLayoutPatchGroup(baseValues.groups),
      );
    }
  }

  return changes;
}
