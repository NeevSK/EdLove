import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  discardUnmatchedAttendanceDraftMarks,
  discardAccountPracticeAttendance,
  loadAccountAttendanceDraft,
  loadAccountPracticeAttendance,
  loadExploreAttendance,
  removeSyncedAttendanceDraftMarks,
  restoreAccountAttendanceDraft,
  saveAccountAttendanceDraft,
  saveAccountPracticeAttendance,
  saveExploreAttendance,
  stepAttendanceStatus,
  type AccountAttendanceDraftScope,
  type WorkspaceStudent,
} from './attendance';

const date = '2026-09-17';
const values = new Map<string, string>();

afterEach(() => {
  values.clear();
  vi.unstubAllGlobals();
});

describe('Workspace attendance local Explore adapter', () => {
  it('restores only the selected day and keeps changes in browser storage', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });

    const initial = loadExploreAttendance(date);
    expect(initial.classrooms).toHaveLength(1);
    expect(initial.students.every((student) => student.status === 'present')).toBe(true);

    const changed = initial.students.map((student, index) =>
      index === 0 ? { ...student, status: 'late' as const } : student,
    );
    saveExploreAttendance(date, changed);

    expect(loadExploreAttendance(date).students[0]?.status).toBe('late');
    expect(loadExploreAttendance('2026-09-18').students[0]?.status).toBe('present');
  });

  it('cycles only through the three editable attendance marks', () => {
    expect(stepAttendanceStatus('present')).toBe('late');
    expect(stepAttendanceStatus('late')).toBe('absent');
    expect(stepAttendanceStatus('absent')).toBe('excused');
    expect(stepAttendanceStatus('excused')).toBe('present');
  });
});

describe('Workspace account attendance drafts', () => {
  const scope: AccountAttendanceDraftScope = {
    accountId: 'account-17',
    bondId: 'bond-1',
    entityId: 'classroom-scope-1',
    classroomId: 'classroom-1',
    date,
  };
  const students: readonly WorkspaceStudent[] = [
    { id: 'roster-1', studentId: 'student-1', name: 'Learner one', rollNumber: 1, status: 'late' },
    { id: 'roster-2', studentId: 'student-2', name: 'Learner two', rollNumber: 2, status: 'absent' },
    { id: 'roster-unlinked', studentId: null, name: 'Unlinked learner', rollNumber: 3, status: 'present' },
  ];

  it('stores only linked student marks in the account + bond + scope + classroom + day namespace', () => {
    const local = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => local.get(key) ?? null,
        setItem: (key: string, value: string) => local.set(key, value),
        removeItem: (key: string) => local.delete(key),
      },
    });

    saveAccountAttendanceDraft(scope, students);
    const [key, raw] = [...local.entries()][0] ?? [];
    expect(key).toContain('standard:account:account-17:workspace%3Aattendance%3Abond-1%3Aclassroom-scope-1%3Aclassroom-1%3A2026-09-17');
    expect(raw).not.toContain('Learner one');
    expect(raw).toContain('student-1');
    expect(loadAccountAttendanceDraft(scope)?.marks).toEqual({
      'student-1': 'late',
      'student-2': 'absent',
    });
    expect(loadAccountAttendanceDraft({ ...scope, entityId: 'other-scope' })).toBeNull();
  });

  it('restores only current roster IDs, preserves unmatched marks through sync, and requires explicit discard', () => {
    const local = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => local.get(key) ?? null,
        setItem: (key: string, value: string) => local.set(key, value),
        removeItem: (key: string) => local.delete(key),
      },
    });
    saveAccountAttendanceDraft(scope, students);

    const currentRoster = [students[0]!];
    const restored = restoreAccountAttendanceDraft(
      [{ ...students[0]!, status: 'present' }],
      loadAccountAttendanceDraft(scope),
    );
    expect(restored.students[0]?.status).toBe('late');
    expect(restored.unmatchedCount).toBe(1);
    expect(removeSyncedAttendanceDraftMarks(scope, currentRoster)).toBe(1);
    expect(loadAccountAttendanceDraft(scope)?.marks).toEqual({ 'student-2': 'absent' });
    expect(discardUnmatchedAttendanceDraftMarks(scope, currentRoster)).toBe(0);
    expect(loadAccountAttendanceDraft(scope)).toBeNull();
  });

  it('does not claim a durable draft when browser storage rejects the write', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => null,
        setItem: () => {
          throw new Error('quota exceeded');
        },
        removeItem: () => undefined,
      },
    });

    expect(() => saveAccountAttendanceDraft(scope, students)).toThrow(
      'The browser could not keep this pending attendance draft',
    );
  });
});

