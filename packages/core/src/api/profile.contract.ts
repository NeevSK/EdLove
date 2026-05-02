import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { POAMetadataSchema } from './contract';

const c = initContract();

const authority = (
  action: 'create' | 'read' | 'update' | 'delete',
  subject: 'User' | 'Group' | 'School',
) => POAMetadataSchema.parse({ authority: { action, subject } });

const SocialLinkSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  platform: z.string(),
  url: z.url(),
  is_public: z.boolean(),
  privacy_level: z.string(),
  order_index: z.number(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

const UserProfileSchema = z.record(z.string(), z.any());
const RewardsSnapshotSchema = z.object({
  id: z.uuid().optional(),
  user_id: z.uuid().optional(),
  points: z.number(),
  badges: z.array(z.string()),
  created_at: z.iso.datetime().nullable().optional(),
  updated_at: z.iso.datetime().nullable().optional(),
});
const UserGrowthStateSchema = z.record(z.string(), z.any());
const WhisperedMomentSchema = z.object({
  key: z.string(),
  name_en: z.string(),
  name_si: z.string(),
  awarded_at: z.iso.datetime(),
});
const JourneySnapshotSchema = z.object({
  as_of: z.string().nullable(),
  rewards: RewardsSnapshotSchema.nullable(),
  growth: UserGrowthStateSchema.nullable(),
  whispered_moments: z.array(WhisperedMomentSchema),
});
const JourneyEventSchema = z.object({
  id: z.uuid(),
  timestamp: z.iso.datetime(),
  source: z.enum(['reward', 'growth', 'moment']),
  operation: z.enum(['insert', 'update', 'delete']).optional(),
  title: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
  snapshot: z.record(z.string(), z.any()).optional(),
});
const ProfileHistoryEntrySchema = z.object({
  id: z.uuid(),
  operation: z.enum(['insert', 'update', 'delete']),
  recorded_at: z.iso.datetime(),
  recorded_by: z.uuid().nullable().optional(),
  snapshot: z.record(z.string(), z.any()),
});
const CommunityProfileSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  visibility: z.string().nullable().optional(),
  member_count: z.number().nullable().optional(),
  creator_id: z.uuid().nullable().optional(),
});

const PulseMetricsSchema = z.object({
  resonance_score: z.number(),
  aggregated_mood: z.enum(['joy', 'peace', 'focus', 'struggle', 'unknown']),
  trend: z.enum(['rising', 'stable', 'failing']),
  participation_rate: z.number(),
  top_subjects: z.array(z.string()),
  interaction_volume: z.number(),
});

export const profileContract = c.router({
  getUserProfile: {
    method: 'GET',
    path: '/profile/users/:id',
    responses: { 200: UserProfileSchema.nullable() },
    metadata: authority('read', 'User'),
  },
  getUserProfileAsOf: {
    method: 'GET',
    path: '/profile/users/:id/as-of',
    query: z.object({ at: z.string() }),
    responses: { 200: UserProfileSchema.nullable() },
    metadata: authority('read', 'User'),
  },
  getUserProfileHistory: {
    method: 'GET',
    path: '/profile/users/:id/history',
    query: z.object({ limit: z.coerce.number().optional() }),
    responses: { 200: z.array(ProfileHistoryEntrySchema) },
    metadata: authority('read', 'User'),
  },
  getJourneySnapshot: {
    method: 'GET',
    path: '/profile/users/:id/journey',
    query: z
      .object({
        at: z.string().optional(),
        view_date: z.string().optional(),
        view_scale: z.enum(['day', 'week', 'month', 'year', 'custom']).optional(),
      })
      .optional(),
    responses: { 200: JourneySnapshotSchema },
    metadata: authority('read', 'User'),
  },
  getJourneyHistory: {
    method: 'GET',
    path: '/profile/users/:id/journey/history',
    query: z.object({
      view_date: z.string(),
      view_scale: z.enum(['day', 'week', 'month', 'year', 'custom']).optional(),
      limit: z.coerce.number().optional(),
    }),
    responses: { 200: z.array(JourneyEventSchema) },
    metadata: authority('read', 'User'),
  },
  updateProfile: {
    method: 'PATCH',
    path: '/profile/users/:id',
    body: z.record(z.string(), z.any()),
    responses: { 200: UserProfileSchema },
    metadata: authority('update', 'User'),
  },
  isAnonymous: {
    method: 'GET',
    path: '/profile/users/:id/anonymous',
    responses: { 200: z.object({ is_anonymous: z.boolean() }) },
    metadata: authority('read', 'User'),
  },
  uploadAvatar: {
    method: 'POST',
    path: '/profile/users/:id/avatar',
    body: z.object({ local_uri: z.string() }),
    responses: { 200: UserProfileSchema },
    metadata: authority('update', 'User'),
  },
  getSocialLinks: {
    method: 'GET',
    path: '/profile/users/:id/social-links',
    responses: { 200: z.array(SocialLinkSchema) },
    metadata: authority('read', 'User'),
  },
  upsertSocialLink: {
    method: 'PUT',
    path: '/profile/users/:id/social-links',
    body: z.record(z.string(), z.any()),
    responses: { 200: SocialLinkSchema },
    metadata: authority('update', 'User'),
  },
  deleteSocialLink: {
    method: 'DELETE',
    path: '/profile/social-links/:id',
    responses: { 204: z.void() },
    metadata: authority('delete', 'User'),
  },
  updateSocialLinksOrder: {
    method: 'POST',
    path: '/profile/users/:id/social-links/order',
    body: z.object({
      links: z.array(z.object({ id: z.uuid(), order_index: z.number() })),
    }),
    responses: { 200: z.object({ ok: z.boolean() }) },
    metadata: authority('update', 'User'),
  },
  getCommunityProfile: {
    method: 'GET',
    path: '/profile/communities/:id',
    responses: { 200: CommunityProfileSchema.nullable() },
    metadata: authority('read', 'Group'),
  },
  getCommunityProfileAsOf: {
    method: 'GET',
    path: '/profile/communities/:id/as-of',
    query: z.object({ at: z.string() }),
    responses: { 200: CommunityProfileSchema.nullable() },
    metadata: authority('read', 'Group'),
  },
  getCommunityProfileHistory: {
    method: 'GET',
    path: '/profile/communities/:id/history',
    query: z.object({ limit: z.coerce.number().optional() }),
    responses: { 200: z.array(ProfileHistoryEntrySchema) },
    metadata: authority('read', 'Group'),
  },
  updateCommunityProfile: {
    method: 'PATCH',
    path: '/profile/communities/:id',
    body: z.object({
      field: z.enum(['name', 'description']),
      value: z.string(),
    }),
    responses: { 200: CommunityProfileSchema },
    metadata: authority('update', 'Group'),
  },
  getSchoolPulse: {
    method: 'GET',
    path: '/profile/schools/:id/pulse',
    query: z.object({
      view_date: z.string(),
      view_scale: z.enum(['day', 'week', 'month', 'year', 'custom']).optional(),
    }),
    responses: { 200: PulseMetricsSchema },
    metadata: authority('read', 'School'),
  },
});
