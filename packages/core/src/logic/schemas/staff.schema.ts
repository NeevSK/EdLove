import { z } from 'zod';

/**
 * StaffPresenceSummarySchema - Daily presence indicators for school staff.
 */
export const StaffPresenceSummarySchema = z.object({
  present: z.number().int().min(0).default(0),
  absent: z.number().int().min(0).default(0),
  onLeave: z.number().int().min(0).default(0),
  total: z.number().int().min(0).default(0),
});

/**
 * TeacherCarouselItemSchema - Metadata for teacher profile cards.
 */
export const TeacherCarouselItemSchema = z.object({
  userId: z.string().uuid(),
  fullName: z.string().min(1),
  role: z.string(),
  todayStatus: z.string().nullable().optional(),
  classroomCount: z.number().int().min(0).default(0),
  avatarUrl: z.string().url().nullable().optional().or(z.string().length(0)),
});

/**
 * StaffLeaveSchema - Data Transfer Object for leave requests.
 */
export const StaffLeaveSchema = z.object({
  id: z.string().uuid(),
  school_id: z.string().uuid(),
  user_id: z.string().uuid(),
  leave_type: z.string(),
  start_date: z.string(), // ISO Date string YYYY-MM-DD
  end_date: z.string(), // ISO Date string YYYY-MM-DD
  reason: z.string().nullable().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  reviewed_by: z.string().uuid().nullable().optional(),
  reviewed_at: z.string().nullable().optional(),
  created_at: z.string(),
});

/**
 * StudentAttendancePulseSchema - High-level metrics for student engagement.
 */
export const StudentAttendancePulseSchema = z.object({
  todayRate: z.number().min(0).max(100).default(0),
  yesterdayRate: z.number().min(0).max(100).default(0),
  atRiskCount: z.number().int().min(0).default(0),
});

/**
 * CalendarEventSchema - Institutional event metadata.
 */
export const CalendarEventSchema = z.object({
  id: z.string().uuid(),
  school_id: z.string().uuid(),
  title: z.string().min(1),
  type: z.string(),
  start_date: z.string(),
  end_date: z.string().nullable().optional(),
  is_public: z.boolean().default(true),
  created_by: z.string().uuid().nullable().optional(),
  created_at: z.string(),
});

export type StaffPresenceSummaryZod = z.infer<typeof StaffPresenceSummarySchema>;
export type TeacherCarouselItemZod = z.infer<typeof TeacherCarouselItemSchema>;
export type StaffLeaveZod = z.infer<typeof StaffLeaveSchema>;
export type StudentAttendancePulseZod = z.infer<typeof StudentAttendancePulseSchema>;
export type CalendarEventZod = z.infer<typeof CalendarEventSchema>;
