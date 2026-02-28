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

export interface StaffLeave {
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
  async getPendingLeaves(schoolId: string): Promise<StaffLeave[]> {
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
      return true;
    } catch (e) {
      console.error('[staffManagement] approveLeave unexpected:', e);
      return false;
    }
  },

  /**
   * Returns school-wide student attendance pulse (today rate, yesterday delta, at-risk count).
   * Derives school scope by first fetching classroom IDs for the school, then filtering
   * attendance by those classroom IDs. At-risk is computed as students whose last 20 attendance
   * records show < 75% present.
   */
  async getStudentAttendancePulse(schoolId: string): Promise<StudentAttendancePulse> {
    const empty: StudentAttendancePulse = { todayRate: 0, yesterdayRate: 0, atRiskCount: 0 };
    try {
      const today = todayISO();
      const yesterday = yesterdayISO();

      // Step 1 — get classroom IDs for this school
      const { data: classrooms, error: classErr } = await supabase
        .from('classrooms')
        .select('id')
        .eq('school_id', schoolId);

      if (classErr || !classrooms || classrooms.length === 0) return empty;
      const classroomIds = classrooms.map((c) => c.id);

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
        const present = rows.filter((r) => r.status === 'present').length;
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
};
