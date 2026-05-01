import type {
  AttendanceReport,
  AttendanceSnapshot,
  SchoolAttendancePulse,
} from '../logic/schemas/attendance.schema';
import type { AttendanceRecord } from '../types';
import { operationsContract } from './operations.contract';

import { Effect } from "effect";
import * as AttendanceEffect from './attendance.effect';

export type AttendanceAuditContext = {
  actorId?: string;
  reason?: string;
  accessKind?: 'teacher_marking' | 'institutional_read' | 'institutional_export';
  idempotencyKey?: string;
};

/**
 * API methods for Managing Classroom Attendance.
 * Bridged to Effect-TS for High-Fidelity Logic.
 */
export const attendanceAPI = {
  async getByDate(classroomId: string, date: string): Promise<AttendanceRecord[]> {
    const snapshot = await attendanceAPI.getClassroomAttendanceSnapshot(classroomId, date);
    return snapshot.records as AttendanceRecord[];
  },

  async record(
    classroomId: string,
    studentId: string,
    status: string,
    date: string,
    audit?: AttendanceAuditContext,
  ): Promise<AttendanceRecord> {
    return Effect.runPromise(AttendanceEffect.attendanceAPI.record(classroomId, studentId, status, date, audit));
  },

  async batchRecord(
    records: Array<{
      classroom_id: string;
      student_id: string;
      status: string;
      date: string;
      occurred_at?: string;
      academic_cycle_id?: string | null;
    }>,
    audit?: AttendanceAuditContext,
  ): Promise<AttendanceRecord[]> {
    return Effect.runPromise(AttendanceEffect.attendanceAPI.batchRecord(records, audit));
  },

  async getForStudent(studentId: string, classroomId?: string): Promise<AttendanceRecord[]> {
    return attendanceAPI.getStudentAttendanceTimeline(studentId, { classroomId });
  },

  async getClassroomAttendanceSnapshot(
    classroomId: string,
    viewDate: string,
  ): Promise<AttendanceSnapshot> {
    return Effect.runPromise(AttendanceEffect.attendanceAPI.getClassroomAttendanceSnapshot(classroomId, viewDate));
  },

  async getStudentAttendanceTimeline(
    studentId: string,
    options?: {
      classroomId?: string;
      fromDate?: string;
      toDate?: string;
    },
  ): Promise<AttendanceRecord[]> {
    return Effect.runPromise(AttendanceEffect.attendanceAPI.getStudentAttendanceTimeline(studentId, options));
  },

  async getSchoolAttendancePulse(
    schoolId: string,
    classroomId?: string,
    viewDate?: string,
    audit?: AttendanceAuditContext,
  ): Promise<SchoolAttendancePulse> {
    return Effect.runPromise(AttendanceEffect.attendanceAPI.getSchoolAttendancePulse(schoolId, classroomId, viewDate, audit));
  },

  async getAttendanceReport(
    schoolId: string,
    startDate: string,
    endDate: string,
    classroomId?: string,
    audit?: AttendanceAuditContext,
  ): Promise<AttendanceReport> {
    return Effect.runPromise(
      AttendanceEffect.attendanceAPI.getAttendanceReport(
        schoolId,
        startDate,
        endDate,
        classroomId,
        audit,
      ),
    );
  },
};

// Satisfy linter for POA metadata linking
void operationsContract;
