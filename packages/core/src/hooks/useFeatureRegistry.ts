import { useMemo } from 'react';
import { Platform } from 'react-native';
import { resolveBondScope } from '@repo/core/logic/permissions/bondScope';
import {
  type FeaturePresentation,
  resolveFeaturePresentation,
} from '@repo/core/logic/permissions/featurePresentation';
import {
  CITIZENSHIP,
  type SanctuaryFeatureResult,
  sanctuaryFeature,
} from '@repo/core/logic/permissions/sanctuaryFeature';
import { resolveFeatureFlagValue } from '@repo/core/logic/registry/featureLifecycleManifest';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import { useEntitlementStore } from '@repo/core/store/useEntitlementStore';
import { useFeatureStore } from '@repo/core/store/useFeatureStore';
import type { DomainFeature } from '@repo/core/types/Workspace';

export interface FeatureGatingResult {
  visible: boolean;
  locked: boolean;
  presentation: FeaturePresentation;
  reason?: 'citizenship' | 'entitlement' | 'authz' | 'feature' | 'platform' | 'not_initialized';
}

export function useFeatureRegistry(
  registry: Record<string, DomainFeature>,
): Record<string, FeatureGatingResult> {
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
    const citizenship =
      citizenshipStr === 'WANDERER' || citizenshipStr === 'THIRD_CLASS'
        ? CITIZENSHIP.THIRD_CLASS
        : citizenshipStr === 'SECOND_CLASS'
          ? CITIZENSHIP.SECOND_CLASS
          : CITIZENSHIP.FIRST_CLASS;

    const bondScope = resolveBondScope(activeBond);

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
          {
            citizenshipRequired: feature.citizenshipRequired ?? CITIZENSHIP.FIRST_CLASS,
            platformSupported: Platform.OS === 'web' ? feature.webSupport : feature.mobileSupport,
            entitlementModule: feature.entitlementModule,
            entitlementTier: feature.entitlementTier,
            entitlementScope: feature.entitlementScope,
            flagKey: feature.flagKey,
            lifecycleState: feature.state,
          },
        );

        const gatingResult: FeatureGatingResult = {
          visible: feature.state !== 'development' && feature.state !== 'deprecated',
          locked: !result.permitted,
          presentation: resolveFeaturePresentation(result, feature.state),
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
    activeBond,
    cedarSnapshotLoaded,
    getDecision,
    activeEntitlements,
    grants,
    pricingTier,
    manifestLoaded,
    readiness,
    flags,
  ]);
}
