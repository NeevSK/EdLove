import React from 'react';
import { Theme, VStack } from '@repo/ui';
import {
  DashboardEcho,
  InstitutionalCalendarSection,
  LeaveApprovalSection,
  MorningSituationalBrief,
  PrincipalObservationsSection,
  PulseDashboard,
  ResourceNeedsDashboard,
  TeacherCarousel,
} from '@repo/admin';
import {
  usePrincipalWorkspaceShell,
  type PrincipalWorkspaceView,
  type PrincipalZoneId,
} from '@repo/admin';

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

type PrincipalZoneSurface = {
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
      <VStack sx={{ gap: Theme.spacing.lg }}        <MorningSituationalBrief schoolId={schoolId} principalId={userId} /        ><TeacherCarousel schoolId={schoolId} /        ><LeaveApprovalSection schoolId={schoolId} principalId={userId} /        ><InstitutionalCalendarSection schoolId={schoolId} principalId={userId} /        ><PrincipalObservationsSection schoolId={schoolId} principalId={userId} /      ></VStack    ),>
    renderOutlookContent: () => (
      <VStack sx={{ gap: Theme.spacing.lg }}        <PulseDashboard schoolId={schoolId} /        ><ResourceNeedsDashboard schoolId={schoolId} /        ><DashboardEcho schoolId={schoolId} /      ></VStack    ),>
  });

  return {
    zoneCounts: shell.zoneCounts,
    surfaces: shell.surfaces as Record<PrincipalZoneId, PrincipalZoneSurface>,
  };
}
