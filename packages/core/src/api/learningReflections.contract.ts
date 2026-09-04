import type { SovereignContract } from '@repo/core/api/contracts';
import { LearningReflectionSchema } from '@repo/core/logic/schemas/classroom.schema';
import { z } from 'zod';

const learningReflectionAuthority = (action: 'create' | 'read' | 'update' | 'delete') =>
  ({
    policy: { action, subject: 'LearningReflection' },
  }) as const;

export const learningReflectionsContract = {
  saveLearningReflection: {
    method: 'post',
    path: '/classroom/learning-reflections',
    request: {
      body: z.object({
        classroom_id: z.uuid(),
        assignment_id: z.uuid().optional(),
        thought: z.string().min(1),
        situation: z.string().nullable().optional(),
        emotion: z
          .object({ label: z.string(), intensity: z.number().int().min(1).max(10) })
          .nullable()
          .optional(),
        trap_ids: z
          .array(z.object({ id: z.string(), label: z.string().optional() }))
          .nullable()
          .optional(),
        evidence_for: z.string().optional(),
        evidence_against: z.string().optional(),
        reframe: z.string().optional(),
        mood_before: z.number().int().min(1).max(5).optional(),
        mood_after: z.number().int().min(1).max(5).optional(),
        post_outcome: z.string().optional(),
        follow_up: z
          .object({
            due_at: z.string(),
            completed_at: z.string().optional(),
            outcome: z.string().optional(),
            reflection: z.string().optional(),
          })
          .nullable()
          .optional(),
      }),
    },
    responses: {
      201: {
        schema: LearningReflectionSchema,
        description: 'Learning reflection created successfully',
      },
    },
    metadata: learningReflectionAuthority('create'),
  },

  getLearningReflections: {
    method: 'get',
    path: '/classroom/learning-reflections',
    request: {
      query: z.object({
        classroom_id: z.uuid().optional(),
        assignment_id: z.uuid().optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
        view_date: z.string().datetime().optional(),
      }),
    },
    responses: {
      200: {
        schema: z.array(LearningReflectionSchema),
        description: 'Retrieve learning reflection history',
      },
    },
    metadata: learningReflectionAuthority('read'),
  },

  completeLearningReflectionFollowUp: {
    method: 'patch',
    path: '/classroom/learning-reflections/:id/follow-up',
    request: {
      params: z.object({ id: z.uuid() }),
      body: z.object({
        post_outcome: z.string().optional(),
        follow_up: z
          .object({
            due_at: z.string(),
            completed_at: z.string().optional(),
            outcome: z.string().optional(),
            reflection: z.string().optional(),
          })
          .nullable()
          .optional(),
      }),
    },
    responses: {
      200: {
        schema: LearningReflectionSchema,
        description: 'Learning reflection follow-up updated',
      },
    },
    metadata: learningReflectionAuthority('update'),
  },
} satisfies SovereignContract;
