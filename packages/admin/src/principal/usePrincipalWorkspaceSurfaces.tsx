import { VStack } from '@repo/ui/primitives';
import type React from 'react';
import { usePrincipalWorkspaceShell } from '@repo/admin/bridge/principalWorkspaceShell';
import DashboardEcho from '@repo/admin/components/principal/DashboardEcho';
import InstitutionalCalendarSection from '@repo/admin/components/principal/InstitutionalCalendarSection';
import LeaveApprovalSection from '@repo/admin/components/principal/LeaveApprovalSection';
import MorningSituationalBrief from '@repo/admin/components/principal/MorningSituationalBrief';
import PrincipalObservationsSection from '@repo/admin/components/principal/PrincipalObservationsSection';
import PulseDashboard from '@repo/admin/components/principal/PulseDashboard';
import ResourceNeedsDashboard from '@repo/admin/components/principal/ResourceNeedsDashboard';
import TeacherCarousel from '@repo/admin/components/principal/TeacherCarousel';
import type { PrincipalWorkspaceView, PrincipalZoneId } from '@repo/admin/principal/workspace';

type ZoneSurfaceArgs = {
  schoolId: string;
  userId: string;
  stats?: {
    total_students?: number;
    total_teachers?: number;
    total_classrooms?: number;
    total_sections?: number;
  } | null;
  navigatePrincipalView: (view: PrincipalWorkspaceView) => void;
};

export type PrincipalZoneSurface = {
  id: PrincipalZoneId;
  eyebrow: string;
  title: string;
  copy: string;
  content: React.ReactNode;
};

export function usePrincipalWorkspaceSurfaces({
  schoolId,
  userId,
  stats,
  navigatePrincipalView,
  onOpenProfile,
  onOpenCommons,
  onOpenQr,
  onOpenBreathing,
  onEditSchool,
}: ZoneSurfaceArgs & {
  onOpenProfile: () => void;
  onOpenCommons: () => void;
  onOpenQr: () => void;
  onOpenBreathing: () => void;
  onEditSchool: () => void;
}) {
  const shell = usePrincipalWorkspaceShell({
    schoolId,
    principalId: userId,
    stats,
    navigatePrincipalView,
    onOpenProfile,
    onOpenCommons,
    onOpenQr,
    onOpenBreathing,
    onEditSchool,
    renderTodayContent: () => (
      <VStack className="gap-6">
        <MorningSituationalBrief schoolId={schoolId} />
        <TeacherCarousel schoolId={schoolId} />
        <LeaveApprovalSection schoolId={schoolId} principalId={userId} />
        <InstitutionalCalendarSection schoolId={schoolId} principalId={userId} />
        <PrincipalObservationsSection schoolId={schoolId} principalId={userId} />
      </VStack>
    ),
    renderOutlookContent: () => (
      <VStack className="gap-6">
        <PulseDashboard schoolId={schoolId} />
        <ResourceNeedsDashboard schoolId={schoolId} />
        <DashboardEcho schoolId={schoolId} />
      </VStack>
    ),
  });

  return {
    zoneCounts: shell.zoneCounts,
    surfaces: shell.surfaces as Record<PrincipalZoneId, PrincipalZoneSurface>,
  };
}
