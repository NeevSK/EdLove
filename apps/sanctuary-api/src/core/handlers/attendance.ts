import { implement } from '../orpc';
import { ORPCError } from '@orpc/server';
import { attendanceORPCContract } from '@repo/core/api/attendance.orpc.contract';
import type { ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';
import { attendanceProjectionServices } from '@repo/core/api/runtimes/attendanceProjection.runtime';

const impl = implement(attendanceORPCContract).$context<ORPCContext>();
const mapAttendance = (row: any) => ({
  id: String(row.id), student_id: String(row.student_id), classroom_id: String(row.classroom_id),
  status: row.status, date: String(row.date), created_at: new Date(row.created_at ?? Date.now()).toISOString(),
  updated_at: new Date(row.updated_at ?? row.created_at ?? Date.now()).toISOString(),
  student_name: row.student?.full_name ?? null, student_avatar_url: row.student?.avatar_url ?? null,
});

export const attendanceRouter = impl.router({
  getByClassroom: impl.getByClassroom.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const rows = await (context.db as any).attendanceRecord.findMany({ where: { classroom_id: input.classroomId, date: input.date ? { equals: input.date } : undefined }, orderBy: { created_at: 'desc' }, include: { student: { select: { full_name: true, avatar_url: true } } } });
    return rows.map(mapAttendance);
  }),
  record: impl.record.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const row = await (context.db as any).attendanceRecord.upsert({ where: { student_id_classroom_id_date: { student_id: input.studentId, classroom_id: input.classroomId, date: input.date } }, update: { status: input.status }, create: { student_id: input.studentId, classroom_id: input.classroomId, status: input.status, date: input.date } });
    return mapAttendance(row);
  }),
  batchRecord: impl.batchRecord.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    try {
      return await (context.db as any).$transaction(async (tx: any) => Promise.all(
        input.map(async (item: any) => mapAttendance(await tx.attendanceRecord.upsert({
          where: { student_id_classroom_id_date: { student_id: item.studentId, classroom_id: item.classroomId, date: item.date } },
          update: { status: item.status },
          create: { student_id: item.studentId, classroom_id: item.classroomId, status: item.status, date: item.date },
        }))),
      ));
    } catch { throw new ORPCError('CONFLICT', { message: 'Attendance batch was not applied' }); }
  }),
  getSchoolPulse: impl.getSchoolPulse.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const rows = await (context.db as any).attendanceRecord.findMany({ where: { classroom: { school_id: input.schoolId, id: input.classroomId || undefined }, date: input.viewDate || undefined }, select: { status: true } });
    const present = rows.filter((r: any) => r.status === 'present').length;
    return { todayRate: rows.length ? present / rows.length : 0, yesterdayRate: 0, atRiskCount: rows.filter((r: any) => r.status === 'absent').length };
  }),
  getReport: impl.getReport.use(doubleGateMiddleware).handler(async ({ input }) => attendanceProjectionServices.getAttendanceReport(input.schoolId, input.startDate, input.endDate, input.classroomId)),
});
