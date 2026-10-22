import { ORPCError } from '@orpc/server';
import { attendanceORPCContract } from '@repo/core/api/attendance.orpc.contract';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';
import { getPolicyDb } from '../policyDb';
import { resolveStudentHistoryScope } from '../studentHistoryScope';

const impl = implement(attendanceORPCContract).$context<ORPCContext>();

type RecordInput = {
  gradeClassId?: string;
  classroomId?: string;
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

// A real Postgres DATE arrives as a Date (String() would give "Wed Oct 21 ..."); fakes
// and older callers pass 'YYYY-MM-DD' strings.
const dateOnly = (value: unknown) =>
  value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);

const mapAttendance = (row: any) => ({
  id: String(row.id),
  student_id: String(row.student_id),
  grade_class_id: String(row.grade_class_id),
  status: row.status,
  attendance_date: dateOnly(row.attendance_date),
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

const dailyWhere = (record: { gradeClassId: string; studentId: string; date: string }) => ({
  student_id_grade_class_id_attendance_date: {
    student_id: record.studentId,
    grade_class_id: record.gradeClassId,
    attendance_date: record.date,
  },
});

type GradeClassRecord = { id: string; school_id: string; academic_cycle_id: string };

const gradeClassSelect = { id: true, school_id: true, academic_cycle_id: true } as const;

/**
 * Model A: attendance is keyed by a real grade_classes.id. There is no fallback to a
 * legacy classroom, a name match, or "the school's first class": Cedar authorized the
 * id the caller sent, so writing anywhere else would bypass that check. Clients map a
 * legacy classroom to one of their own grade classes before calling.
 */
export async function resolveGradeClassRecord(
  db: any,
  targetId: string | undefined,
  contextSchoolId?: string | null,
): Promise<GradeClassRecord | null> {
  if (!targetId) return null;
  const direct = await db.gradeClass.findUnique({
    where: { id: targetId },
    select: gradeClassSelect,
  });
  if (!direct) return null;
  if (contextSchoolId && String(direct.school_id) !== String(contextSchoolId)) return null;
  return direct;
}

/**
 * Bridge used only when a legacy classroom (not attendance) needs its grade class, e.g.
 * enrolling a shadow learner added to classroom "5A". Matches by name within the same
 * school and only when exactly one active grade class has that name; never guesses.
 */
export async function resolveGradeClassForLegacyClassroom(
  db: any,
  classroomId: string,
  contextSchoolId?: string | null,
): Promise<GradeClassRecord | null> {
  const direct = await resolveGradeClassRecord(db, classroomId, contextSchoolId);
  if (direct) return direct;
  const legacy = await db.classroom.findUnique({
    where: { id: classroomId },
    select: { id: true, school_id: true, name: true },
  });
  if (!legacy?.school_id || !legacy.name) return null;
  const matches = await db.gradeClass.findMany({
    where: { school_id: legacy.school_id, name: legacy.name, status: 'active' },
    select: gradeClassSelect,
    take: 2,
  });
  return Array.isArray(matches) && matches.length === 1 ? matches[0] : null;
}

async function requireGradeClass(db: any, targetId: string | undefined, schoolId?: string | null) {
  const gradeClass = await resolveGradeClassRecord(db, targetId, schoolId);
  if (!gradeClass) throw new ORPCError('NOT_FOUND', { message: 'Grade class not found' });
  return gradeClass;
}

/** Attendance can only be written for a student enrolled in that grade class. */
async function requireEnrolledStudent(db: any, studentId: string, gradeClassId: string) {
  const enrollment = await db.studentGradeClassEnrollment.findFirst({
    where: { student_id: studentId, grade_class_id: gradeClassId },
    select: { id: true },
  });
  if (!enrollment) {
    throw new ORPCError('BAD_REQUEST', {
      message: 'Student is not enrolled in this class',
      data: { studentId, gradeClassId },
    });
  }
}

/** Active enrollments on a date, in register order (the order the teacher sees). */
async function loadRoster(db: any, gradeClassId: string, date?: string) {
  const on = date ? new Date(`${date}T23:59:59.999Z`) : new Date();
  return db.studentGradeClassEnrollment.findMany({
    where: {
      grade_class_id: gradeClassId,
      status: 'active',
      effective_from: { lte: on },
      OR: [{ effective_to: null }, { effective_to: { gte: on } }],
    },
    include: { student: { select: { full_name: true, avatar_url: true } } },
    orderBy: { created_at: 'asc' },
  });
}

async function loadDaily(context: ORPCContext, record: RecordInput & { note?: string }, db: any) {
  const gradeClass = await requireGradeClass(
    db,
    record.gradeClassId || record.classroomId,
    context.schoolId,
  );
  const effectiveRecord = {
    ...record,
    gradeClassId: gradeClass.id,
  };

  // Never invent a users row for an unknown id: shadow learners already have one
  // (addShadowStudent), and an id that is not on this class's roster is a client bug.
  await requireEnrolledStudent(db, effectiveRecord.studentId, gradeClass.id);

  const row: any = await (db.dailyAttendance as any).upsert({
    where: dailyWhere(effectiveRecord) as any,
    update: {
      status: effectiveRecord.status,
      recorded_by: context.user.id,
      ...(record.note !== undefined && { note: record.note }),
    },
    create: {
      student_id: effectiveRecord.studentId,
      school_id: gradeClass.school_id,
      academic_cycle_id: gradeClass.academic_cycle_id,
      grade_class_id: effectiveRecord.gradeClassId,
      attendance_date: new Date(`${effectiveRecord.date}T00:00:00.000Z`),
      status: effectiveRecord.status,
      recorded_by: context.user.id,
      ...(record.note !== undefined && { note: record.note }),
    },
    include: {
      student: { select: { full_name: true, avatar_url: true } },
      sessions: { orderBy: { session_at: 'asc' } },
    },
  });

  if (effectiveRecord.sessionKind) {
    await (db.attendanceSession as any).create({
      data: {
        daily_attendance_id: row.id,
        school_id: gradeClass.school_id,
        academic_cycle_id: gradeClass.academic_cycle_id,
        grade_class_id: effectiveRecord.gradeClassId,
        term_id: effectiveRecord.termId ?? null,
        student_id: effectiveRecord.studentId,
        teacher_id: effectiveRecord.teacherId ?? null,
        subject_id: effectiveRecord.subjectId ?? null,
        session_kind: effectiveRecord.sessionKind,
        session_at: effectiveRecord.sessionAt ?? `${effectiveRecord.date}T00:00:00.000Z`,
        status: effectiveRecord.status,
        recorded_by: context.user.id,
      },
    });
    return (db.dailyAttendance as any).findUnique({
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
      const db = await getPolicyDb(context);
      const query = input.query as { gradeClassId?: string; classroomId?: string; date?: string };
      const gradeClass = await requireGradeClass(
        db,
        query.gradeClassId || query.classroomId,
        context.schoolId,
      );
      const rows = await db.dailyAttendance.findMany({
        where: {
          grade_class_id: gradeClass.id,
          attendance_date: input.query.date || undefined,
        },
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
    .handler(async ({ input, context }) =>
      mapAttendance(await loadDaily(context, input.body, await getPolicyDb(context))),
    ),
  batchRecord: impl.batchRecord.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    try {
      return await (await getPolicyDb(context)).$transaction(async (tx: any) => {
        const rows = [];
        for (const item of input.body) rows.push(mapAttendance(await loadDaily(context, item, tx)));
        return rows;
      });
    } catch (error: any) {
      if (error instanceof ORPCError) throw error;
      throw new ORPCError('CONFLICT', {
        message: error?.message || 'Attendance batch was not applied',
        cause: error,
      });
    }
  }),
  getSchoolPulse: impl.getSchoolPulse
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      const rows = await (await getPolicyDb(context)).dailyAttendance.findMany({
        where: {
          school_id: input.query.schoolId,
          grade_class_id: input.query.gradeClassId || undefined,
          attendance_date: input.query.viewDate || undefined,
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
    const rows = await (await getPolicyDb(context)).dailyAttendance.findMany({
      where: {
        school_id: input.query.schoolId,
        grade_class_id: input.query.gradeClassId || undefined,
        attendance_date: { gte: input.query.startDate, lte: input.query.endDate },
      },
      select: { attendance_date: true, status: true },
      orderBy: { attendance_date: 'asc' },
    });
    const byDate = new Map<string, any[]>();
    for (const row of rows) {
      const date = dateOnly(row.attendance_date);
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
  getGradeClassRoster: impl.getGradeClassRoster
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      const db = await getPolicyDb(context);
      const gradeClass = await requireGradeClass(
        db,
        input.query.gradeClassId || (input.query as any).classroomId,
        context.schoolId,
      );
      const rows = await loadRoster(db, gradeClass.id, input.query.date);
      return rows.map((row: any) => ({
        enrollment_id: String(row.id),
        student_id: String(row.student_id),
        full_name: row.student?.full_name ?? null,
        avatar_url: row.student?.avatar_url ?? null,
      }));
    }),
  getStudentHistory: impl.getStudentHistory
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      const db = await getPolicyDb(context);
      const { studentId, from, to, limit } = input.query;
      const scope = await resolveStudentHistoryScope(context.db, context.user.id, studentId);
      if (!scope) {
        throw new ORPCError('FORBIDDEN', {
          message: "You do not have access to this student's attendance history.",
        });
      }
      const rows = await db.dailyAttendance.findMany({
        where: {
          AND: [
            scope,
            ...(from ? [{ attendance_date: { gte: new Date(`${from}T00:00:00.000Z`) } }] : []),
            ...(to ? [{ attendance_date: { lte: new Date(`${to}T00:00:00.000Z`) } }] : []),
          ],
        },
        include: {
          student: { select: { full_name: true, avatar_url: true } },
          sessions: { orderBy: { session_at: 'asc' } },
        },
        orderBy: [{ attendance_date: 'desc' }, { created_at: 'desc' }],
        take: limit ?? 200,
      });
      return rows.map(mapAttendance);
    }),
  getMyGradeClasses: impl.getMyGradeClasses
    .use(doubleGateMiddleware)
    .handler(async ({ context }) => {
      const db = await getPolicyDb(context);
      if (!context.schoolId) return [];
      const leader = ['principal', 'admin', 'section_head', 'grade_head'].includes(
        String(context.capacity),
      );
      if (leader) {
        const rows = await db.gradeClass.findMany({
          where: { school_id: context.schoolId, status: 'active' },
          select: { id: true, name: true, academic_cycle_id: true },
          orderBy: { name: 'asc' },
        });
        return rows.map((row: any) => ({
          id: String(row.id),
          name: String(row.name),
          academic_cycle_id: String(row.academic_cycle_id),
          role: null,
        }));
      }
      const now = new Date();
      const rows = await db.gradeClassTeacherAssignment.findMany({
        where: {
          teacher_id: context.user.id,
          status: 'active',
          effective_from: { lte: now },
          OR: [{ effective_to: null }, { effective_to: { gte: now } }],
          grade_class: { school_id: context.schoolId, status: 'active' },
        },
        include: { grade_class: { select: { id: true, name: true, academic_cycle_id: true } } },
      });
      const seen = new Map<string, any>();
      for (const row of rows) {
        const gc = row.grade_class;
        if (!gc || seen.has(String(gc.id))) continue;
        seen.set(String(gc.id), {
          id: String(gc.id),
          name: String(gc.name),
          academic_cycle_id: String(gc.academic_cycle_id),
          role: row.role ?? null,
        });
      }
      return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
    }),
  quickMark: impl.quickMark.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const db = await getPolicyDb(context);
    const { gradeClassId, date, rawText } = input.body;
    const gradeClass = await requireGradeClass(db, gradeClassId, context.schoolId);

    // "3 7 12" marks those register positions absent; "late 4" marks them late.
    // Enrollments carry no roll number, so a number is the 1-based position on the
    // register as shown by getGradeClassRoster (same query, same order).
    const numbers = [...new Set<number>((rawText.match(/\d+/g) || []).map(Number))];
    const targetStatus: 'late' | 'absent' = /late/i.test(rawText) ? 'late' : 'absent';
    const roster = (await loadRoster(db, gradeClass.id, date)) ?? [];
    const unknown = numbers.filter((n) => n < 1 || n > roster.length);
    if (unknown.length > 0) {
      throw new ORPCError('BAD_REQUEST', {
        message: `No student at register number ${unknown.join(', ')} (class has ${roster.length})`,
        data: { unknown, rosterSize: roster.length },
      });
    }

    const marks: Record<string, 'present' | 'late' | 'absent' | 'excused'> = {};
    const items: RecordInput[] = roster.map((enr: any, idx: number) => {
      const studentId = String(enr.student_id);
      const status = numbers.includes(idx + 1) ? targetStatus : 'present';
      marks[studentId] = status;
      return { gradeClassId: gradeClass.id, studentId, status, date };
    });
    await (db as any).$transaction(async (tx: any) => {
      for (const item of items) await loadDaily(context, item, tx);
    });
    return { updatedCount: items.length, marks };
  }),
  submitExcuse: impl.submitExcuse.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const { studentId, gradeClassId, date, reason } = input.body;
    await loadDaily(
      context,
      { gradeClassId, studentId, date, status: 'excused', note: reason },
      await getPolicyDb(context),
    );
    return { success: true };
  }),
});
