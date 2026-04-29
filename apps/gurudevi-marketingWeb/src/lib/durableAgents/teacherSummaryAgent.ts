import type { SupabaseClient } from '@supabase/supabase-js';
import { type DurableAgentSynthesisMode, synthesizeDurableAgentDraft } from './llmProvider';

export type EvidenceScope = 'attendance' | 'grades' | 'wellbeing' | 'assignments';

export type TeacherSummaryRunMode = 'demo' | 'live';
export type TeacherSummaryDemoScenario = 'attendance-dip' | 'steady-growth' | 'wellbeing-watch';

export type TeacherSummaryContext = {
  runId: string;
  mode: TeacherSummaryRunMode;
  demoScenario?: TeacherSummaryDemoScenario;
  schoolId: string;
  classroomId: string;
  teacherId?: string | null;
  requestedBy?: string | null;
  focusPrompt?: string;
  evidenceScopes: EvidenceScope[];
};

export type ClassroomSummaryContext = {
  id: string;
  name: string;
  schoolId: string | null;
  teacherId: string | null;
  gradeId: string | null;
};

export type AttendanceEvidence = {
  windowDays: number;
  totalRecords: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number | null;
};

export type GradesEvidence = {
  windowDays: number;
  totalGrades: number;
  publishedGrades: number;
  averageMarks: number | null;
};

export type WellbeingEvidence = {
  windowDays: number;
  moodCheckins: number;
  averageMoodScore: number | null;
};

export type AssignmentsEvidence = {
  overdueAssignments: number;
  ungradedSubmissions: number;
};

export type TeacherSummaryEvidence = {
  classroom: ClassroomSummaryContext;
  attendance?: AttendanceEvidence;
  grades?: GradesEvidence;
  wellbeing?: WellbeingEvidence;
  assignments?: AssignmentsEvidence;
};

export type TeacherSummaryGovernor = {
  maxSteps: number;
  requestedScopes: EvidenceScope[];
  executedScopes: EvidenceScope[];
  synthesisMode: 'openai_responses' | 'deterministic_fallback';
  reviewMode: 'draft_only';
};

type DemoScenarioDefinition = {
  title: string;
  description: string;
  focusPrompt: string;
  evidenceScopes: EvidenceScope[];
  attendance?: AttendanceEvidence;
  grades?: GradesEvidence;
  wellbeing?: WellbeingEvidence;
  assignments?: AssignmentsEvidence;
};

export const teacherSummaryDemoScenarios: Record<
  TeacherSummaryDemoScenario,
  DemoScenarioDefinition
> = {
  'attendance-dip': {
    title: 'Attendance Dip',
    description: 'A class with soft academic performance and a meaningful recent attendance slide.',
    focusPrompt:
      'Draft a calm teacher-facing summary that balances attendance concerns with encouragement and points to the next best action.',
    evidenceScopes: ['attendance', 'grades', 'wellbeing', 'assignments'],
    attendance: {
      windowDays: 14,
      totalRecords: 112,
      presentCount: 97,
      absentCount: 11,
      lateCount: 4,
      attendanceRate: 86.6,
    },
    grades: {
      windowDays: 30,
      totalGrades: 38,
      publishedGrades: 26,
      averageMarks: 71.4,
    },
    wellbeing: {
      windowDays: 14,
      moodCheckins: 24,
      averageMoodScore: 3.4,
    },
    assignments: {
      overdueAssignments: 3,
      ungradedSubmissions: 9,
    },
  },
  'steady-growth': {
    title: 'Steady Growth',
    description:
      'A class trending positively with strong attendance and improved academic consistency.',
    focusPrompt:
      'Draft a teacher-facing progress summary that recognizes growth while naming the next area worth nudging.',
    evidenceScopes: ['attendance', 'grades', 'assignments'],
    attendance: {
      windowDays: 14,
      totalRecords: 108,
      presentCount: 103,
      absentCount: 2,
      lateCount: 3,
      attendanceRate: 95.4,
    },
    grades: {
      windowDays: 30,
      totalGrades: 42,
      publishedGrades: 39,
      averageMarks: 78.8,
    },
    assignments: {
      overdueAssignments: 1,
      ungradedSubmissions: 3,
    },
  },
  'wellbeing-watch': {
    title: 'Wellbeing Watch',
    description:
      'Academic activity is acceptable, but the wellbeing signal suggests a gentle check-in is warranted.',
    focusPrompt:
      'Draft a teacher-facing note that is careful, non-diagnostic, and attentive to soft wellbeing signals.',
    evidenceScopes: ['attendance', 'wellbeing', 'assignments'],
    attendance: {
      windowDays: 14,
      totalRecords: 104,
      presentCount: 91,
      absentCount: 8,
      lateCount: 5,
      attendanceRate: 87.5,
    },
    wellbeing: {
      windowDays: 14,
      moodCheckins: 18,
      averageMoodScore: 2.8,
    },
    assignments: {
      overdueAssignments: 2,
      ungradedSubmissions: 4,
    },
  },
};

