import { isBaselineReadCapability } from '@repo/core/logic/permissions/baselineCapabilities';
import {
  type FeaturePresentation,
  resolveFeaturePresentation,
} from '@repo/core/logic/permissions/featurePresentation';
import { usePermissions } from '@repo/core/logic/permissions/hooks/usePermissions';
import { CITIZENSHIP, sanctuaryFeature } from '@repo/core/logic/permissions/sanctuaryFeature';
import { resolveFeatureFlagValue } from '@repo/core/logic/registry/featureLifecycleManifest';
import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import { useEntitlementQuery } from '@repo/core/hooks/useEntitlementQuery';
import { useFeatureStore } from '@repo/core/store/useFeatureStore';
import type { DomainFeature } from '@repo/core/types/Workspace';
import { useMemo } from 'react';

export interface FeatureGatingResult {
  visible: boolean;
  locked: boolean;
  presentation: FeaturePresentation;
  reason?: 'citizenship' | 'entitlement' | 'authz' | 'feature' | 'platform' | 'not_initialized';
}

export function useFeatureRegistry(
  registry: Record<string, DomainFeature>,
): Record<string, FeatureGatingResult> {
  const { context } = usePermissions();
  const cedarSnapshotLoaded = useCedarDecisionStore((s) => s.snapshotLoaded);
  const getDecision = useCedarDecisionStore((s) => s.getDecision);
  const entitlement = useEntitlementQuery(
    context.userId,
    {
      activeBondId: context.activeBond?.id ?? null,
      activeEntityId: context.activeEntityId,
      activeEntityType: context.activeEntityType,
    },
    Boolean(context.userId && !context.isLocalOnly),
  );
  const { activeEntitlements, grants, pricingTier, manifestLoaded, readiness } = entitlement;
  const flags = useFeatureStore((s) => s.flags);

  return useMemo(() => {
    return Object.fromEntries(
      Object.entries(registry).map(([key, feature]) => {
        const action = feature.capabilityRequirement.action;
        const subject = feature.capabilityRequirement.subject;

        const cedarDecision = context.userId ? getDecision(subject, action) : 'no_decision';

        const flagKey = feature.flagKey ?? `${subject}.${action}`;
        const flagActive = resolveFeatureFlagValue(flags, flagKey);
        const flagType = feature.lifecycle.flagClass ?? 'operational';

        const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
        const result = sanctuaryFeature(
          {
            userId: context.userId,
            isLocalOnly: context.isLocalOnly === true,
            activeBondId: context.activeBond?.id ?? null,
            activeEntityId: context.activeEntityId,
            activeEntityType: context.activeEntityType,
            schoolId: context.schoolId,
            primaryCapacity: context.activeBond?.capacity ?? context.capacity ?? null,
            cedarSnapshotLoaded,
            entitlementManifestLoaded: manifestLoaded,
            entitlementReadiness: readiness,
            citizenship:
              context.citizenship === 'FIRST_CLASS'
                ? CITIZENSHIP.FIRST_CLASS
                : context.citizenship === 'SECOND_CLASS'
                  ? CITIZENSHIP.SECOND_CLASS
                  : CITIZENSHIP.THIRD_CLASS,
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
            action,
            subject,
            citizenshipRequired: feature.citizenshipRequired ?? CITIZENSHIP.FIRST_CLASS,
            platformSupported: isWeb ? feature.webSupport : feature.mobileSupport,
            entitlementModule: feature.entitlementModule,
            entitlementTier: feature.entitlementTier,
            entitlementScope: feature.entitlementScope,
            flagKey: feature.flagKey,
            lifecycleState: feature.state,
            allowDuringBootstrap: isBaselineReadCapability(action, subject),
          },
        );

        const gatingResult: FeatureGatingResult = {
          visible: feature.state !== 'development' && feature.state !== 'deprecated',
          locked: !result.permitted,
          presentation: resolveFeaturePresentation(result, feature.state),
          reason: result.permitted || !('reason' in result) ? undefined : result.reason,
        };

        return [key, gatingResult];
      }),
    );
  }, [
    registry,
    context,
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
