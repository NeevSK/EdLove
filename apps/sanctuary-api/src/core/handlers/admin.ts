import { implement } from '../orpc';
import { adminORPCContract } from '@repo/core/api/admin.orpc.contract';
import type { ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(adminORPCContract).$context<ORPCContext>();
const iso = (value: unknown) => value ? new Date(value as string | number | Date).toISOString() : null;
const mapLeave = (row: any) => ({ id: String(row.id), school_id: String(row.school_id), user_id: String(row.user_id), leave_type: String(row.leave_type ?? ''), start_date: iso(row.start_date) ?? '', end_date: iso(row.end_date) ?? '', reason: row.reason ?? null, status: String(row.status ?? 'pending'), reviewed_by: row.reviewed_by ?? null, reviewed_at: iso(row.reviewed_at), created_at: iso(row.created_at) ?? '' });
const mapCalendar = (row: any) => ({ id: String(row.id), school_id: String(row.school_id), created_by: row.created_by ?? null, title: String(row.title ?? ''), type: String(row.type ?? ''), start_date: iso(row.start_date) ?? '', end_date: iso(row.end_date), is_public: row.is_public !== false });

export const adminRouter = impl.router({
  getStaffPresence: impl.getStaffPresence.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const rows = await (context.db as any).staffAttendance.findMany({ where: { school_id: input.schoolId, date: input.viewDate || new Date().toISOString().slice(0, 10) } });
    return { present: rows.filter((r: any) => r.status === 'present' || r.status === 'late').length, absent: rows.filter((r: any) => r.status === 'absent').length, onLeave: rows.filter((r: any) => r.status === 'on_leave' || r.status === 'half_day').length, total: rows.length };
  }),
  getTeacherCarousel: impl.getTeacherCarousel.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    const rows = await (context.db as any).user.findMany({ where: { bonds: { some: { entity_id: input.schoolId, entity_type: 'SCHOOL', capacity: { in: ['teacher', 'grade_head', 'principal'] } } } }, include: { staff_attendance: { where: { date: input.viewDate || new Date().toISOString().slice(0, 10) }, select: { status: true } }, _count: { select: { classrooms: { where: { school_id: input.schoolId } } } } } });
    return rows.map((row: any) => ({ userId: String(row.id), fullName: String(row.full_name ?? ''), capacity: 'teacher', todayStatus: row.staff_attendance?.[0]?.status ?? null, classroomCount: Number(row._count?.classrooms ?? 0), avatarUrl: row.avatar_url ?? null }));
  }),
  submitLeave: impl.submitLeave.use(doubleGateMiddleware).handler(async ({ input, context }) => { await (context.db as any).staffLeave.create({ data: { school_id: input.schoolId, user_id: context.user.id, leave_type: input.leaveType, start_date: input.startDate, end_date: input.endDate, reason: input.reason } }); return { success: true }; }),
  getSchool: impl.getSchool.use(doubleGateMiddleware).handler(async ({ input, context }) => { const row = await (context.db as any).school.findUnique({ where: { id: input.id }, include: { _count: { select: { classrooms: true, bonds: true } } } }); return row ? { id: String(row.id), name: String(row.name ?? ''), classrooms_count: Number(row._count?.classrooms ?? 0), bonds_count: Number(row._count?.bonds ?? 0) } : null; }),
  getPendingLeaves: impl.getPendingLeaves.use(doubleGateMiddleware).handler(async ({ input, context }) => { const rows = await (context.db as any).staffLeave.findMany({ where: { school_id: input.schoolId, status: 'pending' }, orderBy: { created_at: 'desc' } }); return rows.map(mapLeave); }),
  approveLeave: impl.approveLeave.use(doubleGateMiddleware).handler(async ({ input, context }) => { const row = await (context.db as any).staffLeave.update({ where: { id: input.leaveId }, data: { status: input.approved ? 'approved' : 'rejected', reviewed_by: context.user.id, reviewed_at: new Date() } }); return { success: Boolean(row) }; }),
  getUpcomingCalendarEvents: impl.getUpcomingCalendarEvents.use(doubleGateMiddleware).handler(async ({ input, context }) => { const rows = await (context.db as any).calendarEvent.findMany({ where: { school_id: input.schoolId, start_date: { gte: input.viewDate || new Date().toISOString().slice(0, 10) } }, take: input.limit ?? 5, orderBy: { start_date: 'asc' } }); return rows.map(mapCalendar); }),
  createCalendarEvent: impl.createCalendarEvent.use(doubleGateMiddleware).handler(async ({ input, context }) => { await (context.db as any).calendarEvent.create({ data: { school_id: input.schoolId, created_by: context.user.id, title: input.event.title, type: input.event.type, start_date: input.event.start_date, end_date: input.event.end_date, is_public: input.event.is_public ?? true } }); return { success: true }; }),
});
