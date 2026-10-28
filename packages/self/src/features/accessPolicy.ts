import type { PermissionSnapshot } from '@repo/policies/snapshot/types';
import { FEATURE_CATALOG, type SelfFeatureDefinition } from '@repo/self/features/featureCatalog';
import type { SelfViewRole } from '@repo/self/screens/self/roleResolution';

export interface UserAccessContext {
  userId?: string | null;
  /** Canonical Cedar permission snapshot */
  snapshot?: PermissionSnapshot;
  capacities: string[];
  citizenshipLevel: number;
  roles: SelfViewRole[];
  /** @deprecated Retained for backwards-compatibility during migration. */
  capabilities?: string[];
}

export interface AccessibleFeature extends SelfFeatureDefinition {
  roleAffinity: number;
  isGeneral: boolean;
}

export type FeatureAccessDenial = 'cedar-denied' | 'citizenship' | 'capability';

/**
 * Evaluates whether a feature is accessible according to Cedar permissions and citizenship gates.
 */
export function getFeatureAccessStatus(
  feature: SelfFeatureDefinition,
  context: UserAccessContext,
): { allowed: true } | { allowed: false; reason: FeatureAccessDenial } {
  // 1. Evaluate Cedar permissions if a snapshot is present
  if (context.snapshot?.permissions) {
    const res = feature.cedar?.resource;
    const act = feature.cedar?.action ?? 'read';
    if (res) {
      const isPermitted = context.snapshot.permissions[res]?.[act] === true;
      if (!isPermitted) {
        return { allowed: false, reason: 'cedar-denied' };
      }
    }
  } else if (feature.requiredCapabilities && context.capabilities) {
    // Fallback to legacy capability check only if snapshot is not provided
    const caps = new Set(context.capabilities);
    if (!feature.requiredCapabilities.every((c) => caps.has(c))) {
      return { allowed: false, reason: 'capability' };
    }
  }

  // 2. Evaluate citizenship tier
  if (feature.minCitizenship !== undefined && context.citizenshipLevel > feature.minCitizenship) {
    return { allowed: false, reason: 'citizenship' };
  }

  return { allowed: true };
}

interface Policy {
  isAllowed(feature: SelfFeatureDefinition, ctx: UserAccessContext): boolean;
}

class CedarPolicy implements Policy {
  isAllowed(feature: SelfFeatureDefinition, ctx: UserAccessContext): boolean {
    if (!ctx.snapshot?.permissions) return true;
    const res = feature.cedar?.resource;
    const act = feature.cedar?.action ?? 'read';
    if (!res) return true;
    return ctx.snapshot.permissions[res]?.[act] === true;
  }
}

class CitizenshipPolicy implements Policy {
  isAllowed(feature: SelfFeatureDefinition, ctx: UserAccessContext): boolean {
    return feature.minCitizenship === undefined || ctx.citizenshipLevel <= feature.minCitizenship;
  }
}

class AccessPolicyComposite implements Policy {
  constructor(private readonly policies: Policy[]) {}
  isAllowed(feature: SelfFeatureDefinition, ctx: UserAccessContext): boolean {
    return this.policies.every((p) => p.isAllowed(feature, ctx));
  }
}

const defaultComposite = new AccessPolicyComposite([
  new CedarPolicy(),
  new CitizenshipPolicy(),
]);

/**
 * Pure function — evaluates accessible practices via Cedar and citizenship policies.
 */
export function resolveAccessibleFeatures(
  context: UserAccessContext,
  composite: AccessPolicyComposite = defaultComposite,
): AccessibleFeature[] {
  const roles = context.roles;
  return (Object.values(FEATURE_CATALOG) as SelfFeatureDefinition[])
    .filter((f) => composite.isAllowed(f, context))
    .map((feature) => {
      const weights = feature.roleWeights ?? {};
      const isGeneral = Object.keys(weights).length === 0;
      const roleAffinity = isGeneral ? 50 : Math.max(0, ...roles.map((r) => weights[r] ?? 0));
      return { ...feature, roleAffinity, isGeneral } as AccessibleFeature;
    });
}

export { AccessPolicyComposite, CedarPolicy, CitizenshipPolicy };

/** Legacy alias pointing to CedarPolicy for backwards compatibility */
export const CapabilityPolicy = CedarPolicy;

/**
 * Pure derivation of view roles from sovereign domain capacities.
 */
export function deriveRolesFromCapacities(capacities: readonly string[] = []): SelfViewRole[] {
  const roles: SelfViewRole[] = [];
  const capacityRoleMap: Record<string, SelfViewRole> = {
    admin: 'admin',
    developer: 'admin',
    founder: 'founder',
    principal: 'principal',
    assistantPrincipal: 'principal',
    gradeHead: 'principal',
    sectionHead: 'principal',
    teacher: 'teacher',
    librarian: 'teacher',
    guardian: 'guardian',
    parent: 'guardian',
    student: 'student',
    member: 'student',
  };

  for (const capacity of capacities) {
    const role = capacityRoleMap[capacity.toLowerCase()];
    if (role && !roles.includes(role)) roles.push(role);
  }

  return roles.length > 0 ? roles : ['student'];
}

