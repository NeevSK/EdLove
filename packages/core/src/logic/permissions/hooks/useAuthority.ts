import {
  decide,
  type EntitlementInputs,
  resolveAuthorityContext,
} from '@repo/core/logic/permissions/authority';
import type { UserContext } from '@repo/core/logic/schemas/user.schema';
import { useScopeSessionStore } from '@repo/core/store/scopeSession';
import type { FeatureFlags } from '@repo/core/store/types/featureFlags';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import { useEntitlementStore } from '@repo/core/store/useEntitlementStore';
import { useFeatureStore } from '@repo/core/store/useFeatureStore';
import { usePerspectiveStore } from '@repo/core/store/usePerspectiveStore';
import type { Action, CedarDecision, Subject } from '@repo/core/types/authorization';
import type { Bond } from '@repo/core/logic/schemas/identity.schema';
import { useCallback, useMemo } from 'react';

/**
 * The person's authority for screens (Tier 5). The only client reader of the Cedar decision,
 * entitlement and perspective stores; the ratchet's authorityStoreReads counts reads elsewhere.
 * Decisions themselves are pure, in ../authority.ts.
 */

export interface Authority {
  readonly context: UserContext;
  readonly can: (action: Action, subject: Subject) => boolean;
  readonly cannot: (action: Action, subject: Subject) => boolean;
  readonly getDecision: (subject: string, action: string) => CedarDecision;
  readonly cedarSnapshotLoaded: boolean;
  readonly entitlement: EntitlementInputs & {
    readonly manifestLoaded: boolean;
    readonly readiness: ReturnType<typeof useEntitlementStore.getState>['readiness'];
  };
  readonly flags: FeatureFlags;
}

/** The person's authority, subscribed to every input it depends on. */
export function useAuthority(): Authority {
  const user = useAuthStore((s) => s.user);
  const activePerspective = usePerspectiveStore((s) => s.activePerspective);
  // Subscribed, so switching bonds recomputes the context.
  const scopeSnapshot = useScopeSessionStore((s) => s.snapshot);
  const pricingTier = useEntitlementStore((s) => s.pricingTier);
  const activeEntitlements = useEntitlementStore((s) => s.activeEntitlements);
  const grants = useEntitlementStore((s) => s.grants);
  const manifestLoaded = useEntitlementStore((s) => s.manifestLoaded);
  const readiness = useEntitlementStore((s) => s.readiness);
  const cedarSnapshotLoaded = useCedarDecisionStore((s) => s.snapshotLoaded);
  const getDecision = useCedarDecisionStore((s) => s.getDecision);
  const flags = useFeatureStore((s) => s.flags);

  const context = useMemo(
    () =>
      resolveAuthorityContext({
        user,
        activePerspective,
        availableBonds: (scopeSnapshot?.availableBonds as readonly Bond[] | undefined) ?? [],
        sessionActiveBond: (scopeSnapshot?.activeBond as Bond | null | undefined) ?? null,
        entitlement: { pricingTier, activeEntitlements, grants },
      }),
    [user, activePerspective, scopeSnapshot, pricingTier, activeEntitlements, grants],
  );

  const can = useCallback(
    (action: Action, subject: Subject): boolean =>
      decide(
        context.userId,
        context.userId ? getDecision(subject as string, action as string) : 'no_decision',
        action as string,
        subject as string,
      ),
    [context.userId, getDecision],
  );
  const cannot = useCallback((action: Action, subject: Subject) => !can(action, subject), [can]);

  return {
    context,
    can,
    cannot,
    getDecision,
    cedarSnapshotLoaded,
    entitlement: { pricingTier, activeEntitlements, grants, manifestLoaded, readiness },
    flags,
  };
}

/** Whether the permission snapshot is ready, for screens that wait on it. */
export function useAuthorityStatus() {
  const isLoading = useCedarDecisionStore((s) => s.isLoading);
  const error = useCedarDecisionStore((s) => s.error);
  const snapshotLoaded = useCedarDecisionStore((s) => s.snapshotLoaded);
  const loadDecisions = useCedarDecisionStore((s) => s.loadDecisions);
  return { isLoading, error, snapshotLoaded, loadDecisions };
}
