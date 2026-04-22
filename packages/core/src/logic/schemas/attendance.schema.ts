import { z } from 'zod';
import { StudentAttendancePulseSchema } from './staff.schema';

export const AttendanceStatusSchema = z.enum(['present', 'absent', 'late']);

/**
 * AttendanceSchema  A record of presence in the sanctuary.
 */
export const AttendanceSchema = z.object({
  id: z.string().uuid(),
  classroom_id: z.string().uuid(),
  student_id: z.string().uuid(),
  status: AttendanceStatusSchema,
  date: z.string(), // ISO Date string (YYYY-MM-DD)
  created_at: z.string(),
  updated_at: z.string(),
});

/**
 * StudentAttendanceSchema  View model for attendance registry.
 */
export const StudentAttendanceSchema = z.object({
  id: z.string().uuid(),
  student_id: z.string().uuid(),
  full_name: z.string(),
  roll_number: z.string().nullable().optional(),
  status: AttendanceStatusSchema,
});

export const AttendanceSnapshotSchema = z.object({
  classroomId: z.string(),
  viewDate: z.string(),
  records: z.array(AttendanceSchema),
});

export const AttendanceTrendPointSchema = z.object({
  date: z.string(),
  presentCount: z.number(),
  absentCount: z.number(),
  lateCount: z.number(),
  totalCount: z.number(),
  rate: z.number(),
});

export const AttendanceReportSchema = z.object({
  trend: z.array(AttendanceTrendPointSchema),
  overallRate: z.number(),
  totalAbsences: z.number(),
});

export const SchoolAttendancePulseSchema = StudentAttendancePulseSchema;

export type Attendance = z.infer<typeof AttendanceSchema>;
export type StudentAttendance = z.infer<typeof StudentAttendanceSchema>;
export type AttendanceStatus = z.infer<typeof AttendanceStatusSchema>;
export type AttendanceSnapshot = z.infer<typeof AttendanceSnapshotSchema>;
export type AttendanceTrendPoint = z.infer<typeof AttendanceTrendPointSchema>;
export type AttendanceReport = z.infer<typeof AttendanceReportSchema>;
export type SchoolAttendancePulse = z.infer<typeof SchoolAttendancePulseSchema>;
