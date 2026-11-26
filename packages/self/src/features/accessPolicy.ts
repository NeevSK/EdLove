import { FEATURE_CATALOG, type SelfFeatureDefinition } from '@repo/self/features/featureCatalog';
import type { SelfViewRole } from '@repo/self/screens/self/roleResolution';

export interface UserAccessContext {
  userId?: string | null;
  capabilities: string[];
  capacities: string[];
  citizenshipLevel: number;
  roles: SelfViewRole[];
}

/** A feature this person is offered: related to one of their roles, and every capability granted. */
export type AccessibleFeature = SelfFeatureDefinition;

export type FeatureAccessDenial = 'capability' | 'citizenship';

export function getFeatureAccessStatus(
  feature: SelfFeatureDefinition,
  context: UserAccessContext,
  capabilities = new Set(context.capabilities),
): { allowed: true } | { allowed: false; reason: FeatureAccessDenial } {
  if (!feature.requiredCapabilities.every((capability) => capabilities.has(capability))) {
    return { allowed: false, reason: 'capability' };
  }
  if (feature.minCitizenship !== undefined && context.citizenshipLevel > feature.minCitizenship) {
    return { allowed: false, reason: 'citizenship' };
  }
  return { allowed: true };
}

interface Policy {
  isAllowed(feature: SelfFeatureDefinition, ctx: UserAccessContext, caps: Set<string>): boolean;
}
class CapabilityPolicy implements Policy {
  isAllowed(feature: SelfFeatureDefinition, _ctx: UserAccessContext, caps: Set<string>): boolean {
    return feature.requiredCapabilities.every((c) => caps.has(c));
  }
}
/** Product relevance: the feature is for one of the person's roles. */
class RolePolicy implements Policy {
  isAllowed(feature: SelfFeatureDefinition, ctx: UserAccessContext): boolean {
    return feature.roles.some((role) => ctx.roles.includes(role));
  }
}
class CitizenshipPolicy implements Policy {
  isAllowed(feature: SelfFeatureDefinition, ctx: UserAccessContext): boolean {
    return feature.minCitizenship === undefined || ctx.citizenshipLevel <= feature.minCitizenship;
  }
}
class AccessPolicyComposite implements Policy {
  constructor(private readonly policies: Policy[]) {}
  isAllowed(feature: SelfFeatureDefinition, ctx: UserAccessContext, caps: Set<string>): boolean {
    return this.policies.every((p) => p.isAllowed(feature, ctx, caps));
  }
}
const defaultComposite = new AccessPolicyComposite([
  new RolePolicy(),
  new CapabilityPolicy(),
  new CitizenshipPolicy(),
]);

/**
 * Pure function — no hooks, fully testable. Delegates to composite.
 */
export function resolveAccessibleFeatures(
  context: UserAccessContext,
  composite: AccessPolicyComposite = defaultComposite,
): AccessibleFeature[] {
  const caps = new Set(context.capabilities);
  return Object.values(FEATURE_CATALOG).filter((f) => composite.isAllowed(f, context, caps));
}

export { AccessPolicyComposite, CapabilityPolicy, CitizenshipPolicy, RolePolicy };

/**
 * Derive roles from capabilities using a pure fallback (mirrors roleResolution.ts but supports multi-role).
 */
export function deriveRolesFromCapabilities(
  capabilities: string[],
  capacities: string[] = [],
  roleCapabilityMap: Record<string, string> = {
    admin: 'manage:AdminDashboard',
    founder: 'manage:FounderDashboard',
    principal: 'manage:PrincipalDashboard',
    teacher: 'manage:TeacherDashboard',
    guardian: 'manage:GuardianDashboard',
    student: 'manage:StudentDashboard',
  },
): SelfViewRole[] {
  const caps = new Set(capabilities);
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
    const role = capacityRoleMap[capacity];
    if (role && !roles.includes(role)) roles.push(role);
  }

  for (const [role, cap] of Object.entries(roleCapabilityMap)) {
    if (caps.has(cap) && !roles.includes(role as SelfViewRole)) {
      roles.push(role as SelfViewRole);
    }
  }
  return roles.length > 0 ? roles : ['student'];
}

export interface CreateSelfAccessContextOptions {
  userId?: string | null;
  role?: string | null;
  roles?: readonly string[];
  capacities?: string[];
  capabilities?: string[];
  isExplore?: boolean;
}

/**
 * Creates an authoritative access context for the Self practice catalog.
 * In explore / guest mode, full trial capabilities are provided to test delivered browser practices safely.
 * When a user holds multiple capacities (e.g. Principal + Teacher), capabilities from all held roles are unified.
 */
export function createSelfAccessContext(
  options: CreateSelfAccessContextOptions = {},
): UserAccessContext {
  const rawRoles =
    options.roles && options.roles.length > 0
      ? options.roles
      : options.role
        ? [options.role]
        : ['teacher'];
  const resolvedRoles = rawRoles.map((r) => r.toLowerCase() as SelfViewRole);
  const normalizedRole = resolvedRoles[0] ?? 'teacher';
  const isGuestOrExplore =
    options.isExplore ||
    !options.userId ||
    options.userId === 'explore-guest' ||
    options.userId === 'explore' ||
    options.userId === 'anonymous';

  const baseCapabilities = [
    'read:SelfJourney',
    'read:InnerPulse',
    'read:SelfCare',
    'read:SelfReflection',
  ];

  const roleCapabilities: Record<SelfViewRole, string[]> = {
    student: ['read:StudentDashboard'],
    teacher: ['read:TeacherDashboard'],
    principal: ['read:PrincipalDashboard'],
    founder: ['read:TeacherDashboard', 'read:PrincipalDashboard'],
    admin: ['read:StudentDashboard', 'read:TeacherDashboard', 'read:PrincipalDashboard'],
    guardian: [],
  };

  const collectedRoleCapabilities = resolvedRoles.flatMap((r) => roleCapabilities[r] ?? []);

  const capabilities = isGuestOrExplore
    ? [
        ...baseCapabilities,
        'read:StudentDashboard',
        'read:TeacherDashboard',
        'read:PrincipalDashboard',
      ]
    : Array.from(
        new Set([
          ...baseCapabilities,
          ...(options.capabilities ?? []),
          ...collectedRoleCapabilities,
        ]),
      );

  return {
    userId: options.userId ?? null,
    capabilities,
    capacities: options.capacities ?? resolvedRoles,
    citizenshipLevel: 1,
    roles: resolvedRoles,
  };
}
