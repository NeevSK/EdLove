import { useMemo } from 'react';
import { resolveBondScope } from '@repo/core/logic/permissions/bondScope';
import {
  CITIZENSHIP,
  type FeatureRequirement,
  type SanctuaryFeatureResult,
  sanctuaryFeature,
} from '@repo/core/logic/permissions/sanctuaryFeature';
import {
  resolveFeatureFlagClass,
  resolveFeatureFlagValue,
} from '@repo/core/logic/registry/featureLifecycleManifest';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import { useEntitlementStore } from '@repo/core/store/useEntitlementStore';
import { useFeatureStore } from '@repo/core/store/useFeatureStore';

export function useSanctuaryFeature(
  action: string,
  subject: string,
  requirement: FeatureRequirement,
  resourceId?: string,
): SanctuaryFeatureResult {
  const user = useAuthStore((s) => s.user);
  const activeBond = useAuthStore((s) => s.activeBond);
  const citizenshipStr = user?.citizenship ?? 'THIRD_CLASS';
  const principalId = user?.id ?? null;
  const cedarSnapshotLoaded = useCedarDecisionStore((s) => s.snapshotLoaded);
  const getDecision = useCedarDecisionStore((s) => s.getDecision);
  const { activeEntitlements, grants, pricingTier, manifestLoaded, readiness } =
    useEntitlementStore();
  const flags = useFeatureStore((s) => s.flags);

  return useMemo(() => {
    const bondScope = resolveBondScope(activeBond);
    // Map string citizenship to numeric level
    const citizenship =
      citizenshipStr === 'WANDERER' || citizenshipStr === 'THIRD_CLASS'
        ? CITIZENSHIP.THIRD_CLASS
        : citizenshipStr === 'SECOND_CLASS'
          ? CITIZENSHIP.SECOND_CLASS
          : CITIZENSHIP.FIRST_CLASS;

    // Cedar evaluation — synchronous against locally-computed decision store
    const cedarDecision: 'allow' | 'deny' | 'no_decision' = principalId
      ? getDecision(subject, action)
      : 'no_decision';

    // Flag resolution
    const flagKey = requirement.flagKey ?? `${subject}.${action}`;
    const flagActive = resolveFeatureFlagValue(flags, flagKey);
    const flagType = resolveFeatureFlagClass(flagKey);

    return sanctuaryFeature(
      {
        userId: principalId,
        activeBondId: activeBond?.id ?? null,
        activeEntityId: bondScope.activeEntityId,
        activeEntityType: bondScope.activeEntityType,
        schoolId: bondScope.schoolId,
        primaryCapacity: activeBond?.capacity ?? null,
        cedarSnapshotLoaded,
        entitlementManifestLoaded: manifestLoaded,
        entitlementReadiness: readiness,
        citizenship,
        entitlement: {
          pricingTier: pricingTier as 'FREE' | 'PRO' | 'INSTITUTIONAL',
          activeEntitlements,
          grants,
          expirationDate: null,
        },
        cedarDecision,
        flagActive,
        flagKey,
        flagType,
      },
      requirement,
    );
  }, [
    action,
    subject,
    resourceId,
    requirement,
    user,
    citizenshipStr,
    cedarSnapshotLoaded,
    getDecision,
    flags,
    principalId,
    activeBond,
    activeEntitlements,
    grants,
    pricingTier,
    manifestLoaded,
    readiness,
  ]);
}
