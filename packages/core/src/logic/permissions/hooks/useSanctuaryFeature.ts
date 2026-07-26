import { useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCedarDecisionStore } from '@/store/useCedarDecisionStore';
import { useEntitlementStore } from '@/store/useEntitlementStore';
import { useFeatureStore } from '@/store/useFeatureStore';
import {
  sanctuaryFeature,
  type SanctuaryFeatureResult,
  type FeatureRequirement,
  CITIZENSHIP,
} from '@/logic/permissions/sanctuaryFeature';

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
    const flagEntry = (flags as any)?.[flagKey];
    const flagActive = flagEntry?.value ?? true; // fail open unless explicit false
    const flagType = flagEntry?.type ?? 'operational';

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
  ]);
}
