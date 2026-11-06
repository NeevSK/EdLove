import { resolveBondScope } from '@repo/core/logic/permissions/bondScope';
import {
  CITIZENSHIP,
  type FeatureRequirement,
  type SanctuaryFeatureResult,
  sanctuaryFeature,
} from '@repo/core/logic/permissions/sanctuaryFeature';
import { resolveScopedEntitlement } from '@repo/core/logic/ports/entitlement.port';
import {
  resolveFeatureFlagClass,
  resolveFeatureFlagValue,
} from '@repo/core/logic/registry/featureLifecycleManifest';
import { type Capacity, CapacitySchema } from '@repo/core/logic/schemas/capacity.schema';
import {
  type TenantKind,
  type UserContext,
  UserContextSchema,
} from '@repo/core/logic/schemas/user.schema';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import { useEntitlementStore } from '@repo/core/store/useEntitlementStore';
import { useFeatureStore } from '@repo/core/store/useFeatureStore';
import type { FeatureFlags } from '@repo/core/store/types/featureFlags';
import { usePerspectiveStore } from '@repo/core/store/usePerspectiveStore';
import { useScopeSessionStore } from '@repo/core/store/scopeSession';
import { type Bond, type CitizenshipTier, resolveBondCitizenship } from '@repo/core/types/Identity';
import type { Action, Subject } from '@repo/core/types/authorization';
import { useCallback, useMemo } from 'react';

/** Baseline sanctuary read subjects that are open to any user/guest in personal perspective. */
const PERSONAL_SANCTUARY_READ_SUBJECTS = new Set<string>([
  'SelfJourney',
  'InnerPulse',
  'SelfCare',
  'SelfReflection',
  'LibraryResource',
  'CommunityPost',
]);

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
  const user = useAuthStore((state) => state.user);
  const activePerspective = usePerspectiveStore((state) => state.activePerspective);
  const schoolType =
    activePerspective.kind === 'institutional'
      ? (activePerspective.schoolType ?? null)
      : null;

  const flags = useFeatureStore((state) => state.flags);
  const cedarSnapshotLoaded = useCedarDecisionStore((state) => state.snapshotLoaded);
  const getDecision = useCedarDecisionStore((state) => state.getDecision);

  const activeEntitlements = useEntitlementStore((state) => state.activeEntitlements);
  const grants = useEntitlementStore((state) => state.grants);
  const pricingTier = useEntitlementStore((state) => state.pricingTier);
  const manifestLoaded = useEntitlementStore((state) => state.manifestLoaded);
  const readiness = useEntitlementStore((state) => state.readiness);

  const context: UserContext = useMemo(() => {
    const scopeSnapshot = useScopeSessionStore.getState().snapshot;
    const availableBonds: readonly Bond[] = scopeSnapshot?.availableBonds || [];
    let activeBond: Bond | null = (scopeSnapshot?.activeBond as Bond) ?? null;

    // Resolve active bond matching current perspective
    if (activePerspective.kind === 'institutional') {
      const matchingBond = availableBonds.find(
        (b: Bond) => b.entity_id === activePerspective.schoolId && b.entity_type === 'SCHOOL',
      );
      if (matchingBond) {
        activeBond = matchingBond;
      }
    } else if (activePerspective.kind === 'personal') {
      const personalBond = availableBonds.find((b: Bond) => b.entity_type === 'PERSONAL');
      if (personalBond) {
        activeBond = personalBond;
      }
    }

    const personalCapacity: Capacity = CapacitySchema.safeParse(user?.capacity).data ?? 'student';
    const bondScope = resolveBondScope(activeBond);
    const isPersonal =
      bondScope.isPersonal ||
      schoolType === 'personal_workspace' ||
      activePerspective.kind === 'personal';
    const entitlementScope = isPersonal || activeBond === null ? 'individual' : 'active_bond';
    const effectiveEntitlement = resolveScopedEntitlement(
      {
        pricingTier,
        activeEntitlements,
        grants,
        expirationDate: null,
      },
      entitlementScope,
    );

    const effectiveCapacity = activeBond?.capacity ?? personalCapacity;

    const rawContext: UserContext = {
      userId: user?.id || null,
      email:
        user?.email && !user.email.startsWith('anonymous@') && user.email.includes('.')
          ? user.email
          : null,
      bonds: availableBonds as UserContext['bonds'],
      primaryCapacity: personalCapacity,
      activeBond: activeBond as UserContext['activeBond'],
      capacity: effectiveCapacity as UserContext['capacity'],
      traits: effectiveCapacity ? [`capacity:${effectiveCapacity}`] : ['capacity:student'],
      tier: user?.tier || 'free',
      citizenship: resolveBondCitizenship(activeBond),
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
      isAnonymous: !user?.id || Boolean(user?.is_anonymous),
      isLocalOnly: !user?.id || Boolean(user?.is_anonymous) || resolveBondCitizenship(activeBond) === 'THIRD_CLASS',
      hasGlobalAccess:
        activeBond?.capacity === 'founder' ||
        activeBond?.capacity === 'admin' ||
        activeBond?.capacity === 'developer',
      isPersonal,
      sectionId: null,
      gradeId: null,
      classroomId: activeBond?.entity_type === 'CLASSROOM' ? activeBond.entity_id : null,
    };

    const parsed = UserContextSchema.safeParse(rawContext);
    if (!parsed.success) {
      console.warn('[useSanctuaryFeature] Schema parse warning:', parsed.error.issues);
      return rawContext;
    }
    return parsed.data;
  }, [
    user,
    activePerspective,
    schoolType,
    pricingTier,
    activeEntitlements,
    grants,
  ]);

  /** Direct Cedar policy check. */
  const can = useCallback(
    (a: Action, s: Subject): boolean => {
      if (!context.userId) {
        return a === 'read' && PERSONAL_SANCTUARY_READ_SUBJECTS.has(s as string);
      }

      const decision = getDecision(s as string, a as string);
      if (decision === 'allow') return true;
      if (decision === 'deny') return false;

      if (a === 'read' && PERSONAL_SANCTUARY_READ_SUBJECTS.has(s as string)) {
        return true;
      }

      return false;
    },
    [context.userId, getDecision],
  );

  const cannot = useCallback(
    (a: Action, s: Subject): boolean => {
      return !can(a, s);
    },
    [can],
  );

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
