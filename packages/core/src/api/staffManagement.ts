/**
 * Staff Management API
 *
 * Provides data access for:
 *  - Staff attendance (daily presence summary, teacher carousel)
 *  - Leave requests (submit, list pending, approve/reject)
 *  - Student attendance pulse (today rate, delta, at-risk count)
 *  - Institutional calendar (upcoming events, create event)
 */

import { supabase } from '../lib/supabase';
import { AttendanceTrendPoint, AttendanceReport } from '../types/Attendance';

// ── Types ────────────────────────────────────────────────────────────────────

export interface StaffPresenceSummary {
  present: number;
  absent: number;
  onLeave: number;
  total: number;
}

export interface TeacherCarouselItem {
  userId: string;
  fullName: string;
  role: string;
  todayStatus: string | null;
  /** Number of classrooms assigned to this teacher (not sessions scheduled today). */
  classroomCount: number;
  avatarUrl: string | null;
}

export interface StaffLeaveDTO {
  id: string;
  school_id: string;
  user_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface StudentAttendancePulse {
  todayRate: number;
  yesterdayRate: number;
  atRiskCount: number;
}

export interface CalendarEvent {
  id: string;
  school_id: string;
  title: string;
  type: string;
  start_date: string;
  end_date: string | null;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the current local date as YYYY-MM-DD (avoids UTC-vs-local midnight shift). */
function formatLocalDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayISO(): string {
  return formatLocalDateISO(new Date());
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatLocalDateISO(d);
}

// ── API ──────────────────────────────────────────────────────────────────────

export const staffManagementAPI = {
  /**
   * Returns presence summary for staff today.
   */
  async getStaffPresenceSummary(schoolId: string): Promise<StaffPresenceSummary> {
    const empty: StaffPresenceSummary = { present: 0, absent: 0, onLeave: 0, total: 0 };
    try {
      const { data, error } = await supabase
        .from('staff_attendance')
        .select('status')
        .eq('school_id', schoolId)
        .eq('date', todayISO());

      if (error) {
        console.error('[staffManagement] getStaffPresenceSummary:', error.message);
        return empty;
      }

      const rows = data ?? [];
      return {
        present: rows.filter((r) => r.status === 'present' || r.status === 'late').length,
        absent: rows.filter((r) => r.status === 'absent').length,
        onLeave: rows.filter((r) => r.status === 'on_leave' || r.status === 'half_day').length,
        total: rows.length,
      };
    } catch (e) {
      console.error('[staffManagement] getStaffPresenceSummary unexpected:', e);
      return empty;
    }
  },

  /**
   * Returns teacher cards for the carousel (users + today's attendance + class count).
   */
  async getTeacherCarousel(schoolId: string): Promise<TeacherCarouselItem[]> {
    try {
      const today = todayISO();

      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, role, avatar_url')
        .eq('school_id', schoolId)
        .in('role', ['teacher', 'grade_head', 'principal', 'founder']);

      if (usersError) {
        console.error('[staffManagement] getTeacherCarousel users:', usersError.message);
        return [];
      }

      if (!users || users.length === 0) return [];

      const userIds = users.map((u) => u.id);

      const [attResult, classResult] = await Promise.all([
        supabase
          .from('staff_attendance')
          .select('user_id, status')
          .eq('school_id', schoolId)
          .eq('date', today)
          .in('user_id', userIds),
        supabase
          .from('classrooms')
          .select('teacher_id')
          .eq('school_id', schoolId)
          .in('teacher_id', userIds),
      ]);

      const attMap = new Map<string, string>();
      (attResult.data ?? []).forEach((a) => attMap.set(a.user_id, a.status));

      const classCountMap = new Map<string, number>();
      (classResult.data ?? []).forEach((c) => {
        if (c.teacher_id) {
          classCountMap.set(c.teacher_id, (classCountMap.get(c.teacher_id) ?? 0) + 1);
        }
      });

      return users.map((u) => ({
        userId: u.id,
        fullName: u.full_name ?? '',
        role: u.role ?? 'teacher',
        todayStatus: attMap.get(u.id) ?? null,
        classroomCount: classCountMap.get(u.id) ?? 0,
        avatarUrl: u.avatar_url ?? null,
      }));
    } catch (e) {
      console.error('[staffManagement] getTeacherCarousel unexpected:', e);
      return [];
    }
  },

  /**
   * Submits a leave request for a staff member.
   */
  async submitLeaveRequest(
    schoolId: string,
    userId: string,
    leaveType: string,
    startDate: string,
    endDate: string,
    reason?: string,
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from('staff_leaves').insert({
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
    } catch (e) {
      console.error('[staffManagement] submitLeaveRequest unexpected:', e);
      return false;
    }
  },

  /**
   * Returns pending leave requests for a school (principal view).
   */
  async getPendingLeaves(schoolId: string): Promise<StaffLeaveDTO[]> {
    try {
      const { data, error } = await supabase
        .from('staff_leaves')
        .select('*')
        .eq('school_id', schoolId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[staffManagement] getPendingLeaves:', error.message);
        return [];
      }
      return data ?? [];
    } catch (e) {
      console.error('[staffManagement] getPendingLeaves unexpected:', e);
      return [];
    }
  },

  /**
   * Approves or rejects a leave request.
   */
  async approveLeave(leaveId: string, principalId: string, approve: boolean): Promise<boolean> {
    try {
      // Fetch leave request for notification metadata
      const { data: leave } = await supabase
        .from('staff_leaves')
        .select('user_id, leave_type, start_date, end_date')
        .eq('id', leaveId)
        .maybeSingle();

      const { error } = await supabase
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

      // Notify the staff member — fire-and-forget, non-fatal
      if (leave?.user_id) {
        const dateRange = leave.start_date === leave.end_date
          ? leave.start_date
          : `${leave.start_date} – ${leave.end_date}`;
        void supabase.from('notifications').insert({
          user_id: leave.user_id,
          type: approve ? 'leave_approved' : 'leave_rejected',
          title: approve ? 'Leave Approved ✓' : 'Leave Request Update',
          body: approve
            ? `Your ${leave.leave_type ?? 'leave'} request for ${dateRange} has been approved.`
            : `Your ${leave.leave_type ?? 'leave'} request for ${dateRange} was not approved. Please speak with the principal.`,
          is_read: false,
          reference_id: leaveId,
          reference_type: 'staff_leave',
        }).then(
          () => { },
          (err: any) => console.warn('[staffManagement] leave notification failed:', err?.message)
        );
      }

      return true;
    } catch (e) {
      console.error('[staffManagement] approveLeave unexpected:', e);
      return false;
    }
  },

  /**
   * Returns student attendance pulse (today rate, yesterday delta, at-risk count).
   * If classroomId is provided, filters to that classroom. Otherwise fetches for whole school.
   * At-risk is computed as students absent on both today AND yesterday.
   */
  async getStudentAttendancePulse(schoolId: string, classroomId?: string): Promise<StudentAttendancePulse> {
    const empty: StudentAttendancePulse = { todayRate: 0, yesterdayRate: 0, atRiskCount: 0 };
    try {
      const today = todayISO();
      const yesterday = yesterdayISO();

      let classroomIds: string[] = [];

      if (classroomId) {
        classroomIds = [classroomId];
      } else {
        // Step 1 — get all classroom IDs for this school
        const { data: classrooms, error: classErr } = await supabase
          .from('classrooms')
          .select('id')
          .eq('school_id', schoolId);

        if (classErr || !classrooms || classrooms.length === 0) return empty;
        classroomIds = classrooms.map((c) => c.id);
      }

      // Step 2 — fetch today & yesterday attendance rows filtered by classroom
      const [todayRes, yesterdayRes] = await Promise.all([
        supabase
          .from('attendance')
          .select('status, student_id')
          .in('classroom_id', classroomIds)
          .eq('date', today),
        supabase
          .from('attendance')
          .select('status, student_id')
          .in('classroom_id', classroomIds)
          .eq('date', yesterday),
      ]);

      const calcRate = (rows: { status: string }[] | null) => {
        if (!rows || rows.length === 0) return 0;
        const present = rows.filter((r) => r.status === 'present' || r.status === 'late').length;
        return Math.round((present / rows.length) * 100);
      };

      // Step 3 — approximate at-risk: students absent on both today AND yesterday
      const todayAbsent = new Set(
        (todayRes.data ?? []).filter((r) => r.status === 'absent').map((r) => r.student_id),
      );
      const yestAbsent = new Set(
        (yesterdayRes.data ?? []).filter((r) => r.status === 'absent').map((r) => r.student_id),
      );
      const atRiskCount = [...todayAbsent].filter((id) => yestAbsent.has(id)).length;

      return {
        todayRate: calcRate(todayRes.data),
        yesterdayRate: calcRate(yesterdayRes.data),
        atRiskCount,
      };
    } catch (e) {
      console.error('[staffManagement] getStudentAttendancePulse unexpected:', e);
      return empty;
    }
  },

  /**
   * Returns the next N upcoming events from the institutional calendar.
   */
  async getUpcomingCalendarEvents(schoolId: string, limit = 5): Promise<CalendarEvent[]> {
    try {
      const { data, error } = await supabase
        .from('institutional_calendar')
        .select('*')
        .eq('school_id', schoolId)
        .gte('start_date', todayISO())
        .order('start_date', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('[staffManagement] getUpcomingCalendarEvents:', error.message);
        return [];
      }
      return data ?? [];
    } catch (e) {
      console.error('[staffManagement] getUpcomingCalendarEvents unexpected:', e);
      return [];
    }
  },

  /**
   * Creates a new institutional calendar event.
   */
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
      const { error } = await supabase.from('institutional_calendar').insert({
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
    } catch (e) {
      console.error('[staffManagement] createCalendarEvent unexpected:', e);
      return false;
    }
  },

  /**
   * Returns a detailed attendance report for a school or specific classroom over a date range.
   */
  async getAttendanceReport(
    schoolId: string,
    startDate: string,
    endDate: string,
    classroomId?: string,
  ): Promise<AttendanceReport> {
    const empty: AttendanceReport = { trend: [], overallRate: 0, totalAbsences: 0 };
    try {
      let classroomIds: string[] = [];

      if (classroomId) {
        classroomIds = [classroomId];
      } else {
        // 1. Get classroom IDs for this school
        const { data: classrooms, error: classErr } = await supabase
          .from('classrooms')
          .select('id')
          .eq('school_id', schoolId);

        if (classErr || !classrooms || classrooms.length === 0) return empty;
        classroomIds = classrooms.map((c) => c.id);
      }

      // 2. Fetch all attendance records in range
      const { data: records, error: attErr } = await supabase
        .from('attendance')
        .select('status, date')
        .in('classroom_id', classroomIds)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (attErr || !records) {
        console.error('[staffManagement] getAttendanceReport:', attErr?.message);
        return empty;
      }

      // 3. Aggregate results by day
      const dailyMap = new Map<string, AttendanceTrendPoint>();
      records.forEach((r) => {
        if (!dailyMap.has(r.date)) {
          dailyMap.set(r.date, {
            date: r.date,
            presentCount: 0,
            absentCount: 0,
            lateCount: 0,
            totalCount: 0,
            rate: 0,
          });
        }
        const point = dailyMap.get(r.date)!;
        point.totalCount++;
        if (r.status === 'present') point.presentCount++;
        else if (r.status === 'absent') point.absentCount++;
        else if (r.status === 'late') point.lateCount++;
      });

      const trend: AttendanceTrendPoint[] = [];
      let totalPresent = 0;
      let totalLate = 0;
      let totalAbsents = 0;
      let totalRecords = 0;

      dailyMap.forEach((p) => {
        // Count 'late' as present — consistent with getStudentAttendancePulse
        p.rate = p.totalCount > 0
          ? Math.round(((p.presentCount + p.lateCount) / p.totalCount) * 100)
          : 0;
        trend.push(p);
        totalPresent += p.presentCount;
        totalLate += p.lateCount;
        totalAbsents += p.absentCount;
        totalRecords += p.totalCount;
      });

      return {
        trend: trend.sort((a, b) => a.date.localeCompare(b.date)),
        overallRate: totalRecords > 0
          ? Math.round(((totalPresent + totalLate) / totalRecords) * 100)
          : 0,
        totalAbsences: totalAbsents,
      };
    } catch (e) {
      console.error('[staffManagement] getAttendanceReport unexpected:', e);
      return empty;
    }
  },
};
