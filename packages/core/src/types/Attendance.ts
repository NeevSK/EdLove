import { z } from 'zod';
import { 
  AttendanceSchema, 
  StudentAttendanceSchema, 
  AttendanceStatusSchema,
  AttendanceTrendPointSchema,
  AttendanceReportSchema
} from '../logic/schemas/attendance.schema';

/**
 * Attendance - Authoritative domain type.
 */
export type AttendanceRecord = z.infer<typeof AttendanceSchema>;
export type AttendanceStatus = z.infer<typeof AttendanceStatusSchema>;

/**
 * View model for attendance UI (includes flattened student info)
 */
export type StudentAttendance = z.infer<typeof StudentAttendanceSchema>;

/**
 * Analytical types for trends and reporting.
 */
export type AttendanceTrendPoint = z.infer<typeof AttendanceTrendPointSchema>;
export type AttendanceReport = z.infer<typeof AttendanceReportSchema>;
