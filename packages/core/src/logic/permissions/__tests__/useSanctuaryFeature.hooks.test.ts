import type { Bond } from '@repo/core/logic/schemas/identity.schema';
import type { SanctuaryPerspective } from '@repo/core/types/Perspective';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const testState = {
  user: null as any,
  scopeSnapshot: null as any,
  activePerspective: {
    id: 'school-123',
    kind: 'institutional',
    displayName: 'Royal College',
    schoolId: 'school-123',
  } as SanctuaryPerspective,
  availablePerspectives: [] as SanctuaryPerspective[],
  cedarDecisions: {
    'Attendance:record': 'allow',
    'Gradebook:publish': 'deny',
  } as Record<string, 'allow' | 'deny'>,
  cedarSnapshotLoaded: true,
  entitlements: {
    activeEntitlements: ['attendance_module', 'classroom_notes'],
    grants: [],
    pricingTier: 'INSTITUTIONAL' as const,
    manifestLoaded: true,
    readiness: 'verified' as const,
  },
  flags: {
    'attendance.record': true,
  } as Record<string, boolean>,
};

vi.mock('react', () => ({
  useCallback: <T extends (...args: unknown[]) => unknown>(cb: T) => cb,
  useMemo: <T>(factory: () => T) => factory(),
}));

vi.mock('@repo/core/store/useAuthStore', () => ({
  useAuthStore: Object.assign((selector: (s: any) => any) => selector({ user: testState.user }), {
    getState: () => ({ user: testState.user }),
  }),
}));

vi.mock('@repo/core/store/scopeSession', () => ({
  useScopeSessionStore: Object.assign(
    (selector: (s: any) => any) => selector({ snapshot: testState.scopeSnapshot }),
    { getState: () => ({ snapshot: testState.scopeSnapshot }) },
  ),
}));

vi.mock('@repo/core/store/usePerspectiveStore', () => ({
  DEFAULT_PERSONAL_PERSPECTIVE: {
    id: 'personal',
    kind: 'personal',
    displayName: 'Personal Sanctuary',
  },
  usePerspectiveStore: Object.assign(
    (selector: (s: any) => any) =>
      selector({
        activePerspective: testState.activePerspective,
        availablePerspectives: testState.availablePerspectives,
      }),
    {
      getState: () => ({
        activePerspective: testState.activePerspective,
        availablePerspectives: testState.availablePerspectives,
      }),
    },
  ),
}));

vi.mock('@repo/core/store/useCedarDecisionStore', () => ({
  useCedarDecisionStore: Object.assign(
    (selector: (s: any) => any) =>
      selector({
        snapshotLoaded: testState.cedarSnapshotLoaded,
        getDecision: (subject: string, action: string) =>
          testState.cedarDecisions[`${subject}:${action}`] ?? 'no_decision',
      }),
    {
      getState: () => ({
        snapshotLoaded: testState.cedarSnapshotLoaded,
        getDecision: (subject: string, action: string) =>
          testState.cedarDecisions[`${subject}:${action}`] ?? 'no_decision',
      }),
    },
  ),
}));

vi.mock('@repo/core/store/useEntitlementStore', () => {
  const getSnapshot = () => ({
    activeEntitlements: testState.entitlements.activeEntitlements,
    grants: testState.entitlements.grants,
    pricingTier: testState.entitlements.pricingTier,
    manifestLoaded: testState.entitlements.manifestLoaded,
    readiness: testState.entitlements.readiness,
  });
  return {
    useEntitlementStore: Object.assign(
      (selector?: (s: any) => any) =>
        typeof selector === 'function' ? selector(getSnapshot()) : getSnapshot(),
      { getState: getSnapshot },
    ),
  };
});

vi.mock('@repo/core/store/useFeatureStore', () => ({
  useFeatureStore: Object.assign(
    (selector: (s: any) => any) => selector({ flags: testState.flags }),
    { getState: () => ({ flags: testState.flags }) },
  ),
}));

import { CITIZENSHIP } from '@repo/core/logic/permissions/sanctuaryFeature';
import { useSanctuaryFeature } from '../hooks/useSanctuaryFeature';

