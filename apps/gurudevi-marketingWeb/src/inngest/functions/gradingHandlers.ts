import {
  type SchoolGradePublishedPayload,
  schoolGradePublishedEvent,
  v7 as uuidv7,
} from '@repo/core';
import { inngest } from '../../lib/inngest';
import { supabaseAdmin } from '../../lib/supabase';
import { insertWorkerAuditLog, trackWorkerAnalytics } from '../lib/workerObservability';

type GradeContext = {
  school_id: string | null;
  teacher_id: string | null;
};

async function getGradeContext(classroomId: string): Promise<GradeContext> {
  const { data, error } = await supabaseAdmin
    .from('classrooms')
    .select('school_id, teacher_id')
    .eq('id', classroomId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return {
    school_id: data?.school_id ?? null,
    teacher_id: data?.teacher_id ?? null,
  };
}

export const schoolGradePublished = inngest.createFunction(
  {
    id: 'school-grade-published-handler',
    name: 'Process Grade Published',
    triggers: [schoolGradePublishedEvent],
  },
  async ({ event, step }) => {
    const grade = event.data as unknown as SchoolGradePublishedPayload;
    const correlationId = grade.correlationId ?? grade.id;
    const causationId = grade.causationId ?? grade.id;

    const gradeContext = await step.run('load-grade-context', () =>
      getGradeContext(grade.classroom_id),
    );

    await step.run('log-grade-publish-audit', async () => {
      await insertWorkerAuditLog({
        supabase: supabaseAdmin,
        id: uuidv7(),
        action: 'grade_published_background',
        entityId: grade.id,
        entityType: 'grade',
        schoolId: gradeContext.school_id,
        idempotencyKey: `grade-published:${grade.id}:audit`,
        correlationId,
        causationId,
        metadata: {
          classroomId: grade.classroom_id,
          studentId: grade.student_id,
          assignmentId: grade.assignment_id ?? null,
          gradedBy: grade.graded_by,
          marks: grade.marks,
          gradeValue: grade.grade,
          publicationAction: grade.publication_action ?? 'grade_published',
          trigger: 'school_grade_published',
        },
      });
    });

    await step.run('track-grade-publish-analytics', async () => {
      await trackWorkerAnalytics({
        eventName: 'grade_published',
        distinctId: grade.student_id,
        correlationId,
        causationId,
        properties: {
          grade_id: grade.id,
          classroom_id: grade.classroom_id,
          school_id: gradeContext.school_id,
          teacher_id: gradeContext.teacher_id ?? grade.graded_by,
          student_id: grade.student_id,
          assignment_id: grade.assignment_id,
          marks: grade.marks,
          grade_value: grade.grade,
          worker: 'inngest-grade-handler',
        },
      });
    });

    return {
      processed: true,
      gradeId: grade.id,
      schoolId: gradeContext.school_id,
      correlationId,
    };
  },
);
