import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { POAMetadataSchema } from './contract';
import {
  WorkspaceLayoutDeleteSchema,
  WorkspaceLayoutRecordSchema,
  WorkspaceLayoutUpsertSchema,
} from './schemas/workspace-layout.schema';

const c = initContract();

const workspaceLayoutAuthority = (action: 'read' | 'update' | 'delete', subject: string) => POAMetadataSchema.parse({ authority: { action, subject } });

export const workspaceLayoutContract = c.router({
  getWorkspaceLayout: {
    method: 'GET',
    path: '/workspace-layouts/:userId/:workspaceId/:layoutTarget',
    responses: {
      200: WorkspaceLayoutRecordSchema.nullable(),
    },
    metadata: workspaceLayoutAuthority('read', 'WorkspaceLayout'),
  },
  upsertWorkspaceLayout: {
    method: 'PUT',
    path: '/workspace-layouts/:userId/:workspaceId/:layoutTarget',
    body: WorkspaceLayoutUpsertSchema,
    responses: {
      200: WorkspaceLayoutRecordSchema,
    },
    metadata: workspaceLayoutAuthority('update', 'WorkspaceLayout'),
  },
  deleteWorkspaceLayout: {
    method: 'DELETE',
    path: '/workspace-layouts/:userId/:workspaceId/:layoutTarget',
    body: WorkspaceLayoutDeleteSchema,
    responses: {
      200: z.object({ success: z.literal(true) }),
    },
    metadata: workspaceLayoutAuthority('delete', 'WorkspaceLayout'),
  },
});
