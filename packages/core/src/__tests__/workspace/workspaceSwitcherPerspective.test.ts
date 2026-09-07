import { describe, expect, it } from 'vitest';
import { resolveWorkspaceSwitcherTargets } from '@repo/core/logic/workspace/workspaceSwitcher';
import type { SanctuaryPerspective } from '@repo/core/types/Perspective';

describe('Workspace Switcher Perspective Binding', () => {
  const availablePerspectives: SanctuaryPerspective[] = [
    {
      id: 'personal',
      kind: 'personal',
      displayName: 'Personal Sanctuary',
    },
    {
      id: 'bond:royal_college:principal',
      kind: 'institutional',
      displayName: 'Royal College - Principal',
      schoolId: 'school-royal-123',
      schoolName: 'Royal College',
      capacity: 'principal',
      roles: ['principal'],
    },
    {
      id: 'bond:royal_college:teacher',
      kind: 'institutional',
      displayName: 'Royal College - Teacher',
      schoolId: 'school-royal-123',
      schoolName: 'Royal College',
      capacity: 'teacher',
      roles: ['teacher'],
    },
    {
      id: 'bond:guardian:child_456',
      kind: 'guardian',
      displayName: 'Parent of Alex',
      wardUserId: 'child_456',
      wardName: 'Alex',
      schoolId: 'school-royal-123',
    },
  ];

  it('maps workspace targets directly to their corresponding Sanctuary Perspective / Bond IDs', () => {
    const targets = resolveWorkspaceSwitcherTargets({
      currentWorkspace: 'principal',
      canManageFounderDashboard: false,
      canManageAdminDashboard: false,
      canManagePrincipalDashboard: true,
      canManageTeacherDashboard: true,
      canManageStudentDashboard: false,
      canManageGuardianDashboard: true,
      hasPrimaryInstitution: true,
      hasMountedGuardianWorkspace: true,
      availablePerspectives,
      activePerspectiveId: 'bond:royal_college:principal',
    });

    const principalTarget = targets.find((t) => t.id === 'principal');
    const teacherTarget = targets.find((t) => t.id === 'teacher');
    const guardianTarget = targets.find((t) => t.id === 'guardian');

    expect(principalTarget?.enabled).toBe(true);
    expect(principalTarget?.perspectiveId).toBe('bond:royal_college:principal');

    expect(teacherTarget?.enabled).toBe(true);
    expect(teacherTarget?.perspectiveId).toBe('bond:royal_college:teacher');

    expect(guardianTarget?.enabled).toBe(true);
    expect(guardianTarget?.perspectiveId).toBe('bond:guardian:child_456');
  });
});
