import { SOVEREIGN_ORPC_URL } from '@repo/core/api/base';
import { registerTokenResolver } from '@repo/core/api/clientRuntime';
import { orpcClient } from '@repo/core/api/orpcClient';
import { assertSecureApiUrl } from '@repo/core/api/transportSecurity';
import {
  createPersistenceIdentity,
  derivePersistenceKey,
} from '@repo/core/lib/persistenceBoundary';
import {
  createAccountPracticeScope,
  deriveAccountPracticeKey,
  resolveAccountPracticeWriteDecision,
} from '@repo/core/lib/practiceBoundary';
import { createBrowserSupabaseClient } from '../supabase/browser';

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';
export type WorkspaceClassroom = Readonly<{ id: string; name: string; subject: string | null }>;
export type WorkspaceStudent = Readonly<{
  id: string;
  studentId: string | null;
  name: string;
  rollNumber: number | null;
  status: AttendanceStatus;
}>;

export type AccountAttendanceDraftScope = Readonly<{
  accountId: string;
  bondId: string;
  entityId: string;
  classroomId: string;
  date: string;
}>;

export type AccountAttendanceDraft = Readonly<{
  version: 1;
  updatedAt: number;
  marks: Readonly<Record<string, AttendanceStatus>>;
}>;

type AttendanceRow = Readonly<{ student_id: string; status: string }>;
const demoKey = 'gurudevi.explore.workspace.attendance.v1';
const practiceVersion = 1 as const;
const accountDraftVersion = 1 as const;
const demoClassroom: WorkspaceClassroom = {
  id: 'explore-classroom',
  name: 'Forest Learning Circle',
  subject: 'Integrated learning',
};
const demoStudents = [
  { id: 'explore-student-1', studentId: 'explore-student-1', name: 'Amara Perera', rollNumber: 1 },
  { id: 'explore-student-2', studentId: 'explore-student-2', name: 'Kavi Fernando', rollNumber: 2 },
  { id: 'explore-student-3', studentId: 'explore-student-3', name: 'Mihiri Silva', rollNumber: 3 },
];
const practiceClassroom: WorkspaceClassroom = {
  id: 'practice-classroom',
  name: 'Practice Learning Circle',
  subject: 'Integrated learning',
};
const practiceStudents = [
  { id: 'practice-student-1', studentId: 'practice-student-1', name: 'Nila Sen', rollNumber: 1 },
  { id: 'practice-student-2', studentId: 'practice-student-2', name: 'Ravi Das', rollNumber: 2 },
  { id: 'practice-student-3', studentId: 'practice-student-3', name: 'Mira Anand', rollNumber: 3 },
];

function practiceStorageKey(accountId: string): string {
  const scope = createAccountPracticeScope({
    accountId,
    featureId: 'attendance',
    workspaceId: 'daily-roll-call',
  });
  return deriveAccountPracticeKey(scope, 'marks-by-date');
}

function readPracticeMarks(accountId: string): Record<string, Record<string, AttendanceStatus>> {
  const key = practiceStorageKey(accountId);
  try {
    const value: unknown = JSON.parse(
      window.localStorage.getItem(key) ?? '{"version":1,"dates":{}}',
    );
    if (!isRecord(value) || value.version !== practiceVersion || !isRecord(value.dates))
      throw new Error(
        'The saved attendance practice workspace is unreadable. It has not been removed.',
      );
    const dates = Object.entries(value.dates).map(([date, marks]) => {
      if (!isRecord(marks))
        throw new Error(
          'The saved attendance practice workspace is unreadable. It has not been removed.',
        );
      const validMarks = statusMap(marks);
      if (Object.keys(validMarks).length !== Object.keys(marks).length)
        throw new Error(
          'The saved attendance practice workspace has invalid marks. It has not been removed.',
        );
      return [date, validMarks] as const;
    });
    return Object.fromEntries(dates);
  } catch (cause) {
    if (cause instanceof Error && cause.message.includes('practice workspace')) throw cause;
    throw new Error('This browser could not read the local attendance practice workspace.');
  }
}

export function loadAccountPracticeAttendance(
  accountId: string,
  date: string,
): Readonly<{
  classroom: WorkspaceClassroom;
  students: readonly WorkspaceStudent[];
}> {
  const saved = readPracticeMarks(accountId)[date] ?? {};
  return {
    classroom: practiceClassroom,
    students: practiceStudents.map((student) => ({
      ...student,
      status: saved[student.studentId] ?? 'present',
    })),
  };
}

