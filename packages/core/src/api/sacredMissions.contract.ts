import type { SovereignContract } from '@repo/core/api/contracts';
import { z } from 'zod';

export const manifesto = z.object({
  id: z.uuid(),
  school_id: z.uuid(),
  creator_id: z.uuid().nullable(),
  title: z.string(),
  content: z.string(),
  vibe: z.enum(['visionary', 'supportive', 'academic', 'wellbeing']),
  status: z.enum(['active', 'archived', 'fulfilled']),
  target_date: z.string().datetime().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  endorsement_count: z.number().int().nonnegative(),
  has_endorsed: z.boolean(),
});

const authority = (
  action: 'read' | 'create' | 'delete',
  subject: 'Manifesto' | 'ManifestoEndorsement',
) => ({ policy: { action, subject } }) as const;

export const sacredMissionsContract = {
  list: {
    method: 'get',
    path: '/sacredMissions/manifestos',
    request: {
      query: z.object({
        school_id: z.uuid().optional(),
        status: z.enum(['active', 'archived', 'fulfilled']).optional(),
        limit: z.coerce.number().int().min(1).max(100).default(50),
      }),
    },
    responses: { 200: { schema: z.array(manifesto), description: 'School manifestos' } },
    metadata: authority('read', 'Manifesto'),
  },
  create: {
    method: 'post',
    path: '/sacredMissions/manifestos',
    request: {
      body: z.object({
        school_id: z.uuid().optional(),
        title: z.string().trim().min(1).max(200),
        content: z.string().trim().min(1).max(10000),
        vibe: z.enum(['visionary', 'supportive', 'academic', 'wellbeing']).default('visionary'),
        target_date: z.string().datetime().nullable().optional(),
      }),
    },
    responses: { 201: { schema: manifesto, description: 'Create a school manifesto' } },
    metadata: authority('create', 'Manifesto'),
  },
  endorse: {
    method: 'post',
    path: '/sacredMissions/manifestos/:manifestoId/endorse',
    request: {
      params: z.object({ manifestoId: z.uuid() }),
      body: z.object({ commitment_text: z.string().trim().max(2000).optional() }),
    },
    responses: {
      200: { schema: z.object({ success: z.boolean() }), description: 'Endorse a manifesto' },
    },
    metadata: authority('create', 'ManifestoEndorsement'),
  },
  unendorse: {
    method: 'delete',
    path: '/sacredMissions/manifestos/:manifestoId/endorse',
    request: { params: z.object({ manifestoId: z.uuid() }) },
    responses: {
      200: {
        schema: z.object({ success: z.boolean() }),
        description: 'Remove a manifesto endorsement',
      },
    },
    metadata: authority('delete', 'ManifestoEndorsement'),
  },
} as const satisfies SovereignContract;

export type Manifesto = z.infer<typeof manifesto>;
