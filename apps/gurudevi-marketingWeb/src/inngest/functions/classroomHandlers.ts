import {
  type SchoolClassroomCreatedPayload,
  schoolClassroomCreatedEvent,
  v7 as uuidv7,
} from '@repo/core/logic';
import { inngest } from '../../lib/inngest';
import { supabaseAdmin } from '../../lib/supabase';
import { insertWorkerAuditLog, trackWorkerAnalytics } from '../lib/workerObservability';
export const schoolClassroomCreated = inngest.createFunction(
  {
    id: 'school-classroom-created-handler',
    name: 'Process Classroom Created',
    triggers: [schoolClassroomCreatedEvent],
  },
  async ({ event, step }) => {
    const classroom = event.data as unknown as SchoolClassroomCreatedPayload;
    const correlationId = classroom.correlationId ?? classroom.id;
    const causationId = classroom.causationId ?? classroom.id;
    await step.run('log-classroom-audit', async () => {
      await insertWorkerAuditLog({
        supabase: supabaseAdmin,
        id: uuidv7(),
        action: 'classroom_created_background',
        entityId: classroom.id,
        entityType: 'classroom',
        schoolId: classroom.school_id ?? classroom.tenantId ?? null,
        idempotencyKey: `classroom-created:${classroom.id}:audit`,
        correlationId,
        causationId,
        metadata: {
          classroomId: classroom.id,
          schoolId: classroom.school_id ?? null,
          teacherId: classroom.teacher_id ?? null,
          gradeId: classroom.grade_id ?? null,
          name: classroom.name,
          trigger: 'school_classroom_created',
        },
      });
    });
    await step.run('track-classroom-analytics', async () => {
      await trackWorkerAnalytics({
        eventName: 'classroom_created',
        distinctId: classroom.teacher_id ?? classroom.school_id ?? classroom.id,
        correlationId,
        causationId,
        properties: {
          classroom_id: classroom.id,
          school_id: classroom.school_id ?? null,
          teacher_id: classroom.teacher_id ?? null,
          grade_id: classroom.grade_id ?? null,
          classroom_name: classroom.name,
          worker: 'inngest-classroom-handler',
        },
      });
    });
    return {
      processed: true,
      classroomId: classroom.id,
      schoolId: classroom.school_id ?? null,
      correlationId,
    };
  },
);