export function saveAccountPracticeAttendance(
  accountId: string,
  date: string,
  students: readonly WorkspaceStudent[],
): void {
  const scope = createAccountPracticeScope({
    accountId,
    featureId: 'attendance',
    workspaceId: 'daily-roll-call',
  });
  if (!resolveAccountPracticeWriteDecision(scope, 'local').allowed)
    throw new Error('Local attendance practice is unavailable for this account.');
  const allDates = readPracticeMarks(accountId);
  const marks = Object.fromEntries(
    students.flatMap((student) => (student.studentId ? [[student.studentId, student.status]] : [])),
  );
  try {
    window.localStorage.setItem(
      practiceStorageKey(accountId),
      JSON.stringify({ version: practiceVersion, dates: { ...allDates, [date]: marks } }),
    );
  } catch {
    throw new Error(
      'The browser could not keep this local attendance practice. Free storage and retry.',
    );
  }
}

export function discardAccountPracticeAttendance(accountId: string): void {
  const scope = createAccountPracticeScope({
    accountId,
    featureId: 'attendance',
    workspaceId: 'daily-roll-call',
  });
  if (!resolveAccountPracticeWriteDecision(scope, 'local').allowed)
    throw new Error('Local attendance practice is unavailable for this account.');
  try {
    window.localStorage.removeItem(practiceStorageKey(accountId));
  } catch {
    throw new Error('The attendance practice workspace could not be discarded from this browser.');
  }
}

function accountDraftKey(scope: AccountAttendanceDraftScope): string {
  const identity = createPersistenceIdentity({
    experience: 'standard',
    principal: { kind: 'account', id: scope.accountId },
  });
  return derivePersistenceKey(
    identity,
    `workspace:attendance:${scope.bondId}:${scope.entityId}:${scope.classroomId}:${scope.date}`,
  );
}

function parseAccountDraft(value: string | null): AccountAttendanceDraft | null {
  if (!value) return null;
  const parsed: unknown = JSON.parse(value);
  if (!isRecord(parsed) || parsed.version !== accountDraftVersion || !isRecord(parsed.marks))
    throw new Error('The saved attendance draft is unreadable. It has not been removed.');
  const marks = statusMap(parsed.marks);
  if (Object.keys(marks).length !== Object.keys(parsed.marks).length)
    throw new Error('The saved attendance draft contains unknown marks. It has not been removed.');
  return {
    version: accountDraftVersion,
    updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : 0,
    marks,
  };
}

export function loadAccountAttendanceDraft(
  scope: AccountAttendanceDraftScope,
): AccountAttendanceDraft | null {
  try {
    return parseAccountDraft(window.localStorage.getItem(accountDraftKey(scope)));
  } catch (cause) {
    if (cause instanceof Error && cause.message.includes('draft')) throw cause;
    throw new Error(
      'This browser could not read the pending attendance draft. It was not removed.',
    );
  }
}

export function saveAccountAttendanceDraft(
  scope: AccountAttendanceDraftScope,
  students: readonly WorkspaceStudent[],
): AccountAttendanceDraft {
  const currentMarks = Object.fromEntries(
    students.flatMap((student) => (student.studentId ? [[student.studentId, student.status]] : [])),
  );
  const existing = loadAccountAttendanceDraft(scope);
  const draft: AccountAttendanceDraft = {
    version: accountDraftVersion,
    updatedAt: Date.now(),
    marks: { ...existing?.marks, ...currentMarks },
  };
  try {
    window.localStorage.setItem(accountDraftKey(scope), JSON.stringify(draft));
  } catch {
    throw new Error(
      'The browser could not keep this pending attendance draft. Free storage and retry.',
    );
  }
  return draft;
}

export function clearAccountAttendanceDraft(scope: AccountAttendanceDraftScope): void {
  try {
    window.localStorage.removeItem(accountDraftKey(scope));
  } catch {
    throw new Error(
      'Attendance synced, but its local draft could not be cleared from this browser.',
    );
  }
}

export function removeSyncedAttendanceDraftMarks(
  scope: AccountAttendanceDraftScope,
  students: readonly WorkspaceStudent[],
): number {
  const draft = loadAccountAttendanceDraft(scope);
  if (!draft) return 0;
  const syncedIds = new Set(
    students.flatMap((student) => (student.studentId ? [student.studentId] : [])),
  );
  const remaining = Object.fromEntries(
    Object.entries(draft.marks).filter(([studentId]) => !syncedIds.has(studentId)),
  );
  if (!Object.keys(remaining).length) {
    clearAccountAttendanceDraft(scope);
    return 0;
  }
  try {
    window.localStorage.setItem(
      accountDraftKey(scope),
      JSON.stringify({ ...draft, updatedAt: Date.now(), marks: remaining }),
    );
  } catch {
    throw new Error('Attendance synced, but pending local marks could not be updated.');
  }
  return Object.keys(remaining).length;
}

