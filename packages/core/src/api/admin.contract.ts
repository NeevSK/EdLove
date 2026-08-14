import type { SovereignContract } from '@repo/core/api/contracts';
import { SchoolSchema } from '@repo/core/logic/schemas/school.schema';
import {
  CalendarEventSchema,
  StaffLeaveSchema,
  StaffPresenceSummarySchema,
  TeacherCarouselItemSchema,
} from '@repo/core/logic/schemas/staff.schema';
import { z } from 'zod';

const adminAuthority = (
  action: 'create' | 'read' | 'update' | 'delete',
  subject: 'Staff' | 'School' | 'Calendar',
) =>
  ({
    policy: { action, subject },
  }) as const;

/**
 * Admin & Staff Port (Sovereign RPC)
 * Framework-agnostic definition of the Admin API.
 */
export const adminContract = {
  getStaffPresence: {
    method: 'get',
    path: '/admin/schools/:schoolId/staff-presence',
    request: {
      params: z.strictObject({ schoolId: z.uuid() }),
      query: z.strictObject({ viewDate: z.string().optional() }),
    },
    responses: {
      200: { schema: StaffPresenceSummarySchema, description: 'Staff presence summary' },
    },
    metadata: adminAuthority('read', 'Staff'),
  },

  getTeacherCarousel: {
    method: 'get',
    path: '/admin/schools/:schoolId/teacher-carousel',
    request: {
      params: z.strictObject({ schoolId: z.uuid() }),
      query: z.strictObject({ viewDate: z.string().optional() }),
    },
    responses: {
      200: { schema: z.array(TeacherCarouselItemSchema), description: 'Teacher carousel items' },
    },
    metadata: adminAuthority('read', 'Staff'),
  },

  submitLeave: {
    method: 'post',
    path: '/admin/leaves',
    request: {
      body: z.strictObject({
        schoolId: z.uuid(),
        // The server derives the acting user from the authenticated context.
        userId: z.uuid().optional(),
        leaveType: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        reason: z.string().optional(),
      }),
    },
    responses: {
      201: { schema: z.object({ success: z.boolean() }), description: 'Leave submitted' },
    },
    metadata: adminAuthority('create', 'Staff'),
  },

  getSchool: {
    method: 'get',
    path: '/admin/schools/:id',
    request: {
      params: z.strictObject({ id: z.uuid() }),
    },
    responses: {
      200: { schema: SchoolSchema, description: 'School details' },
    },
    metadata: adminAuthority('read', 'School'),
  },

  getPendingLeaves: {
    method: 'get',
    path: '/admin/schools/:schoolId/pending-leaves',
    request: {
      params: z.strictObject({ schoolId: z.uuid() }),
    },
    responses: {
      200: { schema: z.array(StaffLeaveSchema), description: 'Pending staff leaves' },
    },
    metadata: adminAuthority('read', 'Staff'),
  },

  approveLeave: {
    method: 'post',
    path: '/admin/leaves/:leaveId/approve',
    request: {
      params: z.strictObject({ leaveId: z.uuid() }),
      body: z.strictObject({
        // The server derives the reviewer from the authenticated context.
        reviewedBy: z.uuid().optional(),
        approved: z.boolean(),
      }),
    },
    responses: {
      200: { schema: z.object({ success: z.boolean() }), description: 'Leave status updated' },
    },
    metadata: adminAuthority('update', 'Staff'),
  },

  getUpcomingCalendarEvents: {
    method: 'get',
    path: '/admin/schools/:schoolId/calendar-events',
    request: {
      params: z.strictObject({ schoolId: z.uuid() }),
      query: z.strictObject({
        limit: z.coerce.number().optional(),
        viewDate: z.string().optional(),
      }),
    },
    responses: {
      200: { schema: z.array(CalendarEventSchema), description: 'Upcoming calendar events' },
    },
    metadata: adminAuthority('read', 'Calendar'),
  },

  createCalendarEvent: {
    method: 'post',
    path: '/admin/schools/:schoolId/calendar-events',
    request: {
      params: z.strictObject({ schoolId: z.uuid() }),
      body: z.strictObject({
        // Calendar authorship is derived from the authenticated context.
        principalId: z.uuid().optional(),
        event: z.strictObject({
          title: z.string(),
          type: z.string(),
          start_date: z.string(),
          end_date: z.string().optional(),
          is_public: z.boolean().optional(),
        }),
      }),
    },
    responses: {
      201: { schema: z.object({ success: z.boolean() }), description: 'Calendar event created' },
    },
    metadata: adminAuthority('create', 'Calendar'),
  },
} as const satisfies SovereignContract;
