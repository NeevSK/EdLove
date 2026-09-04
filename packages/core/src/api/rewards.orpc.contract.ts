import { z } from 'zod';

export const userRewardsSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  points: z.number().int().default(0),
  badges: z.array(z.string()).default([]),
  created_at: z.string(),
  updated_at: z.string(),
});

export const userRewardsHistorySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  operation: z.string(),
  recorded_at: z.string(),
  recorded_by: z.string().uuid().nullable(),
  snapshot: z.any(),
});

export const whisperedMomentSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  stage: z.string(),
  created_at: z.string(),
});

export const rewardsAuthority = (action: 'read' | 'create' | 'update') =>
  ({
    policy: { action, subject: 'UserRewards' },
  }) as const;

export const rewardsORPCContract = {
  getRewards: {
    method: 'get',
    path: '/rewards',
    request: {
      query: z.object({ userId: z.string().uuid().optional() }),
    },
    responses: {
      200: { schema: userRewardsSchema.nullable(), description: 'Current user rewards' },
    },
    metadata: rewardsAuthority('read'),
  },
  getRewardsHistory: {
    method: 'get',
    path: '/rewards/history',
    request: {
      query: z.object({
        userId: z.string().uuid().optional(),
        limit: z.coerce.number().int().positive().max(100).optional(),
      }),
    },
    responses: {
      200: { schema: z.array(userRewardsHistorySchema), description: 'Rewards history' },
    },
    metadata: rewardsAuthority('read'),
  },
  getRewardsAsOf: {
    method: 'get',
    path: '/rewards/as-of',
    request: {
      query: z.object({
        userId: z.string().uuid().optional(),
        asOf: z.string().datetime(),
      }),
    },
    responses: {
      200: { schema: userRewardsSchema.nullable(), description: 'Rewards snapshot as of date' },
    },
    metadata: rewardsAuthority('read'),
  },
  getRewardsRangeHistory: {
    method: 'get',
    path: '/rewards/range-history',
    request: {
      query: z.object({
        userId: z.string().uuid().optional(),
        viewDate: z.string().date(),
        viewScale: z.enum(['day', 'week', 'month', 'year', 'custom']).optional(),
      }),
    },
    responses: {
      200: { schema: z.array(userRewardsHistorySchema), description: 'Rewards range history' },
    },
    metadata: rewardsAuthority('read'),
  },
  initializeRewards: {
    method: 'post',
    path: '/rewards/initialize',
    request: {
      body: z.object({ userId: z.string().uuid() }),
    },
    responses: {
      201: { schema: userRewardsSchema, description: 'Initialized rewards record' },
    },
    metadata: rewardsAuthority('create'),
  },
  addPoints: {
    method: 'post',
    path: '/rewards/add-points',
    request: {
      body: z.object({
        userId: z.string().uuid(),
        points: z.number().int(),
      }),
    },
    responses: {
      200: { schema: userRewardsSchema, description: 'Updated rewards with added points' },
    },
    metadata: rewardsAuthority('update'),
  },
  awardBadge: {
    method: 'post',
    path: '/rewards/award-badge',
    request: {
      body: z.object({
        userId: z.string().uuid(),
        badge: z.string().trim().min(1),
      }),
    },
    responses: {
      200: { schema: userRewardsSchema, description: 'Updated rewards with awarded badge' },
    },
    metadata: rewardsAuthority('update'),
  },
  checkAndAwardAchievements: {
    method: 'post',
    path: '/rewards/check-achievements',
    request: {
      body: z.object({ userId: z.string().uuid() }),
    },
    responses: {
      200: {
        schema: z.object({
          updatedRewards: userRewardsSchema,
          newAchievements: z.array(z.string()),
        }),
        description: 'Achievement check results',
      },
    },
    metadata: rewardsAuthority('update'),
  },
  getWhisperedMoments: {
    method: 'get',
    path: '/rewards/whispered-moments',
    request: {
      query: z.object({ userId: z.string().uuid().optional() }),
    },
    responses: {
      200: { schema: z.array(whisperedMomentSchema), description: 'User whispered moments' },
    },
    metadata: { policy: { action: 'read', subject: 'WhisperedMoment' } },
  },
};

export type UserRewards = z.infer<typeof userRewardsSchema>;
export type UserRewardsHistory = z.infer<typeof userRewardsHistorySchema>;
export type WhisperedMoment = z.infer<typeof whisperedMomentSchema>;
