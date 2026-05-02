import { z } from 'zod';
import { makeModelSchema } from '../generated/zod';

/**
 * SentinelAuditLogSchema - Non-repudiable audit logs for critical actions.
 * Derived from ZenStack SentinelAuditLog model.
 */
export const SentinelAuditLogSchema = makeModelSchema('SentinelAuditLog');

/**
 * EcosystemStatsSchema - Aggregate ecosystem statistics.
 */
export const EcosystemStatsSchema = z.object({
  total_schools: z.number().default(0),
  total_classrooms: z.number().default(0),
  total_users: z.number().default(0),
  total_students: z.number().default(0),
  total_teachers: z.number().default(0),
  total_principals: z.number().default(0),
  active_communities: z.number().default(0),
  ecosystem_health: z.number().min(0).max(100).default(0),
  // Phase 4 additions
  active_users_7d: z.number().default(0),
  mood_checkins_7d: z.number().default(0),
  avg_mood_score_7d: z.number().nullable().default(null),
  total_library_resources: z.number().default(0),
  verified_resources: z.number().default(0),
  total_bookmarks: z.number().default(0),
  total_community_posts: z.number().default(0),
  posts_7d: z.number().default(0),
  attendance_records: z.number().default(0),
  attendance_records_7d: z.number().default(0),
  growth_signals_7d: z.number().default(0),
  // Phase 5 additions: Global Resource Aggregation
  total_inventory_items: z.number().default(0),
  total_inventory_requests: z.number().default(0),
  pending_inventory_requests: z.number().default(0),
  total_echo_feedback: z.number().default(0),
  pending_echo_responses: z.number().default(0),
  avg_student_performance: z.number().nullable().default(null),
  total_submissions: z.number().default(0),
  submissions_7d: z.number().default(0),
});

/**
 * EcosystemPulseSchema - Aggregate "weather" across all institutions.
 */
export const EcosystemPulseSchema = z.object({
  weather: z.enum(['radiant', 'lush', 'steady', 'resting', 'quiet']),
  pulses: z.array(
    z.object({
      school_id: z.string().uuid(),
      school_name: z.string(),
      weather: z.string(),
      health: z.number(),
    }),
  ),
  computed_at: z.string().datetime(),
});

/**
 * GlobalUserSchema - User representation for ecosystem-wide listing.
 */
export const GlobalUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string(),
  authority: z.string(),
  role: z.string().optional(), // UI uses u.role
  avatar_url: z.string().url().nullable().optional(),
  created_at: z.string(),
  schools: z
    .object({
      name: z.string(),
    })
    .nullable()
    .optional(),
});

export type SentinelAuditLog = z.infer<typeof SentinelAuditLogSchema>;
export type EcosystemStats = z.infer<typeof EcosystemStatsSchema>;
export type EcosystemPulse = z.infer<typeof EcosystemPulseSchema>;
export type GlobalUser = z.infer<typeof GlobalUserSchema>;
