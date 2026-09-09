import type { Subject } from '@repo/core/types/authorization';

export type SelfViewRole = 'admin' | 'founder' | 'principal' | 'teacher' | 'guardian' | 'student';

type SelfRoleCapability =
  | 'AdminDashboard'
  | 'FounderDashboard'
  | 'PrincipalDashboard'
  | 'TeacherDashboard'
  | 'GuardianDashboard'
  | 'StudentDashboard';

type SelfRoleGate = (action: 'manage', subject: SelfRoleCapability) => boolean;

const CAPACITY_ROLE_GATES: Partial<Record<string, SelfRoleCapability>> = {
  admin: 'AdminDashboard',
  founder: 'FounderDashboard',
  principal: 'PrincipalDashboard',
  assistantPrincipal: 'PrincipalDashboard',
  gradeHead: 'PrincipalDashboard',
  sectionHead: 'PrincipalDashboard',
  teacher: 'TeacherDashboard',
  guardian: 'GuardianDashboard',
  parent: 'GuardianDashboard',
  student: 'StudentDashboard',
};

const FALLBACK_ROLE_GATES: Array<[SelfViewRole, SelfRoleCapability]> = [
  ['admin', 'AdminDashboard'],
  ['founder', 'FounderDashboard'],
  ['principal', 'PrincipalDashboard'],
  ['teacher', 'TeacherDashboard'],
  ['guardian', 'GuardianDashboard'],
  ['student', 'StudentDashboard'],
];

/**
 * Resolves the rendered Self view from the active bond first, then capability.
 *
 * Capacity is used only to disambiguate a capability set. It never grants
 * access by itself. In particular, an admin bond cannot be relabeled as a
 * founder view merely because both capabilities are present.
 */
export function resolveSelfViewRole(
  capacity: string | null | undefined,
  can: SelfRoleGate,
): SelfViewRole | null {
  const capacityGate = capacity ? CAPACITY_ROLE_GATES[capacity] : undefined;

  if (capacityGate) {
    if (!can('manage', capacityGate)) return null;
    return roleForCapability(capacityGate);
  }

  for (const [role, capability] of FALLBACK_ROLE_GATES) {
    if (can('manage', capability)) return role;
  }

  return null;
}

function roleForCapability(capability: SelfRoleCapability): SelfViewRole {
  switch (capability) {
    case 'AdminDashboard':
      return 'admin';
    case 'FounderDashboard':
      return 'founder';
    case 'PrincipalDashboard':
      return 'principal';
    case 'TeacherDashboard':
      return 'teacher';
    case 'GuardianDashboard':
      return 'guardian';
    case 'StudentDashboard':
      return 'student';
  }
}

export function selfRoleHeader(role: SelfViewRole): { title: string; note: string } {
  switch (role) {
    case 'admin':
      return { title: 'Sadhana', note: 'Admin Sanctuary' };
    case 'founder':
      return { title: 'Sadhana', note: "Founder's Vision Lab" };
    case 'principal':
      return { title: 'Sadhana', note: "Principal's Inner Sanctuary" };
    case 'teacher':
      return { title: 'Sadhana', note: "Teacher's Working Rhythm" };
    case 'guardian':
      return { title: 'Sadhana', note: 'Guardian Sanctuary' };
    case 'student':
      return { title: 'Mastery Hub', note: 'Personal Growth Stream' };
  }
}

// Keep the import contract honest if Subject changes in core: this helper is
// intentionally capability-only and never bypasses usePermissions.
export type { Subject };
