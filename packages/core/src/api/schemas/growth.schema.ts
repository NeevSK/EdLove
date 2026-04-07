import { z } from 'zod';

export const GrowthSignalSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  dimension: z.string(), // presence, flowering, witnessing, weaving, blooming
  event_type: z.string(),
  event_metadata: z.record(z.string(), z.any()).optional().nullable(),
  created_at: z.string().or(z.date()),
});

export const UserGrowthStateSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  bhumi_stage: z.string().default('seed'),
  banyan_stage: z.string().optional().nullable(),
  river_stage: z.string().optional().nullable(),
  crystal_tier: z.string().optional().nullable(),
  presence_signals: z.number().default(0),
  nourishing_signals: z.number().default(0),
  witnessing_signals: z.number().default(0),
  weaving_signals: z.number().default(0),
  blooming_signals: z.number().default(0),
  peer_mentored_count: z.number().default(0),
  circles_facilitated_count: z.number().default(0),
  lessons_completed_count: z.number().default(0),
  reflections_submitted_count: z.number().default(0),
  crystals_found_count: z.number().default(0),
  fractal_moments_count: z.number().default(0),
  last_seen_at: z.string().or(z.date()),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
});

export const SanctuaryManifestoSchema = z.object({
  id: z.string().uuid(),
  school_id: z.string(),
  creator_id: z.string(),
  title: z.string(),
  content: z.string(),
  vibe: z.string().optional().nullable(),
  status: z.enum(['active', 'archived', 'fulfilled']).default('active'),
  target_date: z.string().or(z.date()).optional().nullable(),
  metadata: z.record(z.string(), z.any()).optional().nullable(),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
  endorsement_count: z.number().optional(),
  has_endorsed: z.boolean().optional(),
});

export const ImpactRippleSchema = z.object({
  id: z.string().uuid(),
  recipient_user_id: z.string(),
  actor_user_id: z.string(),
  entity_id: z.string().optional().nullable(),
  ripple_type: z.string(),
  warm_message_en: z.string().optional().nullable(),
  warm_message_si: z.string().optional().nullable(),
  delivered: z.boolean().default(false),
  delivered_at: z.string().or(z.date()).optional().nullable(),
  created_at: z.string().or(z.date()),
});
