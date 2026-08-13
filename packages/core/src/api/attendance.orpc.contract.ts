import { z } from 'zod';

const status = z.enum(['present', 'absent', 'late', 'excused']);
const sessionKind = z.enum(['lesson', 'arrival', 'departure']);

const sessionInput = z.strictObject({
  sessionKind: sessionKind.optional(),
  sessionAt: z.string().datetime().optional(),
  teacherId: z.string().uuid().nullable().optional(),
  subjectId: z.string().uuid().nullable().optional(),
  termId: z.string().uuid().nullable().optional(),
});

const recordInput = z.strictObject({
  gradeClassId: z.string().uuid(),
  studentId: z.string().uuid(),
  status,
  date: z.string(),
}).merge(sessionInput);

const attendanceRead = { policy: { action: 'read', subject: 'DailyAttendance' } } as const;
const attendanceWrite = { policy: { action: 'create', subject: 'DailyAttendance' } } as const;

export const attendanceORPCContract = {
  getByClassroom: {
    method: 'get',
    path: '/attendance/classroom',
    request: {
      query: z.strictObject({
        gradeClassId: z.string().uuid(),
        date: z.string().optional(),
      }),
    },
    metadata: attendanceRead,
  },
  record: {
    method: 'post',
    path: '/attendance/record',
    request: { body: recordInput },
    metadata: attendanceWrite,
  },
  batchRecord: {
    method: 'post',
    path: '/attendance/batch-record',
    request: { body: z.array(recordInput).min(1).max(500) },
    metadata: attendanceWrite,
  },
  getSchoolPulse: {
    method: 'get',
    path: '/attendance/school-pulse',
    request: {
      query: z.strictObject({
        schoolId: z.string().uuid(),
        gradeClassId: z.string().uuid().optional(),
        viewDate: z.string().optional(),
      }),
    },
    metadata: attendanceRead,
  },
  getReport: {
    method: 'get',
    path: '/attendance/report',
    request: {
      query: z.strictObject({
        schoolId: z.string().uuid(),
        startDate: z.string(),
        endDate: z.string(),
        gradeClassId: z.string().uuid().optional(),
      }),
    },
    metadata: attendanceRead,
  },
};
