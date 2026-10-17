import { WorkspaceLayoutPatchSchema } from '@repo/core/logic/workspace/layoutPatch';
import { z } from 'zod';

const syncAuthority = (action: 'update') =>
  ({
    policy: { action, subject: 'User' },
  }) as const;

export const syncORPCContract = {
  getMutationReceipt: {
    method: 'get',
    path: '/powersync/mutation/:mutationId',
    request: {
      params: z.object({ mutationId: z.string().min(1) }),
    },
    responses: {
      200: {
        schema: z.object({
          mutationId: z.string(),
          status: z.enum(['pending', 'completed', 'failed']),
          error: z.string().nullable().optional(),
        }),
        description: 'Receipt state for an Inngest-backed queued mutation',
      },
    },
    metadata: syncAuthority('update'),
  },
  uploadBatch: {
    method: 'post',
    path: '/powersync/upload',
    request: {
      body: z.object({
        idempotencyKey: z.string().min(1),
        crud: z.array(
          z.object({
            id: z.string(),
            op: z.enum(['PUT', 'PATCH', 'DELETE']),
            table: z.string(),
            opData: z.record(z.string(), z.any()).optional(),
          }),
        ),
      }),
    },
    responses: {
      200: {
        schema: z.object({
          success: z.boolean(),
          processedCount: z.number(),
          idempotent: z.boolean().optional(),
        }),
        description: 'PowerSync batch uploaded and processed successfully',
      },
    },
    metadata: syncAuthority('update'),
  },
  patchWorkspaceLayout: {
    method: 'post',
    path: '/sync/patchWorkspaceLayout',
    request: {
      body: WorkspaceLayoutPatchSchema,
    },
    responses: {
      200: {
        schema: z.discriminatedUnion('status', [
          z.object({
            status: z.literal('completed'),
            operationId: z.string().uuid(),
            serverRevision: z.number().int(),
          }),
          z.object({
            status: z.literal('conflict'),
            conflictReason: z.string(),
            conflictingGroups: z.array(z.string()).optional(),
            conflictFetchReference: z
              .object({
                workspaceId: z.string(),
                layoutTarget: z.string(),
              })
              .optional(),
          }),
        ]),
        description: 'Authoritative workspace layout patch receipt',
      },
    },
    metadata: syncAuthority('update'),
  },
};

