import { useQuery } from '@tanstack/react-query';
import { studentsAPI, usePermissions } from '@repo/core';

/**
 * useStudentAcademicHistory - Sovereign hook to fetch academic history.
 * Aggregates records across all bonds using the Union of Identity.
 */
export const useStudentAcademicHistory = (studentId?: string) => {
  const { ability } = usePermissions();

  return useQuery({
    queryKey: ['student-academic-history', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      return studentsAPI.getHistoricalAcademicRecords(studentId);
    },
    enabled: !!studentId && ability.can('read', 'AcademicHistory'),
  });
};
