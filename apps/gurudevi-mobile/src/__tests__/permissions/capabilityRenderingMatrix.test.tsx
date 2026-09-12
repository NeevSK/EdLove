import type { Subject } from '@repo/core/types/authorization';
import { act, create } from 'react-test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Capacity =
  | 'student'
  | 'teacher'
  | 'guardian'
  | 'principal'
  | 'founder'
  | 'admin'
  | 'developer';

const capacities: Capacity[] = [
  'student',
  'teacher',
  'guardian',
  'principal',
  'founder',
  'admin',
  'developer',
];

const mocks = vi.hoisted(() => {
  const authState = {
    user: {
      id: 'user-1',
      capacity: 'student' as Capacity,
      citizenship: 'SECOND_CLASS' as string | undefined,
    },
    activeBond: null,
    availableBonds: [],
  };
  const authStore = (selector: (state: typeof authState) => unknown) => selector(authState);
  authStore.getState = () => authState;

  return {
    authState,
    authStore,
    perspectiveState: { activePerspective: { kind: 'personal' as const } },
    tenantState: { schoolType: null },
    featureState: { flags: {} },
    cedarState: {
      snapshotLoaded: false,
      getDecision: () => 'no_decision' as const,
    },
    entitlementState: {
      activeEntitlements: [] as string[],
      grants: [],
      pricingTier: 'FREE' as const,
      manifestLoaded: false,
      readiness: 'unknown' as const,
    },
  };
});

vi.mock('@repo/core/store/useAuthStore', () => ({ useAuthStore: mocks.authStore }));
vi.mock('@repo/core/store/usePerspectiveStore', () => ({
  usePerspectiveStore: (selector: (state: typeof mocks.perspectiveState) => unknown) =>
    selector(mocks.perspectiveState),
}));
vi.mock('@repo/core/store/useTenantStore', () => ({
  useTenantStore: (selector: (state: typeof mocks.tenantState) => unknown) =>
    selector(mocks.tenantState),
}));
vi.mock('@repo/core/store/useFeatureStore', () => ({
  useFeatureStore: (selector: (state: typeof mocks.featureState) => unknown) =>
    selector(mocks.featureState),
}));
vi.mock('@repo/core/store/useCedarDecisionStore', () => ({
  useCedarDecisionStore: (selector: (state: typeof mocks.cedarState) => unknown) =>
    selector(mocks.cedarState),
}));
vi.mock('@repo/core/store/useEntitlementStore', () => ({
  useEntitlementStore: () => mocks.entitlementState,
}));

import { usePermissions } from '@repo/core/logic/permissions/hooks/usePermissions';

function CapabilityProbe({
  action,
  subject,
}: {
  action: 'read' | 'create' | 'manage';
  subject: Subject;
}) {
  const { can } = usePermissions();
  return <>{can(action, subject) ? 'visible' : 'blocked'}</>;
}

async function renderDecision(action: 'read' | 'create' | 'manage', subject: Subject) {
  let tree: ReturnType<typeof create>;
  await act(async () => {
    tree = create(<CapabilityProbe action={action} subject={subject} />);
    await Promise.resolve();
  });
  const output = tree!.toJSON();
  tree!.unmount();
  return output;
}

describe('Capability rendering matrix (component-real scenarios)', () => {
  beforeEach(() => {
    mocks.authState.user = {
      id: 'user-1',
      capacity: 'student',
      citizenship: 'SECOND_CLASS',
    };
    mocks.entitlementState.pricingTier = 'FREE';
    mocks.entitlementState.manifestLoaded = false;
    mocks.entitlementState.readiness = 'unknown';
    mocks.cedarState.snapshotLoaded = false;
  });

  it.each(capacities)('renders baseline read UI for %s capacity', async (capacity) => {
    mocks.authState.user.capacity = capacity;

    await expect(renderDecision('read', 'LibraryResource')).resolves.toBe('visible');
  });

  it('uses second-class citizenship when the user record omits citizenship', async () => {
    mocks.authState.user = {
      id: 'user-1',
      capacity: 'teacher',
      citizenship: undefined,
    };

    await expect(renderDecision('read', 'LibraryResource')).resolves.toBe('visible');
  });

  it('renders the same baseline read UI for a third-class local-only user', async () => {
    mocks.authState.user.citizenship = 'THIRD_CLASS';

    await expect(renderDecision('read', 'LibraryResource')).resolves.toBe('visible');
  });

  it('permits local-only personal writes for a third-class user', async () => {
    mocks.authState.user.citizenship = 'THIRD_CLASS';

    await expect(renderDecision('create', 'SelfJourney')).resolves.toBe('visible');
  });

  it('keeps privileged operations blocked while capability state hydrates', async () => {
    mocks.authState.user.capacity = 'admin';

    await expect(renderDecision('manage', 'AdminDashboard')).resolves.toBe('blocked');
  });

  it('keeps paid or privileged decisions fail-closed after hydration is unavailable', async () => {
    mocks.authState.user.capacity = 'founder';
    mocks.authState.user.citizenship = 'SECOND_CLASS';

    await expect(renderDecision('manage', 'FounderDashboard')).resolves.toBe('blocked');
  });
});
