import { useAuthority } from '@repo/core/logic/permissions/hooks/useAuthority';
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
import type { Capacity } from '@repo/core/logic/schemas/capacity.schema';
import type { UserContext } from '@repo/core/logic/schemas/user.schema';
import type { FeatureFlags } from '@repo/core/store/types/featureFlags';
import type { Action, Subject } from '@repo/core/types/authorization';
import type { CitizenshipTier } from '@repo/core/types/Identity';
import type { Bond } from '@repo/core/logic/schemas/identity.schema';
import { useMemo } from 'react';

export type UseSanctuaryFeatureReturn = SanctuaryFeatureResult & {
  context: UserContext;
  activeBond: Bond | null;
  citizenship: CitizenshipTier;
  primaryCapacity: Capacity | null;
  effectiveCapacity: Capacity | null;
  flags: FeatureFlags;
  can: (action: Action, subject: Subject) => boolean;
  cannot: (action: Action, subject: Subject) => boolean;
};

const DEFAULT_FEATURE_RESULT: SanctuaryFeatureResult = {
  permitted: true,
};

/**
 * useSanctuaryFeature
 *
 * The single canonical hook for Sanctuary civic identity, Cedar authorization,
 * and 4-pillar UI presentation gating (Identity, Citizenship, Entitlement, Cedar).
 *
 * Can be called with no arguments to get user context & Cedar `can`/`cannot`,
 * or with (action, subject, requirement) to gate a specific UI feature.
 */
export function useSanctuaryFeature(
  action?: string,
  subject?: string,
  requirement?: FeatureRequirement,
  resourceId?: string,
): UseSanctuaryFeatureReturn {
  const { context, can, cannot, getDecision, cedarSnapshotLoaded, entitlement, flags } =
    useAuthority();
  const { activeEntitlements, grants, pricingTier, manifestLoaded, readiness } = entitlement;

  // Evaluate feature gate if action & subject are provided
  const featureResult = useMemo<SanctuaryFeatureResult>(() => {
    if (!action || !subject) {
      return DEFAULT_FEATURE_RESULT;
    }

    const numericCitizenship =
      context.citizenship === 'FIRST_CLASS'
        ? CITIZENSHIP.FIRST_CLASS
        : context.citizenship === 'SECOND_CLASS'
          ? CITIZENSHIP.SECOND_CLASS
          : CITIZENSHIP.THIRD_CLASS;

    const cedarDecision: 'allow' | 'deny' | 'no_decision' = context.userId
      ? getDecision(subject, action)
      : 'no_decision';

    const req: FeatureRequirement = requirement ?? {
      citizenshipRequired: CITIZENSHIP.THIRD_CLASS,
    };
    const flagKey = req.flagKey ?? `${subject}.${action}`;
    const flagActive = resolveFeatureFlagValue(flags, flagKey);
    const flagType = resolveFeatureFlagClass(flagKey);

    return sanctuaryFeature(
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
        citizenship: numericCitizenship,
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
      req,
    );
  }, [
    action,
    subject,
    requirement,
    context,
    cedarSnapshotLoaded,
    getDecision,
    flags,
    activeEntitlements,
    grants,
    pricingTier,
    manifestLoaded,
    readiness,
  ]);

  return {
    ...featureResult,
    context,
    activeBond: (context.activeBond as Bond) ?? null,
    citizenship: (context.citizenship as CitizenshipTier) ?? 'THIRD_CLASS',
    primaryCapacity: (context.primaryCapacity as Capacity) ?? null,
    effectiveCapacity: (context.capacity as Capacity) ?? null,
    flags,
    can,
    cannot,
  };
}

export const usePermissions = useSanctuaryFeature;
