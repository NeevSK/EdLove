import {
  studentSupportRequestedEvent,
  studentSupportRequestedPayloadSchema,
  teacherSummaryRequestedEvent,
  teacherSummaryRequestedPayloadSchema,
} from '@repo/core/logic/events/schemas';
import { v7 as uuidv7 } from '@repo/core/logic/utils/uuid';
import { queryDatabaseRows } from '@repo/database/client';
import { sanctuaryInngest } from './inngest';

type SupportRequest = ReturnType<typeof studentSupportRequestedPayloadSchema.parse>;
type SummaryRequest = ReturnType<typeof teacherSummaryRequestedPayloadSchema.parse>;

const json = (value: unknown) => JSON.stringify(value);

async function audit(
  action: string,
  runId: string,
  schoolId: string,
  metadata: Record<string, unknown>,
) {
  await queryDatabaseRows(
    `
      insert into public.durable_agent_run_events
        (id, run_id, event_type, school_id, idempotency_key, metadata)
      values ($1::uuid, $3::uuid, $2, $4::uuid, $5, $6::jsonb)
      on conflict (idempotency_key) do nothing
      returning id
    `,
    [uuidv7(), action, runId, schoolId, `durable-agent:${runId}:${action}`, json(metadata)],
  );
  const update =
    action === 'durable_agent_started'
      ? `update public.durable_agent_runs set status = 'running', updated_at = now() where id = $1::uuid`
      : action === 'durable_agent_completed'
        ? `update public.durable_agent_runs set status = 'completed', summary_draft = $2, evidence = $3::jsonb, governor = $4::jsonb, updated_at = now() where id = $1::uuid`
        : action === 'durable_agent_failed'
          ? `update public.durable_agent_runs set status = 'failed', error = $2, updated_at = now() where id = $1::uuid`
          : null;
  if (update) {
    const parameters =
      action === 'durable_agent_started'
        ? [runId]
        : action === 'durable_agent_completed'
          ? [
              runId,
              metadata.summaryDraft ?? null,
              metadata.evidence ? json(metadata.evidence) : null,
              metadata.governor ? json(metadata.governor) : null,
            ]
          : [runId, metadata.error ?? null];
    await queryDatabaseRows(update, parameters);
  }
}

function demoStudent(request: SupportRequest) {
  const scenario = request.demoScenario ?? 'quiet-struggle';
  return {
    student: {
      studentId: request.studentId,
      studentName: request.studentName ?? 'Student',
      classroomId: request.classroomId,
      classroomName: 'Demo classroom',
      schoolId: request.schoolId,
      teacherId: request.teacherId,
    },
    attendance: request.evidenceScopes.includes('attendance')
      ? {
          windowDays: 21,
          totalRecords: 21,
          presentCount: scenario === 'resilient-improver' ? 20 : 15,
          absentCount: scenario === 'resilient-improver' ? 1 : 4,
          lateCount: 2,
          attendanceRate: scenario === 'resilient-improver' ? 95.2 : 71.4,
        }
      : undefined,
    grades: request.evidenceScopes.includes('grades')
      ? {
          windowDays: 45,
          totalGrades: 6,
          averageMarks: scenario === 'resilient-improver' ? 74.8 : 58.5,
          latestMarks: scenario === 'resilient-improver' ? [69, 75, 81] : [61, 59, 57],
        }
      : undefined,
    wellbeing: request.evidenceScopes.includes('wellbeing')
      ? { windowDays: 14, moodCheckins: 6, averageMoodScore: 2.7 }
      : undefined,
  };
}