describe('Workspace account attendance practice adapter', () => {
  const accountId = 'account-practice-17';

  beforeEach(() => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
      },
    });
  });

  it('loads fictional students and keeps saved marks per account, practice feature, and day', () => {
    const initial = loadAccountPracticeAttendance(accountId, date);
    expect(initial.classroom.id).toBe('practice-classroom');
    expect(initial.students.map((student) => student.name)).toEqual(['Nila Sen', 'Ravi Das', 'Mira Anand']);
    expect(initial.students.every((student) => student.status === 'present')).toBe(true);

    const changed = initial.students.map((student, index) =>
      index === 0 ? { ...student, status: 'late' as const } : student,
    );
    saveAccountPracticeAttendance(accountId, date, changed);

    expect(loadAccountPracticeAttendance(accountId, date).students[0]?.status).toBe('late');
    expect(loadAccountPracticeAttendance(accountId, '2026-09-18').students[0]?.status).toBe('present');
    expect(loadAccountPracticeAttendance('different-account', date).students[0]?.status).toBe('present');
    const stored = [...values.values()].join('\n');
    expect(stored).not.toContain('Learner one');
    expect(stored).not.toContain('Nila Sen');
  });

  it('discards only the selected account attendance practice workspace', () => {
    const changed = loadAccountPracticeAttendance(accountId, date).students.map((student) => ({
      ...student,
      status: 'absent' as const,
    }));
    saveAccountPracticeAttendance(accountId, date, changed);
    saveAccountPracticeAttendance('different-account', date, changed);

    discardAccountPracticeAttendance(accountId);

    expect(loadAccountPracticeAttendance(accountId, date).students.every((student) => student.status === 'present')).toBe(true);
    expect(loadAccountPracticeAttendance('different-account', date).students.every((student) => student.status === 'absent')).toBe(true);
  });

  it('preserves malformed practice data and reports storage failures', () => {
    const first = loadAccountPracticeAttendance(accountId, date);
    saveAccountPracticeAttendance(accountId, date, first.students);
    const [key] = [...values.entries()][0] ?? [];
    if (!key) throw new Error('Practice storage key was not created.');
    values.set(key, '{invalid-json');

    expect(() => loadAccountPracticeAttendance(accountId, date)).toThrow(
      'could not read the local attendance practice workspace',
    );
    expect(values.get(key)).toBe('{invalid-json');
  });

  it('reports quota and discard failures without claiming practice data was saved or removed', () => {
    const practice = loadAccountPracticeAttendance(accountId, date);
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: () => {
          throw new Error('quota exceeded');
        },
        removeItem: () => {
          throw new Error('storage unavailable');
        },
      },
    });
    expect(() => saveAccountPracticeAttendance(accountId, date, practice.students)).toThrow(
      'The browser could not keep this local attendance practice',
    );

    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: () => {
          throw new Error('storage unavailable');
        },
      },
    });
    saveAccountPracticeAttendance(accountId, date, practice.students);
    const [key] = [...values.keys()];
    expect(key).toBeDefined();
    expect(() => discardAccountPracticeAttendance(accountId)).toThrow(
      'could not be discarded from this browser',
    );
    if (key) expect(values.has(key)).toBe(true);
  });
});
