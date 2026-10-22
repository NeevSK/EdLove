import { z } from 'zod';

const status = z.enum(['present', 'absent', 'late', 'excused']);
const sessionKind = z.enum(['lesson', 'arrival', 'departure']);

const attendance = z.object({
  id: z.uuid(),
  student_id: z.uuid(),
  grade_class_id: z.uuid(),
  status,
  attendance_date: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  student_name: z.string().nullable(),
  student_avatar_url: z.string().nullable(),
  sessions: z.array(
    z.object({
      id: z.uuid(),
      session_kind: sessionKind,
      session_at: z.string(),
      status,
      teacher_id: z.uuid().nullable(),
      subject_id: z.uuid().nullable(),
      term_id: z.uuid().nullable(),
    }),
  ),
});

const sessionInput = z.strictObject({
  sessionKind: sessionKind.optional(),
  sessionAt: z.iso.datetime().optional(),
  teacherId: z.uuid().nullable().optional(),
  subjectId: z.uuid().nullable().optional(),
  termId: z.uuid().nullable().optional(),
});

const recordInput = z
  .strictObject({
    gradeClassId: z.uuid(),
    studentId: z.uuid(),
    status,
    date: z.string(),
  })
  .merge(sessionInput);

const rosterStudent = z.object({
  enrollment_id: z.uuid(),
  student_id: z.uuid(),
  full_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
});

const gradeClassSummary = z.object({
  id: z.uuid(),
  name: z.string(),
  academic_cycle_id: z.uuid(),
  role: z.string().nullable(),
});

const teachingGroupKind = z.enum(['homeroom', 'subject', 'cohort']);

const classroomLink = z.object({
  grade_class_id: z.uuid(),
  name: z.string(),
  academic_cycle_id: z.uuid(),
});

const attendanceRead = { policy: { action: 'read', subject: 'DailyAttendance' } } as const;
// Listing the caller's own grade classes is school-scoped; the handler filters to the caller.
const ownSchoolRead = { policy: { action: 'read', subject: 'School' } } as const;
const attendanceWrite = { policy: { action: 'create', subject: 'DailyAttendance' } } as const;
const classroomRead = { policy: { action: 'read', subject: 'Classroom' } } as const;
const classroomUpdate = { policy: { action: 'update', subject: 'Classroom' } } as const;

export const attendanceORPCContract = {
  getByClassroom: {
    method: 'get',
    path: '/attendance/classroom',
    request: {
      query: z.strictObject({
        gradeClassId: z.uuid(),
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
        schoolId: z.uuid(),
        gradeClassId: z.uuid().optional(),
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
        schoolId: z.uuid(),
        startDate: z.string(),
        endDate: z.string(),
        gradeClassId: z.uuid().optional(),
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
        gradeClassId: z.uuid(),
        date: z.string().optional(),
      }),
    },
    responses: {
      200: { schema: z.array(rosterStudent), description: 'Active grade class enrollments' },
    },
    metadata: attendanceRead,
  },
  /**
   * One student's attendance across days, newest first. Who may read it, and how much, is
   * decided per school (schools.student_history_access); see the handler. `gradeClassId`
   * is the class the caller views the student through (teachers must send one of their
   * classes); it is authority context, not a filter.
   */
  getStudentHistory: {
    method: 'get',
    path: '/attendance/student-history',
    request: {
      query: z.strictObject({
        studentId: z.uuid(),
        gradeClassId: z.uuid().optional(),
        from: z.iso.date().optional(),
        to: z.iso.date().optional(),
        limit: z.coerce.number().int().min(1).max(500).optional(),
      }),
    },
    responses: {
      200: {
        schema: z.array(attendance),
        description: 'Attendance history the caller may see for this student',
      },
    },
    metadata: attendanceRead,
  },
  /**
   * #149 teaching-group links: the grade classes a (legacy) classroom explicitly
   * teaches. Clients use these before any name matching, and show the class picker when
   * there is no single answer.
   */
  getClassroomLinks: {
    method: 'get',
    path: '/attendance/classroom-links',
    request: { query: z.strictObject({ classroomId: z.uuid() }) },
    responses: {
      200: {
        schema: z.array(classroomLink),
        description: 'Active grade classes linked to the classroom',
      },
    },
    metadata: classroomRead,
  },
  /**
   * Link a classroom to a grade class of the same school. An unclassified classroom must
   * be given a `kind` first (here or already set); a homeroom links to exactly one
   * grade class. Idempotent.
   */
  linkClassroom: {
    method: 'post',
    path: '/attendance/classroom-links',
    request: {
      body: z.strictObject({
        classroomId: z.uuid(),
        gradeClassId: z.uuid(),
        kind: teachingGroupKind.optional(),
      }),
    },
    responses: {
      200: {
        schema: z.object({
          classroom_id: z.uuid(),
          grade_class_id: z.uuid(),
          kind: teachingGroupKind,
        }),
        description: 'The link (created or already present)',
      },
    },
    metadata: classroomUpdate,
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
  quickMark: {
    method: 'post',
    path: '/attendance/quick-mark',
    request: {
      body: z.strictObject({
        gradeClassId: z.uuid(),
        date: z.string(),
        rawText: z.string().trim().min(1).max(500),
      }),
    },
    metadata: attendanceWrite,
    responses: {
      200: {
        schema: z.object({
          updatedCount: z.number(),
          marks: z.record(z.string(), status),
        }),
        description: 'Quick-marked attendance via text parser',
      },
    },
  },
  submitExcuse: {
    method: 'post',
    path: '/attendance/excuse',
    request: {
      body: z.strictObject({
        studentId: z.uuid(),
        gradeClassId: z.uuid(),
        date: z.string(),
        reason: z.string().trim().min(2).max(500),
      }),
    },
    metadata: attendanceWrite,
    responses: {
      200: {
        schema: z.object({ success: z.boolean() }),
        description: 'Submitted excused absence note',
      },
    },
  },
};