async function liveStudent(request: SupportRequest) {
  const [student, classroom] = await Promise.all([
    queryDatabaseRows<any>('select id, full_name from public.users where id = $1::uuid limit 1', [
      request.studentId,
    ]),
    queryDatabaseRows<any>(
      'select id, name, school_id, teacher_id from public.classrooms where id = $1::uuid limit 1',
      [request.classroomId],
    ),
  ]);
  const result: any = {
    student: {
      studentId: request.studentId,
      studentName: student[0]?.full_name ?? request.studentName ?? 'Student',
      classroomId: request.classroomId,
      classroomName: classroom[0]?.name ?? 'Classroom',
      schoolId: classroom[0]?.school_id ?? request.schoolId,
      teacherId: classroom[0]?.teacher_id ?? request.teacherId,
    },
  };
  const sinceAttendance = new Date(Date.now() - 21 * 86400000).toISOString();
  if (request.evidenceScopes.includes('attendance')) {
    const rows = await queryDatabaseRows<any>(
      `select status from public.attendance where classroom_id = $1::uuid and student_id = $2::uuid and created_at >= $3::timestamptz`,
      [request.classroomId, request.studentId, sinceAttendance],
    );
    const present = rows.filter((row) => String(row.status).toLowerCase() === 'present').length;
    const absent = rows.filter((row) => String(row.status).toLowerCase() === 'absent').length;
    const late = rows.filter((row) => String(row.status).toLowerCase() === 'late').length;
    result.attendance = {
      windowDays: 21,
      totalRecords: rows.length,
      presentCount: present,
      absentCount: absent,
      lateCount: late,
      attendanceRate: rows.length ? (present / rows.length) * 100 : null,
    };
  }
  if (request.evidenceScopes.includes('grades')) {
    const rows = await queryDatabaseRows<any>(
      `select marks from public.grades where classroom_id = $1::uuid and student_id = $2::uuid and created_at >= $3::timestamptz order by created_at desc`,
      [request.classroomId, request.studentId, new Date(Date.now() - 45 * 86400000).toISOString()],
    );
    const marks = rows.map((row) => Number(row.marks)).filter(Number.isFinite);
    result.grades = {
      windowDays: 45,
      totalGrades: rows.length,
      averageMarks: marks.length
        ? marks.reduce((sum, value) => sum + value, 0) / marks.length
        : null,
      latestMarks: marks.slice(0, 3),
    };
  }
  if (request.evidenceScopes.includes('wellbeing')) {
    const rows = await queryDatabaseRows<any>(
      `select mood_score from public.mood_logs where user_id = $1::uuid and occurred_at >= $2::timestamptz`,
      [request.studentId, new Date(Date.now() - 14 * 86400000).toISOString()],
    );
    const scores = rows.map((row) => Number(row.mood_score)).filter(Number.isFinite);
    result.wellbeing = {
      windowDays: 14,
      moodCheckins: rows.length,
      averageMoodScore: scores.length
        ? scores.reduce((sum, value) => sum + value, 0) / scores.length
        : null,
    };
  }
  return result;
}

/** Re-check queued scope before reading sensitive evidence. */
async function assertWorkerScope(request: SupportRequest | SummaryRequest): Promise<void> {
  const rows = await queryDatabaseRows<{ valid: boolean }>(
    `
      select exists(
        select 1
        from public.classrooms classroom
        where classroom.id = $1::uuid
          and classroom.school_id = $2::uuid
          and ($3::uuid is null or classroom.teacher_id = $3::uuid)
          and (
            $4::uuid is null
            or exists (
              select 1 from public.classroom_students enrollment
              where enrollment.classroom_id = classroom.id
                and enrollment.student_id = $4::uuid
                and enrollment.status = 'active'
            )
          )
      ) as valid
    `,
    [request.classroomId, request.schoolId, request.teacherId ?? null, 'studentId' in request ? request.studentId : null],
  );
  if (!rows[0]?.valid) throw new Error('Durable agent scope is no longer authorized.');
}

