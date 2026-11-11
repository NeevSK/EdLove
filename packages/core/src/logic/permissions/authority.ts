import { resolveBondScope } from '@repo/core/logic/permissions/bondScope';
import {
  type EntitlementSnapshot,
  resolveScopedEntitlement,
} from '@repo/core/logic/ports/entitlement.port';
import { type Capacity, CapacitySchema } from '@repo/core/logic/schemas/capacity.schema';
import {
  type TenantKind,
  type UserContext,
  UserContextSchema,
} from '@repo/core/logic/schemas/user.schema';
import { useScopeSessionStore } from '@repo/core/store/scopeSession';
import type { FeatureFlags } from '@repo/core/store/types/featureFlags';
import { useAuthStore } from '@repo/core/store/useAuthStore';
import { type CedarDecision, useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import { useEntitlementStore } from '@repo/core/store/useEntitlementStore';
import { useFeatureStore } from '@repo/core/store/useFeatureStore';
import { usePerspectiveStore } from '@repo/core/store/usePerspectiveStore';
import type { Action, Subject } from '@repo/core/types/authorization';
import { type Bond, resolveBondCitizenship } from '@repo/core/types/Identity';
import type { SanctuaryPerspective } from '@repo/core/types/Perspective';
import { useCallback, useMemo } from 'react';

/**
 * The one authority read on the client.
 *
 * What a person may do comes from the signed permission snapshot (verified in
 * useCedarDecisionStore against signature, expiry, policy version, person and bond), the bond
 * the scope session made active, the perspective, and the entitlement manifest. This module is
 * the only reader of those stores outside `store/`; screens and hooks ask it, through
 * `useAuthority` or `useSanctuaryFeature`. The client only hides what isn't allowed; the server
 * decides. The ratchet's `authorityStoreReads` counts reads anywhere else and only goes down.
 * See docs/architecture/2026-11-11-product-shape-and-tool-ownership.md, section 3.
 */

/** Read subjects open to anyone, guests included, in the personal perspective. */
export const PERSONAL_SANCTUARY_READ_SUBJECTS: ReadonlySet<string> = new Set([
  'SelfJourney',
  'InnerPulse',
  'SelfCare',
  'SelfReflection',
  'LibraryResource',
  'CommunityPost',
]);

type AuthUser = ReturnType<typeof useAuthStore.getState>['user'];

export interface EntitlementInputs {
  readonly pricingTier: EntitlementSnapshot['pricingTier'];
  readonly activeEntitlements: EntitlementSnapshot['activeEntitlements'];
  readonly grants: EntitlementSnapshot['grants'];
}

export interface AuthorityInputs {
  readonly user: AuthUser;
  readonly activePerspective: SanctuaryPerspective;
  readonly availableBonds: readonly Bond[];
  readonly sessionActiveBond: Bond | null;
  readonly entitlement: EntitlementInputs;
}

/** The bond the active perspective points at, or the scope session's choice. */
export function resolveActiveBond(
  perspective: SanctuaryPerspective,
  availableBonds: readonly Bond[],
  sessionActiveBond: Bond | null,
): Bond | null {
  if (perspective.kind === 'institutional') {
    return (
      availableBonds.find(
        (b) => b.entity_id === perspective.schoolId && b.entity_type === 'SCHOOL',
      ) ?? sessionActiveBond
    );
  }
  if (perspective.kind === 'personal') {
    return availableBonds.find((b) => b.entity_type === 'PERSONAL') ?? sessionActiveBond;
  }
  return sessionActiveBond;
}

/** Pure: the person's context for authority decisions. */
export function resolveAuthorityContext(inputs: AuthorityInputs): UserContext {
  const { user, activePerspective, availableBonds, sessionActiveBond, entitlement } = inputs;
  const schoolType =
    activePerspective.kind === 'institutional' ? (activePerspective.schoolType ?? null) : null;
  const activeBond = resolveActiveBond(activePerspective, availableBonds, sessionActiveBond);

  const personalCapacity: Capacity = CapacitySchema.safeParse(user?.capacity).data ?? 'student';
  const bondScope = resolveBondScope(activeBond);
  const isPersonal =
    bondScope.isPersonal ||
    schoolType === 'personal_workspace' ||
    activePerspective.kind === 'personal';
  const entitlementScope = isPersonal || activeBond === null ? 'individual' : 'active_bond';
  const effectiveEntitlement = resolveScopedEntitlement(
    { ...entitlement, expirationDate: null },
    entitlementScope,
  );
  const effectiveCapacity = activeBond?.capacity ?? personalCapacity;
  const citizenship = resolveBondCitizenship(activeBond);

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
    citizenship,
    pricing_tier:
      entitlement.pricingTier === 'PRO' || entitlement.pricingTier === 'INSTITUTIONAL'
        ? entitlement.pricingTier
        : 'FREE',
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
    isLocalOnly: !user?.id || Boolean(user?.is_anonymous) || citizenship === 'THIRD_CLASS',
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
    console.warn('[authority] Schema parse warning:', parsed.error.issues);
    return rawContext;
  }
  return parsed.data;
}

