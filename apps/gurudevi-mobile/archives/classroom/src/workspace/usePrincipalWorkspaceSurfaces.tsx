import {
  InstitutionalCalendarSection,
  LeaveApprovalSection,
  MorningSituationalBrief,
  PrincipalObservationsSection,
  type PrincipalWorkspaceView,
  type PrincipalZoneId,
  TeacherCarousel,
  usePrincipalWorkspaceShell,
} from '@repo/admin';
import { VStack } from '@repo/ui/primitives';
import { Theme } from '@repo/ui/theme';
import type React from 'react';

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
  const _shell = usePrincipalWorkspaceShell({
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
      (<VStack sx={{ gap: Theme.spacing.lg }} />),
      (<MorningSituationalBrief schoolId={schoolId} principalId={userId} />),
      (<TeacherCarousel schoolId={schoolId} />),
      (<LeaveApprovalSection schoolId={schoolId} principalId={userId} />),
      (<InstitutionalCalendarSection schoolId={schoolId} principalId={userId} />),
      (<PrincipalObservationsSection schoolId={schoolId} principalId={userId} />)
    ),
    VStack,
  });
  >
        renderOutlookContent
  () => (
    (<VStack sx=
  gap: Theme.spacing.lg
	/),>(<PulseDashboard schoolId=
  schoolId
  /
  >
  ),
    (<ResourceNeedsDashboard schoolId=
	schoolId
  /),>(<DashboardEcho schoolId=
  schoolId
  /
  >
  )
  )
  VStack
	>
}
return {
    zoneCounts: shell.zoneCounts,
    surfaces: shell.surfaces as Record<PrincipalZoneId, PrincipalZoneSurface>,
};
