import { type StudentAttendancePulse, attendanceAPI } from '@repo/core/api';

export type { StudentAttendancePulse };

export const classroomAnalyticsAPI = {
  async getStudentAttendancePulse(
    schoolId: string,
    classroomId?: string,
    viewDate?: string,
  ): Promise<StudentAttendancePulse> {
    return attendanceAPI.getSchoolAttendancePulse(schoolId, classroomId, viewDate);
  },
};
