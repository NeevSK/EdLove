import { createTemporalProxy } from '@repo/core/api/temporalProxy';
import { resolveBondScope } from '@repo/core/logic/permissions/bondScope';
import { useTemporalStore } from '@repo/core/store/useTemporalStore';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('Invariant 1: Temporal Mutation Shield & RBAC Scope Boundary', () => {
  beforeEach(() => {
    useTemporalStore.setState({
      phase: 'present',
      isPastView: false,
      readPolicy: 'live',
      viewDate: new Date().toISOString().split('T')[0],
    });
  });

  afterEach(() => {
    useTemporalStore.setState({
      phase: 'present',
      isPastView: false,
      readPolicy: 'live',
      viewDate: undefined,
    });
  });

  describe('History Immutability Invariant', () => {
    const mockService = {
      upsertAttendance: async (data: { studentId: string; status: string }) => ({
        success: true,
        data,
      }),
      insertRecord: async (record: { title: string }) => ({ success: true, record }),
      deleteRecord: async (id: string) => ({ success: true, deletedId: id }),
      updateLayout: async (patch: Record<string, unknown>) => ({ success: true, patch }),
      getAttendance: async (id: string) => ({ id, status: 'present', immutable: true }),
      listHistoricalSnapshots: async () => [{ id: 'snap-1' }, { id: 'snap-2' }],
    };

    it('unconditionally rejects mutation calls when temporal phase is set to past', async () => {
      useTemporalStore.setState({
        phase: 'past',
        isPastView: true,
        viewDate: '2024-03-15',
      });

      const proxy = createTemporalProxy('educational', mockService);

      await expect(
        proxy.upsertAttendance({ studentId: 'student-99', status: 'absent' }),
      ).rejects.toThrow('Cannot modify history');

      await expect(proxy.deleteRecord('rec-123')).rejects.toThrow('Cannot modify history');

      await expect(proxy.insertRecord({ title: 'New Event' })).rejects.toThrow(
        'Cannot modify history',
      );

      await expect(proxy.updateLayout({ grid: 'custom' })).rejects.toThrow('Cannot modify history');
    });

    it('permits read-only queries during past phase without interference', async () => {
      useTemporalStore.setState({
        phase: 'past',
        isPastView: true,
        viewDate: '2024-03-15',
      });

      const proxy = createTemporalProxy('educational', mockService);

      const attendance = await proxy.getAttendance('rec-1');
      expect(attendance).toEqual({ id: 'rec-1', status: 'present', immutable: true });

      const snapshots = await proxy.listHistoricalSnapshots();
      expect(snapshots).toHaveLength(2);
    });

    it('dynamically unlocks mutations the moment temporal state returns to present', async () => {
      const proxy = createTemporalProxy('educational', mockService);

      // 1. Shift to past -> blocked
      useTemporalStore.setState({ phase: 'past', isPastView: true });
      await expect(
        proxy.upsertAttendance({ studentId: 'student-1', status: 'present' }),
      ).rejects.toThrow('Cannot modify history');

      // 2. Return to present -> immediately unblocked
      useTemporalStore.setState({ phase: 'present', isPastView: false });
      const result = await proxy.upsertAttendance({ studentId: 'student-1', status: 'present' });
      expect(result).toEqual({
        success: true,
        data: { studentId: 'student-1', status: 'present' },
      });
    });
  });

  describe('RBAC Bond Scope Derivation Invariant', () => {
    it('isolates personal sanctuary scope with zero schoolId leakage', () => {
      const personalScope = resolveBondScope({
        id: 'bond-p-1',
        entity_id: 'user-workspace-1',
        entity_type: 'PERSONAL_CLASSROOM',
        capacity: 'teacher',
      });

      expect(personalScope.isPersonal).toBe(true);
      expect(personalScope.schoolId).toBeNull();
      expect(personalScope.activeEntityType).toBe('PERSONAL_CLASSROOM');
    });

    it('correctly derives institutional tenancy for school-bound users', () => {
      const schoolScope = resolveBondScope({
        id: 'bond-s-1',
        entity_id: 'school-colombo-royal',
        entity_type: 'SCHOOL',
        capacity: 'principal',
      });

      expect(schoolScope.isPersonal).toBe(false);
      expect(schoolScope.schoolId).toBe('school-colombo-royal');
      expect(schoolScope.activeEntityType).toBe('SCHOOL');
    });
  });
});
