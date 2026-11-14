import { WorkspaceLayoutTargetSchema } from '@repo/core/logic/schemas/workspace-layout.schema';
import {
  WorkspaceLayoutPatchGroupSchema,
  WorkspaceLayoutPatchSchema,
  WorkspaceLayoutPatchValuesSchema,
} from '@repo/core/logic/workspace/layoutPatch';
import { z } from 'zod';

const WorkspaceLayoutIntentVersionSchema = z.literal(2);

/**
 * One locally durable record for workspace values and their synchronization
 * intent. Values and intent share a record so a restart cannot observe one
 * without the other.
 */
export const WorkspaceLayoutIntentSchema = z
  .object({
    version: WorkspaceLayoutIntentVersionSchema,
    userId: z.uuid(),
    workspaceId: z.string().min(1),
    layoutTarget: WorkspaceLayoutTargetSchema,
    values: WorkspaceLayoutPatchValuesSchema,
    dirtyGroups: z.array(WorkspaceLayoutPatchGroupSchema),
    pendingPatch: WorkspaceLayoutPatchSchema.optional(),
  })
  .strict()
  .superRefine((intent, context) => {
    if (new Set(intent.dirtyGroups).size !== intent.dirtyGroups.length) {
      context.addIssue({
        code: 'custom',
        path: ['dirtyGroups'],
        message: 'Workspace layout intent groups must be unique.',
      });
    }

    if (!intent.pendingPatch) return;

    const patch = intent.pendingPatch;
    if (
      patch.userId !== intent.userId ||
      patch.workspaceId !== intent.workspaceId ||
      patch.layoutTarget !== intent.layoutTarget
    ) {
      context.addIssue({
        code: 'custom',
        path: ['pendingPatch'],
        message: 'Pending workspace patch identity must match its intent.',
      });
    }

    for (const group of Object.keys(patch.changes)) {
      if (!intent.dirtyGroups.includes(group as (typeof intent.dirtyGroups)[number])) {
        context.addIssue({
          code: 'custom',
          path: ['pendingPatch', 'changes', group],
          message: 'Pending workspace patch groups must remain dirty in its intent.',
        });
      }
    }
  });

export type WorkspaceLayoutIntent = z.infer<typeof WorkspaceLayoutIntentSchema>;

export function buildWorkspaceLayoutIntentStorageKey({
  userId,
  workspaceId,
  layoutTarget,
}: Pick<WorkspaceLayoutIntent, 'userId' | 'workspaceId' | 'layoutTarget'>): string {
  return `workspace-layout-intent:${workspaceId}:${layoutTarget}:${userId}`;
}
