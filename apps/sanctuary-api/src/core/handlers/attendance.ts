import { ORPCError } from '@orpc/server';
import { attendanceORPCContract } from '@repo/core/api/attendance.orpc.contract';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(attendanceORPCContract).$context<ORPCContext>();

type RecordInput = {
  gradeClassId: string;
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  date: string;
  sessionKind?: 'lesson' | 'arrival' | 'departure';
  sessionAt?: string;
  teacherId?: string | null;
  subjectId?: string | null;
  termId?: string | null;
};

const iso = (value: unknown) => new Date(value as string | number | Date).toISOString();

const mapAttendance = (row: any) => ({
  id: String(row.id),
  student_id: String(row.student_id),
  grade_class_id: String(row.grade_class_id),
  status: row.status,
  attendance_date: String(row.attendance_date).slice(0, 10),
  created_at: iso(row.created_at),
  updated_at: iso(row.updated_at ?? row.created_at),
  student_name: row.student?.full_name ?? null,
  student_avatar_url: row.student?.avatar_url ?? null,
  sessions: (row.sessions ?? []).map((session: any) => ({
    id: String(session.id),
    session_kind: session.session_kind,
    session_at: iso(session.session_at),
    status: session.status,
    teacher_id: session.teacher_id ?? null,
    subject_id: session.subject_id ?? null,
    term_id: session.term_id ?? null,
  })),
});

const dailyWhere = (input: { gradeClassId: string; studentId: string; date: string }) => ({
  student_id_grade_class_id_attendance_date: {
    student_id: input.studentId,
    grade_class_id: input.gradeClassId,
    attendance_date: input.date,
  },
});

async function loadDaily(context: ORPCContext, input: RecordInput, db = context.db as any) {
  const gradeClass = await db.gradeClass.findUnique({
    where: { id: input.gradeClassId },
    select: { id: true, school_id: true, academic_cycle_id: true },
  });
  if (!gradeClass) throw new ORPCError('NOT_FOUND', { message: 'Grade class not found' });

  const row = await db.dailyAttendance.upsert({
    where: dailyWhere(input),
    update: { status: input.status, recorded_by: context.user.id },
    create: {
      student_id: input.studentId,
      school_id: gradeClass.school_id,
      academic_cycle_id: gradeClass.academic_cycle_id,
      grade_class_id: input.gradeClassId,
      attendance_date: input.date,
      status: input.status,
      recorded_by: context.user.id,
    },
    include: {
      student: { select: { full_name: true, avatar_url: true } },
      sessions: { orderBy: { session_at: 'asc' } },
    },
  });

  if (input.sessionKind) {
    await db.attendanceSession.create({
      data: {
        daily_attendance_id: row.id,
        school_id: gradeClass.school_id,
        academic_cycle_id: gradeClass.academic_cycle_id,
        grade_class_id: input.gradeClassId,
        term_id: input.termId ?? null,
        student_id: input.studentId,
        teacher_id: input.teacherId ?? null,
        subject_id: input.subjectId ?? null,
        session_kind: input.sessionKind,
        session_at: input.sessionAt ?? `${input.date}T00:00:00.000Z`,
        status: input.status,
        recorded_by: context.user.id,
      },
    });
    return db.dailyAttendance.findUnique({
      where: { id: row.id },
      include: {
        student: { select: { full_name: true, avatar_url: true } },
        sessions: { orderBy: { session_at: 'asc' } },
      },
    });
  }
  return row;
}

export const attendanceRouter = impl.router({
  getByClassroom: impl.getByClassroom
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      const rows = await (context.db as any).dailyAttendance.findMany({
        where: { grade_class_id: input.gradeClassId, attendance_date: input.date || undefined },
        orderBy: [{ attendance_date: 'desc' }, { created_at: 'desc' }],
        include: {
          student: { select: { full_name: true, avatar_url: true } },
          sessions: { orderBy: { session_at: 'asc' } },
        },
      });
      return rows.map(mapAttendance);
    }),
  record: impl.record
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => mapAttendance(await loadDaily(context, input))),
  batchRecord: impl.batchRecord.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    try {
      return await (context.db as any).$transaction(async (tx: any) => {
        const rows = [];
        for (const item of input as RecordInput[])
          rows.push(mapAttendance(await loadDaily(context, item, tx)));
        return rows;
      });
    } catch {
      throw new ORPCError('CONFLICT', { message: 'Attendance batch was not applied' });
    }
  }),
  getSchoolPulse: impl.getSchoolPulse
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      const rows = await (context.db as any).dailyAttendance.findMany({
        where: {
          school_id: input.schoolId,
          grade_class_id: input.gradeClassId || undefined,
          attendance_date: input.viewDate || undefined,
        },
        select: { status: true },
      });
      const present = rows.filter((row: any) => row.status === 'present').length;
      return {
        todayRate: rows.length ? present / rows.length : 0,
        yesterdayRate: 0,
        atRiskCount: rows.filter((row: any) => row.status === 'absent').length,
      };
    }),
  getReport: impl.getReport.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const rows = await (context.db as any).dailyAttendance.findMany({
      where: {
        school_id: input.schoolId,
        grade_class_id: input.gradeClassId || undefined,
        attendance_date: { gte: input.startDate, lte: input.endDate },
      },
      select: { attendance_date: true, status: true },
      orderBy: { attendance_date: 'asc' },
    });
    const byDate = new Map<string, any[]>();
    for (const row of rows) {
      const date = String(row.attendance_date).slice(0, 10);
      byDate.set(date, [...(byDate.get(date) ?? []), row]);
    }
    const trend = [...byDate.entries()].map(([date, values]) => {
      const presentCount = values.filter((row) => row.status === 'present').length;
      const absentCount = values.filter((row) => row.status === 'absent').length;
      const lateCount = values.filter((row) => row.status === 'late').length;
      return {
        date,
        presentCount,
        absentCount,
        lateCount,
        totalCount: values.length,
        rate: values.length ? presentCount / values.length : 0,
      };
    });
    const present = rows.filter((row: any) => row.status === 'present').length;
    return {
      trend,
      overallRate: rows.length ? present / rows.length : 0,
      totalAbsences: rows.filter((row: any) => row.status === 'absent').length,
    };
  }),
});
