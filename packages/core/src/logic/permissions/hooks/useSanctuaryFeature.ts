import { useMemo } from 'react';
import {
  CITIZENSHIP,
  type FeatureRequirement,
  type SanctuaryFeatureResult,
  sanctuaryFeature,
} from '@/logic/permissions/sanctuaryFeature';
import {
  resolveFeatureFlagClass,
  resolveFeatureFlagValue,
} from '@/logic/registry/featureLifecycleManifest';
import { useAuthStore } from '@/store/useAuthStore';
import { useCedarDecisionStore } from '@/store/useCedarDecisionStore';
import { useEntitlementStore } from '@/store/useEntitlementStore';
import { useFeatureStore } from '@/store/useFeatureStore';

export function useSanctuaryFeature(
  action: string,
  subject: string,
  requirement: FeatureRequirement,
  resourceId?: string,
): SanctuaryFeatureResult {
  const user = useAuthStore((s) => s.user);
  const citizenshipStr = user?.citizenship ?? 'THIRD_CLASS';
  const principalId = user?.id ?? null;
  const cedarSnapshotLoaded = useCedarDecisionStore((s) => s.snapshotLoaded);
  const getDecision = useCedarDecisionStore((s) => s.getDecision);
  const { activeEntitlements, pricingTier, manifestLoaded } = useEntitlementStore();
  const flags = useFeatureStore((s) => s.flags);

  return useMemo(() => {
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
        cedarSnapshotLoaded,
        entitlementManifestLoaded: manifestLoaded,
        citizenship,
        entitlement: {
          pricingTier: pricingTier as 'FREE' | 'PRO' | 'INSTITUTIONAL',
          activeEntitlements,
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
    activeEntitlements,
    pricingTier,
    manifestLoaded,
  ]);
}