function draft(evidence: any, focusPrompt?: string) {
  const name = evidence.student.studentName;
  const lines = [`Student support snapshot for ${name} in ${evidence.student.classroomName}.`];
  if (focusPrompt) lines.push(`Focus: ${focusPrompt}`);
  if (evidence.attendance)
    lines.push(
      `Attendance across ${evidence.attendance.windowDays} days is ${evidence.attendance.attendanceRate === null ? 'unknown' : `${Math.round(evidence.attendance.attendanceRate)}%`}, with ${evidence.attendance.absentCount} absences and ${evidence.attendance.lateCount} late marks.`,
    );
  if (evidence.grades)
    lines.push(
      `Recent grade evidence includes ${evidence.grades.totalGrades} scores; the average is ${evidence.grades.averageMarks === null ? 'unknown' : evidence.grades.averageMarks.toFixed(1)}.`,
    );
  if (evidence.wellbeing)
    lines.push(
      `There are ${evidence.wellbeing.moodCheckins} wellbeing check-ins in the recent window.`,
    );
  lines.push(
    'Suggested next move: do one quiet teacher check-in, confirm whether the pattern is temporary or persistent, and decide whether a gentle classroom support adjustment would help. This is a draft for human review, not an automated judgment.',
  );
  return lines.join('\n\n');
}

function draftTeacherSummary(evidence: any, focusPrompt?: string) {
  const lines = [`Teacher summary draft for ${evidence.classroom.name}.`];
  if (focusPrompt) lines.push(`Focus: ${focusPrompt}`);
  if (evidence.attendance)
    lines.push(
      `The recent attendance window contains ${evidence.attendance.totalRecords} records, including ${evidence.attendance.absentCount} absences and ${evidence.attendance.lateCount} late marks.`,
    );
  if (evidence.grades)
    lines.push(
      `Recent grade evidence covers ${evidence.grades.totalGrades} marks with an average of ${evidence.grades.averageMarks === null ? 'unknown' : evidence.grades.averageMarks.toFixed(1)}.`,
    );
  if (evidence.wellbeing)
    lines.push(
      `The recent wellbeing window contains ${evidence.wellbeing.moodCheckins} check-ins.`,
    );
  if (evidence.assignments)
    lines.push(
      `Assignment evidence includes ${evidence.assignments.totalAssignments} assignments and ${evidence.assignments.submittedCount} submissions.`,
    );
  lines.push(
    'Suggested next move: review one concrete pattern with the teaching team and choose a small supportive adjustment. This is a draft for human review, not an automated judgment.',
  );
  return lines.join('\n\n');
}

function extractResponseText(body: any): string | null {
  if (typeof body?.output_text === 'string' && body.output_text.trim())
    return body.output_text.trim();
  const fragments = (body?.output ?? [])
    .flatMap((item: any) =>
      (item?.content ?? []).map((part: any) =>
        typeof part?.text === 'string' ? part.text.trim() : '',
      ),
    )
    .filter(Boolean);
  return fragments.length ? fragments.join('\n\n') : null;
}

function extractAnthropicText(body: any): string | null {
  const fragments = (body?.content ?? [])
    .map((part: any) => (typeof part?.text === 'string' ? part.text.trim() : ''))
    .filter(Boolean);
  return fragments.length ? fragments.join('\n\n') : null;
}

