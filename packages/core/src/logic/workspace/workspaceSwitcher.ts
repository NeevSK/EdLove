import type { WorkspaceSwitcherTarget, WorkspaceSwitcherTargetId } from '@/types/Workspace';

export function resolveWorkspaceSwitcherTargets({
  currentWorkspace = 'founder',
  canManageFounderDashboard,
  canManageAdminDashboard,
  canManagePrincipalDashboard,
  canManageTeacherDashboard,
  canManageStudentDashboard,
  canManageGuardianDashboard = false,
  hasPrimaryInstitution = false,
  hasMountedGuardianWorkspace = false,
}: {
  currentWorkspace?: WorkspaceSwitcherTargetId;
  canManageFounderDashboard: boolean;
  canManageAdminDashboard: boolean;
  canManagePrincipalDashboard: boolean;
  canManageTeacherDashboard: boolean;
  canManageStudentDashboard: boolean;
  canManageGuardianDashboard?: boolean;
  hasPrimaryInstitution?: boolean;
  hasMountedGuardianWorkspace?: boolean;
}): WorkspaceSwitcherTarget[] {
  const founderEnabled = canManageFounderDashboard;
  const adminEnabled = canManageAdminDashboard;
  const principalEnabled = canManagePrincipalDashboard && hasPrimaryInstitution;
  const teacherEnabled = canManageTeacherDashboard;
  const studentEnabled = canManageStudentDashboard;
  const guardianEnabled = canManageGuardianDashboard && hasMountedGuardianWorkspace;

  return [
    {
      id: 'founder',
      title: 'Founder workspace',
      description:
        'Platform-scale stewardship, cross-tenant signal, and founder-owned launch surfaces.',
      destination: {
        kind: 'route',
        name: 'FounderDashboard',
      },
      enabled: founderEnabled,
      status: currentWorkspace === 'founder' ? 'current' : 'available',
      reason: founderEnabled ? undefined : 'Founder capacity is not active for this actor.',
    },
    {
      id: 'admin',
      title: 'Admin workspace',
      description:
        'Platform-system operations, tenant health, policy repair, and audit-driven interventions.',
      destination: {
        kind: 'route',
        name: 'AdminDashboard',
      },
      enabled: adminEnabled,
      status: currentWorkspace === 'admin' ? 'current' : 'available',
      reason: adminEnabled ? undefined : 'Admin capacity is not active for this actor.',
    },
    {
      id: 'principal',
      title: 'Principal operations',
      description: 'Institution-specific governance and operational drill-in for a chosen school.',
      destination: hasPrimaryInstitution
        ? {
            kind: 'route',
            name: 'PrincipalDashboard',
          }
        : null,
      enabled: principalEnabled,
      status:
        currentWorkspace === 'principal'
          ? 'current'
          : hasPrimaryInstitution
            ? 'bridge'
            : 'coming_soon',
      reason: principalEnabled
        ? undefined
        : hasPrimaryInstitution
          ? undefined
          : 'Needs at least one institution context before the operational workspace can open.',
    },
    {
      id: 'teacher',
      title: 'Teacher workspace',
      description: 'Academic daily-work surfaces currently composed through the classroom shell.',
      destination: {
        kind: 'tab',
        name: 'Classroom',
      },
      enabled: teacherEnabled,
      status: currentWorkspace === 'teacher' ? 'current' : 'available',
      reason: teacherEnabled ? undefined : 'Teacher capability is not active for this actor.',
    },
    {
      id: 'student',
      title: 'Student workspace',
      description:
        'Learning-flow and progress surfaces currently composed through the classroom shell.',
      destination: {
        kind: 'tab',
        name: 'Classroom',
      },
      enabled: studentEnabled,
      status: currentWorkspace === 'student' ? 'current' : 'available',
      reason: studentEnabled ? undefined : 'Student capability is not active for this actor.',
    },
    {
      id: 'guardian',
      title: 'Guardian workspace',
      description:
        'Family-facing oversight with child visibility, announcements, events, and school communication.',
      destination: hasMountedGuardianWorkspace
        ? {
            kind: 'route',
            name: 'GuardianDashboard',
          }
        : null,
      enabled: guardianEnabled,
      status:
        currentWorkspace === 'guardian'
          ? 'current'
          : hasMountedGuardianWorkspace
            ? 'available'
            : 'coming_soon',
      reason: guardianEnabled
        ? undefined
        : canManageGuardianDashboard && !hasMountedGuardianWorkspace
          ? 'Guardian capacity exists, but the workspace route is not mounted yet.'
          : 'Guardian capacity is not active for this actor.',
    },
  ];
}
