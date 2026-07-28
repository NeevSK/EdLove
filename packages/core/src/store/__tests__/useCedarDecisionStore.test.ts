import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCedarDecisionStore } from '../useCedarDecisionStore';

const mockDrizzle = {
  query: {
    permissionSnapshots: {
      findFirst: vi.fn(),
    },
    policyVersion: {
      findFirst: vi.fn(),
    },
  },
};

vi.mock('../../adapters/powersync/database', () => ({
  getDrizzleDB: () => mockDrizzle,
}));

vi.mock('../../logic/permissions/signature', () => ({
  verifySnapshotSignature: vi.fn().mockResolvedValue(true),
}));

const MOCK_SNAPSHOT = {
  id: 'snap-1',
  userId: 'user-123',
  activeBondId: 'school-1',
  schoolId: 'school-1',
  policyVersion: 'policy-v1',
  generatedAt: '2026-07-23T00:00:00.000Z',
  expiresAt: '2027-07-23T00:00:00.000Z',
  permissions: JSON.stringify({
    Classroom: { create: true, read: true, update: false, delete: false },
    School: { read: true, manage: true },
    StudentDashboard: { read: true },
  }),
  temporalHints: null,
  signature: 'test-sig',
};

describe('useCedarDecisionStore', () => {
  beforeEach(() => {
    useCedarDecisionStore.setState({
      decisions: null,
      snapshotLoaded: false,
      isLoading: false,
      error: null,
      snapshotScopeId: null,
    });
    vi.clearAllMocks();
    mockDrizzle.query.policyVersion.findFirst.mockResolvedValue({ hash: 'policy-v1' });
  });

  describe('loadDecisions', () => {
    it('loads decisions from permissionSnapshots table and sets snapshotLoaded', async () => {
      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValue(MOCK_SNAPSHOT);

      await useCedarDecisionStore.getState().loadDecisions('user-123');

      const state = useCedarDecisionStore.getState();
      expect(state.snapshotLoaded).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.decisions).not.toBeNull();
    });

    it('parses permissions into decisions map correctly', async () => {
      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValue(MOCK_SNAPSHOT);

      await useCedarDecisionStore.getState().loadDecisions('user-123');

      const { decisions } = useCedarDecisionStore.getState();
      expect(decisions).toEqual({
        Classroom: { create: 'allow', read: 'allow', update: 'deny', delete: 'deny' },
        School: { read: 'allow', manage: 'allow' },
        StudentDashboard: { read: 'allow' },
      });
    });

    it('records the active bond scope for the loaded snapshot', async () => {
      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValue(MOCK_SNAPSHOT);

      await useCedarDecisionStore.getState().loadDecisions('user-123', 'school-1');

      expect(useCedarDecisionStore.getState().snapshotScopeId).toBe('school-1');
      expect(mockDrizzle.query.permissionSnapshots.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.anything() }),
      );
    });

    it('sets snapshotLoaded to false when no snapshot record exists', async () => {
      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValue(null);

      await useCedarDecisionStore.getState().loadDecisions('user-456');

      const state = useCedarDecisionStore.getState();
      expect(state.snapshotLoaded).toBe(false);
      expect(state.decisions).toBeNull();
    });

    it('sets snapshotLoaded to false for empty userId', async () => {
      await useCedarDecisionStore.getState().loadDecisions('');

      const state = useCedarDecisionStore.getState();
      expect(state.snapshotLoaded).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('sets error state when database query throws', async () => {
      mockDrizzle.query.permissionSnapshots.findFirst.mockRejectedValue(
        new Error('DB connection failed'),
      );

      await useCedarDecisionStore.getState().loadDecisions('user-123');

      const state = useCedarDecisionStore.getState();
      expect(state.snapshotLoaded).toBe(false);
      expect(state.error).toBe('DB connection failed');
    });
  });

  describe('getDecision', () => {
    it('returns allow for permitted action on subject', async () => {
      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValue(MOCK_SNAPSHOT);
      await useCedarDecisionStore.getState().loadDecisions('user-123');

      expect(useCedarDecisionStore.getState().getDecision('Classroom', 'create')).toBe('allow');
    });

    it('returns deny for forbidden action on subject', async () => {
      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValue(MOCK_SNAPSHOT);
      await useCedarDecisionStore.getState().loadDecisions('user-123');

      expect(useCedarDecisionStore.getState().getDecision('Classroom', 'delete')).toBe('deny');
    });

    it('returns no_decision for unknown subject', async () => {
      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValue(MOCK_SNAPSHOT);
      await useCedarDecisionStore.getState().loadDecisions('user-123');

      expect(useCedarDecisionStore.getState().getDecision('NonExistent', 'read')).toBe(
        'no_decision',
      );
    });

    it('returns no_decision when decisions not loaded', () => {
      expect(useCedarDecisionStore.getState().getDecision('Classroom', 'read')).toBe('no_decision');
    });
  });

  describe('clearDecisions', () => {
    it('resets all state to initial values', async () => {
      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValue(MOCK_SNAPSHOT);
      await useCedarDecisionStore.getState().loadDecisions('user-123');
      expect(useCedarDecisionStore.getState().snapshotLoaded).toBe(true);

      useCedarDecisionStore.getState().clearDecisions();

      const state = useCedarDecisionStore.getState();
      expect(state.decisions).toBeNull();
      expect(state.snapshotLoaded).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
