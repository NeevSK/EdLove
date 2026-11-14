import { SafeZustandStorage } from '@repo/core/storage-wrapper';
import { useQuery } from '@tanstack/react-query';

const GRADES_CACHE_KEY = 'gurudevi-grades-cache';

export interface GradeRow {
  id: string;
  grade: number;
  feedback: string | null;
  submitted_at: string;
  assignments: { title: string } | null;
  classrooms: { name: string } | null;
}

/**
 * A student's grades, read from the device cache. The retired assignment API isn't admitted by
 * the current foundation, so the cache is the only source until a v1 query exists; then the
 * `queryFn` changes and every caller keeps working.
 */
export function useStudentGrades(studentId?: string) {
  const grades = useQuery({
    queryKey: ['self', 'grades', studentId],
    queryFn: async (): Promise<GradeRow[]> => {
      const cached = await SafeZustandStorage.getItem(`${GRADES_CACHE_KEY}-${studentId}`);
      return cached ? (JSON.parse(cached) as GradeRow[]) : [];
    },
    enabled: Boolean(studentId),
    // Device storage: never waits for the network.
    networkMode: 'always',
  });

  return {
    grades: grades.data ?? [],
    isLoading: Boolean(studentId) && grades.isPending,
    error: grades.isError ? 'Grades could not be loaded.' : null,
    refreshData: grades.refetch,
  };
}
