'use client';

import type { DomainTemporalHorizon, WorkbenchTaskDescriptor } from '@repo/core/types';
import { resolvePracticeAvailability } from '@repo/core/logic/registry/capabilityManifest';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useBrowserWorkspaceAppearance } from '../../../lib/canvas/useBrowserWorkspaceAppearance';
import { useDomainWorkbench } from '../../../lib/workbench';
import {
  type AccountAttendanceDraftScope,
  type AttendanceStatus,
  discardAccountPracticeAttendance,
  discardUnmatchedAttendanceDraftMarks,
  loadAccountAttendance,
  loadAccountAttendanceDraft,
  loadAccountClassrooms,
  loadAccountPracticeAttendance,
  loadExploreAttendance,
  removeSyncedAttendanceDraftMarks,
  restoreAccountAttendanceDraft,
  saveAccountAttendance,
  saveAccountAttendanceDraft,
  saveAccountPracticeAttendance,
  saveExploreAttendance,
  stepAttendanceStatus,
  type WorkspaceClassroom,
  type WorkspaceStudent,
} from '../../../lib/workspace/attendance';
import { TaskStrip, TemporalHorizon } from '../components/workbench';
import styles from './workspace.module.css';

type WorkspaceFloorProps = Readonly<{
  mode: 'account' | 'explore';
  subjectId?: string;
  capacity?: string;
  scope?: Readonly<{ bondId: string; entityId: string }>;
}>;
type LoadState = 'loading' | 'ready' | 'error';
const attendanceTask = {
  featureId: 'attendance',
  route: '/workspace',
  title: 'Daily attendance',
  icon: '◷',
  temporalBinding: { kind: 'none' },
  localStatePolicy: 'restore-permitted',
} as const;

