/**
 * @file packages/core/src/api/hooks/grading.hooks.ts
 * Sovereign TanStack Query v5 hooks bound to native oRPC v2 Grading contracts.
 */

import { orpc } from '../orpcClient';
import type { QueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

export interface GradebookContext {
  schoolId: string;
  academicCycleId: string;
  gradeClassId: string;
  termId: string;
  subjectId: string;
}

export function useGradebookSnapshotQuery(context?: GradebookContext, viewDate?: string) {
  const effectiveDate = viewDate || new Date().toISOString().split('T')[0]!;
  return useQuery<any>({
    ...orpc.grading.getGradebookSnapshot.queryOptions({
      input: {
        query: {
          schoolId: context?.schoolId || '00000000-0000-0000-0000-000000000000',
          academicCycleId: context?.academicCycleId || '00000000-0000-0000-0000-000000000000',
          gradeClassId: context?.gradeClassId || '00000000-0000-0000-0000-000000000000',
          termId: context?.termId || '00000000-0000-0000-0000-000000000000',
          subjectId: context?.subjectId || '00000000-0000-0000-0000-000000000000',
          viewDate: effectiveDate,
        },
      },
    }),
    enabled: Boolean(
      context?.schoolId &&
      context?.academicCycleId &&
      context?.gradeClassId &&
      context?.termId &&
      context?.subjectId,
    ),
    staleTime: 60 * 1000,
  });
}

export function useClassroomGradesQuery(context?: {
  schoolId: string;
  academicCycleId: string;
  gradeClassId: string;
  termId?: string;
  subjectId?: string;
}) {
  return useQuery<any[]>({
    ...orpc.grading.getClassroomGrades.queryOptions({
      input: {
        query: {
          schoolId: context?.schoolId || '00000000-0000-0000-0000-000000000000',
          academicCycleId: context?.academicCycleId || '00000000-0000-0000-0000-000000000000',
          gradeClassId: context?.gradeClassId || '00000000-0000-0000-0000-000000000000',
          ...(context?.termId ? { termId: context.termId } : {}),
          ...(context?.subjectId ? { subjectId: context.subjectId } : {}),
        },
      },
    }),
    enabled: Boolean(context?.schoolId && context?.academicCycleId && context?.gradeClassId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useReportCardQuery(params?: {
  studentId: string;
  schoolId: string;
  academicCycleId: string;
  termId?: string;
  subjectId?: string;
}) {
  return useQuery<any[]>({
    ...orpc.grading.getReportCard.queryOptions({
      input: {
        query: {
          studentId: params?.studentId || '00000000-0000-0000-0000-000000000000',
          schoolId: params?.schoolId || '00000000-0000-0000-0000-000000000000',
          academicCycleId: params?.academicCycleId || '00000000-0000-0000-0000-000000000000',
          ...(params?.termId ? { termId: params.termId } : {}),
          ...(params?.subjectId ? { subjectId: params.subjectId } : {}),
        },
      },
    }),
    enabled: Boolean(params?.studentId && params?.schoolId && params?.academicCycleId),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Atomic invalidation for grading queries.
 */
export async function invalidateGradingQueries(queryClient: QueryClient) {
  await queryClient.invalidateQueries({
    queryKey: orpc.grading.getGradebookSnapshot.key(),
  });
  await queryClient.invalidateQueries({
    queryKey: orpc.grading.getClassroomGrades.key(),
  });
  await queryClient.invalidateQueries({
    queryKey: orpc.grading.getReportCard.key(),
  });
}
