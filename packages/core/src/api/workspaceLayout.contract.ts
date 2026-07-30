import { z } from 'zod';
import {
  WorkspaceLayoutDeleteSchema,
  WorkspaceLayoutRecordSchema,
  WorkspaceLayoutUpsertSchema,
} from '@repo/core/logic/schemas/workspace-layout.schema';
import type { SovereignContract } from '@repo/core/api/contract';

const workspaceLayoutAuthority = (action: 'read' | 'update' | 'delete', subject: string) =>
  ({
    policy: { action, subject },
  }) as const;

export const workspaceLayoutContract = {
  getWorkspaceLayout: {
    method: 'get',
    path: '/workspace-layouts/:userId/:workspaceId/:layoutTarget',
    request: {
      params: z.object({
        userId: z.string(),
        workspaceId: z.string(),
        layoutTarget: z.string(),
      }),
    },
    responses: {
      200: {
        schema: WorkspaceLayoutRecordSchema.nullable(),
        description: 'Get workspace layout',
      },
    },
    metadata: workspaceLayoutAuthority('read', 'WorkspaceLayout'),
  },
  upsertWorkspaceLayout: {
    method: 'put',
    path: '/workspace-layouts/:userId/:workspaceId/:layoutTarget',
    request: {
      params: z.object({
        userId: z.string(),
        workspaceId: z.string(),
        layoutTarget: z.string(),
      }),
      body: WorkspaceLayoutUpsertSchema,
    },
    responses: {
      200: {
        schema: WorkspaceLayoutRecordSchema,
        description: 'Workspace layout upserted successfully',
      },
    },
    metadata: workspaceLayoutAuthority('update', 'WorkspaceLayout'),
  },
  deleteWorkspaceLayout: {
    method: 'delete',
    path: '/workspace-layouts/:userId/:workspaceId/:layoutTarget',
    request: {
      params: z.object({
        userId: z.string(),
        workspaceId: z.string(),
        layoutTarget: z.string(),
      }),
      body: WorkspaceLayoutDeleteSchema,
    },
    responses: {
      200: {
        schema: z.object({ success: z.literal(true) }),
        description: 'Workspace layout deleted successfully',
      },
    },
    metadata: workspaceLayoutAuthority('delete', 'WorkspaceLayout'),
  },
} as const satisfies SovereignContract;
