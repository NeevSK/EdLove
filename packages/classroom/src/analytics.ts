import type { StudentAttendancePulse } from '@repo/core';
import { staffManagementAPI } from '@repo/core/api';

export type { StudentAttendancePulse };

export const classroomAnalyticsAPI = {
  async getStudentAttendancePulse(
    schoolId: string,
    classroomId?: string,
    viewDate?: string,
  ): Promise<StudentAttendancePulse> {
    return staffManagementAPI.getStudentAttendancePulse(schoolId, classroomId, viewDate);
  },
};
