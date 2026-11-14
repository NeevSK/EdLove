import type { AttendanceStatus, WorkspaceStudent } from './attendance';

export type AtRiskStudent = Readonly<{
  student: WorkspaceStudent;
  consecutiveAbsences: number;
  overallRatePercent: number;
  alertLevel: 'urgent' | 'warning' | 'notice';
}>;

export type HallwayDriftNotice = Readonly<{
  studentId: string;
  studentName: string;
  morningStatus: AttendanceStatus;
  sessionStatus: AttendanceStatus;
}>;

/**
 * Calculates current consecutive active presence streak.
 * Traverses from most recent record backwards.
 */
export function calculateAttendanceStreak(
  history: readonly (AttendanceStatus | { status: AttendanceStatus })[],
): number {
  let streak = 0;
  for (const entry of history) {
    const status = typeof entry === 'string' ? entry : entry.status;
    if (status === 'present') {
      streak += 1;
    } else if (status === 'absent' || status === 'late') {
      break;
    }
  }
  return streak;
}

/**
 * Detects Hallway Drift: students marked present in morning homeroom / entrance kiosk
 * but missing or marked absent in a later subject period.
 */
export function identifyHallwayDrift(
  morningRoster: readonly WorkspaceStudent[],
  periodRoster: readonly WorkspaceStudent[],
): readonly HallwayDriftNotice[] {
  const morningMap = new Map<string, WorkspaceStudent>();
  for (const s of morningRoster) {
    const id = s.studentId ?? s.id;
    morningMap.set(id, s);
  }

  const drifts: HallwayDriftNotice[] = [];
  for (const sessionStudent of periodRoster) {
    const id = sessionStudent.studentId ?? sessionStudent.id;
    const morningRecord = morningMap.get(id);

    // If present in morning homeroom but absent in period
    if (
      morningRecord &&
      (morningRecord.status === 'present' || morningRecord.status === 'late') &&
      sessionStudent.status === 'absent'
    ) {
      drifts.push({
        studentId: id,
        studentName: sessionStudent.name,
        morningStatus: morningRecord.status,
        sessionStatus: sessionStudent.status,
      });
    }
  }

  return drifts;
}

/**
 * Identifies learners requiring early pastoral or guardian intervention
 * based on consecutive unexcused misses or low overall term presence.
 */
export function detectAtRiskStudents(
  students: readonly WorkspaceStudent[],
  historyMap: Readonly<Record<string, readonly AttendanceStatus[]>>,
): readonly AtRiskStudent[] {
  const atRisk: AtRiskStudent[] = [];

  for (const student of students) {
    const id = student.studentId ?? student.id;
    const records = historyMap[id] ?? [];
    if (records.length === 0) continue;

    // Count consecutive trailing absences
    let consecutiveAbsences = 0;
    for (let i = records.length - 1; i >= 0; i--) {
      if (records[i] === 'absent') {
        consecutiveAbsences += 1;
      } else {
        break;
      }
    }

    const presentCount = records.filter((s) => s === 'present' || s === 'late').length;
    const overallRatePercent = Math.round((presentCount / records.length) * 100);

    if (consecutiveAbsences >= 3 || overallRatePercent < 80) {
      atRisk.push({
        student,
        consecutiveAbsences,
        overallRatePercent,
        alertLevel: consecutiveAbsences >= 3 ? 'urgent' : 'warning',
      });
    }
  }

  return atRisk;
}
