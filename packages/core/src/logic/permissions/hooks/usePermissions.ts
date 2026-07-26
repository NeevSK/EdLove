import { useCallback, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCedarDecisionStore } from '@/store/useCedarDecisionStore';
import { useEntitlementStore } from '@/store/useEntitlementStore';
import { useFeatureStore } from '@/store/useFeatureStore';
import { useTenantStore } from '@/store/useTenantStore';
import { type TenantKind, type UserContext, UserContextSchema } from '@/logic/schemas/user.schema';
import type { Action, Subject } from '@/types/authorization';
import { sanctuaryFeature, CITIZENSHIP } from '@/logic/permissions/sanctuaryFeature';

/**
 * @deprecated Use useSanctuaryFeature() for permission checks and
 * useAuthStore / useFeatureStore / useCedarDecisionStore directly for reads.
 * This facade is kept for backward compatibility — it delegates to the
 * new store internally.
 */
export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);
  const schoolType = useTenantStore((state) => state.schoolType);
  const flags = useFeatureStore((state) => state.flags);
  const cedarSnapshotLoaded = useCedarDecisionStore((state) => state.snapshotLoaded);
  const getDecision = useCedarDecisionStore((state) => state.getDecision);
  const { activeEntitlements, pricingTier, manifestLoaded } = useEntitlementStore();

  const context: UserContext = useMemo(() => {
    const activePerspective = useAuthStore.getState().activePerspective;
    const availableBonds = useAuthStore.getState().availableBonds || [];
    const activeBond = activePerspective?.activeBond ?? null;
    const isPersonal = schoolType === 'personal_workspace';

    const rawContext: UserContext = {
      userId: user?.id || null,
      email: user?.email || null,

      bonds: availableBonds as UserContext['bonds'],
      primaryCapacity: availableBonds[0]?.capacity || null,
      activeBond: activeBond as UserContext['activeBond'],
      capacity: activeBond?.capacity || null,
      traits: activeBond?.capacity ? [`capacity:${activeBond.capacity}`] : [],
      tier: user?.tier || 'free',
      citizenship:
        user?.citizenship === 'SECOND_CLASS' || user?.citizenship === 'FIRST_CLASS'
          ? user.citizenship
          : 'WANDERER',
      pricing_tier:
        user?.pricing_tier === 'PRO' || user?.pricing_tier === 'INSTITUTIONAL'
          ? user.pricing_tier
          : 'FREE',
      features: user?.features || [],
      flags: user?.flags || {},

      schoolId: activeBond?.entity_type === 'SCHOOL' ? activeBond.entity_id : null,
      tenancyName: null,
      tenancy: {
        kind: 'customer' as TenantKind,
        isPersonal,
      },
      tenantKind: 'customer' as TenantKind,
      isAnonymous: !user,
      hasGlobalAccess: activeBond?.capacity === 'founder' || activeBond?.capacity === 'admin',
      isPersonal,
      sectionId: null,
      gradeId: null,
      classroomId: activeBond?.entity_type === 'CLASSROOM' ? activeBond.entity_id : null,
    };

    return UserContextSchema.parse(rawContext);
  }, [user, schoolType]);

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
      const flagEntry = (flags as any)?.[flagKey];
      const flagActive = flagEntry?.value ?? true;
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
        {
          citizenshipRequired: CITIZENSHIP.THIRD_CLASS,
        },
      ).permitted;
    },
    [user, flags, cedarSnapshotLoaded, getDecision, activeEntitlements, pricingTier, manifestLoaded],
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
