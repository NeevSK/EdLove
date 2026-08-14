import { echoContract, type StudentEcho } from '@repo/core/api/echo.contract';
import { SovereignError } from '@repo/core/types/Errors';
import { queryDatabaseRows } from '@repo/database/client';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(echoContract).$context<ORPCContext>();

const requireUser = (context: ORPCContext) => {
  assertDatabase(context);
  if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();
};

const mapEcho = (row: any): StudentEcho => ({
  id: String(row.id),
  classroom_id: String(row.classroom_id),
  school_id: String(row.school_id),
  student_id: String(row.student_id),
  content: String(row.content),
  is_anonymous: Boolean(row.is_anonymous),
  is_read: Boolean(row.is_read),
  teacher_response: row.teacher_response ?? null,
  responded_by: row.responded_by ? String(row.responded_by) : null,
  responded_at: row.responded_at ? new Date(row.responded_at).toISOString() : null,
  created_at: new Date(row.created_at).toISOString(),
  updated_at: new Date(row.updated_at).toISOString(),
  ...(row.student_name !== undefined ? { student_name: row.student_name ?? 'Anonymous Soul' } : {}),
  ...(row.student_avatar !== undefined ? { student_avatar: row.student_avatar ?? null } : {}),
});

const echoSelect = (visibility = '') => `
  select e.id, e.classroom_id, e.school_id, e.student_id, e.content,
         e.is_anonymous, e.is_read, e.teacher_response, e.responded_by,
         e.responded_at, e.created_at, e.updated_at,
         case when e.is_anonymous and e.student_id <> $2::uuid
              then 'Anonymous Soul' else u.full_name end as student_name,
         case when e.is_anonymous and e.student_id <> $2::uuid
              then null else u.avatar_url end as student_avatar
  from public.classroom_echo_feedback e
  join public.users u on u.id = e.student_id
  ${visibility}
`;

export const echoRouter = impl.router({
  sendEcho: impl.sendEcho.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    const rows = await queryDatabaseRows<any>(
      `
          insert into public.classroom_echo_feedback
            (classroom_id, school_id, student_id, content, is_anonymous, is_read)
          select c.id, c.school_id, $2::uuid, $3, $4, false
          from public.classrooms c
          where c.id = $1::uuid
            and exists (
              select 1 from public.classroom_students cs
              where cs.classroom_id = c.id and cs.student_id = $2::uuid
                and coalesce(cs.status, 'active') = 'active'
            )
          returning id, classroom_id, school_id, student_id, content,
                    is_anonymous, is_read, teacher_response, responded_by,
                    responded_at, created_at, updated_at
        `,
      [input.body.classroomId, context.user.id, input.body.content, input.body.isAnonymous],
    );
    if (!rows[0]) throw SovereignError.unauthorized('create', 'classroom echo');
    return mapEcho(rows[0]);
  }),

  getMyEchoes: impl.getMyEchoes.use(doubleGateMiddleware).handler(async ({ context }) => {
    requireUser(context);
    const rows = await queryDatabaseRows<any>(
      `${echoSelect('where e.student_id = $1::uuid')} order by e.created_at desc`,
      [context.user.id, context.user.id],
    );
    return rows.map(mapEcho);
  }),

  getEchoesByClassroom: impl.getEchoesByClassroom
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireUser(context);
      const rows = await queryDatabaseRows<any>(
        `${echoSelect(`
          where e.classroom_id = $1::uuid
            and (
              e.student_id = $2::uuid
              or exists (select 1 from public.classrooms c where c.id = e.classroom_id and c.teacher_id = $2::uuid)
              or exists (select 1 from public.users p where p.id = $2::uuid and p.school_id = e.school_id and coalesce(p.role, p.capacity) in ('principal', 'admin', 'founder'))
            )
        `)} order by e.is_read asc, e.created_at desc`,
        [input.params.classroomId, context.user.id],
      );
      return rows.map(mapEcho);
    }),

  getTeacherEchoes: impl.getTeacherEchoes
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireUser(context);
      const rows = await queryDatabaseRows<any>(
        `${echoSelect(`
          where e.classroom_id = $1::uuid
            and exists (select 1 from public.classrooms c where c.id = e.classroom_id and c.teacher_id = $2::uuid)
        `)} order by e.is_read asc, e.created_at desc`,
        [input.params.classroomId, context.user.id],
      );
      return rows.map(mapEcho);
    }),

  respondToEcho: impl.respondToEcho
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireUser(context);
      const updated = await queryDatabaseRows<any>(
        `update public.classroom_echo_feedback e
         set teacher_response = $2, responded_by = $3::uuid, responded_at = now(), is_read = true
         where e.id = $1::uuid
           and exists (select 1 from public.classrooms c where c.id = e.classroom_id and c.teacher_id = $3::uuid)
         returning e.*`,
        [input.params.echoId, input.body.response, context.user.id],
      );
      if (!updated[0]) throw SovereignError.notFound('Classroom echo');
      return mapEcho(updated[0]);
    }),

  markAsRead: impl.markAsRead.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    const rows = await queryDatabaseRows<any>(
      `update public.classroom_echo_feedback e
         set is_read = true
         where e.id = $1::uuid
           and (
             e.student_id = $2::uuid
             or exists (select 1 from public.classrooms c where c.id = e.classroom_id and c.teacher_id = $2::uuid)
           )
         returning e.*`,
      [input.params.echoId, context.user.id],
    );
    if (!rows[0]) throw SovereignError.notFound('Classroom echo');
    return mapEcho(rows[0]);
  }),
});
