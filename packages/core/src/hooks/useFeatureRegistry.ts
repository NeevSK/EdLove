import { useMemo } from 'react';
import type { DomainFeature } from '../types/Workspace';
import { useAuthStore } from '../store/useAuthStore';
import { useCedarDecisionStore } from '../store/useCedarDecisionStore';
import { useEntitlementStore } from '../store/useEntitlementStore';
import { useFeatureStore } from '../store/useFeatureStore';
import {
  sanctuaryFeature,
  CITIZENSHIP,
  type SanctuaryFeatureResult,
} from '../logic/permissions/sanctuaryFeature';

export interface FeatureGatingResult {
  visible: boolean;
  locked: boolean;
  reason?: 'citizenship' | 'entitlement' | 'authz' | 'feature' | 'not_initialized';
}

export function useFeatureRegistry(
  registry: Record<string, DomainFeature>,
): Record<string, FeatureGatingResult> {
  const user = useAuthStore((s) => s.user);
  const citizenshipStr = user?.citizenship ?? 'THIRD_CLASS';
  const principalId = user?.id ?? null;
  const cedarSnapshotLoaded = useCedarDecisionStore((s) => s.snapshotLoaded);
  const getDecision = useCedarDecisionStore((s) => s.getDecision);
  const { activeEntitlements, pricingTier, manifestLoaded } = useEntitlementStore();
  const flags = useFeatureStore((s) => s.flags);

  return useMemo(() => {
    const citizenship =
      citizenshipStr === 'WANDERER' || citizenshipStr === 'THIRD_CLASS'
        ? CITIZENSHIP.THIRD_CLASS
        : citizenshipStr === 'SECOND_CLASS'
          ? CITIZENSHIP.SECOND_CLASS
          : CITIZENSHIP.FIRST_CLASS;

    return Object.fromEntries(
      Object.entries(registry).map(([key, feature]) => {
        const action = feature.capabilityRequirement.action;
        const subject = feature.capabilityRequirement.subject;

        const cedarDecision = principalId ? getDecision(subject, action) : 'no_decision';

        const flagKey = feature.flagKey ?? `${subject}.${action}`;
        const flagEntry = (flags as any)?.[flagKey];
        const flagActive = flagEntry?.value ?? true;
        const flagType = flagEntry?.type ?? 'operational';

        const result = sanctuaryFeature(
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
          {
            citizenshipRequired: feature.citizenshipRequired ?? CITIZENSHIP.FIRST_CLASS,
            entitlementModule: feature.entitlementModule,
            entitlementTier: feature.entitlementTier,
            flagKey: feature.flagKey,
          },
        );

        const gatingResult: FeatureGatingResult = {
          visible: true,
          locked: !result.permitted,
          reason: result.permitted ? undefined : (result as any).reason,
        };

        return [key, gatingResult];
      }),
    );
  }, [
    registry,
    user,
    citizenshipStr,
    principalId,
    cedarSnapshotLoaded,
    getDecision,
    activeEntitlements,
    pricingTier,
    manifestLoaded,
    flags,
  ]);
}


