import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  AttendanceReportSchema,
  AttendanceSchema,
  AttendanceSnapshotSchema,
  SchoolAttendancePulseSchema,
} from '../logic/schemas/attendance.schema';
import { InventoryItemSchema } from '../logic/schemas/inventory_item.schema';
import {
  SchoolGradeSchema,
  SchoolSchema,
  SchoolStatsSchema,
  SectionSchema,
} from '../logic/schemas/school.schema';
import { POAMetadataSchema } from './contract';

const c = initContract();

/**
 * Operations & Attendance Contract (Batch B)
 * Handles School management, Attendance, and Inventory with POA.
 */
export const operationsContract = c.router({
  // Attendance
  getAttendance: {
    method: 'GET',
    path: '/attendance',
    query: z.object({
      classroom_id: z.string(),
      date: z.string().optional(),
    }),
    responses: {
      200: z.array(AttendanceSchema),
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'Attendance',
      },
    }),
  },
  recordAttendance: {
    method: 'POST',
    path: '/attendance',
    body: z.object({
      classroom_id: z.string(),
      student_id: z.string(),
      status: z.string(),
      date: z.string(),
    }),
    responses: {
      201: AttendanceSchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'create',
        subject: 'Attendance',
      },
    }),
  },
  batchRecordAttendance: {
    method: 'POST',
    path: '/attendance/batch',
    body: z.array(
      z.object({
        classroom_id: z.string(),
        student_id: z.string(),
        status: z.string(),
        date: z.string(),
      }),
    ),
    responses: {
      200: z.array(AttendanceSchema),
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'create',
        subject: 'Attendance',
      },
    }),
  },
  getAttendanceForStudent: {
    method: 'GET',
    path: '/attendance/student',
    query: z.object({
      student_id: z.string(),
      classroom_id: z.string().optional(),
    }),
    responses: {
      200: z.array(AttendanceSchema),
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'Attendance',
      },
    }),
  },
  getClassroomAttendanceSnapshot: {
    method: 'GET',
    path: '/attendance/snapshot',
    query: z.object({
      classroom_id: z.string(),
      view_date: z.string(),
    }),
    responses: {
      200: AttendanceSnapshotSchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'Attendance',
      },
    }),
  },
  getStudentAttendanceTimeline: {
    method: 'GET',
    path: '/attendance/student/timeline',
    query: z.object({
      student_id: z.string(),
      classroom_id: z.string().optional(),
      from_date: z.string().optional(),
      to_date: z.string().optional(),
    }),
    responses: {
      200: z.array(AttendanceSchema),
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'Attendance',
      },
    }),
  },
  getSchoolAttendancePulse: {
    method: 'GET',
    path: '/attendance/pulse',
    query: z.object({
      school_id: z.string(),
      classroom_id: z.string().optional(),
      view_date: z.string().optional(),
    }),
    responses: {
      200: SchoolAttendancePulseSchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'Attendance',
      },
    }),
  },
  getAttendanceReport: {
    method: 'GET',
    path: '/attendance/report',
    query: z.object({
      school_id: z.string(),
      start_date: z.string(),
      end_date: z.string(),
      classroom_id: z.string().optional(),
    }),
    responses: {
      200: AttendanceReportSchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'Attendance',
      },
    }),
  },

  // School
  createSchool: {
    method: 'POST',
    path: '/schools',
    body: z.object({
      name: z.string().min(1),
      handle: z.string().min(1),
      type: z.enum(['primary', 'secondary', 'mixed']),
      created_by: z.string(),
    }),
    responses: {
      201: SchoolSchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'create',
        subject: 'School',
      },
    }),
  },
  searchSchools: {
    method: 'GET',
    path: '/schools/search',
    query: z.object({
      query: z.string().min(1),
    }),
    responses: {
      200: z.array(SchoolSchema),
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'School',
      },
    }),
  },
  getSchool: {
    method: 'GET',
    path: '/schools/:id',
    responses: {
      200: SchoolSchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'School',
      },
    }),
  },
  updateSchool: {
    method: 'PATCH',
    path: '/schools/:id',
    body: SchoolSchema.partial(),
    responses: {
      200: SchoolSchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'update',
        subject: 'School',
      },
    }),
  },
  getSchoolStats: {
    method: 'GET',
    path: '/schools/:id/stats',
    responses: {
      200: SchoolStatsSchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'School',
      },
    }),
  },
  getInviteCodes: {
    method: 'GET',
    path: '/schools/:id/invites',
    responses: {
      200: z.array(z.any()),
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'School',
      },
    }),
  },
  generateInviteCode: {
    method: 'POST',
    path: '/schools/:id/invites',
    body: z.object({
      role: z.string(),
      created_by: z.string(),
    }),
    responses: {
      201: z.any(),
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'create',
        subject: 'School',
      },
    }),
  },
  getSchoolSections: {
    method: 'GET',
    path: '/schools/:id/sections',
    responses: {
      200: z.array(SectionSchema),
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'School',
      },
    }),
  },
  getSectionGrades: {
    method: 'GET',
    path: '/sections/:id/grades',
    responses: {
      200: z.array(SchoolGradeSchema),
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'School',
      },
    }),
  },
  createSchoolSection: {
    method: 'POST',
    path: '/schools/:school_id/sections',
    body: z.object({
      name: z.string(),
      code: z.string().optional(),
    }),
    responses: {
      201: SectionSchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'create',
        subject: 'School',
      },
    }),
  },
  createSectionGrade: {
    method: 'POST',
    path: '/sections/:section_id/grades',
    body: z.object({
      name: z.string(),
      level: z.number().int(),
    }),
    responses: {
      201: SchoolGradeSchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'create',
        subject: 'School',
      },
    }),
  },

  // Inventory
  getInventory: {
    method: 'GET',
    path: '/inventory',
    query: z.object({
      classroom_id: z.string(),
    }),
    responses: {
      200: z.array(InventoryItemSchema),
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'Inventory',
      },
    }),
  },
  updateInventory: {
    method: 'PATCH',
    path: '/inventory/:id',
    body: InventoryItemSchema.partial(),
    responses: {
      200: InventoryItemSchema,
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'update',
        subject: 'Inventory',
      },
    }),
  },
  createInventoryRequest: {
    method: 'POST',
    path: '/inventory/requests',
    body: z.object({
      item_id: z.string(),
      quantity: z.number(),
      notes: z.string().optional(),
    }),
    responses: {
      201: z.any(),
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'create',
        subject: 'Inventory',
      },
    }),
  },
  getSchoolResourceNeeds: {
    method: 'GET',
    path: '/inventory/school/:schoolId/needs',
    responses: {
      200: z.array(z.any()),
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'Inventory',
      },
    }),
  },
  getSchoolRequests: {
    method: 'GET',
    path: '/inventory/school/:schoolId/requests',
    responses: {
      200: z.array(z.any()),
    },
    metadata: POAMetadataSchema.parse({
      authority: {
        action: 'read',
        subject: 'Inventory',
      },
    }),
  },
});
