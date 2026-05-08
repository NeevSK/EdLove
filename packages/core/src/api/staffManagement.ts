/**
 * Staff Management API
 *
 * Provides data access for:
 *  - Staff attendance (daily presence summary, teacher carousel)
 *  - Leave requests (submit, list pending, approve/reject)
 *  - Institutional calendar (upcoming events, create event)
 *  - Student attendance projections delegated to the dedicated attendance projection service
 */

import {
  type CalendarEventZod as CalendarEvent,
  CalendarEventSchema,
  type StaffLeaveZod as StaffLeaveDTO,
  StaffLeaveSchema,
  type StaffPresenceSummaryZod as StaffPresenceSummary,
  StaffPresenceSummarySchema,
  type StudentAttendancePulseZod as StudentAttendancePulse,
  type TeacherCarouselItemZod as TeacherCarouselItem,
  TeacherCarouselItemSchema,
} from '../logic/schemas/staff.schema';
import { attendanceProjectionServices } from './runtimes/attendanceProjection.runtime';
import type { AttendanceReport } from '../types/Attendance';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from './supabase';

export type {
  CalendarEvent,
  StaffLeaveDTO,
  StaffPresenceSummary,
  StudentAttendancePulse,
  TeacherCarouselItem,
};

function formatLocalDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayISO(): string {
  return formatLocalDateISO(new Date());
}

