import { z } from 'zod';

const status = z.enum(['present', 'absent', 'late', 'excused']);
const sessionKind = z.enum(['lesson', 'arrival', 'departure']);

const attendance = z.object({
  id: z.string().uuid(),
  student_id: z.string().uuid(),
  grade_class_id: z.string().uuid(),
  status,
  attendance_date: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  student_name: z.string().nullable(),
  student_avatar_url: z.string().nullable(),
  sessions: z.array(
    z.object({
      id: z.string().uuid(),
      session_kind: sessionKind,
      session_at: z.string(),
      status,
      teacher_id: z.string().uuid().nullable(),
      subject_id: z.string().uuid().nullable(),
      term_id: z.string().uuid().nullable(),
    }),
  ),
});

const sessionInput = z.strictObject({
  sessionKind: sessionKind.optional(),
  sessionAt: z.string().datetime().optional(),
  teacherId: z.string().uuid().nullable().optional(),
  subjectId: z.string().uuid().nullable().optional(),
  termId: z.string().uuid().nullable().optional(),
});

const recordInput = z
  .strictObject({
    gradeClassId: z.string().uuid(),
    studentId: z.string().uuid(),
    status,
    date: z.string(),
  })
  .merge(sessionInput);

const rosterStudent = z.object({
  enrollment_id: z.string().uuid(),
  student_id: z.string().uuid(),
  full_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
});

const gradeClassSummary = z.object({
  id: z.string().uuid(),
  name: z.string(),
  academic_cycle_id: z.string().uuid(),
  role: z.string().nullable(),
});

const attendanceRead = { policy: { action: 'read', subject: 'DailyAttendance' } } as const;
// Listing the caller's own grade classes is school-scoped; the handler filters to the caller.
const ownSchoolRead = { policy: { action: 'read', subject: 'School' } } as const;
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
    responses: { 200: { schema: z.array(attendance), description: 'Classroom attendance' } },
    metadata: attendanceRead,
  },
  record: {
    method: 'post',
    path: '/attendance/record',
    request: { body: recordInput },
    metadata: attendanceWrite,
    responses: { 201: { schema: attendance, description: 'Recorded attendance' } },
  },
  batchRecord: {
    method: 'post',
    path: '/attendance/batch-record',
    request: { body: z.array(recordInput).min(1).max(500) },
    metadata: attendanceWrite,
    responses: { 201: { schema: z.array(attendance), description: 'Recorded attendance batch' } },
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
    responses: {
      200: {
        schema: z.object({
          todayRate: z.number(),
          yesterdayRate: z.number(),
          atRiskCount: z.number().int().nonnegative(),
        }),
        description: 'School attendance pulse',
      },
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
    responses: {
      200: {
        schema: z.object({
          trend: z.array(
            z.object({
              date: z.string(),
              presentCount: z.number(),
              absentCount: z.number(),
              lateCount: z.number(),
              totalCount: z.number(),
              rate: z.number(),
            }),
          ),
          overallRate: z.number(),
          totalAbsences: z.number(),
        }),
        description: 'Attendance report',
      },
    },
    metadata: attendanceRead,
  },
  getGradeClassRoster: {
    method: 'get',
    path: '/attendance/grade-class-roster',
    request: {
      query: z.strictObject({
        gradeClassId: z.string().uuid(),
        date: z.string().optional(),
      }),
    },
    responses: {
      200: { schema: z.array(rosterStudent), description: 'Active grade class enrollments' },
    },
    metadata: attendanceRead,
  },
  getMyGradeClasses: {
    method: 'get',
    path: '/attendance/my-grade-classes',
    request: {},
    responses: {
      200: { schema: z.array(gradeClassSummary), description: 'Grade classes the caller may mark' },
    },
    metadata: ownSchoolRead,
  },
};