/** Pure: may this context do `action` on `subject`, given a snapshot decision. */
export function decide(
  userId: string | null,
  decision: CedarDecision,
  action: string,
  subject: string,
): boolean {
  const openRead = action === 'read' && PERSONAL_SANCTUARY_READ_SUBJECTS.has(subject);
  if (!userId) return openRead;
  if (decision === 'allow') return true;
  if (decision === 'deny') return false;
  return openRead;
}

export interface Authority {
  readonly context: UserContext;
  readonly can: (action: Action, subject: Subject) => boolean;
  readonly cannot: (action: Action, subject: Subject) => boolean;
  readonly getDecision: (subject: string, action: string) => CedarDecision;
  readonly cedarSnapshotLoaded: boolean;
  readonly entitlement: EntitlementInputs & {
    readonly manifestLoaded: boolean;
    readonly readiness: ReturnType<typeof useEntitlementStore.getState>['readiness'];
  };
  readonly flags: FeatureFlags;
}

/** The person's authority, subscribed to every input it depends on. */
export function useAuthority(): Authority {
  const user = useAuthStore((s) => s.user);
  const activePerspective = usePerspectiveStore((s) => s.activePerspective);
  // Subscribed, so switching bonds recomputes the context.
  const scopeSnapshot = useScopeSessionStore((s) => s.snapshot);
  const pricingTier = useEntitlementStore((s) => s.pricingTier);
  const activeEntitlements = useEntitlementStore((s) => s.activeEntitlements);
  const grants = useEntitlementStore((s) => s.grants);
  const manifestLoaded = useEntitlementStore((s) => s.manifestLoaded);
  const readiness = useEntitlementStore((s) => s.readiness);
  const cedarSnapshotLoaded = useCedarDecisionStore((s) => s.snapshotLoaded);
  const getDecision = useCedarDecisionStore((s) => s.getDecision);
  const flags = useFeatureStore((s) => s.flags);

  const context = useMemo(
    () =>
      resolveAuthorityContext({
        user,
        activePerspective,
        availableBonds: (scopeSnapshot?.availableBonds as readonly Bond[] | undefined) ?? [],
        sessionActiveBond: (scopeSnapshot?.activeBond as Bond | null | undefined) ?? null,
        entitlement: { pricingTier, activeEntitlements, grants },
      }),
    [user, activePerspective, scopeSnapshot, pricingTier, activeEntitlements, grants],
  );

  const can = useCallback(
    (action: Action, subject: Subject): boolean =>
      decide(
        context.userId,
        context.userId ? getDecision(subject as string, action as string) : 'no_decision',
        action as string,
        subject as string,
      ),
    [context.userId, getDecision],
  );
  const cannot = useCallback((action: Action, subject: Subject) => !can(action, subject), [can]);

  return {
    context,
    can,
    cannot,
    getDecision,
    cedarSnapshotLoaded,
    entitlement: { pricingTier, activeEntitlements, grants, manifestLoaded, readiness },
    flags,
  };
}

/** Whether the permission snapshot is ready, for screens that wait on it. */
export function useAuthorityStatus() {
  const isLoading = useCedarDecisionStore((s) => s.isLoading);
  const error = useCedarDecisionStore((s) => s.error);
  const snapshotLoaded = useCedarDecisionStore((s) => s.snapshotLoaded);
  const loadDecisions = useCedarDecisionStore((s) => s.loadDecisions);
  return { isLoading, error, snapshotLoaded, loadDecisions };
}
