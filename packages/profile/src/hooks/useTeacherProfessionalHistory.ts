import { studentsAPI, usePermissions } from '@repo/core';
import { useQuery } from '@tanstack/react-query';

/**
 * useTeacherProfessionalHistory - Sovereign hook to fetch professional history.
 * Aggregates records across all bonds using the Union of Identity.
 */
export const useTeacherProfessionalHistory = (teacherId?: string) => {
  const { can } = usePermissions();

  return useQuery({
    queryKey: ['teacher-professional-history', teacherId],
    queryFn: async () => {
      if (!teacherId) return [];
      return studentsAPI.getHistoricalProfessionalRecords(teacherId);
    },
    enabled: !!teacherId && can('read', 'TeacherProfile'),
  });
};
