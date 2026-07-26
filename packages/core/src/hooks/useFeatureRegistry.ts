import { useMemo } from 'react';
import {
  CITIZENSHIP,
  type SanctuaryFeatureResult,
  sanctuaryFeature,
} from '@/logic/permissions/sanctuaryFeature';
import { resolveFeatureFlagValue } from '@/logic/registry/featureLifecycleManifest';
import { useAuthStore } from '@/store/useAuthStore';
import { useCedarDecisionStore } from '@/store/useCedarDecisionStore';
import { useEntitlementStore } from '@/store/useEntitlementStore';
import { useFeatureStore } from '@/store/useFeatureStore';
import type { DomainFeature } from '@/types/Workspace';

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
        const flagActive = resolveFeatureFlagValue(flags, flagKey);
        const flagType = feature.lifecycle.flagClass ?? 'operational';

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
            lifecycleState: feature.state,
          },
        );

        const gatingResult: FeatureGatingResult = {
          visible: feature.state !== 'development' && feature.state !== 'deprecated',
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
