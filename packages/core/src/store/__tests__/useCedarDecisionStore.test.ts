import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { verifySnapshotSignature } from '../../logic/permissions/signature';
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
    useCedarDecisionStore.getState().clearDecisions();
    useCedarDecisionStore.setState({
      decisions: null,
      snapshotLoaded: false,
      isLoading: false,
      error: null,
      snapshotScopeId: null,
    });
    vi.clearAllMocks();
    mockDrizzle.query.policyVersion.findFirst.mockResolvedValue({ hash: 'policy-v1' });
    vi.mocked(verifySnapshotSignature).mockReset().mockResolvedValue(true);
  });

  describe('loadDecisions', () => {
    it.each(['snapshot', 'policy', 'signature'] as const)(
      'cannot restore grants or errors after clear during %s success or failure',
      async (stage) => {
        for (const outcome of ['resolve', 'reject'] as const) {
          const snapshot = Promise.withResolvers<typeof MOCK_SNAPSHOT>();
          const policy = Promise.withResolvers<{ hash: string }>();
          const signature = Promise.withResolvers<boolean>();
          mockDrizzle.query.permissionSnapshots.findFirst
            .mockReset()
            .mockResolvedValue(MOCK_SNAPSHOT);
          mockDrizzle.query.policyVersion.findFirst
            .mockReset()
            .mockResolvedValue({ hash: 'policy-v1' });
          vi.mocked(verifySnapshotSignature).mockReset().mockResolvedValue(true);
          if (stage === 'snapshot')
            mockDrizzle.query.permissionSnapshots.findFirst.mockReturnValueOnce(snapshot.promise);
          if (stage === 'policy')
            mockDrizzle.query.policyVersion.findFirst.mockReturnValueOnce(policy.promise);
          if (stage === 'signature')
            vi.mocked(verifySnapshotSignature).mockReturnValueOnce(signature.promise);
          const loading = useCedarDecisionStore.getState().loadDecisions('user-123', 'school-1');
          await vi.waitFor(() => {
            const boundary =
              stage === 'snapshot'
                ? mockDrizzle.query.permissionSnapshots.findFirst
                : stage === 'policy'
                  ? mockDrizzle.query.policyVersion.findFirst
                  : verifySnapshotSignature;
            expect(boundary).toHaveBeenCalledOnce();
          });
          useCedarDecisionStore.getState().clearDecisions();
          const selected =
            stage === 'snapshot' ? snapshot : stage === 'policy' ? policy : signature;
          if (outcome === 'reject') selected.reject(new Error('old account boundary failed'));
          else {
            snapshot.resolve(MOCK_SNAPSHOT);
            policy.resolve({ hash: 'policy-v1' });
            signature.resolve(true);
          }
          await loading;
          expect(useCedarDecisionStore.getState()).toMatchObject({
            decisions: null,
            snapshotLoaded: false,
            isLoading: false,
            error: null,
            snapshotScopeId: null,
          });
        }
      },
    );

    it('withdraws old grants during reload and ignores an older load after the newer one settles', async () => {
      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValue(MOCK_SNAPSHOT);
      await useCedarDecisionStore.getState().loadDecisions('user-123');
      expect(useCedarDecisionStore.getState().getDecision('Classroom', 'create')).toBe('allow');
      const oldQuery = Promise.withResolvers<typeof MOCK_SNAPSHOT>();
      mockDrizzle.query.permissionSnapshots.findFirst.mockReturnValueOnce(oldQuery.promise);
      const older = useCedarDecisionStore.getState().loadDecisions('user-123');
      expect(useCedarDecisionStore.getState().getDecision('Classroom', 'create')).toBe(
        'no_decision',
      );
      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValue({
        ...MOCK_SNAPSHOT,
        userId: 'user-456',
        permissions: JSON.stringify({ Classroom: { create: false } }),
      });
      await useCedarDecisionStore.getState().loadDecisions('user-456');
      oldQuery.resolve(MOCK_SNAPSHOT);
      await older;
      expect(useCedarDecisionStore.getState().getDecision('Classroom', 'create')).toBe('deny');
    });

    it('invalidates pending grants when the principal becomes empty', async () => {
      const query = Promise.withResolvers<typeof MOCK_SNAPSHOT>();
      mockDrizzle.query.permissionSnapshots.findFirst.mockReturnValueOnce(query.promise);
      const older = useCedarDecisionStore.getState().loadDecisions('user-123');
      await useCedarDecisionStore.getState().loadDecisions('');
      query.resolve(MOCK_SNAPSHOT);
      await older;
      expect(useCedarDecisionStore.getState()).toMatchObject({
        decisions: null,
        snapshotLoaded: false,
        isLoading: false,
      });
    });

    it('rejects a signed snapshot belonging to another principal', async () => {
      mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValue({
        ...MOCK_SNAPSHOT,
        userId: 'other-account',
      });
      await useCedarDecisionStore.getState().loadDecisions('user-123');
      expect(useCedarDecisionStore.getState()).toMatchObject({
        decisions: null,
        error: 'Permission snapshot principal mismatch',
      });
      expect(verifySnapshotSignature).not.toHaveBeenCalled();
    });

    it.each(['not-a-date', new Date(0).toISOString()])(
      'denies non-future snapshot expiry %s',
      async (expiresAt) => {
        mockDrizzle.query.permissionSnapshots.findFirst.mockResolvedValue({
          ...MOCK_SNAPSHOT,
          expiresAt,
        });
        await useCedarDecisionStore.getState().loadDecisions('user-123');
        expect(useCedarDecisionStore.getState()).toMatchObject({
          decisions: null,
          error: 'Permission snapshot has expired',
        });
      },
    );

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
