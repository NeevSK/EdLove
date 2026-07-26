import type { CalendarEvent } from '@repo/schema';
import type { Capacity } from '@/types';
import { APIError } from '@/types/API';
import { type AppType, createSovereignClient, SOVEREIGN_API_URL } from '@/api/base';

/**
 * STAFF MANAGEMENT API (Sovereign RPC Proxy)
 *
 * Siphons staff presence, carousels, and leaves to the Sanctuary API.
 * Purged internal Supabase references.
 */

// Types for Mock Data & UI (Siphoned from Contract)
export interface StaffPresenceSummary {
  present: number;
  absent: number;
  onLeave: number;
  total: number;
}

export interface TeacherCarouselItem {
  userId: string;
  fullName: string;
  capacity: Capacity;
  todayStatus: 'present' | 'absent' | 'late' | 'on_leave';
  classroomCount: number;
  avatarUrl: string | null;
}

export interface StudentAttendancePulse {
  todayRate: number;
  yesterdayRate: number;
  atRiskCount: number;
}

export interface StaffLeaveDTO {
  id: string;
  school_id: string;
  user_id: string;
  leave_type: string;
  start_date: Date;
  end_date: Date;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: Date | null;
  created_at: Date;
}

const client = createSovereignClient<AppType>(SOVEREIGN_API_URL);

export const staffManagementAPI = {
  async getStaffPresenceSummary(
    schoolId: string,
    viewDate?: string,
  ): Promise<StaffPresenceSummary> {
    const res = await (client.api as any).admin.schools[':schoolId']['staff-presence'].$get({
      param: { schoolId },
      query: { viewDate: viewDate ?? undefined },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch staff presence', res.status.toString());
    }

    return (await res.json()) as StaffPresenceSummary;
  },

  async getTeacherCarousel(schoolId: string, viewDate?: string): Promise<TeacherCarouselItem[]> {
    const res = await (client.api as any).admin.schools[':schoolId']['teacher-carousel'].$get({
      param: { schoolId },
      query: { viewDate: viewDate ?? undefined },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch teacher carousel', res.status.toString());
    }

    return (await res.json()) as TeacherCarouselItem[];
  },

  async submitLeaveRequest(
    schoolId: string,
    userId: string,
    leaveType: string,
    startDate: string,
    endDate: string,
    reason?: string,
  ): Promise<boolean> {
    const res = await (client.api as any).admin.leaves.$post({
      json: {
        schoolId,
        userId,
        leaveType,
        startDate,
        endDate,
        reason,
      },
    });

    if (!res.ok) {
      throw new APIError('Failed to submit leave request', res.status.toString());
    }

    const data = (await res.json()) as any;
    return data.success;
  },

  async getPendingLeaves(schoolId: string): Promise<StaffLeaveDTO[]> {
    const res = await (client.api as any).admin.schools[':schoolId']['pending-leaves'].$get({
      param: { schoolId },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch pending leaves', res.status.toString());
    }

    return (await res.json()) as StaffLeaveDTO[];
  },

  async approveLeave(leaveId: string, reviewedBy: string, approved: boolean): Promise<boolean> {
    const res = await (client.api as any).admin.leaves[':leaveId'].approve.$post({
      param: { leaveId },
      json: { reviewedBy, approved },
    });

    if (!res.ok) {
      throw new APIError('Failed to update leave status', res.status.toString());
    }

    const data = (await res.json()) as any;
    return data.success;
  },

  async getUpcomingCalendarEvents(
    schoolId: string,
    limit?: number,
    viewDate?: string,
  ): Promise<CalendarEvent[]> {
    const res = await (client.api as any).admin.schools[':schoolId']['calendar-events'].$get({
      param: { schoolId },
      query: {
        limit: limit !== undefined ? limit.toString() : undefined,
        viewDate: viewDate ?? undefined,
      },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch calendar events', res.status.toString());
    }

    return (await res.json()) as CalendarEvent[];
  },

  async createCalendarEvent(
    schoolId: string,
    principalId: string,
    event: {
      title: string;
      type: string;
      start_date: string;
      end_date?: string;
      is_public?: boolean;
    },
  ): Promise<boolean> {
    const res = await (client.api as any).admin.schools[':schoolId']['calendar-events'].$post({
      param: { schoolId },
      json: { principalId, event },
    });

    if (!res.ok) {
      throw new APIError('Failed to create calendar event', res.status.toString());
    }

    const data = (await res.json()) as any;
    return data.success;
  },
};
