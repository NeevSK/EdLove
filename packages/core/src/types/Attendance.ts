import type { AttendanceSchema } from '@repo/core/logic/schemas/attendance.schema';
import type { z } from 'zod';

/**
 * Attendance - Authoritative domain type.
 */
export type AttendanceRecord = z.infer<typeof AttendanceSchema>;