function today(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function todayHorizon(): DomainTemporalHorizon {
  return { anchor: { kind: 'date', date: today() }, scale: 'day', intent: 'current' };
}

function moveDate(value: string, delta: number): string {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + delta);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function statusCounts(students: readonly WorkspaceStudent[]) {
  return students.reduce(
    (counts, student) =>
      student.studentId ? { ...counts, [student.status]: counts[student.status] + 1 } : counts,
    { present: 0, late: 0, absent: 0, excused: 0 },
  );
}

export function WorkspaceFloor({ mode, subjectId, capacity, scope }: WorkspaceFloorProps) {
  const floorAppearance = useBrowserWorkspaceAppearance({
    accountId: subjectId ?? 'explore',
    defaultGroupOrder: ['operational'],
    enableRemoteSync: mode === 'account' && Boolean(subjectId),
    workspaceId: 'workspace',
  });
  const workbench = useDomainWorkbench('workspace');
  const [overview, setOverview] = useState(true);
  const [classrooms, setClassrooms] = useState<readonly WorkspaceClassroom[]>([]);
  const [classroom, setClassroom] = useState<WorkspaceClassroom | null>(null);
  const selectedClassroomRef = useRef<WorkspaceClassroom | null>(null);
  const [students, setStudents] = useState<readonly WorkspaceStudent[]>([]);
  const [date, setDate] = useState(today());
  const [loadState, setLoadState] = useState<LoadState>(mode === 'explore' ? 'ready' : 'loading');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [unsynced, setUnsynced] = useState(false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [unmatchedDraftCount, setUnmatchedDraftCount] = useState(0);
  const latestLoadRef = useRef(0);
  const focused = useMemo(
    () =>
      workbench.state.tasks.find((task) => task.taskKey === workbench.state.focusedTaskKey) ?? null,
    [workbench.state.focusedTaskKey, workbench.state.tasks],
  );

  const load = useCallback(
    async (selectedDate: string, selectedClassroom?: WorkspaceClassroom) => {
      const loadId = ++latestLoadRef.current;
      setLoadState('loading');
      setError(null);
      setSaved(false);
      try {
        if (mode === 'account' && practiceMode && subjectId) {
          const practice = loadAccountPracticeAttendance(subjectId, selectedDate);
          setClassrooms([practice.classroom]);
          setClassroom(practice.classroom);
          selectedClassroomRef.current = practice.classroom;
          setStudents(practice.students);
          setUnsynced(false);
          setUnmatchedDraftCount(0);
        } else if (mode === 'explore') {
          const local = loadExploreAttendance(selectedDate);
          setClassrooms(local.classrooms);
          setClassroom(local.classroom);
          selectedClassroomRef.current = local.classroom;
          setStudents(local.students);
        } else if (subjectId) {
          if (!scope)
            throw new Error('Your selected classroom scope is unavailable. Reload Workspace.');
          const available = await loadAccountClassrooms(subjectId);
          if (loadId !== latestLoadRef.current) return;
          setClassrooms(available);
          const selected =
            selectedClassroom ??
            available.find((item) => item.id === selectedClassroomRef.current?.id) ??
            available[0] ??
            null;
          setClassroom(selected);
          selectedClassroomRef.current = selected;
          if (selected) {
            const roster = await loadAccountAttendance(selected, selectedDate, subjectId);
            if (loadId !== latestLoadRef.current) return;
            const draft = loadAccountAttendanceDraft(accountDraftScope(selected.id, selectedDate));
            const restored = restoreAccountAttendanceDraft(roster, draft);
            setStudents(restored.students);
            setUnsynced(draft !== null);
            setUnmatchedDraftCount(restored.unmatchedCount);
          } else {
            setStudents([]);
            setUnsynced(false);
            setUnmatchedDraftCount(0);
          }
        } else {
          throw new Error('Your account identity is unavailable. Sign in again to continue.');
        }
        setLoadState('ready');
      } catch (cause) {
        if (loadId !== latestLoadRef.current) return;
        setLoadState('error');
        setError(
          cause instanceof Error ? cause.message : 'Workspace could not load. Please retry.',
        );
      }
    },
    [mode, practiceMode, scope, subjectId],
  );

  function accountDraftScope(
    classroomId: string,
    selectedDate: string,
  ): AccountAttendanceDraftScope {
    if (!subjectId || !scope) throw new Error('The selected account scope is unavailable.');
    return {
      accountId: subjectId,
      bondId: scope.bondId,
      entityId: scope.entityId,
      classroomId,
      date: selectedDate,
    };
  }

  function persistAccountDraft(nextStudents: readonly WorkspaceStudent[]) {
    if (practiceMode) return true;
    if (mode !== 'account' || !classroom) return true;
    try {
      saveAccountAttendanceDraft(accountDraftScope(classroom.id, date), nextStudents);
      setUnsynced(true);
      setError(null);
      return true;
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'The attendance draft could not be saved locally.',
      );
      return false;
    }
  }

  useEffect(() => {
    void load(date);
  }, [date, load]);

  function openAttendance() {
    const result = workbench.open(attendanceTask);
    if (result.kind === 'at-capacity') {
      setError('Close another Workspace task before opening daily attendance.');
      return;
    }
    setOverview(false);
  }

  function focusTask(task: WorkbenchTaskDescriptor) {
    workbench.focus(task.taskKey);
    setOverview(false);
  }

  function closeTask(task: WorkbenchTaskDescriptor) {
    const result = workbench.close(task.taskKey);
    setOverview(result.kind === 'overview');
  }

  function changeStatus(studentId: string) {
    setSaved(false);
    const next = students.map((student) =>
      student.id === studentId
        ? { ...student, status: stepAttendanceStatus(student.status) }
        : student,
    );
    if (!persistAccountDraft(next)) return;
    setStudents(next);
  }

  function markAll(status: AttendanceStatus) {
    setSaved(false);
    const next = students.map((student) => (student.studentId ? { ...student, status } : student));
    if (!persistAccountDraft(next)) return;
    setStudents(next);
  }

  async function save() {
    if (!classroom || students.length === 0 || saving) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === 'account' && practiceMode && subjectId) {
        saveAccountPracticeAttendance(subjectId, date, students);
      } else if (mode === 'explore') saveExploreAttendance(date, students);
      else if (subjectId) {
        await saveAccountAttendance(classroom, date, students, subjectId);
        const remaining = removeSyncedAttendanceDraftMarks(
          accountDraftScope(classroom.id, date),
          students,
        );
        setUnmatchedDraftCount(remaining);
        setUnsynced(remaining > 0);
      } else throw new Error('Your account identity is unavailable. Sign in again to continue.');
      setSaved(true);
      setNotice(
        practiceMode
          ? 'Practice attendance saved on this device. It has not changed a live classroom.'
          : mode === 'explore'
            ? 'Saved in this browser’s local Explore workspace.'
            : 'Attendance saved for this classroom.',
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Attendance was not saved. Please retry.');
    } finally {
      setSaving(false);
    }
  }

  function discardUnmatchedDraft() {
    if (mode !== 'account' || !classroom) return;
    try {
      const remaining = discardUnmatchedAttendanceDraftMarks(
        accountDraftScope(classroom.id, date),
        students,
      );
      setUnmatchedDraftCount(0);
      setUnsynced(remaining > 0);
      setNotice(
        'Unmatched local draft marks were discarded. Current roster marks remain unchanged.',
      );
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unmatched draft marks were not removed.');
    }
  }

  function endPractice() {
    if (mode !== 'account' || !practiceMode || !subjectId) return;
    try {
      discardAccountPracticeAttendance(subjectId);
      setPracticeMode(false);
      setOverview(true);
      setSaved(false);
      setNotice('Attendance practice was discarded. Your live classroom records were not changed.');
      setError(null);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'The practice workspace could not be discarded.',
      );
    }
  }

  const counts = statusCounts(students);
  const markableCount = students.filter((student) => student.studentId !== null).length;
  const unlinkedCount = students.length - markableCount;
  const activeAttendance = focused?.featureId === attendanceTask.featureId;
  const practiceAvailability = resolvePracticeAvailability({
    featureId: attendanceTask.featureId,
    platform: 'browser',
    capacity,
    hasSelectedScope: Boolean(scope),
  });
  const horizon = workbench.state.temporalHorizon ?? todayHorizon();

  useEffect(() => {
    if (workbench.state.temporalHorizon?.anchor.kind === 'date') {
      setDate(workbench.state.temporalHorizon.anchor.date);
    } else if (!workbench.state.temporalHorizon) {
      workbench.setTemporalHorizon(horizon);
    }
  }, [workbench.state.temporalHorizon]);

  function selectDate(nextDate: string) {
    setDate(nextDate);
    workbench.setTemporalHorizon({
      anchor: { kind: 'date', date: nextDate },
      scale: 'day',
      intent: 'current',
    });
  }

  return (
    <article
      className={styles.floor}
      data-domain="workspace"
      data-appearance={floorAppearance.appearance.preset}
      data-motion={floorAppearance.appearance.motion}
      aria-labelledby="workspace-title"
    >
      <div className={styles.workbench}>
        <TaskStrip
          focusedTaskKey={workbench.state.focusedTaskKey}
          onCloseTask={closeTask}
          onFocusTask={focusTask}
          onOpenCatalog={() => setOverview(true)}
          onOpenOverview={() => setOverview(true)}
          overviewActive={overview}
          tasks={workbench.state.tasks}
        />
        <TemporalHorizon
          dateLabel={new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(
            new Date(`${date}T12:00:00`),
          )}
          onNext={() => selectDate(moveDate(date, 1))}
          onPrevious={() => selectDate(moveDate(date, -1))}
          onToday={() => selectDate(today())}
          orientation="Choose the day you are taking attendance for."
        />
      </div>

      <header className={styles.heading}>
        <p className={styles.eyebrow}>
          {practiceMode
            ? 'Safe Try · fictional attendance'
            : mode === 'explore'
              ? 'Explore · local workspace'
              : 'Workspace'}
        </p>
        <h1 id="workspace-title">A steady view of the work in your care</h1>
        <p>
          {mode === 'explore'
            ? 'Try attendance with a local sample roster. Changes stay in this browser.'
            : 'Open a classroom practice from your selected school scope. Keep the roster, day’s marks, and next action together.'}
        </p>
      </header>

      {error ? (
        <div className={styles.error} role="alert">
          <p>{error}</p>
          <button
            onClick={() =>
              void (loadState === 'error' ? load(date, classroom ?? undefined) : save())
            }
            type="button"
          >
            {loadState === 'error' ? 'Retry loading' : 'Retry save'}
          </button>
        </div>
      ) : null}
      {notice ? (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      ) : null}
      {mode === 'account' && unsynced ? (
        <p className={styles.notice} role="status">
          Attendance changes are saved on this device and have not all synced to Sanctuary.
          {unmatchedDraftCount > 0 ? (
            <>
              {' '}
              {unmatchedDraftCount} saved mark{unmatchedDraftCount === 1 ? '' : 's'} no longer match
              this roster and were kept aside.
              <button onClick={discardUnmatchedDraft} type="button">
                Discard unmatched marks
              </button>
            </>
          ) : null}
        </p>
      ) : null}
      {practiceMode ? (
        <p className={styles.notice} role="status">
          Fictional sample students · Saved only on this device · No live classroom changes.
        </p>
      ) : null}

      {overview || !activeAttendance ? (
        <section aria-labelledby="workspace-overview-title" className={styles.overview}>
          <div>
            <p className={styles.eyebrow}>Overview · Classroom practice</p>
            <h2 id="workspace-overview-title">Daily attendance</h2>
            <p>Take a classroom roll call and keep each student’s mark for the selected day.</p>
          </div>
          {loadState === 'loading' && mode === 'account' ? (
            <p className={styles.loading} role="status">
              Checking the selected classroom scope…
            </p>
          ) : null}
          {loadState === 'ready' ? (
            <div className={styles.summary} aria-label="Attendance summary">
              <span>
                <strong>{classrooms.length}</strong> classrooms
              </span>
              <span>
                <strong>{students.length}</strong> students in today’s roster
              </span>
              {mode === 'explore' ? <span className={styles.localTag}>Local demo data</span> : null}
            </div>
          ) : null}
          <button
            className={styles.primary}
            disabled={mode === 'account' && loadState !== 'ready'}
            onClick={openAttendance}
            type="button"
          >
            {loadState === 'loading' && mode === 'account'
              ? 'Loading workspace…'
              : 'Open attendance'}
          </button>
          {mode === 'account' &&
          !practiceMode &&
          subjectId &&
          practiceAvailability.available ? (
            <button
              className={styles.secondary}
              onClick={() => {
                latestLoadRef.current += 1;
                setPracticeMode(true);
                setOverview(false);
                const result = workbench.open(attendanceTask);
                if (result.kind === 'at-capacity') {
                  setPracticeMode(false);
                  setOverview(true);
                  setError(
                    'Close another Workspace task before opening daily attendance practice.',
                  );
                }
              }}
              type="button"
            >
              Try attendance safely
            </button>
          ) : null}
          {mode === 'account' && loadState === 'ready' && classrooms.length === 0 ? (
            <p className={styles.muted}>
              No classrooms are connected to this account yet. A school or classroom bond is
              required before shared classroom work appears.
            </p>
          ) : null}
        </section>
      ) : (
        <section className={styles.attendance} aria-labelledby="attendance-title">
          <div className={styles.attendanceHeading}>
            <div>
              <p className={styles.eyebrow}>
                {classroom?.subject ?? 'Classroom'} · {date}
              </p>
              <h2 id="attendance-title">{classroom?.name ?? 'Daily attendance'}</h2>
            </div>
            {classrooms.length > 1 ? (
              <label className={styles.classPicker}>
                Classroom
                <select
                  value={classroom?.id ?? ''}
                  onChange={(event) => {
                    const next = classrooms.find((item) => item.id === event.target.value);
                    if (next) {
                      selectedClassroomRef.current = next;
                      void load(date, next);
                    }
                  }}
                >
                  {classrooms.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
          {loadState === 'loading' ? (
            <p className={styles.loading} role="status">
              Loading the classroom roster…
            </p>
          ) : null}
          {loadState === 'ready' ? (
            <>
              <div className={styles.counts}>
                <span>
                  <strong>{counts.present}</strong> present
                </span>
                <span>
                  <strong>{counts.late}</strong> late
                </span>
                <span>
                  <strong>{counts.absent}</strong> absent
                </span>
                <span>
                  <strong>{counts.excused}</strong> excused
                </span>
                <span className={styles.muted}>{students.length} students</span>
              </div>
              <div className={styles.bulkActions} aria-label="Mark all students">
                <span>Mark all</span>
                {(['present', 'late', 'absent', 'excused'] as const).map((status) => (
                  <button key={status} type="button" onClick={() => markAll(status)}>
                    {status}
                  </button>
                ))}
              </div>
              {students.length ? (
                <ul className={styles.roster}>
                  {students.map((student, index) => (
                    <li key={student.id}>
                      <span className={styles.roll}>{student.rollNumber ?? index + 1}</span>
                      <span className={styles.studentName}>{student.name}</span>
                      <button
                        aria-label={
                          student.studentId
                            ? `${student.name}, ${student.status}. Change attendance status.`
                            : `${student.name}, not linked to a student account.`
                        }
                        className={`${styles.status} ${styles[student.status]}`}
                        disabled={!student.studentId}
                        onClick={() => changeStatus(student.id)}
                        type="button"
                      >
                        {student.studentId ? student.status : 'not linked'}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.empty}>No students are enrolled in this classroom yet.</p>
              )}
              {unlinkedCount > 0 ? (
                <p className={styles.muted}>
                  {unlinkedCount} roster {unlinkedCount === 1 ? 'entry is' : 'entries are'} not
                  linked to a student account, so attendance cannot be recorded for{' '}
                  {unlinkedCount === 1 ? 'it' : 'them'} yet.
                </p>
              ) : null}
              <button
                className={styles.primary}
                disabled={!markableCount || saving}
                onClick={() => void save()}
                type="button"
              >
                {saving
                  ? 'Saving attendance…'
                  : saved
                    ? 'Saved'
                    : practiceMode
                      ? 'Save practice changes'
                      : 'Save attendance'}
              </button>
              {practiceMode ? (
                <button className={styles.secondary} onClick={endPractice} type="button">
                  End practice and discard
                </button>
              ) : null}
            </>
          ) : null}
        </section>
      )}
    </article>
  );
}