/**
 * @deprecated Legacy adapter that extracts roles. Prefer deriveRolesFromCapacities.
 */
export function deriveRolesFromCapabilities(
  _capabilities: string[],
  capacities: string[] = [],
): SelfViewRole[] {
  return deriveRolesFromCapacities(capacities);
}

/**
 * Creates an authoritative in-memory Cedar snapshot for explore and dev runs.
 * Zero database writes, zero remote API calls — all personal practices are fully unlocked for local practice.
 */
export function createExploreCedarSnapshot(): PermissionSnapshot {
  return {
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400_000).toISOString(),
    userId: 'explore-guest',
    activeBondId: 'explore-bond',
    activeEntityId: 'explore-entity',
    activeEntityType: 'PERSONAL',
    schoolId: null,
    policyVersion: '1.0.0',
    permissions: {
      FireJournal: { read: true, create: true },
      MoodLog: { read: true, create: true },
      JoyMoments: { read: true, create: true },
      GratitudeEntries: { read: true, create: true },
      EnergyForecasts: { read: true, create: true },
      Wellbeing: { read: true, create: true },
      LearningReflection: { read: true, create: true },
      DecisionJournal: { read: true, create: true },
      DailyAttendance: { read: true, create: true },
      DailyContent: { read: true, create: true },
      Student: { read: true, create: true },
      Notification: { read: true, create: true },
      User: { read: true, update: true },
      Classroom: { read: true, create: false },
      School: { read: true, create: false },
      Grade: { read: true, create: false },
    },
    temporalHints: {},
    signature: 'explore-dev-local-snapshot',
  };
}

/**
 * Creates a default Cedar snapshot based on domain capacities for initial render before remote sync.
 */
export function createDefaultCedarSnapshot(capacities: readonly string[] = []): PermissionSnapshot {
  const norm = capacities.map((c) => c.toLowerCase());
  const isTeacher = norm.includes('teacher');
  const isPrincipal = norm.includes('principal') || norm.includes('admin') || norm.includes('founder');

  return {
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400_000).toISOString(),
    userId: 'authenticated-user',
    activeBondId: 'session-bond',
    activeEntityId: 'session-entity',
    activeEntityType: 'PERSONAL',
    schoolId: null,
    policyVersion: '1.0.0',
    permissions: {
      // Universal practices: open to all authentic users
      FireJournal: { read: true, create: true },
      MoodLog: { read: true, create: true },
      JoyMoments: { read: true, create: true },
      GratitudeEntries: { read: true, create: true },
      EnergyForecasts: { read: true, create: true },
      Wellbeing: { read: true, create: true },
      LearningReflection: { read: true, create: true },
      DecisionJournal: { read: true, create: true },
      DailyAttendance: { read: true, create: isTeacher },
      DailyContent: { read: true, create: true },
      Student: { read: true, create: true },
      Notification: { read: true, create: true },
      User: { read: true, update: true },
      Classroom: { read: isTeacher || isPrincipal, create: isTeacher || isPrincipal },
      School: { read: isPrincipal, create: isPrincipal },
      Grade: { read: true, create: isTeacher },
    },
    temporalHints: {},
    signature: 'default-capacity-snapshot',
  };
}

export interface CreateSelfAccessContextOptions {
  userId?: string | null;
  capacity?: string | null;
  capacities?: readonly string[];
  role?: string | null;
  roles?: readonly string[];
  isExplore?: boolean;
  snapshot?: PermissionSnapshot;
  /** @deprecated Kept for backwards compatibility with tests. */
  capabilities?: string[];
}

/**
 * Creates an authoritative access context for the Self practice catalog.
 * Uses Amazon Cedar PermissionSnapshot for formal action/resource decisions.
 */
export function createSelfAccessContext(
  options: CreateSelfAccessContextOptions = {},
): UserAccessContext {
  const isGuestOrExplore =
    options.isExplore ||
    !options.userId ||
    options.userId === 'explore-guest' ||
    options.userId === 'explore' ||
    options.userId === 'anonymous';

  const rawCapacities =
    options.capacities && options.capacities.length > 0
      ? options.capacities
      : options.capacity
        ? [options.capacity]
        : options.roles && options.roles.length > 0
          ? options.roles
          : options.role
            ? [options.role]
            : ['teacher'];

  const resolvedRoles = deriveRolesFromCapacities(rawCapacities);

  // Authoritative Cedar snapshot: use provided snapshot, or explore sandbox, or capacity default
  const snapshot: PermissionSnapshot =
    options.snapshot ??
    (isGuestOrExplore
      ? createExploreCedarSnapshot()
      : createDefaultCedarSnapshot(rawCapacities));

  return {
    userId: options.userId ?? null,
    snapshot,
    capacities: [...rawCapacities],
    citizenshipLevel: 1,
    roles: resolvedRoles,
    capabilities: options.capabilities,
  };
}
