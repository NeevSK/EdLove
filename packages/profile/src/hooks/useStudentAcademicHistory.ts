import { studentsAPI } from '@repo/core/api/client';
import { usePermissions } from '@repo/core/logic';
import { useQuery } from '@tanstack/react-query';

/**
 * useStudentAcademicHistory - Sovereign hook to fetch academic history.
 * Aggregates records across all bonds using the Union of Identity.
 */
export const useStudentAcademicHistory = (studentId?: string) => {
  const { can } = usePermissions();

  return useQuery({
    queryKey: ['student-academic-history', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      return studentsAPI.getHistoricalAcademicRecords(studentId);
    },
    enabled: !!studentId && can('read', 'AcademicHistory'),
  });
};

export function invalidateStudentAcademicHistory(queryClient: any, studentId?: string) {
  if (studentId) {
    return queryClient.invalidateQueries({
      queryKey: ['student-academic-history', studentId],
    });
  }
  return queryClient.invalidateQueries({
    queryKey: ['student-academic-history'],
  });
}

