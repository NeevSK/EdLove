import type { AttendanceProjectionRepository } from '@repo/core/logic/domains/attendanceProjection/ports';
import {
  type AttendanceReport,
  AttendanceReportSchema,
  type AttendanceTrendPoint,
  type SchoolAttendancePulse,
  SchoolAttendancePulseSchema,
} from '@repo/core/logic/schemas/attendance.schema';
import type { SupabaseClient } from '@supabase/supabase-js';

function formatLocalDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayISO(): string {
  return formatLocalDateISO(new Date());
}
async function resolveClassroomIds(
  supabase: SupabaseClient,
  schoolId: string,
  classroomId?: string,
): Promise<string[]> {
  if (classroomId) return [classroomId];

  const { data, error } = await supabase.from('classrooms').select('id').eq('school_id', schoolId);

  if (error || !data || data.length === 0) return [];
  return data.map((row) => row.id);
}

export const createSupabaseAttendanceProjectionRepository = (
  supabase: SupabaseClient,
): AttendanceProjectionRepository => ({
  async getSchoolAttendancePulse(
    schoolId: string,
    classroomId?: string,
    viewDate?: string,
  ): Promise<SchoolAttendancePulse> {
    const empty: SchoolAttendancePulse = {
      todayRate: 0,
      yesterdayRate: 0,
      atRiskCount: 0,
    };

    try {
      const targetDate = viewDate || todayISO();
      const relativeYesterdayDate = new Date(targetDate);
      relativeYesterdayDate.setDate(relativeYesterdayDate.getDate() - 1);
      const relativeYesterday = formatLocalDateISO(relativeYesterdayDate);

      const classroomIds = await resolveClassroomIds(supabase, schoolId, classroomId);
      if (classroomIds.length === 0) return empty;

      const [todayRes, yesterdayRes] = await Promise.all([
        supabase
          .from('attendance')
          .select('status, student_id')
          .in('classroom_id', classroomIds)
          .eq('date', targetDate),
        supabase
          .from('attendance')
          .select('status, student_id')
          .in('classroom_id', classroomIds)
          .eq('date', relativeYesterday),
      ]);

      const calcRate = (rows: { status: string }[] | null) => {
        if (!rows || rows.length === 0) return 0;
        const present = rows.filter(
          (row) => row.status === 'present' || row.status === 'late',
        ).length;
        return Math.round((present / rows.length) * 100);
      };

      const todayAbsent = new Set(
        (todayRes.data ?? []).filter((row) => row.status === 'absent').map((row) => row.student_id),
      );
      const yesterdayAbsent = new Set(
        (yesterdayRes.data ?? [])
          .filter((row) => row.status === 'absent')
          .map((row) => row.student_id),
      );

      return SchoolAttendancePulseSchema.parse({
        todayRate: calcRate(todayRes.data),
        yesterdayRate: calcRate(yesterdayRes.data),
        atRiskCount: [...todayAbsent].filter((id) => yesterdayAbsent.has(id)).length,
      });
    } catch (error) {
      console.error('[attendanceProjection] getSchoolAttendancePulse unexpected:', error);
      return empty;
    }
  },

  async getAttendanceReport(
    schoolId: string,
    startDate: string,
    endDate: string,
    classroomId?: string,
  ): Promise<AttendanceReport> {
    const empty: AttendanceReport = {
      trend: [],
      overallRate: 0,
      totalAbsences: 0,
    };

    try {
      const classroomIds = await resolveClassroomIds(supabase, schoolId, classroomId);
      if (classroomIds.length === 0) return empty;

      const { data: records, error } = await supabase
        .from('attendance')
        .select('status, date')
        .in('classroom_id', classroomIds)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error || !records) {
        console.error('[attendanceProjection] getAttendanceReport:', error?.message);
        return empty;
      }

      const dailyMap = new Map<string, AttendanceTrendPoint>();
      records.forEach((record) => {
        if (!dailyMap.has(record.date)) {
          dailyMap.set(record.date, {
            date: record.date,
            presentCount: 0,
            absentCount: 0,
            lateCount: 0,
            totalCount: 0,
            rate: 0,
          });
        }

        const point = dailyMap.get(record.date)!;
        point.totalCount += 1;
        if (record.status === 'present') point.presentCount += 1;
        else if (record.status === 'absent') point.absentCount += 1;
        else if (record.status === 'late') point.lateCount += 1;
      });

      const trend: AttendanceTrendPoint[] = [];
      let totalPresent = 0;
      let totalLate = 0;
      let totalAbsences = 0;
      let totalCount = 0;

      dailyMap.forEach((point) => {
        point.rate =
          point.totalCount > 0
            ? Math.round(((point.presentCount + point.lateCount) / point.totalCount) * 100)
            : 0;

        trend.push(point);
        totalPresent += point.presentCount;
        totalLate += point.lateCount;
        totalAbsences += point.absentCount;
        totalCount += point.totalCount;
      });

      return AttendanceReportSchema.parse({
        trend: trend.sort((left, right) => left.date.localeCompare(right.date)),
        overallRate:
          totalCount > 0 ? Math.round(((totalPresent + totalLate) / totalCount) * 100) : 0,
        totalAbsences,
      });
    } catch (error) {
      console.error('[attendanceProjection] getAttendanceReport unexpected:', error);
      return empty;
    }
  },
});
