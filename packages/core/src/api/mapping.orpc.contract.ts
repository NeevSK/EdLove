import { z } from 'zod';
import { KnowledgeTopologySchema } from '@repo/core/logic/schemas/dashboard.schema';

const mappingTopology = KnowledgeTopologySchema.extend({
  id: z.string(),
  owner_id: z.string().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  is_public: z.boolean(),
  share_token: z.string().nullable(),
  share_token_expires_at: z.string().datetime().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

const topologyInput = KnowledgeTopologySchema.extend({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  isPublic: z.boolean().optional(),
}).partial();

const mappingAuthority = (action: 'create' | 'read' | 'update') =>
  ({
    policy: { action, subject: 'MappingTopology' },
  }) as const;

export const mappingORPCContract = {
  getById: {
    method: 'get',
    path: '/mapping/topologies/:id',
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
      200: { schema: mappingTopology.nullable(), description: 'Get a topology by id' },
    },
    metadata: mappingAuthority('read'),
  },
  getSchoolPulse: {
    method: 'get',
    path: '/mapping/schools/:schoolId/pulse',
    request: {
      params: z.object({ schoolId: z.string().uuid() }),
      query: z.object({ viewDate: z.string().date().optional() }),
    },
    responses: {
      200: {
        schema: KnowledgeTopologySchema,
        description: 'Get an authorized school topology pulse',
      },
    },
    metadata: mappingAuthority('read'),
  },
  upsert: {
    method: 'put',
    path: '/mapping/topologies/:id',
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: topologyInput,
    },
    responses: {
      200: { schema: mappingTopology, description: 'Create or update an owned topology' },
    },
    metadata: mappingAuthority('update'),
  },
  createShareLink: {
    method: 'post',
    path: '/mapping/topologies/:id/share',
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: z.object({ expiresDays: z.number().int().min(1).max(30).default(7) }),
    },
    responses: {
      200: {
        schema: z.object({ token: z.string(), expiresAt: z.string().datetime() }),
        description: 'Create a time-limited topology share token',
      },
    },
    metadata: mappingAuthority('update'),
  },
};

export type MappingTopology = z.infer<typeof mappingTopology>;