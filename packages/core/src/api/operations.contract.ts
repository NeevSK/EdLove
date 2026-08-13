import { z } from 'zod';
import {
  AttendanceReportSchema,
  AttendanceSchema,
  SchoolAttendancePulseSchema,
} from '@repo/core/logic/schemas/attendance.schema';
import type { SovereignContract } from '@repo/core/api/contracts';

const operationsAuthority = (
  action: 'create' | 'read' | 'update' | 'delete',
  subject: 'Attendance' | 'School' | 'Inventory',
) =>
  ({
    policy: { action, subject },
  }) as const;

/**
 * Operations & Attendance Port (Sovereign RPC)
 * Framework-agnostic definition of the Operations API.
 */
export const operationsContract = {
  getAttendance: {
    method: 'get',
    path: '/attendance',
    request: {
      query: z.strictObject({
        classroom_id: z.uuid(),
        date: z.string().optional(),
      }),
    },
    responses: {
      200: { schema: z.array(AttendanceSchema), description: 'Retrieve attendance records' },
    },
    metadata: operationsAuthority('read', 'Attendance'),
  },

  recordAttendance: {
    method: 'post',
    path: '/attendance',
    request: {
      body: z.strictObject({
        classroom_id: z.uuid(),
        student_id: z.uuid(),
        status: z.string(),
        date: z.string(),
      }),
    },
    responses: {
      201: { schema: AttendanceSchema, description: 'Attendance recorded' },
    },
    metadata: operationsAuthority('create', 'Attendance'),
  },

  batchRecordAttendance: {
    method: 'post',
    path: '/attendance/batch',
    request: {
      body: z.array(
        z.strictObject({
          classroom_id: z.uuid(),
          student_id: z.uuid(),
          status: z.string(),
          date: z.string(),
        }),
      ),
    },
    responses: {
      200: { schema: z.array(AttendanceSchema), description: 'Batch attendance recorded' },
    },
    metadata: operationsAuthority('create', 'Attendance'),
  },

  getSchoolAttendancePulse: {
    method: 'get',
    path: '/attendance/pulse',
    request: {
      query: z.strictObject({
        school_id: z.uuid(),
        classroom_id: z.uuid().optional(),
        view_date: z.string().optional(),
      }),
    },
    responses: {
      200: { schema: SchoolAttendancePulseSchema, description: 'Attendance pulse retrieved' },
    },
    metadata: operationsAuthority('read', 'Attendance'),
  },

  getAttendanceReport: {
    method: 'get',
    path: '/attendance/report',
    request: {
      query: z.strictObject({
        school_id: z.uuid(),
        start_date: z.string(),
        end_date: z.string(),
        classroom_id: z.uuid().optional(),
      }),
    },
    responses: {
      200: { schema: AttendanceReportSchema, description: 'Attendance report retrieved' },
    },
    metadata: operationsAuthority('read', 'Attendance'),
  },
} as const satisfies SovereignContract;