export function discardUnmatchedAttendanceDraftMarks(
  scope: AccountAttendanceDraftScope,
  students: readonly WorkspaceStudent[],
): number {
  const draft = loadAccountAttendanceDraft(scope);
  if (!draft) return 0;
  const rosterIds = new Set(
    students.flatMap((student) => (student.studentId ? [student.studentId] : [])),
  );
  const remaining = Object.fromEntries(
    Object.entries(draft.marks).filter(([studentId]) => rosterIds.has(studentId)),
  );
  if (!Object.keys(remaining).length) {
    clearAccountAttendanceDraft(scope);
    return 0;
  }
  try {
    window.localStorage.setItem(
      accountDraftKey(scope),
      JSON.stringify({ ...draft, updatedAt: Date.now(), marks: remaining }),
    );
  } catch {
    throw new Error('The unmatched draft marks could not be removed from this browser.');
  }
  return Object.keys(remaining).length;
}

export function restoreAccountAttendanceDraft(
  students: readonly WorkspaceStudent[],
  draft: AccountAttendanceDraft | null,
): Readonly<{ students: readonly WorkspaceStudent[]; unmatchedCount: number }> {
  if (!draft) return { students, unmatchedCount: 0 };
  const rosterIds = new Set(
    students.flatMap((student) => (student.studentId ? [student.studentId] : [])),
  );
  const unmatchedCount = Object.keys(draft.marks).filter((id) => !rosterIds.has(id)).length;
  return {
    students: students.map((student) => {
      const restoredStatus = student.studentId ? draft.marks[student.studentId] : undefined;
      return restoredStatus ? { ...student, status: restoredStatus } : student;
    }),
    unmatchedCount,
  };
}

function apiOrigin(): string {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
  if (!value) throw new Error('Workspace services are not configured in this browser.');
  try {
    assertSecureApiUrl(value);
    assertSecureApiUrl(SOVEREIGN_ORPC_URL);
  } catch {
    throw new Error('Workspace services are not configured securely in this browser.');
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function statusMap(value: unknown): Record<string, AttendanceStatus> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, AttendanceStatus] =>
        entry[1] === 'present' ||
        entry[1] === 'late' ||
        entry[1] === 'absent' ||
        entry[1] === 'excused',
    ),
  );
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim())
    throw new Error(`The server returned an invalid ${label}.`);
  return value;
}

function attendanceStatus(value: unknown): AttendanceStatus {
  if (value === 'present' || value === 'late' || value === 'absent' || value === 'excused')
    return value;
  throw new Error('The server returned an unknown attendance status. Refresh and try again.');
}

