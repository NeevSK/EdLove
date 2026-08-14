import {
  createDomainServices,
  type SchoolAttendanceRecordedPayload,
  schoolAttendanceRecordedEvent,
  v7 as uuidv7,
} from '@repo/core/logic';
import { inngest } from '../../lib/inngest';
import { supabaseAdmin } from '../../lib/supabase';
import { insertWorkerAuditLog, trackWorkerAnalytics } from '../lib/workerObservability';

type ClassroomContext = {
  school_id: string | null;
  teacher_id: string | null;
};
async function getClassroomContext(classroomId: string): Promise<ClassroomContext> {
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
export const schoolAttendanceRecorded = inngest.createFunction(
  {
    id: 'school-attendance-recorded-handler',
    name: 'Process Attendance Recorded',
    triggers: [schoolAttendanceRecordedEvent],
  },
  async ({ event, step }) => {
    const attendance = event.data as unknown as SchoolAttendanceRecordedPayload;
    const attendanceId =
      attendance.idempotency_key ??
      `${attendance.classroom_id}:${attendance.student_id}:${new Date(attendance.date).toISOString()}`;
    const domainServices = createDomainServices(supabaseAdmin);
    const correlationId = attendance.correlationId ?? attendanceId;
    const causationId = attendance.causationId ?? attendanceId;
    const classroomContext = await step.run('load-classroom-context', () =>
      getClassroomContext(attendance.classroom_id),
    );
    await step.run('log-attendance-audit', async () => {
      await insertWorkerAuditLog({
        supabase: supabaseAdmin,
        id: uuidv7(),
        action: 'attendance_recorded_background',
        entityId: attendanceId,
        entityType: 'attendance',
        schoolId: classroomContext.school_id,
        idempotencyKey: `attendance-recorded:${attendanceId}:audit`,
        correlationId,
        causationId,
        metadata: {
          classroomId: attendance.classroom_id,
          studentId: attendance.student_id,
          status: attendance.status,
          date: attendance.date,
          teacherId: classroomContext.teacher_id,
          trigger: 'school_attendance_recorded',
        },
      });
    });
    await step.run('track-attendance-analytics', async () => {
      await trackWorkerAnalytics({
        eventName: 'attendance_recorded',
        distinctId: attendance.student_id,
        correlationId,
        causationId,
        properties: {
          attendance_id: attendanceId,
          student_id: attendance.student_id,
          classroom_id: attendance.classroom_id,
          school_id: classroomContext.school_id,
          teacher_id: classroomContext.teacher_id,
          attendance_status: attendance.status,
          attendance_date: attendance.date,
          worker: 'inngest-attendance-handler',
        },
      });
    });
    if (attendance.status === 'absent' && classroomContext.teacher_id) {
      await step.run('create-teacher-insight-note', async () => {
        await domainServices.teacherInsights.createPrivateNote(
          {
            teacherId: classroomContext.teacher_id!,
            type: 'note',
            content: [
              'System-generated attendance insight.',
              `Student ${attendance.student_id} was marked absent in classroom ${attendance.classroom_id} on ${attendance.date}.`,
              'Use this as a private cue for follow-up, not as a finalized student judgment.',
            ].join(' '),
          },
          `attendance-recorded:${attendanceId}:teacher-note`,
        );
      });
    }
    return {
      processed: true,
      attendanceId,
      schoolId: classroomContext.school_id,
      correlationId,
    };
  },
);
