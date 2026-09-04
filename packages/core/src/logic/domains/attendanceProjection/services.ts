import type { AttendanceProjectionRepository } from '@repo/core/logic/domains/attendanceProjection/ports';
import type {
  AttendanceReport,
  SchoolAttendancePulse,
} from '@repo/core/logic/schemas/attendance.schema';

export interface AttendanceProjectionServices {
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

export function createAttendanceProjectionServices(
  repository: AttendanceProjectionRepository,
): AttendanceProjectionServices {
  return {
    getSchoolAttendancePulse: (schoolId, classroomId, viewDate) =>
      repository.getSchoolAttendancePulse(schoolId, classroomId, viewDate),
    getAttendanceReport: (schoolId, startDate, endDate, classroomId) =>
      repository.getAttendanceReport(schoolId, startDate, endDate, classroomId),
  };
}