async function accountFetch(
  path: string,
  expectedSubjectId: string,
  init?: RequestInit,
): Promise<unknown> {
  const origin = apiOrigin();
  const supabase = createBrowserSupabaseClient();
  if (!supabase) throw new Error('Sign in to use your Workspace.');
  const { data, error } = await supabase.auth.getSession();
  const session = data.session;
  if (
    error ||
    !session?.access_token ||
    !session.user.id ||
    session.user.id !== expectedSubjectId
  ) {
    throw new Error('Your secure session has ended. Sign in again to continue.');
  }

  let response: Response;
  try {
    response = await fetch(`${origin}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
      cache: 'no-store',
      redirect: 'error',
    });
  } catch {
    throw new Error('Workspace could not reach Sanctuary. Check your connection and retry.');
  }
  if (response.status === 401 || response.status === 403)
    throw new Error('Your current scope cannot access this classroom.');
  if (!response.ok) throw new Error('Workspace is temporarily unavailable. Please retry.');
  return response.json();
}

async function openApiGet(path: string, expectedSubjectId: string): Promise<unknown> {
  return accountFetch(`/api/openapi${path}`, expectedSubjectId);
}

/**
 * Attendance model A: the "classrooms" offered here are the caller's grade classes
 * (grade_classes, e.g. 5A), because daily_attendance is keyed by grade_class_id.
 * Subject classrooms (classrooms.id) are not attendance targets.
 */
export async function loadAccountClassrooms(
  subjectId: string,
): Promise<readonly WorkspaceClassroom[]> {
  const result = await openApiGet('/attendance/my-grade-classes', subjectId);
  if (!Array.isArray(result)) throw new Error('Workspace received an invalid class list.');
  return result.filter(isRecord).map((row) => ({
    id: requiredString(row.id, 'grade class identity'),
    name: requiredString(row.name, 'grade class name'),
    subject: null,
  }));
}

export async function loadAccountAttendance(
  classroom: WorkspaceClassroom,
  date: string,
  subjectId: string,
): Promise<readonly WorkspaceStudent[]> {
  const gradeClassId = encodeURIComponent(classroom.id);
  const [rosterValue, attendanceValue] = await Promise.all([
    openApiGet(
      `/attendance/grade-class-roster?gradeClassId=${gradeClassId}&date=${encodeURIComponent(date)}`,
      subjectId,
    ),
    openApiGet(
      `/attendance/classroom?gradeClassId=${gradeClassId}&date=${encodeURIComponent(date)}`,
      subjectId,
    ),
  ]);
  if (!Array.isArray(rosterValue) || !Array.isArray(attendanceValue))
    throw new Error('Workspace received an invalid attendance response.');
  const attendanceByStudent = new Map<string, AttendanceStatus>();
  for (const row of attendanceValue.filter(isRecord)) {
    attendanceByStudent.set(
      requiredString(row.student_id, 'student identity'),
      attendanceStatus(row.status),
    );
  }
  return rosterValue.filter(isRecord).map((row) => {
    const id = requiredString(row.enrollment_id, 'enrollment identity');
    // Enrollments reference a student account; fallback to enrollment id so shadow learners are always markable.
    const studentId = typeof row.student_id === 'string' && row.student_id ? row.student_id : id;
    return {
      id,
      studentId,
      name:
        typeof row.full_name === 'string' && row.full_name.trim()
          ? row.full_name
          : `Learner ${id.slice(0, 6)}`,
      rollNumber: null,
      status: attendanceByStudent.get(studentId) ?? 'present',
    };
  });
}

export async function saveAccountAttendance(
  classroom: WorkspaceClassroom,
  date: string,
  students: readonly WorkspaceStudent[],
  expectedSubjectId: string,
): Promise<void> {
  apiOrigin();
  const supabase = createBrowserSupabaseClient();
  if (!supabase) throw new Error('Sign in to save attendance to your Workspace.');
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token || data.session.user.id !== expectedSubjectId)
    throw new Error('Your secure session has ended. Sign in again.');
  registerTokenResolver(async () => {
    const session = await supabase.auth.getSession();
    if (session.error) throw session.error;
    if (session.data.session?.user.id !== expectedSubjectId)
      throw new Error('Your active account changed. Reload Workspace before saving.');
    return session.data.session?.access_token ?? null;
  });
  const markableStudents = students.filter(
    (student): student is WorkspaceStudent & { studentId: string } => student.studentId !== null,
  );
  try {
    const result: unknown = await orpcClient.attendance.batchRecord({
      body: markableStudents.map((student) => ({
        gradeClassId: classroom.id,
        studentId: student.studentId,
        status: student.status,
        date,
      })),
    });
    if (
      !Array.isArray(result) ||
      result.length !== markableStudents.length ||
      result.some(
        (row, index) =>
          !isRecord(row) ||
          row.student_id !== markableStudents[index]?.studentId ||
          row.status !== markableStudents[index]?.status,
      )
    ) {
      throw new Error('Sanctuary returned an incomplete attendance result.');
    }
  } catch (error) {
    if (error instanceof Error && /403|forbidden|unauthorized/i.test(error.message))
      throw new Error('Your current scope cannot mark attendance for this classroom.');
    throw new Error('Attendance was not saved. Check your connection and retry.');
  }
}

export function loadExploreAttendance(date: string): Readonly<{
  classrooms: readonly WorkspaceClassroom[];
  classroom: WorkspaceClassroom;
  students: readonly WorkspaceStudent[];
}> {
  const classroom = demoClassroom;
  let saved: Record<string, AttendanceStatus> = {};
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(demoKey) ?? '{}');
    if (isRecord(value)) saved = statusMap(value[date]);
  } catch {
    throw new Error('This browser could not read the local Explore workspace.');
  }
  return {
    classrooms: [classroom],
    classroom,
    students: demoStudents.map((student) => ({
      ...student,
      status: saved[student.studentId] ?? 'present',
    })),
  };
}

export function saveExploreAttendance(date: string, students: readonly WorkspaceStudent[]): void {
  let allDates: Record<string, Record<string, AttendanceStatus>> = {};
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(demoKey) ?? '{}');
    if (isRecord(value)) {
      allDates = Object.fromEntries(
        Object.entries(value).flatMap(([storedDate, statuses]) =>
          isRecord(statuses) ? [[storedDate, statusMap(statuses)]] : [],
        ),
      );
    }
  } catch {
    throw new Error('This browser could not read the local Explore workspace.');
  }
  const marks = Object.fromEntries(
    students.flatMap((student) => (student.studentId ? [[student.studentId, student.status]] : [])),
  );
  try {
    window.localStorage.setItem(demoKey, JSON.stringify({ ...allDates, [date]: marks }));
  } catch {
    throw new Error(
      'The browser could not keep this local Explore change. Free some storage and retry.',
    );
  }
}

export function stepAttendanceStatus(status: AttendanceStatus): AttendanceStatus {
  const cycle: readonly AttendanceStatus[] = ['present', 'late', 'absent', 'excused'];
  const nextIndex = (cycle.indexOf(status) + 1) % cycle.length;
  return cycle[nextIndex] ?? 'present';
}
