import { describe, expect, it } from 'vitest';
import {
  calculateAttendanceStreak,
  detectAtRiskStudents,
  identifyHallwayDrift,
} from './attendanceInsights';
import type { WorkspaceStudent } from './attendance';

describe('attendanceInsights', () => {
  describe('calculateAttendanceStreak', () => {
    it('calculates correct streak from recent present marks', () => {
      const history = ['present', 'present', 'present', 'absent', 'present'] as const;
      expect(calculateAttendanceStreak(history)).toBe(3);
    });

    it('returns 0 if most recent is absent', () => {
      const history = ['absent', 'present', 'present'] as const;
      expect(calculateAttendanceStreak(history)).toBe(0);
    });

    it('handles empty history', () => {
      expect(calculateAttendanceStreak([])).toBe(0);
    });
  });

  describe('identifyHallwayDrift', () => {
    it('detects student present in morning but absent in session', () => {
      const morning: WorkspaceStudent[] = [
        { id: 's1', studentId: 's1', name: 'Kasun', rollNumber: 1, status: 'present' },
        { id: 's2', studentId: 's2', name: 'Nimal', rollNumber: 2, status: 'present' },
      ];
      const session: WorkspaceStudent[] = [
        { id: 's1', studentId: 's1', name: 'Kasun', rollNumber: 1, status: 'absent' }, // drifted
        { id: 's2', studentId: 's2', name: 'Nimal', rollNumber: 2, status: 'present' },
      ];

      const drifts = identifyHallwayDrift(morning, session);
      expect(drifts).toHaveLength(1);
      expect(drifts[0]?.studentName).toBe('Kasun');
      expect(drifts[0]?.morningStatus).toBe('present');
      expect(drifts[0]?.sessionStatus).toBe('absent');
    });

    it('does not flag students who were absent all day', () => {
      const morning: WorkspaceStudent[] = [
        { id: 's1', studentId: 's1', name: 'Kasun', rollNumber: 1, status: 'absent' },
      ];
      const session: WorkspaceStudent[] = [
        { id: 's1', studentId: 's1', name: 'Kasun', rollNumber: 1, status: 'absent' },
      ];

      const drifts = identifyHallwayDrift(morning, session);
      expect(drifts).toHaveLength(0);
    });
  });

  describe('detectAtRiskStudents', () => {
    it('flags students with 3+ consecutive trailing absences', () => {
      const students: WorkspaceStudent[] = [
        { id: 's1', studentId: 's1', name: 'Kasun', rollNumber: 1, status: 'absent' },
        { id: 's2', studentId: 's2', name: 'Nimal', rollNumber: 2, status: 'present' },
      ];
      const historyMap = {
        s1: ['present', 'absent', 'absent', 'absent'] as const,
        s2: ['present', 'present', 'present', 'present'] as const,
      };

      const atRisk = detectAtRiskStudents(students, historyMap);
      expect(atRisk).toHaveLength(1);
      expect(atRisk[0]?.student.name).toBe('Kasun');
      expect(atRisk[0]?.alertLevel).toBe('urgent');
      expect(atRisk[0]?.consecutiveAbsences).toBe(3);
    });
  });
});
