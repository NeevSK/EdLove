import { isAnonymousIdentity, isLocalOnlyIdentity } from '@repo/core/logic/auth/identityState';
import {
  isBaselineReadCapability,
  isLocalOnlyMutation,
} from '@repo/core/logic/permissions/baselineCapabilities';
import { resolveBondScope } from '@repo/core/logic/permissions/bondScope';
import {
  CITIZENSHIP,
  meetsCitizenship,
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
import { useEntitlementQuery } from '@repo/core/hooks/useEntitlementQuery';
import { useFeatureStore } from '@repo/core/store/useFeatureStore';
import { PERSONAL_SCOPE_PERSPECTIVE, useScopeSessionStore } from '@repo/core/store/scopeSession';
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

/**
 * usePermissions - Sovereign hook for permission checks and user context.
 */
export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);
  const scopeSnapshot = useScopeSessionStore((state) => state.snapshot);
  const scopeTransitioning = useScopeSessionStore((state) => state.isTransitioning);
  const scopeMatchesIdentity =
    !scopeTransitioning &&
    scopeSnapshot !== null &&
    scopeSnapshot.principalId === (user?.id ?? null);
  const activePerspective = scopeMatchesIdentity && scopeSnapshot
    ? scopeSnapshot.activePerspective
    : PERSONAL_SCOPE_PERSPECTIVE;
  const schoolType =
    scopeMatchesIdentity && scopeSnapshot?.activePerspective.kind === 'institutional'
      ? (scopeSnapshot.activePerspective.schoolType ?? null)
      : null;
  const flags = useFeatureStore((state) => state.flags);
  const cedarSnapshotLoaded = useCedarDecisionStore((state) => state.snapshotLoaded);
  const getDecision = useCedarDecisionStore((state) => state.getDecision);
  const entitlement = useEntitlementQuery(
    user?.id ?? null,
    {
      activeBondId: scopeMatchesIdentity ? (scopeSnapshot?.activeBond?.id ?? null) : null,
      activeEntityId: scopeMatchesIdentity ? (scopeSnapshot?.activeBond?.entity_id ?? null) : null,
      activeEntityType: scopeMatchesIdentity ? (scopeSnapshot?.activeBond?.entity_type ?? null) : null,
    },
    Boolean(user?.id && scopeMatchesIdentity),
  );
  const { activeEntitlements, grants, pricingTier, manifestLoaded, readiness } = entitlement;

  const context: UserContext = useMemo(() => {
    const availableBonds = scopeMatchesIdentity && scopeSnapshot ? scopeSnapshot.availableBonds : [];
    const activeBond = scopeMatchesIdentity && scopeSnapshot ? scopeSnapshot.activeBond : null;
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
      primaryCapacity: activeBond?.capacity ?? effectiveCapacity,
      activeBond: activeBond as UserContext['activeBond'],
      capacity: effectiveCapacity as UserContext['capacity'],
      traits: effectiveCapacity ? [`capacity:${effectiveCapacity}`] : ['capacity:student'],
      tier: user?.tier || 'free',
      citizenship:
        user?.citizenship === 'SECOND_CLASS' || user?.citizenship === 'FIRST_CLASS'
          ? user.citizenship
          : user?.citizenship === 'WANDERER'
            ? 'THIRD_CLASS'
            : 'SECOND_CLASS',
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
      isAnonymous: isAnonymousIdentity(user),
      isLocalOnly: isLocalOnlyIdentity(user),
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
      console.warn('[usePermissions] Schema parse warning:', parsed.error.issues);
      return rawContext;
    }
    return parsed.data;
  }, [
    user,
    scopeSnapshot,
    scopeMatchesIdentity,
    activePerspective,
    schoolType,
    pricingTier,
    activeEntitlements,
    grants,
  ]);

  const can = useCallback(
    (action: Action, subject: Subject) => {
      const citizenshipStr = context.citizenship;
      const citizenship =
        citizenshipStr === 'THIRD_CLASS'
          ? CITIZENSHIP.THIRD_CLASS
          : citizenshipStr === 'SECOND_CLASS'
            ? CITIZENSHIP.SECOND_CLASS
            : CITIZENSHIP.FIRST_CLASS;

      let cedarDecision: 'allow' | 'deny' | 'no_decision' = 'no_decision';
      if (context.userId) {
        const rawDecision = getDecision(subject as string, action as string);
        if (rawDecision === 'allow' || rawDecision === 'deny') {
          cedarDecision = rawDecision;
        } else if (action === 'read' && PERSONAL_SANCTUARY_READ_SUBJECTS.has(subject as string)) {
          cedarDecision = 'allow';
        }
      } else {
        // Guest exploration permitted for baseline sanctuary reads
        if (action === 'read' && PERSONAL_SANCTUARY_READ_SUBJECTS.has(subject as string)) {
          cedarDecision = 'allow';
        }
      }

      const flagKey = `${subject as string}.${action as string}`;
      const flagActive = resolveFeatureFlagValue(flags, flagKey);
      const flagType = resolveFeatureFlagClass(flagKey);

      if (
        context.isLocalOnly &&
        Boolean(context.userId) &&
        isLocalOnlyMutation(action, subject) &&
        flagActive
      ) {
        return true;
      }

      // Keep the core shell usable while remote Cedar and entitlement state
      // hydrates. This is deliberately limited to read-only baseline surfaces;
      // mutations and paid capabilities still require the full evaluator.
      if (
        isBaselineReadCapability(action, subject) &&
        Boolean(context.userId) &&
        flagActive &&
        meetsCitizenship(citizenship, CITIZENSHIP.THIRD_CLASS)
      ) {
        return true;
      }

      return sanctuaryFeature(
        {
          userId: context.userId,
          isLocalOnly: context.isLocalOnly === true,
          activeBondId: context.activeBond?.id ?? null,
          primaryCapacity: context.activeBond?.capacity ?? context.capacity ?? null,
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
      context,
      flags,
      cedarSnapshotLoaded,
      getDecision,
      activeEntitlements,
      grants,
      pricingTier,
      manifestLoaded,
      readiness,
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
