import { z } from 'zod';
import { makeModelSchema } from '@repo/schema';

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
  userId: z.uuid(),
  fullName: z.string().min(1),
  role: z.string(),
  todayStatus: z.string().nullable().optional(),
  classroomCount: z.number().int().min(0).default(0),
  avatarUrl: z.url().nullable().optional().or(z.string().length(0)),
});

/**
 * StaffLeaveSchema - Data Transfer Object for leave requests.
 * Derived from ZenStack StaffLeave model.
 */
export const StaffLeaveSchema = makeModelSchema('StaffLeave');

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
 * Derived from ZenStack CalendarEvent model.
 */
export const CalendarEventSchema = makeModelSchema('CalendarEvent');

export type StaffPresenceSummaryZod = z.infer<typeof StaffPresenceSummarySchema>;
export type TeacherCarouselItemZod = z.infer<typeof TeacherCarouselItemSchema>;
export type StaffLeaveZod = z.infer<typeof StaffLeaveSchema>;
export type StudentAttendancePulseZod = z.infer<typeof StudentAttendancePulseSchema>;
export type CalendarEventZod = z.infer<typeof CalendarEventSchema>;
