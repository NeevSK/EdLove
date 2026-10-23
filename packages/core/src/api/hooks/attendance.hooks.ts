/**
 * @file packages/core/src/api/hooks/attendance.hooks.ts
 * Sovereign TanStack Query v5 hooks bound to native oRPC v2 Attendance contracts.
 */

import { orpc } from '../orpcClient';
import type { QueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

export function useAttendanceByClassroomQuery(gradeClassId?: string, date?: string) {
  return useQuery<any[]>({
    ...orpc.attendance.getByClassroom.queryOptions({
      input: {
        query: {
          gradeClassId: gradeClassId || '00000000-0000-0000-0000-000000000000',
          ...(date ? { date } : {}),
        },
      },
    }),
    enabled: Boolean(gradeClassId),
    staleTime: 30 * 1000,
  });
}

export function useAttendanceRosterQuery(gradeClassId?: string) {
  return useQuery<any[]>({
    ...orpc.attendance.getGradeClassRoster.queryOptions({
      input: {
        query: {
          gradeClassId: gradeClassId || '00000000-0000-0000-0000-000000000000',
        },
      },
    }),
    enabled: Boolean(gradeClassId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAttendanceSchoolPulseQuery(schoolId?: string, gradeClassId?: string, viewDate?: string) {
  return useQuery<any>({
    ...orpc.attendance.getSchoolPulse.queryOptions({
      input: {
        query: {
          schoolId: schoolId || '00000000-0000-0000-0000-000000000000',
          ...(gradeClassId ? { gradeClassId } : {}),
          ...(viewDate ? { viewDate } : {}),
        },
      },
    }),
    enabled: Boolean(schoolId),
    staleTime: 60 * 1000,
  });
}

/**
 * useMyGradeClassesQuery — Grade classes manageable by the authenticated user.
 */
export function useMyGradeClassesQuery() {
  return useQuery<any[]>({
    ...orpc.attendance.getMyGradeClasses.queryOptions({ input: undefined }),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * useGradeClassRegisterQuery — Combined roster + snapshot query for a grade class.
 */
export function useGradeClassRegisterQuery(gradeClassId?: string, date?: string) {
  return useQuery({
    queryKey: ['attendance', 'register', gradeClassId, date],
    queryFn: async () => {
      if (!gradeClassId) throw new Error('gradeClassId is required');
      const [roster, snapshot] = await Promise.all([
        orpc.attendance.getGradeClassRoster.call({ input: { query: { gradeClassId, date } } }),
        orpc.attendance.getByClassroom.call({ input: { query: { gradeClassId, date } } }),
      ]);
      return { roster, snapshot };
    },
    enabled: Boolean(gradeClassId),
    staleTime: 60 * 1000,
  });
}

/**
 * Atomic invalidation for attendance queries.
 */
export async function invalidateAttendanceQueries(queryClient: QueryClient, gradeClassId?: string) {
  await queryClient.invalidateQueries({ queryKey: ['attendance'] });
  if (gradeClassId) {
    await queryClient.invalidateQueries({
      queryKey: orpc.attendance.getByClassroom.key({
        input: { query: { gradeClassId } },
      }),
    });
    await queryClient.invalidateQueries({
      queryKey: orpc.attendance.getGradeClassRoster.key({
        input: { query: { gradeClassId } },
      }),
    });
  } else {
    await queryClient.invalidateQueries({
      queryKey: orpc.attendance.getByClassroom.key(),
    });
    await queryClient.invalidateQueries({
      queryKey: orpc.attendance.getSchoolPulse.key(),
    });
  }
}

