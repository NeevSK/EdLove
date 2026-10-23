import { orpc } from '@repo/core/api/orpcClient';
import type {
  Classroom,
  StudentAssignment,
  StudentStats,
} from '@repo/core/logic/schemas/classroom.schema';
import { type QueryClient, useQuery } from '@tanstack/react-query';

/**
 * useTeacherClassroomsQuery — Fetch all sanctuaries managed by a teacher.
 * Powered by typed oRPC v2 contracts with deterministic cache keys.
 */
export function useTeacherClassroomsQuery(teacherId?: string) {
  return useQuery<Classroom[]>({
    ...orpc.educational.getByTeacher.queryOptions({
      input: { query: { teacher_id: teacherId ?? '' } },
    }),
    select: (res: any) => (Array.isArray(res) ? res : []),
    enabled: Boolean(teacherId),
  });
}

/**
 * useStudentClassroomsQuery — Fetch all sanctuaries joined by a student.
 */
export function useStudentClassroomsQuery(studentId?: string) {
  return useQuery<Classroom[]>({
    ...orpc.educational.getByStudent.queryOptions({
      input: { query: { student_id: studentId ?? '' } },
    }),
    select: (res: any) => (Array.isArray(res) ? res : []),
    enabled: Boolean(studentId),
  });
}

/**
 * useTeacherStatsQuery — Aggregate stats for a teacher's dashboard.
 */
export function useTeacherStatsQuery(teacherId?: string) {
  return useQuery({
    ...orpc.educational.getTeacherStats.queryOptions({
      input: { params: { id: teacherId ?? '' } },
    }),
    enabled: Boolean(teacherId),
  });
}

/**
 * useStudentAssignmentsQuery — Fetch upcoming quests for a student.
 */
export function useStudentAssignmentsQuery(studentId?: string) {
  return useQuery<StudentAssignment[]>({
    ...orpc.educational.getUpcomingAssignments.queryOptions({
      input: { params: { studentId: studentId ?? '' } },
    }),
    select: (res: any) => (Array.isArray(res) ? res : []),
    enabled: Boolean(studentId),
  });
}

/**
 * useStudentStatsQuery — Fetch student submissions & assignment progress.
 */
export function useStudentStatsQuery(studentId?: string) {
  return useQuery<StudentStats>({
    ...orpc.educational.getStudentSubmissions.queryOptions({
      input: { params: { studentId: studentId ?? '' } },
    }),
    select: (submissions: any) => ({
      active_sanctuaries: 0,
      goals_set: 0,
      growth_points: 0,
      submissions_count: Array.isArray(submissions) ? submissions.length : 0,
    }),
    enabled: Boolean(studentId),
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