async function synthesize(
  evidence: any,
  focusPrompt?: string,
  systemPrompt = 'Draft a warm, evidence-bound, non-diagnostic teacher-facing student support snapshot. Never rank, label, diagnose, or make an automated judgment. End with one careful next move and state that it is a draft for human review.',
) {
  const fallbackDraft = evidence.student
    ? draft(evidence, focusPrompt)
    : draftTeacherSummary(evidence, focusPrompt);
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey)
    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.DURABLE_AGENT_MODEL ?? 'gpt-4.1-mini',
          max_output_tokens: 420,
          input: [
            { role: 'system', content: [{ type: 'input_text', text: systemPrompt }] },
            {
              role: 'user',
              content: [
                {
                  type: 'input_text',
                  text: JSON.stringify({ focusPrompt: focusPrompt ?? null, evidence }),
                },
              ],
            },
          ],
        }),
      });
      if (response.ok) {
        const text = extractResponseText(await response.json());
        if (text) return { summaryDraft: text, synthesisMode: 'openai_responses' as const };
      }
    } catch {
      // A deterministic draft is the safe availability fallback.
    }
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.DURABLE_AGENT_ANTHROPIC_MODEL ?? 'claude-3-5-haiku-latest',
          max_tokens: 420,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: JSON.stringify({ focusPrompt: focusPrompt ?? null, evidence }),
            },
          ],
        }),
      });
      if (response.ok) {
        const text = extractAnthropicText(await response.json());
        if (text) return { summaryDraft: text, synthesisMode: 'anthropic_messages' as const };
      }
    } catch {
      // Continue to the deterministic fallback.
    }
  }
  return { summaryDraft: fallbackDraft, synthesisMode: 'deterministic_fallback' as const };
}

async function runStudentSupport(request: SupportRequest) {
  await audit('durable_agent_started', request.runId, request.schoolId, {
    runType: 'student_support_snapshot',
    mode: request.mode,
    classroomId: request.classroomId,
    studentId: request.studentId,
    reviewMode: request.reviewMode,
  });
  try {
    await assertWorkerScope(request);
    const evidence = request.mode === 'demo' ? demoStudent(request) : await liveStudent(request);
    const synthesis = await synthesize(evidence, request.focusPrompt);
    const governor = {
      maxSteps: request.evidenceScopes.length + 1,
      requestedScopes: request.evidenceScopes,
      executedScopes: request.evidenceScopes,
      synthesisMode: synthesis.synthesisMode,
      reviewMode: request.reviewMode,
    };
    await audit('durable_agent_completed', request.runId, request.schoolId, {
      runType: 'student_support_snapshot',
      mode: request.mode,
      schoolId: request.schoolId,
      classroomId: request.classroomId,
      studentId: request.studentId,
      teacherId: request.teacherId,
      studentName: evidence.student.studentName,
      summaryDraft: synthesis.summaryDraft,
      evidence,
      governor,
    });
  } catch (error) {
    await audit('durable_agent_failed', request.runId, request.schoolId, {
      runType: 'student_support_snapshot',
      error: error instanceof Error ? error.message : 'Unknown worker failure',
    });
    throw error;
  }
}

