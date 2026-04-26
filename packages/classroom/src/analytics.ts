import { type StudentAttendancePulse, staffManagementAPI } from '@repo/core';

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
