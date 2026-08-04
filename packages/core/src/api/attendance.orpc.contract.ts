import { z } from 'zod';

export const attendanceORPCContract = {
  getByClassroom: {
    method: 'get',
    path: '/attendance/classroom',
    request: {
      query: z.object({
        classroomId: z.string().uuid(),
        date: z.string(),
      }),
    },
  },
  record: {
    method: 'post',
    path: '/attendance/record',
    request: {
      body: z.object({
        classroomId: z.string().uuid(),
        studentId: z.string().uuid(),
        status: z.enum(['present', 'absent', 'late', 'excused']),
        date: z.string(),
      }),
    },
  },
  batchRecord: {
    method: 'post',
    path: '/attendance/batch-record',
  },
  getSchoolPulse: {
    method: 'get',
    path: '/attendance/school-pulse',
  },
  getReport: {
    method: 'get',
    path: '/attendance/report',
  },
};
