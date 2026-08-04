import { useCallback, useMemo } from 'react';
import { resolveBondScope } from '@repo/core/logic/permissions/bondScope';
import { CITIZENSHIP, sanctuaryFeature } from '@repo/core/logic/permissions/sanctuaryFeature';
import { resolveScopedEntitlement } from '@repo/core/logic/ports/entitlement.port';
import {
  resolveFeatureFlagClass,
  resolveFeatureFlagValue,
} from '@repo/core/logic/registry/featureLifecycleManifest';
import { type TenantKind, type UserContext, UserContextSchema } from '@repo/core/logic/schemas/user.schema';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import { useEntitlementStore } from '@repo/core/store/useEntitlementStore';
import { useFeatureStore } from '@repo/core/store/useFeatureStore';
import { useTenantStore } from '@repo/core/store/useTenantStore';
import type { Action, Subject } from '@repo/core/types/authorization';

/**
 * @deprecated Use useSanctuaryFeature() for permission checks and
 * useAuthStore / useFeatureStore / useCedarDecisionStore directly for reads.
 * This facade is kept for backward compatibility — it delegates to the
 * new store internally.
 */
export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);
  const activeBondState = useAuthStore((state) => state.activeBond);
  const schoolType = useTenantStore((state) => state.schoolType);
  const flags = useFeatureStore((state) => state.flags);
  const cedarSnapshotLoaded = useCedarDecisionStore((state) => state.snapshotLoaded);
  const getDecision = useCedarDecisionStore((state) => state.getDecision);
  const { activeEntitlements, grants, pricingTier, manifestLoaded, readiness } =
    useEntitlementStore();

  const context: UserContext = useMemo(() => {
    const activePerspective = useAuthStore.getState().activePerspective;
    const availableBonds = useAuthStore.getState().availableBonds || [];
    const activeBond = activePerspective?.activeBond ?? null;
    const bondScope = resolveBondScope(activeBond);
    const isPersonal = bondScope.isPersonal || schoolType === 'personal_workspace';
    const entitlementScope = isPersonal ? 'individual' : 'active_bond';
    const effectiveEntitlement = resolveScopedEntitlement(
      {
        pricingTier,
        activeEntitlements,
        grants,
        expirationDate: null,
      },
      entitlementScope,
    );

    const rawContext: UserContext = {
      userId: user?.id || null,
      email:
        user?.email && !user.email.startsWith('anonymous@') && user.email.includes('.')
          ? user.email
          : null,

      bonds: availableBonds as UserContext['bonds'],
      primaryCapacity: availableBonds[0]?.capacity || null,
      activeBond: activeBond as UserContext['activeBond'],
      capacity: activeBond?.capacity || null,
      traits: activeBond?.capacity ? [`capacity:${activeBond.capacity}`] : [],
      tier: user?.tier || 'free',
      citizenship:
        user?.citizenship === 'SECOND_CLASS' || user?.citizenship === 'FIRST_CLASS'
          ? user.citizenship
          : 'THIRD_CLASS',
      pricing_tier: pricingTier === 'PRO' || pricingTier === 'INSTITUTIONAL' ? pricingTier : 'FREE',
      features: user?.features || [],
      flags: user?.flags || {},

      schoolId: bondScope.schoolId,
      activeEntityId: bondScope.activeEntityId,
      activeEntityType: bondScope.activeEntityType,
      schoolType: schoolType ?? null,
      onboarding_completed: Boolean(user?.onboarding_completed),
      effective_entitlement_scope: entitlementScope,
      effective_entitlement_tier: effectiveEntitlement.pricingTier,
      tenancyName: null,
      tenancy: {
        kind: 'customer' as TenantKind,
        isPersonal,
      },
      tenantKind: 'customer' as TenantKind,
      isAnonymous: !user,
      hasGlobalAccess:
        activeBond?.capacity === 'founder' ||
        activeBond?.capacity === 'admin' ||
        activeBond?.capacity === 'developer',
      isPersonal,
      sectionId: null,
      gradeId: null,
      classroomId: activeBond?.entity_type === 'CLASSROOM' ? activeBond.entity_id : null,
    };

    return UserContextSchema.parse(rawContext);
  }, [user, schoolType, pricingTier]);

  const can = useCallback(
    (action: Action, subject: Subject) => {
      const citizenshipStr = user?.citizenship ?? 'THIRD_CLASS';
      const citizenship =
        citizenshipStr === 'WANDERER' || citizenshipStr === 'THIRD_CLASS'
          ? CITIZENSHIP.THIRD_CLASS
          : citizenshipStr === 'SECOND_CLASS'
            ? CITIZENSHIP.SECOND_CLASS
            : CITIZENSHIP.FIRST_CLASS;

      const cedarDecision = user?.id
        ? getDecision(subject as string, action as string)
        : 'no_decision';

      const flagKey = `${subject as string}.${action as string}`;
      const flagActive = resolveFeatureFlagValue(flags, flagKey);
      const flagType = resolveFeatureFlagClass(flagKey);

      return sanctuaryFeature(
        {
          userId: user?.id ?? null,
          activeBondId: activeBondState?.id ?? null,
          primaryCapacity: activeBondState?.capacity ?? null,
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
          citizenshipRequired: CITIZENSHIP.THIRD_CLASS,
        },
      ).permitted;
    },
    [
      user,
      flags,
      cedarSnapshotLoaded,
      getDecision,
      activeEntitlements,
      grants,
      pricingTier,
      manifestLoaded,
      readiness,
      activeBondState,
    ],
  );

  const cannot = useCallback(
    (action: Action, subject: Subject) => {
      return !can(action, subject);
    },
    [can],
  );

  return useMemo(
    () => ({
      context,
      flags,
      can,
      cannot,
    }),
    [context, flags, can, cannot],
  );
};
