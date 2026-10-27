import { usePermissions } from '@repo/core/logic/permissions/hooks/usePermissions';
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
import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import { useEntitlementQuery } from '@repo/core/hooks/useEntitlementQuery';
import { useFeatureStore } from '@repo/core/store/useFeatureStore';
import { useMemo } from 'react';

export function useSanctuaryFeature(
  action: string,
  subject: string,
  requirement: FeatureRequirement,
  resourceId?: string,
): SanctuaryFeatureResult {
  const { context } = usePermissions();
  const principalId = context.userId;
  const cedarSnapshotLoaded = useCedarDecisionStore((s) => s.snapshotLoaded);
  const getDecision = useCedarDecisionStore((s) => s.getDecision);
  const entitlement = useEntitlementQuery(
    principalId,
    {
      activeBondId: context.activeBond?.id ?? null,
      activeEntityId: context.activeEntityId,
      activeEntityType: context.activeEntityType,
    },
    Boolean(principalId && !context.isLocalOnly),
  );
  const { activeEntitlements, grants, pricingTier, manifestLoaded, readiness } = entitlement;
  const flags = useFeatureStore((s) => s.flags);

  return useMemo(() => {
    const citizenship =
      context.citizenship === 'FIRST_CLASS'
        ? CITIZENSHIP.FIRST_CLASS
        : context.citizenship === 'SECOND_CLASS'
          ? CITIZENSHIP.SECOND_CLASS
          : CITIZENSHIP.THIRD_CLASS;

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
        isLocalOnly: context.isLocalOnly === true,
        activeBondId: context.activeBond?.id ?? null,
        activeEntityId: context.activeEntityId,
        activeEntityType: context.activeEntityType,
        schoolId: context.schoolId,
        primaryCapacity: context.activeBond?.capacity ?? context.capacity ?? null,
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
    requirement,
    context,
    cedarSnapshotLoaded,
    getDecision,
    flags,
    principalId,
    activeEntitlements,
    grants,
    pricingTier,
    manifestLoaded,
    readiness,
  ]);
}
