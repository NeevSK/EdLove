import type {
  StaffLeaveDTO,
  StaffPresenceSummary,
  StudentAttendancePulse,
  TeacherCarouselItem,
} from '@repo/core';
import { staffManagementAPI } from '@repo/core/api';
import { supabase } from '@repo/core/native';

export type { StaffLeaveDTO, StaffPresenceSummary, StudentAttendancePulse, TeacherCarouselItem };

export interface StudentPrincipalPulse extends StudentAttendancePulse {
  submissionRate: number | null;
  pendingEnrollments: number;
}

function getWeekStartISO(): string {
  const date = new Date();
  const day = date.getDay();
  const diff = day === 0 ? 6 : day - 1;
  date.setDate(date.getDate() - diff);
  return date.toISOString().split('T')[0] ?? '';
}

async function getSubmissionRate(schoolId: string, classroomId?: string): Promise<number | null> {
  const weekStart = getWeekStartISO();
  let assignmentsQuery = supabase
    .from('assignments')
    .select('id')
    .eq('school_id', schoolId)
    .gte('created_at', weekStart);

  if (classroomId) {
    assignmentsQuery = assignmentsQuery.eq('classroom_id', classroomId);
  }

  const { data: assignments, error: assignmentsError } = await assignmentsQuery;
  if (assignmentsError) throw assignmentsError;

  const assignmentIds = (assignments ?? []).map((a) => a.id);
  if (assignmentIds.length === 0) return null;

  const { data: submissions, error: submissionsError } = await supabase
    .from('submissions')
    .select('assignment_id')
    .in('assignment_id', assignmentIds);

  if (submissionsError) throw submissionsError;

  const distinctSubmitted = new Set((submissions ?? []).map((s) => s.assignment_id));
  return Math.round((distinctSubmitted.size / assignmentIds.length) * 100);
}

async function getPendingEnrollments(schoolId: string, classroomId?: string): Promise<number> {
  if (classroomId) return 0;

  const { count, error } = await supabase
    .from('enrollment_requests')
    .select('id', { count: 'exact' })
    .eq('school_id', schoolId)
    .eq('status', 'pending');

  if (error) throw error;
  return count ?? 0;
}

export const staffOperationsAPI = {
  ...staffManagementAPI,
  async getStudentPrincipalPulse(
    schoolId: string,
    classroomId?: string,
  ): Promise<StudentPrincipalPulse> {
    const [attendancePulse, submissionRate, pendingEnrollments] = await Promise.all([
      staffManagementAPI.getStudentAttendancePulse(schoolId, classroomId),
      getSubmissionRate(schoolId, classroomId),
      getPendingEnrollments(schoolId, classroomId),
    ]);

    return {
      ...attendancePulse,
      submissionRate,
      pendingEnrollments,
    };
  },
};
