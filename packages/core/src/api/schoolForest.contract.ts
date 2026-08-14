import type { SovereignContract } from '@repo/core/api/contracts';
import { z } from 'zod';

const giftType = z.enum(['lantern', 'rain', 'sunlight', 'seed']);

export const gratitudeGift = z.object({
  id: z.uuid(),
  sender_user_id: z.uuid(),
  recipient_user_id: z.uuid(),
  school_id: z.uuid().nullable(),
  message: z.string().nullable(),
  gift_type: giftType,
  warm_message_en: z.string(),
  warm_message_si: z.string().nullable(),
  warm_message_ta: z.string().nullable(),
  delivered: z.boolean(),
  delivered_at: z.string().nullable(),
  created_at: z.string(),
});

const treeHealth = z.enum(['seedling', 'growing', 'flourishing', 'flowering', 'ancient']);
const teacherTree = z.object({
  user_id: z.uuid(),
  tree_health: treeHealth,
  has_thuthimal: z.boolean(),
  last_signal_at: z.string().nullable(),
  days_since_signal: z.number().int().nonnegative(),
  needs_rain: z.boolean(),
});
const forestWeather = z.enum(['radiant', 'lush', 'steady', 'resting', 'quiet']);
const schoolForestState = z.object({
  school_id: z.uuid(),
  trees: z.array(teacherTree),
  forest_weather: forestWeather,
  forest_narrative_en: z.string(),
  computed_at: z.string(),
});
const schoolPulse = z.object({
  school_id: z.uuid(),
  presence_fraction: z.number().min(0).max(1),
  leading_dimension: z.string(),
  pulse_narrative_en: z.string(),
  period_start: z.string(),
  computed_at: z.string(),
});

const authority = (action: 'create' | 'read' | 'update') =>
  ({ policy: { action, subject: 'GratitudeGift' } }) as const;
const schoolReadAuthority = { policy: { action: 'read', subject: 'School' } } as const;

export const schoolForestContract = {
  getForestOverview: {
    method: 'get',
    path: '/school-forest/overview/:schoolId',
    request: { params: z.object({ schoolId: z.uuid() }) },
    responses: { 200: { schema: schoolForestState, description: 'School forest overview' } },
    metadata: schoolReadAuthority,
  },
  getSchoolPulse: {
    method: 'get',
    path: '/school-forest/pulse/:schoolId',
    request: { params: z.object({ schoolId: z.uuid() }) },
    responses: { 200: { schema: schoolPulse, description: 'School forest pulse' } },
    metadata: schoolReadAuthority,
  },
  sendGratitudeGift: {
    method: 'post',
    path: '/school-forest/gifts',
    request: {
      body: z.object({
        recipientUserId: z.uuid(),
        giftType,
        message: z.string().trim().max(1000).optional(),
        schoolId: z.uuid().optional(),
      }),
    },
    responses: { 200: { schema: gratitudeGift, description: 'Created gratitude gift' } },
    metadata: authority('create'),
  },
  getPendingGifts: {
    method: 'get',
    path: '/school-forest/gifts/pending/:recipientUserId',
    request: { params: z.object({ recipientUserId: z.uuid() }) },
    responses: {
      200: { schema: z.array(gratitudeGift), description: 'Pending gratitude gifts' },
    },
    metadata: authority('read'),
  },
  markGiftDelivered: {
    method: 'patch',
    path: '/school-forest/gifts/:giftId/deliver',
    request: { params: z.object({ giftId: z.uuid() }) },
    responses: { 200: { schema: gratitudeGift, description: 'Delivered gratitude gift' } },
    metadata: authority('update'),
  },
} as const satisfies SovereignContract;

export type GratitudeGift = z.infer<typeof gratitudeGift>;
export type GiftType = z.infer<typeof giftType>;
export type TeacherTree = z.infer<typeof teacherTree>;
export type SchoolForestState = z.infer<typeof schoolForestState>;
export type SchoolPulse = z.infer<typeof schoolPulse>;
