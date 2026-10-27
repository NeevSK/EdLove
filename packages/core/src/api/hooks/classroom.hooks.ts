import { assignmentsAPI } from '@repo/core/api/orchestration/educational';
import { classroomsAPI } from '@repo/core/api/orchestration/educational';
import { orpc } from '@repo/core/api/orpcClient';
import { resolveSandboxMode } from '@repo/core/api/sandboxMode';
import type {
  Classroom,
  StudentAssignment,
  StudentStats,
} from '@repo/core/logic/schemas/classroom.schema';
import { type QueryClient, useQuery } from '@tanstack/react-query';

/**
 * useTeacherClassroomsQuery — Fetch all sanctuaries managed by a teacher.
 * Powered by typed oRPC v2 contracts with deterministic cache keys and resonant proxy sandbox resilience.
 */
export function useTeacherClassroomsQuery(teacherId?: string) {
  const mode = resolveSandboxMode();
  const isSandbox = mode === 'demo' || mode === 'ghost';
  const effectiveId = teacherId || (isSandbox ? 'demo-teacher' : '');

  return useQuery<Classroom[]>({
    queryKey: orpc.educational.getByTeacher.queryKey({
      input: { query: { teacher_id: effectiveId } },
    }),
    queryFn: () => classroomsAPI.getByTeacher(effectiveId) as Promise<Classroom[]>,
    select: (res: any) => (Array.isArray(res) ? res : []),
    enabled: Boolean(teacherId) || isSandbox,
  });
}

/**
 * useStudentClassroomsQuery — Fetch all sanctuaries joined by a student.
 */
export function useStudentClassroomsQuery(studentId?: string) {
  const mode = resolveSandboxMode();
  const isSandbox = mode === 'demo' || mode === 'ghost';
  const effectiveId = studentId || (isSandbox ? 'demo-student' : '');

  return useQuery<Classroom[]>({
    queryKey: orpc.educational.getByStudent.queryKey({
      input: { query: { student_id: effectiveId } },
    }),
    queryFn: () => classroomsAPI.getByStudent(effectiveId) as Promise<Classroom[]>,
    select: (res: any) => (Array.isArray(res) ? res : []),
    enabled: Boolean(studentId) || isSandbox,
  });
}

/**
 * useTeacherStatsQuery — Aggregate stats for a teacher's dashboard.
 */
export function useTeacherStatsQuery(teacherId?: string) {
  const mode = resolveSandboxMode();
  const isSandbox = mode === 'demo' || mode === 'ghost';
  const effectiveId = teacherId || (isSandbox ? 'demo-teacher' : '');

  return useQuery({
    queryKey: orpc.educational.getTeacherStats.queryKey({
      input: { params: { id: effectiveId } },
    }),
    queryFn: () => classroomsAPI.getTeacherStats(effectiveId),
    enabled: Boolean(teacherId) || isSandbox,
  });
}

/**
 * useStudentAssignmentsQuery — Fetch upcoming quests for a student.
 */
export function useStudentAssignmentsQuery(studentId?: string) {
  const mode = resolveSandboxMode();
  const isSandbox = mode === 'demo' || mode === 'ghost';
  const effectiveId = studentId || (isSandbox ? 'demo-student' : '');

  return useQuery<StudentAssignment[]>({
    queryKey: orpc.educational.getUpcomingAssignments.queryKey({
      input: { params: { studentId: effectiveId } },
    }),
    queryFn: () => assignmentsAPI.getUpcomingForStudent(effectiveId) as Promise<StudentAssignment[]>,
    select: (res: any) => (Array.isArray(res) ? res : []),
    enabled: Boolean(studentId) || isSandbox,
  });
}

/**
 * useStudentStatsQuery — Fetch student submissions & assignment progress.
 */
export function useStudentStatsQuery(studentId?: string) {
  const mode = resolveSandboxMode();
  const isSandbox = mode === 'demo' || mode === 'ghost';
  const effectiveId = studentId || (isSandbox ? 'demo-student' : '');

  return useQuery<StudentStats>({
    queryKey: orpc.educational.getStudentSubmissions.queryKey({
      input: { params: { studentId: effectiveId } },
    }),
    queryFn: async () => {
      const submissions = await assignmentsAPI.getSubmissionHistoryForStudent(effectiveId);
      return {
        active_sanctuaries: 0,
        goals_set: 0,
        growth_points: 0,
        submissions_count: Array.isArray(submissions) ? submissions.length : 0,
      };
    },
    enabled: Boolean(studentId) || isSandbox,
  });
}

/**
 * Atomic Query Invalidation Helpers
 * Leverage oRPC hierarchical query keys to prevent over-invalidation or stale UI state.
 */
export function invalidateTeacherClassroomQueries(queryClient: QueryClient, teacherId?: string) {
  return queryClient.invalidateQueries({
    queryKey: teacherId
      ? orpc.educational.getByTeacher.queryKey({ input: { query: { teacher_id: teacherId } } })
      : orpc.educational.getByTeacher.key(),
  });
}

export function invalidateStudentClassroomQueries(queryClient: QueryClient, studentId?: string) {
  return queryClient.invalidateQueries({
    queryKey: studentId
      ? orpc.educational.getByStudent.queryKey({ input: { query: { student_id: studentId } } })
      : orpc.educational.getByStudent.key(),
  });
}

/**
 * invalidateStudentAssignmentsQuery — Invalidate upcoming student assignments.
 */
export function invalidateStudentAssignmentsQuery(queryClient: QueryClient, studentId?: string) {
  return queryClient.invalidateQueries({
    queryKey: studentId
      ? orpc.educational.getUpcomingAssignments.queryKey({ input: { params: { studentId } } })
      : orpc.educational.getUpcomingAssignments.key(),
  });
}