export const staffManagementAPI = {
  async getStaffPresenceSummary(
    schoolId: string,
    viewDate?: string,
  ): Promise<StaffPresenceSummary> {
    const targetDate = viewDate || todayISO();
    const empty: StaffPresenceSummary = {
      present: 0,
      absent: 0,
      onLeave: 0,
      total: 0,
    };
    try {
      const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
        .from('staff_attendance')
        .select('status')
        .eq('school_id', schoolId)
        .eq('date', targetDate);

      if (error) {
        console.error('[staffManagement] getStaffPresenceSummary:', error.message);
        return empty;
      }

      const rows = data ?? [];
      return StaffPresenceSummarySchema.parse({
        present: rows.filter((row) => row.status === 'present' || row.status === 'late').length,
        absent: rows.filter((row) => row.status === 'absent').length,
        onLeave: rows.filter((row) => row.status === 'on_leave' || row.status === 'half_day')
          .length,
        total: rows.length,
      });
    } catch (error) {
      console.error('[staffManagement] getStaffPresenceSummary unexpected:', error);
      return empty;
    }
  },

  async getTeacherCarousel(schoolId: string, viewDate?: string): Promise<TeacherCarouselItem[]> {
    try {
      const targetDate = viewDate || todayISO();

      const { data: users, error: usersError } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
        .from('users')
        .select('id, full_name, role, avatar_url')
        .eq('school_id', schoolId)
        .in('role', ['teacher', 'grade_head', 'principal', 'founder']);

      if (usersError) {
        console.error('[staffManagement] getTeacherCarousel users:', usersError.message);
        return [];
      }

      if (!users || users.length === 0) return [];

      const userIds = users.map((user) => user.id);

      const [attendanceResult, classroomResult] = await Promise.all([
        __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
          .from('staff_attendance')
          .select('user_id, status')
          .eq('school_id', schoolId)
          .eq('date', targetDate)
          .in('user_id', userIds),
        __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
          .from('classrooms')
          .select('teacher_id')
          .eq('school_id', schoolId)
          .in('teacher_id', userIds),
      ]);

      const attendanceMap = new Map<string, string>();
      (attendanceResult.data ?? []).forEach((row) => {
        attendanceMap.set(row.user_id, row.status);
      });

      const classroomCountMap = new Map<string, number>();
      (classroomResult.data ?? []).forEach((row) => {
        if (row.teacher_id) {
          classroomCountMap.set(row.teacher_id, (classroomCountMap.get(row.teacher_id) ?? 0) + 1);
        }
      });

      return users.map((user) => {
        const item = {
          userId: user.id,
          fullName: user.full_name ?? '',
          role: user.role ?? 'teacher',
          todayStatus: attendanceMap.get(user.id) ?? null,
          classroomCount: classroomCountMap.get(user.id) ?? 0,
          avatarUrl: user.avatar_url ?? null,
        };

        try {
          return TeacherCarouselItemSchema.parse(item);
        } catch (error) {
          console.error('[staffManagement] TeacherCarouselItem Validation Error:', error, item);
          return item as TeacherCarouselItem;
        }
      });
    } catch (error) {
      console.error('[staffManagement] getTeacherCarousel unexpected:', error);
      return [];
    }
  },

  async submitLeaveRequest(
    schoolId: string,
    userId: string,
    leaveType: string,
    startDate: string,
    endDate: string,
    reason?: string,
  ): Promise<boolean> {
    try {
      const { error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.from('staff_leaves').insert({
        school_id: schoolId,
        user_id: userId,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: reason ?? null,
      });
      if (error) {
        console.error('[staffManagement] submitLeaveRequest:', error.message);
        return false;
      }
      return true;
    } catch (error) {
      console.error('[staffManagement] submitLeaveRequest unexpected:', error);
      return false;
    }
  },

  async getPendingLeaves(schoolId: string): Promise<StaffLeaveDTO[]> {
    try {
      const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
        .from('staff_leaves')
        .select('*')
        .eq('school_id', schoolId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[staffManagement] getPendingLeaves:', error.message);
        return [];
      }

      return (data ?? []).map((item) => {
        try {
          return StaffLeaveSchema.parse(item);
        } catch (parseError) {
          console.error('[staffManagement] StaffLeave Validation Error:', parseError);
          return item as StaffLeaveDTO;
        }
      });
    } catch (error) {
      console.error('[staffManagement] getPendingLeaves unexpected:', error);
      return [];
    }
  },

  async approveLeave(leaveId: string, principalId: string, approve: boolean): Promise<boolean> {
    try {
      const { data: leave } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
        .from('staff_leaves')
        .select('user_id, leave_type, start_date, end_date')
        .eq('id', leaveId)
        .maybeSingle();

      const { error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
        .from('staff_leaves')
        .update({
          status: approve ? 'approved' : 'rejected',
          reviewed_by: principalId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', leaveId);

      if (error) {
        console.error('[staffManagement] approveLeave:', error.message);
        return false;
      }

      if (leave?.user_id) {
        const dateRange =
          leave.start_date === leave.end_date
            ? leave.start_date
            : `${leave.start_date} - ${leave.end_date}`;

        void __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
          .from('notifications')
          .insert({
            user_id: leave.user_id,
            type: approve ? 'leave_approved' : 'leave_rejected',
            title: approve ? 'Leave Approved' : 'Leave Request Update',
            body: approve
              ? `Your ${leave.leave_type ?? 'leave'} request for ${dateRange} has been approved.`
              : `Your ${leave.leave_type ?? 'leave'} request for ${dateRange} was not approved. Please speak with the principal.`,
            is_read: false,
            reference_id: leaveId,
            reference_type: 'staff_leave',
          })
          .then(
            () => {},
            (notificationError: Error) =>
              console.warn(
                '[staffManagement] leave notification failed:',
                notificationError?.message,
              ),
          );
      }

      return true;
    } catch (error) {
      console.error('[staffManagement] approveLeave unexpected:', error);
      return false;
    }
  },

  async getStudentAttendancePulse(
    schoolId: string,
    classroomId?: string,
    viewDate?: string,
    _options?: { actorId?: string; accessKind?: string; reason?: string },
  ): Promise<StudentAttendancePulse> {
    return attendanceProjectionServices.getSchoolAttendancePulse(schoolId, classroomId, viewDate);
  },

  async getUpcomingCalendarEvents(
    schoolId: string,
    limit = 5,
    viewDate?: string,
  ): Promise<CalendarEvent[]> {
    try {
      const targetDate = viewDate || todayISO();
      const { data, error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__
        .from('institutional_calendar')
        .select('*')
        .eq('school_id', schoolId)
        .gte('start_date', targetDate)
        .order('start_date', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('[staffManagement] getUpcomingCalendarEvents:', error.message);
        return [];
      }

      return (data ?? []).map((event) => {
        try {
          return CalendarEventSchema.parse(event);
        } catch (parseError) {
          console.error('[staffManagement] CalendarEvent Validation Error:', parseError);
          return event as CalendarEvent;
        }
      });
    } catch (error) {
      console.error('[staffManagement] getUpcomingCalendarEvents unexpected:', error);
      return [];
    }
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
    try {
      const { error } = await __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__.from('institutional_calendar').insert({
        school_id: schoolId,
        created_by: principalId,
        title: event.title,
        type: event.type,
        start_date: event.start_date,
        end_date: event.end_date ?? null,
        is_public: event.is_public ?? true,
      });
      if (error) {
        console.error('[staffManagement] createCalendarEvent:', error.message);
        return false;
      }
      return true;
    } catch (error) {
      console.error('[staffManagement] createCalendarEvent unexpected:', error);
      return false;
    }
  },

  async getAttendanceReport(
    schoolId: string,
    startDate: string,
    endDate: string,
    classroomId?: string,
  ): Promise<AttendanceReport> {
    return (await attendanceProjectionServices.getAttendanceReport(
      schoolId,
      startDate,
      endDate,
      classroomId,
    )) as AttendanceReport;
  },
};
