import GradeHeadDashboard from '@repo/admin/screens/GradeHeadDashboard';
import PrincipalDashboard from '@repo/admin/screens/PrincipalDashboard';
import SectionHeadDashboard from '@repo/admin/screens/SectionHeadDashboard';
import React from 'react';
import { PrincipalOnboardingView } from '../components';
import type { ClassroomWorkspaceSurface, PrincipalInsight } from '../types/workspace';

export function appendPrincipalWorkspaceSurfaces(
  surfaces: ClassroomWorkspaceSurface[],
  {
    can,
    isGuest,
    isDemoModeTriggered,
    classroomData,
    schoolIdToUse,
    fetchRoleData,
    navigation,
    surfaceInsights,
    onTryDemo,
    onCreateSchool,
  }: {
    can: (action: string, subject: string, field?: string) => boolean;
    isGuest: boolean;
    isDemoModeTriggered: boolean;
    classroomData: { userId: string };
    schoolIdToUse?: string | null;
    fetchRoleData: () => void | Promise<void>;
    navigation: { navigate: (screen: string, params?: any) => void };
    surfaceInsights?: PrincipalInsight;
    onTryDemo: () => void;
    onCreateSchool: () => void;
  },
) {
  if (can('manage', 'PrincipalDashboard')) {
    const principalContent =
      !schoolIdToUse && !isDemoModeTriggered ? (
        <PrincipalOnboardingView
          isGuest={isGuest}
          onTryDemo={onTryDemo}
          onCreateSchool={onCreateSchool}
          onJoinSchool={() => navigation.navigate('Search')}
        />
      ) : (
        <PrincipalDashboard
          schoolId={schoolIdToUse || 'demo-school'}
          userId={classroomData.userId}
          onRefresh={fetchRoleData}
        />
      );

    surfaces.push({
      surfaceId: 'principal',
      workspaceId: 'classroom',
      capabilityKey: 'PrincipalDashboard',
      ownerPackage: 'admin',
      defaultZone: 'institution',
      defaultOrder: 10,
      mobileSupport: true,
      webSupport: true,
      title: 'Principal Shell',
      subtitle: 'Official school governance workspace',
      summary:
        surfaceInsights?.principal?.summary ??
        'Institutional pulse, observations, approvals, and published academic oversight.',
      temporalLabel: surfaceInsights?.principal?.temporalLabel ?? 'Official',
      metadata: surfaceInsights?.principal?.metadata ?? ['Admin-owned', 'Governance'],
      content: principalContent,
    });
  }

  if (can('manage', 'SectionHeadDashboard')) {
    surfaces.push({
      surfaceId: 'section-head',
      workspaceId: 'classroom',
      capabilityKey: 'SectionHeadDashboard',
      ownerPackage: 'classroom',
      defaultZone: 'work',
      defaultOrder: 20,
      mobileSupport: true,
      webSupport: true,
      title: 'Section Head Desk',
      subtitle: 'Section-level academic coordination',
      summary: 'Mixed teaching and coordination capability within the classroom holon.',
      temporalLabel: 'Work',
      metadata: ['Academic', 'Mixed-role'],
      content: (
        <SectionHeadDashboard schoolId={schoolIdToUse || undefined} userId={classroomData.userId} />
      ),
    });
  }

  if (can('manage', 'GradeHeadDashboard')) {
    surfaces.push({
      surfaceId: 'grade-head',
      workspaceId: 'classroom',
      capabilityKey: 'GradeHeadDashboard',
      ownerPackage: 'classroom',
      defaultZone: 'work',
      defaultOrder: 30,
      mobileSupport: true,
      webSupport: true,
      title: 'Grade Head Deck',
      subtitle: 'Grade-level academic stewardship',
      summary: 'Cross-class coordination for grade-wide rhythms, issues, and academic flow.',
      temporalLabel: 'Work',
      metadata: ['Academic', 'Mixed-role'],
      content: (
        <GradeHeadDashboard schoolId={schoolIdToUse || undefined} userId={classroomData.userId} />
      ),
    });
  }
}
