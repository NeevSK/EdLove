import { FEATURE_CATALOG, type SelfFeatureDefinition } from '@repo/self/features/featureCatalog';
import type { SelfViewRole } from '@repo/self/screens/self/roleResolution';

export interface UserAccessContext {
  userId?: string | null;
  capabilities: string[];
  capacities: string[];
  citizenshipLevel: number;
  roles: SelfViewRole[];
}

export interface AccessibleFeature extends SelfFeatureDefinition {
  roleAffinity: number;
  isGeneral: boolean;
}

interface Policy {
  isAllowed(feature: SelfFeatureDefinition, ctx: UserAccessContext, caps: Set<string>): boolean;
}
class CapabilityPolicy implements Policy {
  isAllowed(feature: SelfFeatureDefinition, _ctx: UserAccessContext, caps: Set<string>): boolean {
    return feature.requiredCapabilities.every((c) => caps.has(c));
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
  const roles = context.roles;
  return (Object.values(FEATURE_CATALOG) as SelfFeatureDefinition[])
    .filter((f) => composite.isAllowed(f, context, caps))
    .map((feature) => {
      const weights = feature.roleWeights ?? {};
      const isGeneral = Object.keys(weights).length === 0;
      const roleAffinity = isGeneral ? 50 : Math.max(0, ...roles.map((r) => weights[r] ?? 0));
      return { ...feature, roleAffinity, isGeneral } as AccessibleFeature;
    });
}

export { AccessPolicyComposite, CapabilityPolicy, CitizenshipPolicy };

/**
 * Derive roles from capabilities using a pure fallback (mirrors roleResolution.ts but supports multi-role).
 */
export function deriveRolesFromCapabilities(
  capabilities: string[],
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
  for (const [role, cap] of Object.entries(roleCapabilityMap)) {
    if (caps.has(cap)) roles.push(role as SelfViewRole);
  }
  return roles.length > 0 ? roles : ['student'];
}
