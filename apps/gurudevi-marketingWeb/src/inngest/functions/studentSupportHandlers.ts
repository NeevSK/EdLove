import {
  studentSupportRequestedEvent,
  studentSupportRequestedPayloadSchema,
  v7 as uuidv7,
} from '@repo/core/logic';
import {
  buildDemoStudentSupportEvidence,
  loadStudentAttendanceEvidence,
  loadStudentGradesEvidence,
  loadStudentSupportContext,
  loadStudentWellbeingEvidence,
  type StudentSupportEvidence,
  type StudentSupportEvidenceScope,
  synthesizeStudentSupportDraft,
} from '../../lib/durableAgents/studentSupportAgent';
import { inngest } from '../../lib/inngest';
import { supabaseAdmin } from '../../lib/supabase';
import { insertWorkerAuditLog } from '../lib/workerObservability';

async function loadLiveStudentEvidence(
  classroomId: string,
  studentId: string,
  scopes: StudentSupportEvidenceScope[],
): Promise<StudentSupportEvidence> {
  const student = await loadStudentSupportContext(supabaseAdmin, classroomId, studentId);
  const evidence: StudentSupportEvidence = { student };
  if (scopes.includes('attendance')) {
    evidence.attendance = await loadStudentAttendanceEvidence(
      supabaseAdmin,
      classroomId,
      studentId,
    );
  }
  if (scopes.includes('grades')) {
    evidence.grades = await loadStudentGradesEvidence(supabaseAdmin, classroomId, studentId);
  }
  if (scopes.includes('wellbeing')) {
    evidence.wellbeing = await loadStudentWellbeingEvidence(supabaseAdmin, studentId);
  }
  return evidence;
}
export const studentSupportRequested = inngest.createFunction(
  {
    id: 'student-support-requested',
    name: 'Student Support Requested',
    triggers: [studentSupportRequestedEvent],
  },
  async ({ event, step }) => {
    const request = studentSupportRequestedPayloadSchema.parse(event.data);
    const correlationId = request.correlationId ?? request.runId;
    const causationId = request.causationId ?? request.runId;
    await step.run('log-student-support-started', async () => {
      await insertWorkerAuditLog({
        supabase: supabaseAdmin,
        id: uuidv7(),
        action: 'durable_agent_started',
        entityId: request.runId,
        entityType: 'durable_agent_run',
        schoolId: request.schoolId,
        idempotencyKey: `durable-agent:${request.runId}:started`,
        correlationId,
        causationId,
        metadata: {
          runType: 'student_support_snapshot',
          mode: request.mode,
          demoScenario: request.demoScenario ?? null,
          classroomId: request.classroomId,
          teacherId: request.teacherId ?? null,
          studentId: request.studentId,
          studentName: request.studentName ?? null,
          evidenceScopes: request.evidenceScopes,
          reviewMode: request.reviewMode,
        },
      });
    });
    try {
      const evidence = await step.run('load-student-support-evidence', async () => {
        if (request.mode === 'demo') {
          return buildDemoStudentSupportEvidence({
            runId: request.runId,
            mode: request.mode,
            demoScenario: request.demoScenario,
            schoolId: request.schoolId,
            classroomId: request.classroomId,
            teacherId: request.teacherId,
            studentId: request.studentId,
            studentName: request.studentName,
            requestedBy: request.requestedBy,
            focusPrompt: request.focusPrompt,
            evidenceScopes: request.evidenceScopes,
          });
        }
        return loadLiveStudentEvidence(
          request.classroomId,
          request.studentId,
          request.evidenceScopes as StudentSupportEvidenceScope[],
        );
      });
      const synthesis = await step.run('synthesize-student-support-draft', async () =>
        synthesizeStudentSupportDraft(evidence, request.focusPrompt),
      );
      const governor = {
        maxSteps: request.evidenceScopes.length + 1,
        requestedScopes: request.evidenceScopes,
        executedScopes: request.evidenceScopes,
        synthesisMode: synthesis.synthesisMode,
        reviewMode: request.reviewMode,
      };
      await step.run('log-student-support-completed', async () => {
        await insertWorkerAuditLog({
          supabase: supabaseAdmin,
          id: uuidv7(),
          action: 'durable_agent_completed',
          entityId: request.runId,
          entityType: 'durable_agent_run',
          schoolId: request.schoolId,
          idempotencyKey: `durable-agent:${request.runId}:completed`,
          correlationId,
          causationId,
          metadata: {
            runType: 'student_support_snapshot',
            mode: request.mode,
            demoScenario: request.demoScenario ?? null,
            classroomId: request.classroomId,
            teacherId: request.teacherId ?? null,
            studentId: request.studentId,
            studentName: evidence.student.studentName,
            focusPrompt: request.focusPrompt ?? null,
            summaryDraft: synthesis.summaryDraft,
            evidence,
            governor,
          },
        });
      });
      return {
        runId: request.runId,
        status: 'completed',
        governor,
      };
    } catch (error) {
      await step.run('log-student-support-failed', async () => {
        await insertWorkerAuditLog({
          supabase: supabaseAdmin,
          id: uuidv7(),
          action: 'durable_agent_failed',
          entityId: request.runId,
          entityType: 'durable_agent_run',
          schoolId: request.schoolId,
          idempotencyKey: `durable-agent:${request.runId}:failed`,
          correlationId,
          causationId,
          metadata: {
            runType: 'student_support_snapshot',
            mode: request.mode,
            demoScenario: request.demoScenario ?? null,
            classroomId: request.classroomId,
            teacherId: request.teacherId ?? null,
            studentId: request.studentId,
            studentName: request.studentName ?? null,
            error: error instanceof Error ? error.message : 'Unknown durable-agent failure',
          },
        });
      });
      throw error;
    }
  },
);
