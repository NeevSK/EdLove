import { z } from 'zod';
import { 
  StaffLeaveSchema, 
  StaffPresenceSummarySchema, 
  TeacherCarouselItemSchema,
  CalendarEventSchema
} from '../logic/schemas/staff.schema';
import { SchoolSchema, SectionSchema } from '../logic/schemas/school.schema';
import { type SovereignContract } from './contract';

const adminAuthority = (
  action: 'create' | 'read' | 'update' | 'delete',
  subject: 'Staff' | 'School' | 'Calendar'
) => ({
  policy: { action, subject },
}) as const;

/**
 * Admin & Staff Port (Sovereign RPC)
 * Framework-agnostic definition of the Admin API.
 */
export const adminContract: SovereignContract = {
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
        userId: z.uuid(),
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
} as const;
