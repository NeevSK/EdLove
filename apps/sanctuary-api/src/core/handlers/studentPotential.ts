import { studentPotentialContract } from '@repo/core/api/studentPotential.contract';
import { SovereignError } from '@repo/core/types/Errors';
import { queryDatabaseRows } from '@repo/database/client';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(studentPotentialContract).$context<ORPCContext>();

const requireUser = (context: ORPCContext) => {
  assertDatabase(context);
  if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();
};

const mapAnalysis = (row: any) => ({
  id: String(row.id),
  student_id: String(row.student_id),
  teacher_id: String(row.teacher_id),
  classroom_id: String(row.classroom_id),
  cognitive_flow: Number(row.cognitive_flow),
  emotional_resonance: Number(row.emotional_resonance),
  social_weaving: Number(row.social_weaving),
  creative_spark: Number(row.creative_spark),
  practical_mastery: Number(row.practical_mastery),
  silver_lining: row.silver_lining ?? null,
  potential_notes: Array.isArray(row.potential_notes) ? row.potential_notes : [],
  created_at: new Date(row.created_at).toISOString(),
  updated_at: new Date(row.updated_at).toISOString(),
  visibility: 'private' as const,
  audit: {
    audit_required: true as const,
    owner_id: String(row.teacher_id),
    share_state: 'private' as const,
  },
});

export const studentPotentialRouter = {
  getForClassroom: impl.getForClassroom
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireUser(context);
      const rows = await queryDatabaseRows<any>(
        `
          select spa.id, spa.student_id, spa.teacher_id, spa.classroom_id,
                 spa.cognitive_flow, spa.emotional_resonance, spa.social_weaving,
                 spa.creative_spark, spa.practical_mastery, spa.silver_lining,
                 spa.potential_notes, spa.created_at, spa.updated_at
          from public.student_potential_analysis spa
          join public.classrooms classroom on classroom.id = spa.classroom_id
          where spa.student_id = $1::uuid
            and spa.classroom_id = $2::uuid
            and (
              spa.student_id = $3::uuid
              or spa.teacher_id = $3::uuid
              or exists (
                select 1
                from public.users viewer
                where viewer.id = $3::uuid
                  and viewer.school_id = classroom.school_id
                  and coalesce(viewer.role, '') in (
                    'founder', 'developer', 'admin', 'principal',
                    'assistant_principal', 'assistantPrincipal',
                    'section_head', 'grade_head'
                  )
              )
            )
          order by spa.updated_at desc, spa.created_at desc
          limit 1
        `,
        [input.params.studentId, input.params.classroomId, context.user.id],
      );
      return rows[0] ? mapAnalysis(rows[0]) : null;
    }),
  listForStudent: impl.listForStudent
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireUser(context);
      const rows = await queryDatabaseRows<any>(
        `
          select spa.id, spa.student_id, spa.teacher_id, spa.classroom_id,
                 spa.cognitive_flow, spa.emotional_resonance, spa.social_weaving,
                 spa.creative_spark, spa.practical_mastery, spa.silver_lining,
                 spa.potential_notes, spa.created_at, spa.updated_at
          from public.student_potential_analysis spa
          join public.classrooms classroom on classroom.id = spa.classroom_id
          join public.users student on student.id = spa.student_id
          where spa.student_id = $1::uuid
            and (
              spa.student_id = $2::uuid
              or spa.teacher_id = $2::uuid
              or exists (
                select 1
                from public.users viewer
                where viewer.id = $2::uuid
                  and viewer.school_id = classroom.school_id
                  and coalesce(viewer.role, '') in (
                    'founder', 'developer', 'admin', 'principal',
                    'assistant_principal', 'assistantPrincipal',
                    'section_head', 'grade_head'
                  )
              )
            )
          order by spa.updated_at desc, spa.created_at desc
        `,
        [input.params.studentId, context.user.id],
      );
      return rows.map(mapAnalysis);
    }),
  upsert: impl.upsert.use(doubleGateMiddleware).handler(async ({ input, context }) => {
    requireUser(context);
    if (input.body.student_id !== input.params.studentId) {
      throw SovereignError.invalidInput('student_id must match the route studentId');
    }
    const authorized = await queryDatabaseRows<{ allowed: boolean }>(
      `
          select exists(
            select 1
            from public.classrooms classroom
            where classroom.id = $1::uuid
              and classroom.teacher_id = $2::uuid
              and exists (
                select 1 from public.users student where student.id = $3::uuid
              )
          ) as allowed
        `,
      [input.body.classroom_id, context.user.id, input.params.studentId],
    );
    if (!authorized[0]?.allowed) throw SovereignError.unauthorized('update', 'student potential');

    const rows = await queryDatabaseRows<{ result: any }>(
      `
          select public.upsert_student_potential_analysis(
            $1::uuid, $2::uuid, $3::integer, $4::integer, $5::integer,
            $6::integer, $7::integer, $8::text, $9::text
          ) as result
        `,
      [
        input.params.studentId,
        input.body.classroom_id,
        input.body.cognitive_flow,
        input.body.emotional_resonance,
        input.body.social_weaving,
        input.body.creative_spark,
        input.body.practical_mastery,
        input.body.silver_lining ?? null,
        context.requestId,
      ],
    );
    const result = rows[0]?.result;
    if (!result) throw SovereignError.unavailable('STUDENT_POTENTIAL_UPSERT_FAILED');
    return mapAnalysis(typeof result === 'string' ? JSON.parse(result) : result);
  }),
};
