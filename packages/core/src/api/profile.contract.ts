import { z } from 'zod';
import type { SovereignContract } from '@repo/core/api/contract';

const profileAuthority = (
  action: 'create' | 'read' | 'update' | 'delete',
  subject: 'User' | 'Group' | 'School',
) =>
  ({
    policy: { action, subject },
  }) as const;

// --- Sovereign Schemas (Zod v4 functional API) ---

const _SocialLinkSchema = z.strictObject({
  id: z.uuid(),
  user_id: z.uuid(),
  platform: z.string(),
  url: z.string(), // z.url() is deprecated in v4, use refinements if needed
  is_public: z.boolean(),
  privacy_level: z.string(),
  order_index: z.number(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

const UserProfileSchema = z.record(z.string(), z.any());

const RewardsSnapshotSchema = z.strictObject({
  id: z.uuid().optional(),
  user_id: z.uuid().optional(),
  points: z.number(),
  badges: z.array(z.string()),
  created_at: z.iso.datetime().nullable().optional(),
  updated_at: z.iso.datetime().nullable().optional(),
});

const UserGrowthStateSchema = z.record(z.string(), z.any());

const WhisperedMomentSchema = z.strictObject({
  key: z.string(),
  name_en: z.string(),
  name_si: z.string(),
  awarded_at: z.iso.datetime(),
});

const JourneySnapshotSchema = z.strictObject({
  as_of: z.string().nullable(),
  rewards: RewardsSnapshotSchema.nullable(),
  growth: UserGrowthStateSchema.nullable(),
  whispered_moments: z.array(WhisperedMomentSchema),
});

const _JourneyEventSchema = z.strictObject({
  id: z.uuid(),
  timestamp: z.iso.datetime(),
  source: z.enum(['reward', 'growth', 'moment']),
  operation: z.enum(['insert', 'update', 'delete']).optional(),
  title: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
  snapshot: z.record(z.string(), z.any()).optional(),
});

const _ProfileHistoryEntrySchema = z.strictObject({
  id: z.uuid(),
  operation: z.enum(['insert', 'update', 'delete']),
  recorded_at: z.iso.datetime(),
  recorded_by: z.uuid().nullable().optional(),
  snapshot: z.record(z.string(), z.any()),
});

const _CommunityProfileSchema = z.strictObject({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  visibility: z.string().nullable().optional(),
  member_count: z.number().nullable().optional(),
  creator_id: z.uuid().nullable().optional(),
});

const PulseMetricsSchema = z.strictObject({
  resonance_score: z.number(),
  aggregated_mood: z.enum(['joy', 'peace', 'focus', 'struggle', 'unknown']),
  trend: z.enum(['rising', 'stable', 'failing']),
  participation_rate: z.number(),
  top_subjects: z.array(z.string()),
  interaction_volume: z.number(),
});

/**
 * Profile Domain Port
 */
export const profileContract = {
  getUserProfile: {
    method: 'get',
    path: '/profile/users/:id',
    request: {
      params: z.strictObject({ id: z.uuid() }),
    },
    responses: {
      200: { schema: UserProfileSchema.nullable(), description: 'User profile retrieved' },
    },
    metadata: profileAuthority('read', 'User'),
  },

  updateProfile: {
    method: 'patch',
    path: '/profile/users/:id',
    request: {
      params: z.strictObject({ id: z.uuid() }),
      body: z.record(z.string(), z.any()),
    },
    responses: {
      200: { schema: UserProfileSchema, description: 'User profile updated' },
    },
    metadata: profileAuthority('update', 'User'),
  },

  getJourneySnapshot: {
    method: 'get',
    path: '/profile/users/:id/journey',
    request: {
      params: z.strictObject({ id: z.uuid() }),
      query: z.strictObject({
        at: z.string().optional(),
        view_date: z.string().optional(),
        view_scale: z.enum(['day', 'week', 'month', 'year', 'custom']).optional(),
      }),
    },
    responses: {
      200: { schema: JourneySnapshotSchema, description: 'Journey snapshot retrieved' },
    },
    metadata: profileAuthority('read', 'User'),
  },

  getSchoolPulse: {
    method: 'get',
    path: '/profile/schools/:id/pulse',
    request: {
      params: z.strictObject({ id: z.uuid() }),
      query: z.strictObject({
        view_date: z.string(),
        view_scale: z.enum(['day', 'week', 'month', 'year', 'custom']).optional(),
      }),
    },
    responses: {
      200: { schema: PulseMetricsSchema, description: 'School pulse metrics retrieved' },
    },
    metadata: profileAuthority('read', 'School'),
  },
} as const satisfies SovereignContract;