export function getTeacherSummaryDemoScenario(scenario?: TeacherSummaryDemoScenario) {
  return teacherSummaryDemoScenarios[scenario ?? 'attendance-dip'];
}

function asPercent(value: number | null) {
  if (value === null || Number.isNaN(value)) return 'unknown';
  return `${Math.round(value)}%`;
}

export async function loadClassroomSummaryContext(
  supabase: SupabaseClient,
  classroomId: string,
): Promise<ClassroomSummaryContext> {
  const { data, error } = await supabase
    .from('classrooms')
    .select('id, name, school_id, teacher_id, grade_id')
    .eq('id', classroomId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error(`Classroom ${classroomId} was not found.`);
  }

  return {
    id: data.id,
    name: data.name,
    schoolId: data.school_id ?? null,
    teacherId: data.teacher_id ?? null,
    gradeId: data.grade_id ?? null,
  };
}

export async function loadAttendanceEvidence(
  supabase: SupabaseClient,
  classroomId: string,
  windowDays = 14,
): Promise<AttendanceEvidence> {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('attendance')
    .select('status, created_at')
    .eq('classroom_id', classroomId)
    .gte('created_at', since);

  if (error) throw error;

  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;

  for (const row of data ?? []) {
    const status = String(row.status ?? '').toLowerCase();
    if (status === 'present') presentCount++;
    else if (status === 'absent') absentCount++;
    else if (status === 'late') lateCount++;
  }

  const totalRecords = (data ?? []).length;
  const attendanceRate = totalRecords > 0 ? (presentCount / totalRecords) * 100 : null;

  return {
    windowDays,
    totalRecords,
    presentCount,
    absentCount,
    lateCount,
    attendanceRate,
  };
}

export async function loadGradesEvidence(
  supabase: SupabaseClient,
  classroomId: string,
  windowDays = 30,
): Promise<GradesEvidence> {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('grades')
    .select('marks, publication_state, created_at')
    .eq('classroom_id', classroomId)
    .gte('created_at', since);

  if (error) throw error;

  const marks = (data ?? [])
    .map((row) => Number(row.marks))
    .filter((value) => Number.isFinite(value));
  const publishedGrades = (data ?? []).filter(
    (row) => row.publication_state === 'published',
  ).length;

  return {
    windowDays,
    totalGrades: (data ?? []).length,
    publishedGrades,
    averageMarks:
      marks.length > 0 ? marks.reduce((sum, value) => sum + value, 0) / marks.length : null,
  };
}

export async function loadWellbeingEvidence(
  supabase: SupabaseClient,
  classroomId: string,
  windowDays = 14,
): Promise<WellbeingEvidence> {
  const { data: students, error: studentsError } = await supabase
    .from('classroom_students')
    .select('student_id')
    .eq('classroom_id', classroomId)
    .eq('status', 'active');

  if (studentsError) throw studentsError;

  const studentIds = (students ?? [])
    .map((row) => row.student_id)
    .filter((value): value is string => typeof value === 'string');

  if (studentIds.length === 0) {
    return {
      windowDays,
      moodCheckins: 0,
      averageMoodScore: null,
    };
  }

  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('mood_logs')
    .select('mood_score, occurred_at')
    .in('user_id', studentIds)
    .gte('occurred_at', since);

  if (error) throw error;

  const scores = (data ?? [])
    .map((row) => Number(row.mood_score))
    .filter((value) => Number.isFinite(value));

  return {
    windowDays,
    moodCheckins: (data ?? []).length,
    averageMoodScore:
      scores.length > 0 ? scores.reduce((sum, value) => sum + value, 0) / scores.length : null,
  };
}

