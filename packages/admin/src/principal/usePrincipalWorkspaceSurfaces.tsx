import React from 'react';
import {  VStack } from '@repo/ui';
import { usePrincipalWorkspaceShell } from '../bridge/principalWorkspaceShell';
import type { PrincipalWorkspaceView, PrincipalZoneId } from './workspace';
import MorningSituationalBrief from '../components/principal/MorningSituationalBrief';
import TeacherCarousel from '../components/principal/TeacherCarousel';
import LeaveApprovalSection from '../components/principal/LeaveApprovalSection';
import InstitutionalCalendarSection from '../components/principal/InstitutionalCalendarSection';
import PrincipalObservationsSection from '../components/principal/PrincipalObservationsSection';
import PulseDashboard from '../components/principal/PulseDashboard';
import ResourceNeedsDashboard from '../components/principal/ResourceNeedsDashboard';
import DashboardEcho from '../components/principal/DashboardEcho';

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
  onEditSchool}: ZoneSurfaceArgs & {
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
    )});

  return {
    zoneCounts: shell.zoneCounts,
    surfaces: shell.surfaces as Record<PrincipalZoneId, PrincipalZoneSurface>};
}