describe('usePermissions and useSanctuaryFeature hooks', () => {
  const mockTeacherBond: Bond = {
    id: 'bond-t-1',
    user_id: '018f3a5b-7c2d-8e4f-9a1b-c3d5e7f9a1b2',
    entity_id: '018f3a5b-7c2d-8e4f-9a1b-c3d5e7f9a1b3',
    entity_type: 'SCHOOL',
    citizenship: 'FIRST_CLASS',
    capacity: 'teacher',
    status: 'active',
  };

  beforeEach(() => {
    testState.user = {
      id: '018f3a5b-7c2d-8e4f-9a1b-c3d5e7f9a1b2',
      email: 'teacher@edlove.org',
      capacity: 'teacher',
      tier: 'free',
      citizenship: 'FIRST_CLASS',
      features: [],
      flags: {},
    };

    testState.scopeSnapshot = {
      principalId: '018f3a5b-7c2d-8e4f-9a1b-c3d5e7f9a1b2',
      activeBond: mockTeacherBond,
      availableBonds: [mockTeacherBond],
    };

    testState.activePerspective = {
      id: '018f3a5b-7c2d-8e4f-9a1b-c3d5e7f9a1b3',
      kind: 'institutional',
      displayName: 'Royal College',
      schoolId: '018f3a5b-7c2d-8e4f-9a1b-c3d5e7f9a1b3',
    };

    testState.cedarDecisions = {
      'Attendance:record': 'allow',
      'Gradebook:publish': 'deny',
    };

    testState.entitlements = {
      activeEntitlements: ['attendance_module', 'classroom_notes'],
      grants: [],
      pricingTier: 'INSTITUTIONAL',
      manifestLoaded: true,
      readiness: 'verified',
    };

    testState.flags = {
      'attendance.record': true,
    };
  });

  describe('usePermissions', () => {
    it('grounds active capacity in active bond within the perspective', () => {
      const { context, can, cannot } = useSanctuaryFeature();

      expect(context.userId).toBe('018f3a5b-7c2d-8e4f-9a1b-c3d5e7f9a1b2');
      expect(context.capacity).toBe('teacher');
      expect(context.activeBond?.id).toBe('bond-t-1');
      expect(context.schoolId).toBe('018f3a5b-7c2d-8e4f-9a1b-c3d5e7f9a1b3');

      // Evaluates direct Cedar PDP decisions
      expect(can('record' as any, 'Attendance' as any)).toBe(true);
      expect(can('publish' as any, 'Gradebook' as any)).toBe(false);
      expect(cannot('publish' as any, 'Gradebook' as any)).toBe(true);
    });

    it('falls back to personal baseline reads for guest context', () => {
      testState.user = null;
      testState.scopeSnapshot = null;
      testState.activePerspective = {
        id: 'personal',
        kind: 'personal',
        displayName: 'Personal Sanctuary',
      };

      const { context, can } = useSanctuaryFeature();
      expect(context.userId).toBeNull();
      expect(can('read' as any, 'SelfReflection' as any)).toBe(true);
      expect(can('write' as any, 'SelfReflection' as any)).toBe(false);
    });
  });

  describe('useSanctuaryFeature', () => {
    it('evaluates synchronous sanctuaryFeature gating with Cedar allow', () => {
      const result = useSanctuaryFeature('record', 'Attendance', {
        action: 'record',
        subject: 'Attendance',
        citizenshipRequired: CITIZENSHIP.FIRST_CLASS,
        platformSupported: true,
      });

      expect(result.permitted).toBe(true);
    });

    it('denies when Cedar policy returns deny', () => {
      const result = useSanctuaryFeature('publish', 'Gradebook', {
        action: 'publish',
        subject: 'Gradebook',
        citizenshipRequired: CITIZENSHIP.FIRST_CLASS,
        platformSupported: true,
      });

      expect(result.permitted).toBe(false);
      if (!result.permitted) {
        expect(result.reason).toBe('authz');
      }
    });

    it('denies when platform is unsupported', () => {
      const result = useSanctuaryFeature('record', 'Attendance', {
        action: 'record',
        subject: 'Attendance',
        citizenshipRequired: CITIZENSHIP.FIRST_CLASS,
        platformSupported: false,
      });

      expect(result.permitted).toBe(false);
      if (!result.permitted) {
        expect(result.reason).toBe('platform');
      }
    });
  });
});
