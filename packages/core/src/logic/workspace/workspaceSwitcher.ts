import type { CommercialPerspective, SanctuaryPerspective } from '@repo/core/types/Perspective';
import type {
  WorkspaceSwitcherTarget,
  WorkspaceSwitcherTargetId,
} from '@repo/core/types/Workspace';

export function formatCommercialPerspectiveTitle(p: CommercialPerspective): string {
  if (p.customAlias && p.customAlias.trim().length > 0) {
    return p.customAlias;
  }
  const mediumTag = p.medium ? ` (${p.medium.charAt(0).toUpperCase() + p.medium.slice(1)})` : '';
  return `${p.instituteName} · ${p.subjectName} ${p.grade}${mediumTag}`;
}

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
  availablePerspectives = [],
  activePerspectiveId,
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
  availablePerspectives?: SanctuaryPerspective[];
  activePerspectiveId?: string;
}): WorkspaceSwitcherTarget[] {
  const founderEnabled = canManageFounderDashboard;
  const adminEnabled = canManageAdminDashboard;
  const principalEnabled = canManagePrincipalDashboard && hasPrimaryInstitution;
  const teacherEnabled = canManageTeacherDashboard;
  const studentEnabled = canManageStudentDashboard;
  const guardianEnabled = canManageGuardianDashboard && hasMountedGuardianWorkspace;

  // Find matching perspective IDs from available perspectives
  const personalPerspective = availablePerspectives.find((p) => p.kind === 'personal');
  const institutionalPerspectives = availablePerspectives.filter(
    (p): p is import('@repo/core/types/Perspective').InstitutionalBondPerspective => p.kind === 'institutional',
  );
  const guardianPerspectives = availablePerspectives.filter(
    (p): p is import('@repo/core/types/Perspective').GuardianBondPerspective => p.kind === 'guardian',
  );
  const commercialPerspectives = availablePerspectives.filter(
    (p): p is CommercialPerspective => p.kind === 'commercial',
  );

  const targets: WorkspaceSwitcherTarget[] = [];

  // 1. Personal Sanctuary Studio
  targets.push({
    id: 'personal',
    title: personalPerspective?.displayName || 'Personal Sanctuary',
    description: 'Private studio, master lesson drafts, question vault, and pedagogical notes.',
    destination: {
      kind: 'tab',
      name: 'Classroom',
    },
    enabled: true,
    perspectiveId: personalPerspective?.id || 'personal',
    category: 'personal',
    badge: '🌿 Sanctuary',
    status: activePerspectiveId === 'personal' || currentWorkspace === 'personal' ? 'current' : 'available',
  });

  // 2. Commercial Batches
  for (const comm of commercialPerspectives) {
    const isCurrent = activePerspectiveId === comm.id;
    targets.push({
      id: 'commercial',
      title: formatCommercialPerspectiveTitle(comm),
      description: `${comm.batchName} · ${comm.role.replace('_', ' ').toUpperCase()}`,
      destination: {
        kind: 'tab',
        name: 'Classroom',
      },
      enabled: true,
      perspectiveId: comm.id,
      category: 'commercial',
      badge: '💼 Commercial',
      status: isCurrent ? 'current' : 'available',
    });
  }

  // 3. Platform Stewardship (Founder / System Admin if privileged)
  if (founderEnabled) {
    targets.push({
      id: 'founder',
      title: 'Founder workspace',
      description: 'Platform-scale stewardship, cross-tenant signal, and founder-owned launch surfaces.',
      destination: {
        kind: 'route',
        name: 'FounderDashboard',
      },
      enabled: true,
      category: 'institutional',
      status: currentWorkspace === 'founder' ? 'current' : 'available',
    });
  }

  if (adminEnabled) {
    targets.push({
      id: 'admin',
      title: 'Admin workspace',
      description: 'Platform-system operations, tenant health, policy repair, and audit-driven interventions.',
      destination: {
        kind: 'route',
        name: 'AdminDashboard',
      },
      enabled: true,
      category: 'institutional',
      status: currentWorkspace === 'admin' ? 'current' : 'available',
    });
  }

  // 4. Institutional School Bonds (Render user's actual active school bonds)
  if (institutionalPerspectives.length > 0) {
    for (const inst of institutionalPerspectives) {
      const isCurrent = activePerspectiveId === inst.id;
      const isPrincipal = inst.capacity === 'principal' || inst.roles?.includes('principal');
      targets.push({
        id: (isPrincipal ? 'principal' : inst.capacity === 'student' ? 'student' : 'teacher') as WorkspaceSwitcherTargetId,
        title: inst.schoolName || inst.displayName,
        description: `${inst.capacity.toUpperCase()} · ${inst.schoolName || 'Academic Institution'}`,
        destination: isPrincipal
          ? { kind: 'route', name: 'PrincipalDashboard' }
          : { kind: 'tab', name: 'Classroom' },
        enabled: true,
        perspectiveId: inst.id,
        category: 'institutional',
        badge: `🏫 ${inst.capacity.toUpperCase()}`,
        status: isCurrent ? 'current' : 'available',
      });
    }
  } else {
    // Legacy fallback if permissions say principal/teacher/student but no perspective object was created yet
    if (principalEnabled) {
      targets.push({
        id: 'principal',
        title: 'Principal operations',
        description: 'Institution-specific governance and operational drill-in for a chosen school.',
        destination: { kind: 'route', name: 'PrincipalDashboard' },
        enabled: true,
        category: 'institutional',
        status: currentWorkspace === 'principal' ? 'current' : 'available',
      });
    }
    if (teacherEnabled) {
      targets.push({
        id: 'teacher',
        title: 'Teacher workspace',
        description: 'Academic daily-work surfaces currently composed through the classroom shell.',
        destination: { kind: 'tab', name: 'Classroom' },
        enabled: true,
        category: 'institutional',
        status: currentWorkspace === 'teacher' ? 'current' : 'available',
      });
    }
    if (studentEnabled) {
      targets.push({
        id: 'student',
        title: 'Student workspace',
        description: 'Learning-flow and progress surfaces currently composed through the classroom shell.',
        destination: { kind: 'tab', name: 'Classroom' },
        enabled: true,
        category: 'institutional',
        status: currentWorkspace === 'student' ? 'current' : 'available',
      });
    }
  }

  // 5. Guardian Wards & Family Portal
  if (guardianPerspectives.length > 0) {
    for (const ward of guardianPerspectives) {
      const isCurrent = activePerspectiveId === ward.id;
      targets.push({
        id: 'guardian',
        title: ward.wardName ? `${ward.wardName}'s Progress` : (ward.displayName || 'Ward Overview'),
        description: 'Child visibility, attendance tracking, and school communication.',
        destination: {
          kind: 'route',
          name: 'GuardianDashboard',
        },
        enabled: true,
        perspectiveId: ward.id,
        category: 'guardian',
        badge: '👨‍👧 Ward',
        status: isCurrent ? 'current' : 'available',
      });
    }
  } else if (guardianEnabled) {
    targets.push({
      id: 'guardian',
      title: 'Guardian workspace',
      description: 'Family-facing oversight with child visibility, announcements, and events.',
      destination: {
        kind: 'route',
        name: 'GuardianDashboard',
      },
      enabled: true,
      category: 'guardian',
      badge: '👨‍👧 Family',
      status: currentWorkspace === 'guardian' ? 'current' : 'available',
    });
  }

  return targets;
}