async function runTeacherSummary(request: SummaryRequest) {
  await audit('durable_agent_started', request.runId, request.schoolId, {
    runType: 'teacher_summary_draft',
    mode: request.mode,
    classroomId: request.classroomId,
    teacherId: request.teacherId,
    reviewMode: request.reviewMode,
  });
  try {
    await assertWorkerScope(request);
    const classroomRows = await queryDatabaseRows<any>(
      'select id, name, school_id, teacher_id from public.classrooms where id = $1::uuid limit 1',
      [request.classroomId],
    );
    const classroom = classroomRows[0] ?? {
      id: request.classroomId,
      name: 'Classroom',
      school_id: request.schoolId,
      teacher_id: request.teacherId,
    };
    const evidence: any = {
      classroom: {
        id: classroom.id,
        name: classroom.name,
        schoolId: classroom.school_id,
        teacherId: classroom.teacher_id,
      },
    };
    if (request.evidenceScopes.includes('attendance')) {
      const rows =
        request.mode === 'demo'
          ? Array.from({ length: 21 }, (_, index) => ({
              status: index < 16 ? 'present' : index === 20 ? 'late' : 'absent',
            }))
          : await queryDatabaseRows<any>(
              'select status from public.attendance where classroom_id = $1::uuid and created_at >= $2::timestamptz',
              [request.classroomId, new Date(Date.now() - 21 * 86400000).toISOString()],
            );
      evidence.attendance = {
        windowDays: 21,
        totalRecords: rows.length,
        absentCount: rows.filter((row) => row.status === 'absent').length,
        lateCount: rows.filter((row) => row.status === 'late').length,
        presentCount: rows.filter((row) => row.status === 'present').length,
      };
    }
    if (request.evidenceScopes.includes('grades')) {
      const rows =
        request.mode === 'demo'
          ? [{ marks: 61 }, { marks: 74 }, { marks: 68 }]
          : await queryDatabaseRows<any>(
              'select marks from public.grades where classroom_id = $1::uuid and created_at >= $2::timestamptz',
              [request.classroomId, new Date(Date.now() - 45 * 86400000).toISOString()],
            );
      const marks = rows.map((row) => Number(row.marks)).filter(Number.isFinite);
      evidence.grades = {
        windowDays: 45,
        totalGrades: rows.length,
        averageMarks: marks.length
          ? marks.reduce((sum, value) => sum + value, 0) / marks.length
          : null,
      };
    }
    if (request.evidenceScopes.includes('wellbeing')) {
      const rows =
        request.mode === 'demo'
          ? [{ id: 1 }, { id: 2 }]
          : await queryDatabaseRows<any>(
              'select id from public.mood_logs where occurred_at >= $1::timestamptz and user_id in (select student_id from public.classroom_students where classroom_id = $2::uuid)',
              [new Date(Date.now() - 14 * 86400000).toISOString(), request.classroomId],
            );
      evidence.wellbeing = { windowDays: 14, moodCheckins: rows.length };
    }
    if (request.evidenceScopes.includes('assignments')) {
      const rows =
        request.mode === 'demo'
          ? [{ id: 1 }, { id: 2 }, { id: 3 }]
          : await queryDatabaseRows<any>(
              'select id from public.assignments where classroom_id = $1::uuid',
              [request.classroomId],
            );
      evidence.assignments = { totalAssignments: rows.length, submittedCount: 0 };
    }
    const synthesis = await synthesize(
      evidence,
      request.focusPrompt,
      'Draft a concise, evidence-bound teacher-facing classroom summary. Be warm and specific, do not rank students, diagnose, or make automated judgments. End with one careful next move and state that it is a draft for human review.',
    );
    const summaryDraft = synthesis.summaryDraft;
    const governor = {
      maxSteps: request.evidenceScopes.length + 1,
      requestedScopes: request.evidenceScopes,
      executedScopes: request.evidenceScopes,
      synthesisMode: synthesis.synthesisMode,
      reviewMode: request.reviewMode,
    };
    await audit('durable_agent_completed', request.runId, request.schoolId, {
      runType: 'teacher_summary_draft',
      mode: request.mode,
      schoolId: request.schoolId,
      classroomId: request.classroomId,
      teacherId: request.teacherId,
      summaryDraft,
      evidence,
      governor,
    });
  } catch (error) {
    await audit('durable_agent_failed', request.runId, request.schoolId, {
      runType: 'teacher_summary_draft',
      error: error instanceof Error ? error.message : 'Unknown worker failure',
    });
    throw error;
  }
}

export const studentSupportRequested = sanctuaryInngest.createFunction(
  { id: 'sanctuary-student-support-requested', triggers: [studentSupportRequestedEvent] },
  async ({ event, step }) =>
    step.run('student-support-run', () =>
      runStudentSupport(studentSupportRequestedPayloadSchema.parse(event.data)),
    ),
);

export const teacherSummaryRequested = sanctuaryInngest.createFunction(
  { id: 'sanctuary-teacher-summary-requested', triggers: [teacherSummaryRequestedEvent] },
  async ({ event, step }) => {
    const request = teacherSummaryRequestedPayloadSchema.parse(event.data);
    return step.run('teacher-summary-run', () => runTeacherSummary(request));
  },
);

export const durableAgentFunctions = [studentSupportRequested, teacherSummaryRequested];
