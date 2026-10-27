'use client';

import { resolvePracticeAvailability } from '@repo/core/logic/registry/capabilityManifest';
import { resolveTemporalCoordinates, resolveTemporalIntent } from '@repo/core/logic/workbench';
import { getMaxPinnedForWorkspace } from '@repo/core/logic/workspace/canvas';
import type { DomainTemporalHorizon, WorkbenchTaskDescriptor } from '@repo/core/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWorkspaceCanvas } from '../../../lib/canvas/useWorkspaceCanvas';
import {
  useWorkspaceDomain,
  type WorkspaceAttendanceReadScope,
} from '../../../lib/domain/hooks/useWorkspaceDomain';
import { setExploreCapacity, useExploreCapacity } from '../../../lib/explore/exploreCapacity';
import { useDomainWorkbench } from '../../../lib/workbench';
import { useQuickAccessPreferences } from '../../../lib/workbench/quickAccessPreferences';
import {
  type AccountAttendanceDraftScope,
  type AttendanceStatus,
  discardAccountPracticeAttendance,
  discardUnmatchedAttendanceDraftMarks,
  loadAccountAttendanceDraft,
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
import { identifyHallwayDrift } from '../../../lib/workspace/attendanceInsights';
import type { FurnitureDefinition } from '../components/FloorStudioDrawer';
import { LivingCard } from '../components/LivingCard';
import { MorningSituationalBrief } from '../components/MorningSituationalBrief';
import { RoleLensSwitcher, type WorkspaceRoleFilter } from '../components/RoleLensSwitcher';
import { SanctuaryFloorCanvas } from '../components/SanctuaryFloorCanvas';
import {
  TaskStrip,
  TemporalHorizon,
  timeGreeting,
  WorkbenchContextHeader,
} from '../components/workbench';
import styles from './workspace.module.css';
import {
  filterWorkspaceFeatures,
  getWorkspaceOverviewPosture,
  WORKSPACE_FEATURES,
} from './workspaceFeatureRegistry';

type AuthorizedEntryScope = Readonly<{ bondId: string; entityId: string }>;

type WorkspaceFloorProps = Readonly<{
  mode: 'account' | 'explore';
  subjectId?: string;
  capacity?: string;
  displayName?: string;
  scope?: AuthorizedEntryScope;
}>;

const WORKSPACE_FURNITURE_ITEMS: readonly FurnitureDefinition[] = [
  { id: 'role-lens', label: 'Role Perspective Lens & Nav', icon: '🏷️' },
  { id: 'workbench', label: 'Daily Operations & Timeline', icon: '🧭' },
  { id: 'heading', label: 'Workspace Posture & Header', icon: '🏛️' },
  { id: 'attendance', label: 'Attendance Roster & Actions', icon: '📋' },
  { id: 'insights', label: 'Presence Pulse & Drift Insights', icon: '📊' },
];

type LoadState = 'loading' | 'ready' | 'error';
const attendanceTask = {
  featureId: 'attendance',
  route: '/workspace',
  title: 'Daily attendance',
  icon: '◷',
  temporalBinding: { kind: 'follow-domain' },
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

function buildAccountDraftScope(
  subjectId: string,
  scope: AuthorizedEntryScope,
  classroomId: string,
  selectedDate: string,
): AccountAttendanceDraftScope {
  return {
    accountId: subjectId,
    bondId: scope.bondId,
    entityId: scope.entityId,
    classroomId,
    date: selectedDate,
  };
}

export function WorkspaceFloor({
  mode,
  subjectId,
  capacity,
  displayName = 'Guest Explorer',
  scope,
}: WorkspaceFloorProps) {
  const router = useRouter();
  const exploreCapacity = useExploreCapacity();
  const normalizedCapacity = (mode === 'explore' ? exploreCapacity : capacity)?.toLowerCase();
  const defaultRole: WorkspaceRoleFilter =
    normalizedCapacity === 'student'
      ? 'student'
      : normalizedCapacity === 'principal' || normalizedCapacity === 'admin'
        ? 'principal'
        : normalizedCapacity === 'guardian' || normalizedCapacity === 'parent'
          ? 'guardian'
          : 'teacher';

  const [activeRole, setActiveRole] = useState<WorkspaceRoleFilter>(defaultRole);

  useEffect(() => {
    if (mode === 'explore') return;
    try {
      const stored = window.localStorage.getItem('sanctuary-role-lens:workspace');
      if (
        stored &&
        ['all', 'common', 'teacher', 'student', 'principal', 'guardian'].includes(stored)
      ) {
        setActiveRole(stored as WorkspaceRoleFilter);
      }
    } catch {
      return;
    }
  }, [defaultRole, mode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOverview(new URLSearchParams(window.location.search).get('task') !== 'attendance');
    }
  }, []);

  useEffect(() => {
    if (mode === 'explore') setActiveRole(defaultRole);
  }, [defaultRole, mode]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('task') === 'attendance') {
      setOverview(false);
    }
  }, []);

  const handleRoleChange = useCallback(
    (role: WorkspaceRoleFilter) => {
      setActiveRole(role);
      if (mode === 'explore') {
        if (
          role === 'teacher' ||
          role === 'student' ||
          role === 'principal' ||
          role === 'guardian'
        ) {
          setExploreCapacity(role);
        }
        return;
      }
      try {
        window.localStorage.setItem('sanctuary-role-lens:workspace', role);
      } catch {}
    },
    [mode],
  );

  const [overview, setOverview] = useState(true);
  const workspaceFeatureIds = WORKSPACE_FEATURES.map((feature) => feature.id);
  const quickAccessScope = mode === 'explore' ? 'explore' : 'sanctuary';
  const quickAccess = useQuickAccessPreferences(
    'workspace',
    quickAccessScope,
    workspaceFeatureIds,
    ['attendance'],
    getMaxPinnedForWorkspace('workspace'),
  );
  const canvas = useWorkspaceCanvas({
    accountId: subjectId ?? 'explore',
    enableRemoteSync: mode === 'account' && Boolean(subjectId),
    activeTaskId: !overview ? attendanceTask.featureId : null,
  });
  const workbench = useDomainWorkbench('workspace', { usageScope: quickAccessScope });
  const [classrooms, setClassrooms] = useState<readonly WorkspaceClassroom[]>([]);
  const [classroom, setClassroom] = useState<WorkspaceClassroom | null>(null);
  const selectedClassroomRef = useRef<WorkspaceClassroom | null>(null);
  const [students, setStudents] = useState<readonly WorkspaceStudent[]>([]);
  const [studentProjectionIdentity, setStudentProjectionIdentity] = useState<string | null>(null);
  const [localDate, setLocalDate] = useState(today());
  const [practiceMode, setPracticeMode] = useState(false);
  const date =
    workbench.state.temporalHorizon?.anchor.kind === 'date'
      ? workbench.state.temporalHorizon.anchor.date
      : localDate;
  const attendanceScope = useMemo<WorkspaceAttendanceReadScope | null>(
    () =>
      mode === 'account' && subjectId && scope
        ? { principalId: subjectId, bondId: scope.bondId, entityId: scope.entityId }
        : null,
    [mode, scope?.bondId, scope?.entityId, subjectId],
  );
  const accountAttendance = useWorkspaceDomain({
    scope: attendanceScope,
    classroom,
    date,
    enabled: mode === 'account' && !practiceMode,
  });
  const refetchAccountClassrooms = accountAttendance.classroomsQuery.refetch;
  const refetchAccountRoster = accountAttendance.rosterQuery.refetch;
  const visibleClassrooms =
    mode === 'account' && !practiceMode ? accountAttendance.classrooms : classrooms;
  const attendanceProjectionIdentity =
    mode === 'account' && !practiceMode && attendanceScope && classroom
      ? [
          attendanceScope.principalId,
          attendanceScope.bondId,
          attendanceScope.entityId,
          classroom.id,
          date,
        ].join(':')
      : null;
  const hasCurrentStudentProjection =
    mode !== 'account' ||
    practiceMode ||
    studentProjectionIdentity === attendanceProjectionIdentity;
  const activeStudents = hasCurrentStudentProjection
    ? students
    : ([] as readonly WorkspaceStudent[]);
  const coordinates = useMemo(
    () => resolveTemporalCoordinates(date, { domain: 'workspace' }),
    [date],
  );
  const effectiveRole: WorkspaceRoleFilter =
    activeRole === 'all' || activeRole === 'common' ? defaultRole : activeRole;

  const posture = useMemo(
    () => getWorkspaceOverviewPosture(effectiveRole, coordinates.intent, coordinates.dateLabel),
    [effectiveRole, coordinates.intent, coordinates.dateLabel],
  );
  const [loadState, setLoadState] = useState<LoadState>(mode === 'explore' ? 'ready' : 'loading');
  const accountReadState: LoadState =
    mode !== 'account' || practiceMode
      ? loadState
      : accountAttendance.classroomsQuery.isPending ||
          (classroom !== null && accountAttendance.rosterQuery.isPending)
        ? 'loading'
        : accountAttendance.classroomsQuery.error || accountAttendance.rosterQuery.error
          ? 'error'
          : 'ready';
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [unsynced, setUnsynced] = useState(false);
  const [unmatchedDraftCount, setUnmatchedDraftCount] = useState(0);
  const [absenteeInput, setAbsenteeInput] = useState('');
  const [activeSession, setActiveSession] = useState<
    'morning' | 'period-1' | 'period-2' | 'period-3'
  >('morning');
  const [morningRoster, setMorningRoster] = useState<readonly WorkspaceStudent[]>([]);
  const latestLoadRef = useRef(0);
  const focused = useMemo(
    () =>
      workbench.state.tasks.find((task) => task.taskKey === workbench.state.focusedTaskKey) ?? null,
    [workbench.state.focusedTaskKey, workbench.state.tasks],
  );

  const hallwayDrifts = useMemo(() => {
    if (activeSession === 'morning' || morningRoster.length === 0) return [];
    return identifyHallwayDrift(morningRoster, activeStudents);
  }, [activeSession, activeStudents, morningRoster]);

  useEffect(() => {
    if (mode !== 'account' || practiceMode) return;
    if (!scope || !subjectId || !accountAttendance.scope) {
      setLoadState('error');
      setError('Your selected classroom scope is unavailable. Reload Workspace.');
      return;
    }
    if (accountAttendance.classroomsQuery.isPending) {
      setLoadState('loading');
      return;
    }
    if (accountAttendance.classroomsQuery.error) {
      setLoadState('error');
      setError(
        accountAttendance.classroomsQuery.error instanceof Error
          ? accountAttendance.classroomsQuery.error.message
          : 'Workspace could not load. Please retry.',
      );
      return;
    }
    const available = accountAttendance.classrooms;
    const selected =
      available.find((item) => item.id === selectedClassroomRef.current?.id) ??
      available.find((item) => item.id === classroom?.id) ??
      available[0] ??
      null;
    if (selected?.id !== classroom?.id) setClassroom(selected);
    selectedClassroomRef.current = selected;
    if (!selected) {
      setStudents([]);
      setUnsynced(false);
      setUnmatchedDraftCount(0);
      setLoadState('ready');
    }
  }, [
    accountAttendance.classrooms,
    accountAttendance.classroomsQuery.error,
    accountAttendance.classroomsQuery.isPending,
    accountAttendance.scope,
    classroom?.id,
    mode,
    practiceMode,
    scope,
    subjectId,
  ]);

  useEffect(() => {
    if (mode !== 'account' || practiceMode) return;
    // Never project a prior scoped roster while a new principal, bond, entity,
    // grade class, or date query is being admitted.
    setStudents([]);
    setStudentProjectionIdentity(null);
    setMorningRoster([]);
    setUnsynced(false);
    setUnmatchedDraftCount(0);
    setSaved(false);
  }, [classroom?.id, date, mode, practiceMode, scope?.bondId, scope?.entityId, subjectId]);

  useEffect(() => {
    if (mode !== 'account' || practiceMode || !classroom || !scope || !subjectId) return;
    if (accountAttendance.rosterQuery.isPending) {
      setLoadState('loading');
      return;
    }
    if (accountAttendance.rosterQuery.error) {
      setLoadState('error');
      setError(
        accountAttendance.rosterQuery.error instanceof Error
          ? accountAttendance.rosterQuery.error.message
          : 'Workspace could not load. Please retry.',
      );
      return;
    }
    if (!accountAttendance.rosterQuery.isSuccess) return;
    try {
      const draft = loadAccountAttendanceDraft(
        buildAccountDraftScope(subjectId, scope, classroom.id, date),
      );
      const restored = restoreAccountAttendanceDraft(accountAttendance.students, draft);
      setStudents(restored.students);
      setStudentProjectionIdentity(attendanceProjectionIdentity);
      setMorningRoster(restored.students);
      setUnsynced(draft !== null);
      setUnmatchedDraftCount(restored.unmatchedCount);
      setLoadState('ready');
      setError(null);
    } catch (cause) {
      setLoadState('error');
      setError(cause instanceof Error ? cause.message : 'Workspace could not load. Please retry.');
    }
  }, [
    accountAttendance.rosterQuery.error,
    accountAttendance.rosterQuery.isPending,
    accountAttendance.rosterQuery.isSuccess,
    accountAttendance.students,
    attendanceProjectionIdentity,
    classroom,
    date,
    mode,
    practiceMode,
    scope,
    subjectId,
  ]);

  const load = useCallback(
    async (selectedDate: string, selectedClassroom?: WorkspaceClassroom | null) => {
      await Promise.resolve();
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
          setMorningRoster(local.students);
        } else if (subjectId) {
          if (!scope || !accountAttendance.scope)
            throw new Error('Your selected classroom scope is unavailable. Reload Workspace.');
          if (selectedClassroom) {
            selectedClassroomRef.current = selectedClassroom;
            setClassroom(selectedClassroom);
          }
          await refetchAccountClassrooms();
          if (selectedClassroom ?? classroom) await refetchAccountRoster();
          if (loadId !== latestLoadRef.current) return;
          return;
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
    [
      accountAttendance.scope,
      classroom,
      mode,
      practiceMode,
      refetchAccountClassrooms,
      refetchAccountRoster,
      scope,
      subjectId,
    ],
  );

  function accountDraftScope(classroomId: string, selectedDate: string) {
    if (!subjectId || !scope) {
      throw new Error('The selected account scope is unavailable.');
    }
    return buildAccountDraftScope(subjectId, scope, classroomId, selectedDate);
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
    let active = true;
    const fetchAttendance = async () => {
      await Promise.resolve();
      if (active && (mode !== 'account' || practiceMode)) {
        await load(date);
      }
    };
    fetchAttendance().catch(() => {});
    return () => {
      active = false;
    };
  }, [date, load, mode, practiceMode]);

  function openAttendance() {
    const result = workbench.open(attendanceTask);
    if (result.kind === 'at-capacity') {
      setError('Close another Workspace task before opening daily attendance.');
      return;
    }
    setOverview(false);
  }

  function openWorkspaceFeature(feature: (typeof WORKSPACE_FEATURES)[number]) {
    if (feature.id === 'attendance') {
      openAttendance();
      return;
    }
    const result = workbench.open({
      featureId: feature.id,
      route: feature.href,
      title: feature.label,
      icon: feature.symbol,
      temporalBinding: { kind: 'follow-domain' },
      localStatePolicy: 'restore-permitted',
    });
    if (result.kind === 'at-capacity') {
      setError('Close another Workspace task before opening this tool.');
      return;
    }
    router.push(feature.href);
  }

  function focusTask(task: WorkbenchTaskDescriptor) {
    workbench.focus(task.taskKey);
    if (task.featureId === attendanceTask.featureId) {
      setOverview(false);
      return;
    }
    if (task.route !== '/workspace') router.push(task.route);
  }

  function closeTask(task: WorkbenchTaskDescriptor) {
    const returnToHome = overview;
    const result = workbench.close(task.taskKey);
    setOverview(returnToHome || result.kind === 'overview');
    if (
      task.featureId === attendanceTask.featureId &&
      new URLSearchParams(window.location.search).has('task')
    ) {
      router.replace('/workspace');
    }
  }

  function changeStatus(studentId: string) {
    if (!hasCurrentStudentProjection) return;
    setSaved(false);
    const next = activeStudents.map((student) =>
      student.id === studentId
        ? { ...student, status: stepAttendanceStatus(student.status) }
        : student,
    );
    if (!persistAccountDraft(next)) return;
    setStudents(next);
  }

  function markAll(status: AttendanceStatus) {
    if (!hasCurrentStudentProjection) return;
    setSaved(false);
    const next = activeStudents.map((student) =>
      student.studentId ? { ...student, status } : student,
    );
    if (!persistAccountDraft(next)) return;
    setStudents(next);
  }

  function applyRapidAbsentees() {
    if (!hasCurrentStudentProjection || !activeStudents.length) return;
    const tokens = absenteeInput
      .split(/[,\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    if (!tokens.length) return;
    const absenteeRolls = new Set(
      tokens.map((t) => parseInt(t, 10)).filter((n) => !isNaN(n) && n > 0),
    );
    if (!absenteeRolls.size) return;
    setSaved(false);
    let absentCount = 0;
    const next = activeStudents.map((student, index) => {
      const roll = student.rollNumber ?? index + 1;
      const isAbsent = absenteeRolls.has(roll);
      if (isAbsent) absentCount++;
      return {
        ...student,
        status: (isAbsent ? 'absent' : 'present') as AttendanceStatus,
      };
    });
    if (!persistAccountDraft(next)) return;
    setStudents(next);
    setNotice(
      `Fast roll call applied: ${absentCount} marked absent (roll ${Array.from(absenteeRolls).join(', ')}), ${next.length - absentCount} present.`,
    );
    setAbsenteeInput('');
  }

  function handleRosterKeyDown(
    e: React.KeyboardEvent<HTMLButtonElement>,
    studentId: string,
    index: number,
  ) {
    if (!hasCurrentStudentProjection) return;
    const key = e.key.toLowerCase();
    let targetStatus: AttendanceStatus | null = null;
    if (key === 'p') targetStatus = 'present';
    else if (key === 'a') targetStatus = 'absent';
    else if (key === 'l') targetStatus = 'late';
    else if (key === 'e') targetStatus = 'excused';

    if (targetStatus) {
      e.preventDefault();
      setSaved(false);
      const next = activeStudents.map((s) =>
        s.id === studentId ? { ...s, status: targetStatus! } : s,
      );
      if (!persistAccountDraft(next)) return;
      setStudents(next);

      // Rapidly jump focus down to next student row for keyboard roll-call
      const nextIndex = index + 1;
      if (nextIndex < activeStudents.length) {
        const nextStudent = activeStudents[nextIndex];
        if (nextStudent) {
          const nextBtn = document.getElementById(`status-btn-${nextStudent.id}`);
          nextBtn?.focus();
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = index + 1;
      if (nextIndex < activeStudents.length) {
        const nextStudent = activeStudents[nextIndex];
        if (nextStudent) {
          const nextBtn = document.getElementById(`status-btn-${nextStudent.id}`);
          nextBtn?.focus();
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = index - 1;
      if (prevIndex >= 0) {
        const prevStudent = activeStudents[prevIndex];
        if (prevStudent) {
          const prevBtn = document.getElementById(`status-btn-${prevStudent.id}`);
          prevBtn?.focus();
        }
      }
    }
  }

  async function save() {
    if (!classroom || !hasCurrentStudentProjection || activeStudents.length === 0 || saving) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === 'account' && practiceMode && subjectId) {
        saveAccountPracticeAttendance(subjectId, date, activeStudents);
      } else if (mode === 'explore') saveExploreAttendance(date, activeStudents);
      else if (subjectId) {
        await saveAccountAttendance(classroom, date, activeStudents, subjectId);
        await accountAttendance.invalidateRoster();
        const remaining = removeSyncedAttendanceDraftMarks(
          accountDraftScope(classroom.id, date),
          activeStudents,
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
        activeStudents,
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

  const counts = statusCounts(activeStudents);
  const markableCount = activeStudents.filter((student) => student.studentId !== null).length;
  const unlinkedCount = activeStudents.length - markableCount;
  const activeAttendance = focused?.featureId === attendanceTask.featureId;
  const practiceAvailability = resolvePracticeAvailability({
    featureId: attendanceTask.featureId,
    platform: 'browser',
    capacity,
    hasSelectedScope: Boolean(scope),
  });
  const horizon = workbench.state.temporalHorizon ?? todayHorizon();

  useEffect(() => {
    if (!workbench.state.temporalHorizon) {
      workbench.setTemporalHorizon(horizon);
    }
  }, [horizon, workbench]);

  function selectDate(nextDate: string) {
    setLocalDate(nextDate);
    workbench.setTemporalHorizon({
      anchor: { kind: 'date', date: nextDate },
      scale: 'day',
      intent: resolveTemporalIntent(nextDate, today()),
    });
  }

  return (
    <SanctuaryFloorCanvas
      appearance={canvas.appearance}
      domain="workspace"
      furnitureItems={WORKSPACE_FURNITURE_ITEMS}
      groupOrder={[...canvas.groupOrder]}
      onReorderFurniture={(order) => canvas.setGroupOrder(order as unknown as any)}
      onResetFloorDefaults={canvas.resetAppearance}
      showPageActions={overview}
      onTogglePinFurniture={(id) => canvas.togglePin(id as any)}
      pinnedIds={canvas.pinnedIds}
      setAppearance={canvas.setAppearance}
      titleId={
        overview
          ? 'workspace-title'
          : activeAttendance
            ? 'attendance-title'
            : 'workspace-task-title'
      }
      topControls={() => (
        <WorkbenchContextHeader
          domain="workspace"
          homeActive={overview}
          dateControl={
            <TemporalHorizon
              compact
              dateLabel={coordinates.dateLabel}
              intent={coordinates.intent}
              orientation={coordinates.orientationLabel}
              slots={coordinates.slots}
              onSelectDate={selectDate}
              onToday={() => selectDate(today())}
            />
          }
          greeting={timeGreeting(displayName)}
          intent={coordinates.intent}
          selectedDate={coordinates.date}
        />
      )}
    >
      <TaskStrip
        shellSlot
        className={styles.workspaceTaskStrip}
        focusedTaskKey={workbench.state.focusedTaskKey}
        onCloseTask={closeTask}
        onFocusTask={focusTask}
        onReorderTask={(taskKey, destinationIndex) => workbench.reorder(taskKey, destinationIndex)}
        onOpenOverview={() => {
          setOverview(true);
          if (new URLSearchParams(window.location.search).has('task')) {
            router.replace('/workspace');
          }
          requestAnimationFrame(() =>
            document.getElementById('workspace-catalog-title')?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            }),
          );
        }}
        quickAccessItems={WORKSPACE_FEATURES.map((item) => ({
          id: item.id,
          label: item.label,
          emoji: item.symbol,
        }))}
        quickAccessPinnedIds={quickAccess.pinnedIds}
        quickAccessUsage={quickAccess.usage}
        quickAccessPinLimit={quickAccess.pinLimit}
        onOpenQuickAccessItem={(item) => {
          const feature = WORKSPACE_FEATURES.find((candidate) => item.id === candidate.id);
          if (feature) {
            openWorkspaceFeature(feature);
            return;
          }
        }}
        onToggleQuickAccessPin={quickAccess.togglePin}
        overviewActive={overview}
        tasks={workbench.state.tasks}
        trailingContent={
          <RoleLensSwitcher
            activeRole={activeRole}
            onRoleChange={handleRoleChange}
            presentation="menu"
          />
        }
      />

      {error ? (
        <div className={styles.error} role="alert">
          <p>{error}</p>
          <button
            onClick={() => {
              if (accountReadState === 'error') {
                load(date, classroom).catch(() => {});
              } else {
                save().catch(() => {});
              }
            }}
            type="button"
          >
            {accountReadState === 'error' ? 'Retry loading' : 'Retry save'}
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

      {overview ? (
        <div className={styles.featureContentIn} key="workspace-home">
          <header className={styles.heading}>
            <h1 id="workspace-title">A steady view of the work in your care</h1>
            <p>
              {mode === 'explore'
                ? 'Try attendance with a local sample roster. Changes stay in this browser.'
                : 'Open a classroom practice from your selected school scope. Keep the roster, day’s marks, and next action together.'}
            </p>
          </header>
          <LivingCard
            className={styles.overview}
            variant={
              effectiveRole === 'student'
                ? 'lotus'
                : effectiveRole === 'principal'
                  ? 'glass'
                  : 'vellum'
            }
            elevation="floating"
            style={{ padding: 'clamp(1.5rem, 4vw, 3rem)' }}
          >
            {effectiveRole === 'principal' ? (
              <MorningSituationalBrief schoolId={scope?.entityId ?? 'default-school'} />
            ) : null}

            <div>
              <p className={styles.eyebrow}>{posture.eyebrow}</p>
              <h2 id="workspace-overview-title">{posture.title}</h2>
              <p>{posture.description}</p>
            </div>

            {(effectiveRole === 'teacher' || effectiveRole === 'principal') &&
            coordinates.intent !== 'plan' ? (
              <>
                {accountReadState === 'loading' && mode === 'account' ? (
                  <p className={styles.loading} role="status">
                    Checking the selected classroom scope…
                  </p>
                ) : null}
                {accountReadState === 'ready' ? (
                  <div className={styles.summary} aria-label="Attendance summary">
                    <span>
                      <strong>{visibleClassrooms.length}</strong> classrooms
                    </span>
                    <span>
                      <strong>{activeStudents.length}</strong> students in this roster
                    </span>
                    {mode === 'explore' ? (
                      <span className={styles.localTag}>Local demo data</span>
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : null}

            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {effectiveRole === 'student' ? (
                <>
                  <Link href="/self/attendance" className={styles.primary}>
                    {posture.actionText}
                  </Link>
                  <Link href="/workspace/timetable" className={styles.secondary}>
                    View timetable
                  </Link>
                  <Link href="/self" className={styles.secondary}>
                    Quiet journal
                  </Link>
                </>
              ) : effectiveRole === 'guardian' ? (
                <>
                  <Link href="/workspace" className={styles.primary}>
                    {posture.actionText}
                  </Link>
                  <Link href="/community" className={styles.secondary}>
                    Community dialogues
                  </Link>
                  <Link href="/library" className={styles.secondary}>
                    Family guides
                  </Link>
                </>
              ) : effectiveRole === 'principal' && coordinates.intent === 'plan' ? (
                <>
                  <Link href="/workspace/events" className={styles.primary}>
                    {posture.actionText}
                  </Link>
                  <Link href="/workspace/school" className={styles.secondary}>
                    School profile
                  </Link>
                </>
              ) : effectiveRole === 'teacher' && coordinates.intent === 'plan' ? (
                <>
                  <Link href="/workspace/plan" className={styles.primary}>
                    {posture.actionText}
                  </Link>
                  <Link href="/workspace/timetable" className={styles.secondary}>
                    Upcoming timetable
                  </Link>
                </>
              ) : (
                <>
                  <button
                    className={styles.primary}
                    disabled={mode === 'account' && accountReadState !== 'ready'}
                    onClick={openAttendance}
                    type="button"
                  >
                    {accountReadState === 'loading' && mode === 'account'
                      ? 'Loading workspace…'
                      : posture.actionText}
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
                </>
              )}
            </div>

            {mode === 'account' &&
            accountReadState === 'ready' &&
            visibleClassrooms.length === 0 &&
            (effectiveRole === 'teacher' || effectiveRole === 'principal') ? (
              <p className={styles.muted}>
                No classrooms are connected to this account yet. A school or classroom bond is
                required before shared classroom work appears.
              </p>
            ) : null}
          </LivingCard>

          <section aria-labelledby="workspace-catalog-title" className={styles.workspaceCatalog}>
            <p className={styles.eyebrow}>Workspace tools</p>
            <h2 id="workspace-catalog-title">
              {activeRole === 'all'
                ? 'All workspace operations'
                : activeRole === 'common'
                  ? 'Universal tools'
                  : `${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)} tools`}
            </h2>
            <div className={styles.workspaceGrid}>
              {filterWorkspaceFeatures(WORKSPACE_FEATURES, activeRole).map((feature) => (
                <LivingCard
                  as="article"
                  className={styles.workspaceCard}
                  key={feature.id}
                  variant="vellum"
                  elevation="floating"
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <span style={{ fontSize: '1.75rem' }} aria-hidden="true">
                        {feature.symbol}
                      </span>
                      <span className={styles.roleTag}>
                        {feature.isCommon ? 'Common' : feature.roles.join(' · ')}
                      </span>
                    </div>
                    <h3
                      style={{
                        margin: '0.35rem 0',
                        fontFamily: 'Georgia, serif',
                        fontSize: '1.2rem',
                      }}
                    >
                      {feature.label}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        color: 'var(--ink-soft)',
                        fontSize: '0.88rem',
                        lineHeight: 1.5,
                      }}
                    >
                      {feature.description}
                    </p>
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <button
                      type="button"
                      className={styles.catalogOpenButton}
                      onClick={() => openWorkspaceFeature(feature)}
                    >
                      {feature.id === 'attendance' ? 'Open attendance →' : 'Open tool →'}
                    </button>
                  </div>
                </LivingCard>
              ))}
            </div>
          </section>
          {visibleClassrooms.length > 0 ? (
            <section
              aria-labelledby="workspace-classrooms-title"
              className={styles.classroomHomeSection}
            >
              <p className={styles.eyebrow}>Coordination</p>
              <h2 id="workspace-classrooms-title">Classrooms</h2>
              <ul className={styles.classroomHomeList}>
                {visibleClassrooms.map((item) => {
                  const isPinned = canvas.pinnedIds.includes(item.id);
                  return (
                    <li key={item.id}>
                      <span>{item.name}</span>
                      <button
                        type="button"
                        aria-label={isPinned ? `Unpin ${item.name}` : `Pin ${item.name}`}
                        aria-pressed={isPinned}
                        onClick={() => canvas.togglePin(item.id)}
                      >
                        {isPinned ? '📌' : '＋'}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </div>
      ) : (
        <div className={styles.featureContentIn} key={focused?.taskKey ?? 'workspace-feature'}>
          <main className={styles.activeWorkspaceStage}>
            {activeAttendance ? (
              <section className={styles.attendance} aria-labelledby="attendance-title">
                <div className={styles.attendanceHeading}>
                  <div>
                    <p className={styles.eyebrow}>
                      {classroom?.subject ?? 'Classroom'} · {date}
                    </p>
                    <h2 id="attendance-title">{classroom?.name ?? 'Daily attendance'}</h2>
                    {classroom?.id ? (
                      <Link
                        href={`/workspace/classroom/${encodeURIComponent(classroom.id)}`}
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#9a5b2d',
                          textDecoration: 'none',
                          display: 'inline-block',
                          marginTop: '0.25rem',
                        }}
                      >
                        Open Classroom Hub & Roster →
                      </Link>
                    ) : null}
                  </div>
                  {visibleClassrooms.length > 1 ? (
                    <label className={styles.classPicker}>
                      Classroom
                      <select
                        value={classroom?.id ?? ''}
                        onChange={(event) => {
                          const next = visibleClassrooms.find(
                            (item) => item.id === event.target.value,
                          );
                          if (next) {
                            selectedClassroomRef.current = next;
                            setClassroom(next);
                          }
                        }}
                      >
                        {visibleClassrooms.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                </div>
                {accountReadState === 'loading' ? (
                  <p className={styles.loading} role="status">
                    Loading the classroom roster…
                  </p>
                ) : null}
                {accountReadState === 'ready' ? (
                  <>
                    <div
                      className={styles.sessionSelector}
                      role="tablist"
                      aria-label="Attendance session"
                    >
                      {[
                        { id: 'morning', label: '☀️ Morning Homeroom (Census)' },
                        { id: 'period-1', label: '📚 Period 1 Math' },
                        { id: 'period-2', label: '🔬 Period 2 Science' },
                        { id: 'period-3', label: '🎨 Period 3 Art' },
                      ].map((sess) => (
                        <button
                          key={sess.id}
                          type="button"
                          className={`${styles.sessionPill} ${activeSession === sess.id ? styles.sessionPillActive : ''}`}
                          onClick={() => {
                            if (activeSession === 'morning') {
                              setMorningRoster(activeStudents);
                            }
                            setActiveSession(sess.id as any);
                          }}
                        >
                          {sess.label}
                        </button>
                      ))}
                    </div>

                    {hallwayDrifts.length > 0 && (
                      <div className={styles.hallwayDriftBanner} role="alert">
                        <span>⚠️</span>
                        <div>
                          <strong>Hallway Drift Sentinel ({hallwayDrifts.length}):</strong>{' '}
                          <span>
                            {hallwayDrifts
                              .map(
                                (d) =>
                                  `${d.studentName} (present at morning gate, absent in ${activeSession})`,
                              )
                              .join(', ')}
                          </span>
                        </div>
                      </div>
                    )}

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
                      <span className={styles.muted}>{activeStudents.length} students</span>
                    </div>
                    <div className={styles.bulkActions} aria-label="Mark all students">
                      <span>Mark all</span>
                      {(['present', 'late', 'absent', 'excused'] as const).map((status) => (
                        <button key={status} type="button" onClick={() => markAll(status)}>
                          {status}
                        </button>
                      ))}
                    </div>

                    <div
                      className={styles.rapidRollCall}
                      aria-label="Rapid roll-call absentee input"
                    >
                      <label htmlFor="rapid-absentees">All Present Except:</label>
                      <input
                        id="rapid-absentees"
                        className={styles.rapidInput}
                        type="text"
                        placeholder="Enter absentee roll numbers e.g. 4, 18, 33"
                        value={absenteeInput}
                        onChange={(e) => setAbsenteeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            applyRapidAbsentees();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className={styles.rapidApplyBtn}
                        disabled={!absenteeInput.trim()}
                        onClick={applyRapidAbsentees}
                      >
                        Apply Absentees
                      </button>
                    </div>

                    <div className={styles.kioskBanner}>
                      <div>
                        <strong>Automated Edge Ingress:</strong> Have students tap cards or badges
                        at the classroom door?
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '1rem',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                        }}
                      >
                        <Link href="/workspace/badges" className={styles.kioskLink}>
                          📇 Print Class Badges
                        </Link>
                        <Link href="/workspace/kiosk" className={styles.kioskLink}>
                          Open Doorway Kiosk Scanner →
                        </Link>
                      </div>
                    </div>

                    {activeStudents.length ? (
                      <ul className={styles.roster}>
                        {activeStudents.map((student, index) => (
                          <li key={student.id}>
                            <span className={styles.roll}>{student.rollNumber ?? index + 1}</span>
                            <span className={styles.studentName}>
                              {student.name}
                              {student.studentId === student.id ? (
                                <span
                                  className={styles.shadowPill}
                                  title="Grade 1+ persistent record"
                                >
                                  Shadow
                                </span>
                              ) : null}
                            </span>
                            <button
                              id={`status-btn-${student.id}`}
                              aria-label={
                                student.studentId
                                  ? `${student.name}, ${student.status}. Change attendance status. Hotkeys: P for Present, A for Absent, L for Late, E for Excused.`
                                  : `${student.name}, not linked to a student account.`
                              }
                              className={`${styles.status} ${styles[student.status]}`}
                              disabled={!student.studentId}
                              onClick={() => changeStatus(student.id)}
                              onKeyDown={(e) => handleRosterKeyDown(e, student.id, index)}
                              type="button"
                            >
                              <span>{student.studentId ? student.status : 'not linked'}</span>
                              {student.studentId ? (
                                <span className={styles.hotkeyBadge} aria-hidden="true">
                                  {student.status.charAt(0).toUpperCase()}
                                </span>
                              ) : null}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={styles.empty}>
                        No students are enrolled in this classroom yet.
                      </p>
                    )}
                    <p
                      className={styles.muted}
                      style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}
                    >
                      All enrolled students and shadow learners accumulate continuous multi-year
                      attendance history from Grade 1.
                    </p>
                    <button
                      className={styles.primary}
                      disabled={!hasCurrentStudentProjection || !markableCount || saving}
                      onClick={() => {
                        save().catch(() => {});
                      }}
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
            ) : (
              <section
                className={styles.workspaceTaskPreview}
                aria-labelledby="workspace-task-title"
              >
                <span aria-hidden="true" className={styles.workspaceTaskEmoji}>
                  {WORKSPACE_FEATURES.find((feature) => feature.id === focused?.featureId)
                    ?.symbol ?? '✨'}
                </span>
                <p className={styles.eyebrow}>Workspace task</p>
                <h2 id="workspace-task-title">{focused?.title ?? 'Workspace feature'}</h2>
                <p>
                  {WORKSPACE_FEATURES.find((feature) => feature.id === focused?.featureId)
                    ?.description ?? 'Open a workspace tool to continue.'}
                </p>
                {mode === 'explore' ? (
                  <p className={styles.muted}>
                    Explore preview · This task stays in your workspace tabs and uses no school
                    records.
                  </p>
                ) : null}
                {focused?.route ? (
                  <Link className={styles.catalogOpenButton} href={focused.route}>
                    Open full tool →
                  </Link>
                ) : null}
              </section>
            )}
          </main>
        </div>
      )}
    </SanctuaryFloorCanvas>
  );
}
