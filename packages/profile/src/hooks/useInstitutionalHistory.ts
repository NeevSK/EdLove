import { studentsAPI } from '@repo/core/api/client';
import type { ClassroomLegacyRecord, SchoolLegacyRecord } from '@repo/core/logic';
import { useQuery } from '@tanstack/react-query';

export function useSchoolLegacyHistory(schoolId?: string) {
  return useQuery({
    queryKey: ['school-legacy-history', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const records = await studentsAPI.getSchoolLegacyHistory(schoolId);
      return records as SchoolLegacyRecord[];
    },
    enabled: !!schoolId,
  });
}

export function useClassroomLegacyHistory(classroomId?: string) {
  return useQuery({
    queryKey: ['classroom-legacy-history', classroomId],
    queryFn: async () => {
      if (!classroomId) return [];
      const records = await studentsAPI.getClassroomLegacyHistory(classroomId);
      return records as ClassroomLegacyRecord[];
    },
    enabled: !!classroomId,
  });
}
