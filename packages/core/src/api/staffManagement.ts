import { 
  createSovereignClient, 
  SOVEREIGN_API_URL, 
  type AppType 
} from './base';
import { APIError } from '../types/API';
import { Capacity } from '../types';

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
  async getStaffPresenceSummary(schoolId: string, viewDate?: string): Promise<StaffPresenceSummary> {
    const res = await client.api.admin.schools[':schoolId']['staff-presence'].$get({
      param: { schoolId },
      query: { viewDate: viewDate ?? undefined },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch staff presence', res.status.toString());
    }

    return await res.json() as StaffPresenceSummary;
  },

  async getTeacherCarousel(schoolId: string, viewDate?: string): Promise<TeacherCarouselItem[]> {
    const res = await client.api.admin.schools[':schoolId']['teacher-carousel'].$get({
      param: { schoolId },
      query: { viewDate: viewDate ?? undefined },
    });

    if (!res.ok) {
      throw new APIError('Failed to fetch teacher carousel', res.status.toString());
    }

    return await res.json() as TeacherCarouselItem[];
  },

  async submitLeaveRequest(
    schoolId: string,
    userId: string,
    leaveType: string,
    startDate: string,
    endDate: string,
    reason?: string
  ): Promise<boolean> {
    const res = await client.api.admin.leaves.$post({
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

    const data = await res.json() as any;
    return data.success;
  },
};
