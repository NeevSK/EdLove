import { v7 as uuidv7 } from "@repo/core/logic";
import { teacherSummaryRequestedEvent, teacherSummaryRequestedPayloadSchema } from '@repo/core/logic';
import { buildDemoEvidence, type EvidenceScope, loadAssignmentsEvidence, loadAttendanceEvidence, loadClassroomSummaryContext, loadGradesEvidence, loadWellbeingEvidence, synthesizeTeacherSummaryDraft, type TeacherSummaryEvidence, } from '../../lib/durableAgents/teacherSummaryAgent';
import { inngest } from '../../lib/inngest';
import { supabaseAdmin } from '../../lib/supabase';
import { insertWorkerAuditLog } from '../lib/workerObservability';
async function loadLiveEvidence(classroomId: string, scopes: EvidenceScope[]): Promise<TeacherSummaryEvidence> {
    const classroom = await loadClassroomSummaryContext(supabaseAdmin, classroomId);
    const evidence: TeacherSummaryEvidence = { classroom };
    if (scopes.includes('attendance')) {
        evidence.attendance = await loadAttendanceEvidence(supabaseAdmin, classroomId);
    }
    if (scopes.includes('grades')) {
        evidence.grades = await loadGradesEvidence(supabaseAdmin, classroomId);
    }
    if (scopes.includes('wellbeing')) {
        evidence.wellbeing = await loadWellbeingEvidence(supabaseAdmin, classroomId);
    }
    if (scopes.includes('assignments')) {
        evidence.assignments = await loadAssignmentsEvidence(supabaseAdmin, classroomId);
    }
    return evidence;
}
export const teacherSummaryRequested = inngest.createFunction({
    id: 'teacher-summary-requested',
    name: 'Teacher Summary Requested',
    triggers: [teacherSummaryRequestedEvent],
}, async ({ event, step }) => {
    const request = teacherSummaryRequestedPayloadSchema.parse(event.data);
    const correlationId = request.correlationId ?? request.runId;
    const causationId = request.causationId ?? request.runId;
    await step.run('log-agent-run-started', async () => {
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
                runType: 'teacher_summary_draft',
                mode: request.mode,
                demoScenario: request.demoScenario ?? null,
                classroomId: request.classroomId,
                teacherId: request.teacherId ?? null,
                evidenceScopes: request.evidenceScopes,
                reviewMode: request.reviewMode,
            },
        });
    });
    try {
        const evidence = await step.run('load-governed-evidence', async () => {
            if (request.mode === 'demo') {
                return buildDemoEvidence({
                    runId: request.runId,
                    mode: request.mode,
                    demoScenario: request.demoScenario,
                    schoolId: request.schoolId,
                    classroomId: request.classroomId,
                    teacherId: request.teacherId,
                    requestedBy: request.requestedBy,
                    focusPrompt: request.focusPrompt,
                    evidenceScopes: request.evidenceScopes,
                });
            }
            return loadLiveEvidence(request.classroomId, request.evidenceScopes as EvidenceScope[]);
        });
        const synthesis = await step.run('synthesize-summary-draft', async () => {
            return synthesizeTeacherSummaryDraft(evidence, request.focusPrompt);
        });
        const governor = {
            maxSteps: request.evidenceScopes.length + 1,
            requestedScopes: request.evidenceScopes,
            executedScopes: request.evidenceScopes,
            synthesisMode: synthesis.synthesisMode,
            reviewMode: request.reviewMode,
        };
        await step.run('log-agent-run-completed', async () => {
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
                    runType: 'teacher_summary_draft',
                    mode: request.mode,
                    demoScenario: request.demoScenario ?? null,
                    classroomId: request.classroomId,
                    teacherId: request.teacherId ?? null,
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
    }
    catch (error) {
        await step.run('log-agent-run-failed', async () => {
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
                    runType: 'teacher_summary_draft',
                    mode: request.mode,
                    demoScenario: request.demoScenario ?? null,
                    classroomId: request.classroomId,
                    teacherId: request.teacherId ?? null,
                    error: error instanceof Error ? error.message : 'Unknown durable-agent failure',
                },
            });
        });
        throw error;
    }
});
