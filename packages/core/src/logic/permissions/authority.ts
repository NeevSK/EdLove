import { resolveBondScope } from '@repo/core/logic/permissions/bondScope';
import { resolveScopedEntitlement } from '@repo/core/logic/permissions/entitlement';
import type { EntitlementSnapshot } from '@repo/core/logic/ports/entitlement.port';
import { type Capacity, CapacitySchema } from '@repo/core/logic/schemas/capacity.schema';
import {
  type TenantKind,
  type UserContext,
  UserContextSchema,
} from '@repo/core/logic/schemas/user.schema';
import type { CedarDecision } from '@repo/core/types/authorization';
import { type Bond, resolveBondCitizenship } from '@repo/core/types/Identity';
import type { SanctuaryPerspective } from '@repo/core/types/Perspective';
import type { User } from '@repo/core/types/User';

/**
 * Authority decisions on the client (Tier 2, pure).
 *
 * Builds the person's context from the bond, perspective and entitlement inputs, and decides an
 * action from a permission snapshot decision. The hooks that read those inputs live in
 * ./hooks/useAuthority.ts (Tier 5), the only client reader of the decision, entitlement and
 * perspective stores. The client only hides what isn't allowed; the server decides.
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

type AuthUser = User | null;

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
