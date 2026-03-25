import { APIError } from '../api/types';
import { Role } from '../permissions/schemas/role.schema';
import type { CapabilityKey, CapabilityResource, PolicyDecision } from '../types/Policy';
import type { PlatformAccessContext, TenantKind } from '../types/Tenancy';
import type { User } from '../types/User';
import { protocolRegistry } from './ProtocolRegistry';

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

export function getTenantKind(input?: {
  schoolId?: string | null;
  tenantKind?: TenantKind | null;
}): TenantKind {
  if (input?.tenantKind) return input.tenantKind;
  if (input?.schoolId === 'mock-school') return 'demo';
  return 'customer';
}

export function getUserRoles(user?: Partial<User> | null): Role[] {
  const platform = Array.isArray(user?.platform_authorities) ? user?.platform_authorities ?? [] : [];
  const school = user?.school_authority ? [user.school_authority as Role] : [];
  const work = Array.isArray(user?.work_capacities) ? user?.work_capacities ?? [] : [];
  
  return unique([...platform, ...school, ...work] as Role[]);
}

/**
 * BOOT: Register Baseline Capabilities
 */
export function bootCoreCapabilities() {
  protocolRegistry.registerCapability('classroom.personal.use', (context) => {
    const isTeacherLike = context.roles.some(r => ['teacher', 'gradeHead', 'sectionHead'].includes(r));
    return {
      capability: 'classroom.personal.use',
      allowed: isTeacherLike && context.isPersonal
    };
  });

  protocolRegistry.registerCapability('classroom.school.manage', (context) => {
    const isPrincipalLike = context.roles.some(r => ['principal', 'founder', 'admin', 'developer'].includes(r));
    const hasSchoolId = !!context.schoolId;
    return {
      capability: 'classroom.school.manage',
      allowed: isPrincipalLike && hasSchoolId && !context.isPersonal
    };
  });

  // Default Community & Library Rules
  const POST_ONBOARDING_ONLY: CapabilityKey[] = [
    'community.groups.discover', 
    'community.groups.join', 
    'community.groups.create',
    'community.feed.view',
    'community.dm.create',
    'library.browse',
    'library.verified.view',
    'library.upload',
    'app.local.use',
    'app.cloud.sync'
  ];

  POST_ONBOARDING_ONLY.forEach(key => {
    protocolRegistry.registerCapability(key, (context) => ({
      capability: key,
      allowed: !!context.userId
    }));
  });
}

/**
 * Helper to register multiple capabilities for specific roles.
 */
export function registerRoleCapabilities(config: Partial<Record<Role, CapabilityKey[]>>) {
  Object.entries(config).forEach(([role, keys]) => {
    (keys as CapabilityKey[]).forEach(key => {
      protocolRegistry.registerCapability(key, (context, resource) => {
        const hasRole = context.roles.includes(role as Role);
        const inCorrectSchool = !resource?.schoolId || resource.schoolId === context.schoolId;
        const allowed = hasRole && inCorrectSchool;
        
        return {
          capability: key,
          allowed,
          reason: allowed ? `Role '${role}' grants this capability.` : undefined
        };
      });
    });
  });
}

export function getPlatformAccessContext(
  user?: Partial<User> | null,
  overrides?: {
    tenantKind?: TenantKind | null;
    roles?: Role[];
  },
): PlatformAccessContext {
  const roles = overrides?.roles ?? getUserRoles(user);
  const tenantKind = getTenantKind({
    schoolId: user?.school_id ?? null,
    tenantKind: overrides?.tenantKind ?? user?.tenant_kind ?? null,
  });
  
  const hasGlobalAccess = roles.some((role) =>
    role === 'founder' || role === 'admin' || role === 'developer',
  );

  return {
    userId: user?.id ?? null,
    schoolId: user?.school_id ?? null,
    sectionId: (user as any)?.section_id ?? null,
    gradeId: (user as any)?.grade_id ?? null,
    tenantKind,
    roles,
    hasGlobalAccess,
    isPersonal: overrides?.tenantKind === 'sandbox' || user?.tenant_kind === 'sandbox',
  };
}

export function getResolvedCapabilities(context: PlatformAccessContext): CapabilityKey[] {
  if (context.hasGlobalAccess) {
    return protocolRegistry.getCapabilityKeys();
  }

  return protocolRegistry.getCapabilityKeys().filter(key => {
    return protocolRegistry.resolveCapability(key, context)?.allowed ?? false;
  });
}

export function can(
  capability: CapabilityKey,
  context: PlatformAccessContext,
  resource?: CapabilityResource,
): PolicyDecision {
  if (context.hasGlobalAccess) {
    return {
      capability,
      allowed: true,
      reason: 'Global platform role grants cross-tenant visibility.',
      scope: resource?.scope ?? undefined,
    };
  }

  const decision = protocolRegistry.resolveCapability(capability, context, resource);
  if (decision) return decision;

  return {
    capability,
    allowed: false,
    reason: 'Capability not registered or not granted to current roles.',
    scope: resource?.scope ?? undefined,
  };
}

export function requireCapability(
  capability: CapabilityKey,
  context: PlatformAccessContext,
  resource?: CapabilityResource,
): PolicyDecision {
  const decision = can(capability, context, resource);
  if (!decision.allowed) {
    throw new APIError(decision.reason || 'Authority denied', 'FORBIDDEN', decision);
  }
  return decision;
}
