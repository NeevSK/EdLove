import type { AttendanceReport, SchoolAttendancePulse } from '../../schemas/attendance.schema';

export interface AttendanceProjectionRepository {
  getSchoolAttendancePulse(
    schoolId: string,
    classroomId?: string,
    viewDate?: string,
  ): Promise<SchoolAttendancePulse>;
  getAttendanceReport(
    schoolId: string,
    startDate: string,
    endDate: string,
    classroomId?: string,
  ): Promise<AttendanceReport>;
}