export async function loadAssignmentsEvidence(
  supabase: SupabaseClient,
  classroomId: string,
): Promise<AssignmentsEvidence> {
  const today = new Date().toISOString();

  const { data: assignments, error: assignmentsError } = await supabase
    .from('assignments')
    .select('id')
    .eq('classroom_id', classroomId)
    .lte('due_date', today)
    .limit(20);

  if (assignmentsError) throw assignmentsError;

  const assignmentIds = (assignments ?? [])
    .map((row) => row.id)
    .filter((value): value is string => typeof value === 'string');

  if (assignmentIds.length === 0) {
    return {
      overdueAssignments: 0,
      ungradedSubmissions: 0,
    };
  }

  const { data: submissions, error: submissionsError } = await supabase
    .from('submissions')
    .select('assignment_id')
    .in('assignment_id', assignmentIds)
    .is('grade', null);

  if (submissionsError) throw submissionsError;

  return {
    overdueAssignments: assignmentIds.length,
    ungradedSubmissions: (submissions ?? []).length,
  };
}

export function buildDemoEvidence(context: TeacherSummaryContext): TeacherSummaryEvidence {
  const scenario = getTeacherSummaryDemoScenario(context.demoScenario);
  const classroom: ClassroomSummaryContext = {
    id: context.classroomId,
    name: 'Grade 7 Lotus',
    schoolId: context.schoolId,
    teacherId: context.teacherId ?? '00000000-0000-0000-0000-000000000007',
    gradeId: '00000000-0000-0000-0000-000000000017',
  };

  return {
    classroom,
    attendance: context.evidenceScopes.includes('attendance') ? scenario.attendance : undefined,
    grades: context.evidenceScopes.includes('grades') ? scenario.grades : undefined,
    wellbeing: context.evidenceScopes.includes('wellbeing') ? scenario.wellbeing : undefined,
    assignments: context.evidenceScopes.includes('assignments') ? scenario.assignments : undefined,
  };
}

export function buildDeterministicTeacherSummary(
  evidence: TeacherSummaryEvidence,
  focusPrompt?: string,
): string {
  const lines: string[] = [`Draft summary for ${evidence.classroom.name}:`];

  if (focusPrompt) {
    lines.push(`Focus: ${focusPrompt}`);
  }

  if (evidence.attendance) {
    lines.push(
      `Attendance over the last ${evidence.attendance.windowDays} days is ${asPercent(evidence.attendance.attendanceRate)}, with ${evidence.attendance.absentCount} absences and ${evidence.attendance.lateCount} late marks recorded.`,
    );
  }

  if (evidence.grades) {
    lines.push(
      `Grading activity shows ${evidence.grades.totalGrades} recorded grades in the recent window, ${evidence.grades.publishedGrades} already published, and an average marks level of ${
        evidence.grades.averageMarks === null ? 'unknown' : evidence.grades.averageMarks.toFixed(1)
      }.`,
    );
  }

  if (evidence.wellbeing) {
    lines.push(
      `Wellbeing signals remain light but meaningful: ${evidence.wellbeing.moodCheckins} mood check-ins with an average score of ${
        evidence.wellbeing.averageMoodScore === null
          ? 'unknown'
          : evidence.wellbeing.averageMoodScore.toFixed(1)
      }/5.`,
    );
  }

  if (evidence.assignments) {
    lines.push(
      `There are ${evidence.assignments.overdueAssignments} overdue assignments in view and ${evidence.assignments.ungradedSubmissions} ungraded submissions still waiting for closure.`,
    );
  }

  lines.push(
    'Suggested next move: review the absent students first, then clear the ungraded submissions, and finally decide whether any wellbeing patterns need a quiet check-in rather than a policy reaction.',
  );
  lines.push('This is a draft for human review, not an automated judgment.');

  return lines.join('\n\n');
}

export async function synthesizeTeacherSummaryDraft(
  evidence: TeacherSummaryEvidence,
  focusPrompt?: string,
): Promise<{
  summaryDraft: string;
  synthesisMode: DurableAgentSynthesisMode;
}> {
  return synthesizeDurableAgentDraft({
    systemPrompt:
      'You are drafting a teacher-facing class summary for internal review. Be warm, specific, non-surveillant, and evidence-bound. Never overclaim. Never diagnose. End with one careful suggested next move. Keep it under 220 words.',
    userPayload: {
      focusPrompt: focusPrompt ?? null,
      evidence,
      output_shape: {
        style: 'three short paragraphs',
        end_with: 'one suggested next move',
        note: 'state clearly that this is a draft for human review',
      },
    },
    deterministicFallback: buildDeterministicTeacherSummary(evidence, focusPrompt),
  });
}
