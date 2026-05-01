import { PublishedSchoolGradingCompletion } from '@repo/core/logic';
import { Building2, LayoutGrid, NotebookPen, Share2, TrendingUp } from '@repo/ui/icons';
import { Box, Button } from '@repo/ui/primitives';
import { ButtonIcon, ButtonText, HStack, Heading, Icon, Text, VStack } from '@repo/ui/primitives';
import { WebScreenHeader } from '@repo/ui/components/WebScreenHeader.web';
import { hapticLight } from '@repo/ui/utils/haptics';

import type React from 'react';
import { useTranslation } from 'react-i18next';
import {
  getPrincipalCapabilitiesByZone,
  type PrincipalWorkspaceView,
} from '../../principal/workspace';
import { getPrincipalFeatureScopeMeta } from './PrincipalIAScope';

export interface DashboardContentProps {
  school: any;
  user: any;
  stats: any;
  presence: any;
  resonanceScore: number;
  pulse: any;
  echoItems: any[];
  teachers: any[];
  studentPulse: any;
  atRiskCount: number;
  pendingLeaves: any[];
  calendarEvents: any[];
  schoolTopology: any;
  topologyLoading: boolean;
  staffLoading: boolean;
  curriculumProgress: any[];
  resourceNeeds: any[];
  publishedGradingCompletion?: PublishedSchoolGradingCompletion | null;
  isPastView: boolean;
  onNavigate: (view: PrincipalWorkspaceView) => void;
  onAddStaff: () => void;
  onAddClassroom: () => void;
  onMarkEchoRead: (id: string) => void;
  onApproveLeave: (id: string) => void;
  onRejectLeave: (id: string) => void;
  onShowAtRisk: () => void;
  onAddAction: (featureId: string) => void;
  onHistoryAction: (featureId: string) => void;
  onNavigateToProfile: () => void;
  onOpenCommons: () => void;
  observations: any[];
  renderTodayZone?: (
    context: { schoolId: string; principalId: string } & Pick<
      DashboardContentProps,
      'studentPulse' | 'atRiskCount' | 'onShowAtRisk'
    >,
  ) => React.ReactNode;
  renderInstitutionZone?: (context: { schoolId: string; principalId: string }) => React.ReactNode;
  renderOutlookZone?: (context: { schoolId: string; principalId: string }) => React.ReactNode;
}

function ZoneShell({
  title,
  subtitle,
  count,
  children,
}: {
  title: string;
  subtitle: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Box className="flex-col gap-6 min-w-0 bg-phase-surface border border-phase-border rounded-[32px] p-6 shadow-sm">
      <HStack className="justify-between items-start gap-4">
        <VStack className="flex-1 min-w-0">
          <Heading className="text-[20px] font-black text-phaseText-primary tracking-tight">
            {title}
          </Heading>
          <Text className="text-[13px] leading-relaxed text-phaseText-muted font-bold mt-1.5">
            {subtitle}
          </Text>
        </VStack>
        <Box className="bg-phase-canvas px-3 py-1 rounded-full border border-phase-border shadow-inner">
          <Text className="text-[10px] font-black uppercase tracking-widest text-phaseText-muted">
            {count} modules
          </Text>
        </Box>
      </HStack>
      <Box className="mt-2">{children}</Box>
    </Box>
  );
}

export function DashboardContent({
  school,
  user,
  publishedGradingCompletion,
  studentPulse,
  atRiskCount,
  onNavigate,
  onNavigateToProfile,
  onOpenCommons,
  onShowAtRisk,
  renderTodayZone,
  renderInstitutionZone,
  renderOutlookZone,
}: DashboardContentProps) {
  const { t } = useTranslation();
  const schoolId = school?.id ?? '';
  const principalId = user?.id ?? '';

  const renderScopeBadge = (featureId: string) => {
    const scopeMeta = getPrincipalFeatureScopeMeta(featureId);
    if (!scopeMeta) return null;

    return (
      <Box className="bg-phase-canvas px-2.5 py-0.5 rounded-full ml-3 border border-phase-border shadow-inner">
        <Text className="text-[9px] font-black uppercase tracking-[0.1em] text-phaseText-muted">
          {t(scopeMeta.scopeBadgeLabelKey)}
        </Text>
      </Box>
    );
  };

  const todayCount = getPrincipalCapabilitiesByZone('today', 'live').length;
  const institutionCount = getPrincipalCapabilitiesByZone('institution', 'live').length;
  const outlookCount = getPrincipalCapabilitiesByZone('outlook').filter(
    (capability) => capability.status !== 'hidden',
  ).length;

  return (
    <VStack className="gap-8 pb-32">
      <WebScreenHeader
        title={
          <Text className="text-phaseText-primary font-black">
            Principal <Text className="text-phase-interactive">Workspace</Text>.
          </Text>
        }
        note={`Balanced leadership cockpit for ${school?.name || 'your institution'}: operate today, govern the school, and seed future cycles.`}
        timeText={school?.name || 'Institutional Governance'}
        actions={
          <HStack className="gap-3 flex-wrap">
            <Button
              variant="outline"
              action="secondary"
              onPress={() => {
                hapticLight();
                onNavigateToProfile();
              }}
              className="rounded-2xl border-phase-border bg-phase-surface shadow-sm active:scale-95 transition-all"
            >
              <ButtonIcon as={Building2} className="text-phaseText-primary" />
              <ButtonText className="text-phaseText-primary font-black uppercase tracking-widest text-[11px] ml-2">
                {t('principal.ia.actions.profileCta') || 'Institutional Profile'}
              </ButtonText>
              {renderScopeBadge('school_profile')}
            </Button>
            <Button
              variant="outline"
              action="secondary"
              onPress={() => {
                hapticLight();
                onOpenCommons();
              }}
              className="rounded-2xl border-phase-interactive bg-phase-interactive/5 active:scale-95 transition-all"
            >
              <ButtonIcon as={Share2} className="text-phase-interactive" />
              <ButtonText className="text-phase-interactive font-black uppercase tracking-widest text-[11px] ml-2">
                {t('principal.ia.actions.commonsCta') || 'Community Commons'}
              </ButtonText>
              {renderScopeBadge('open_commons')}
            </Button>
          </HStack>
        }
      />

      <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 items-start">
        <ZoneShell
          title="Today"
          subtitle="Situational awareness, urgent operations, and the few things that cannot wait."
          count={todayCount}
        >
          {renderTodayZone?.({ schoolId, principalId, studentPulse, atRiskCount, onShowAtRisk })}
        </ZoneShell>

        <ZoneShell
          title="Institution"
          subtitle="The official work of shaping the school, its structure, and its institutional memory."
          count={institutionCount}
        >
          <VStack className="gap-4">
            <HStack className="gap-3">
              <Button
                variant="outline"
                action="secondary"
                className="flex-1 rounded-[20px] justify-between border-phase-border bg-phase-surface h-14 px-5 shadow-sm active:scale-95 transition-all"
                onPress={() => {
                  hapticLight();
                  onNavigate('hierarchy');
                }}
              >
                <HStack className="items-center gap-3">
                  <ButtonIcon as={LayoutGrid} className="text-phaseText-primary" />
                  <ButtonText className="text-phaseText-primary font-bold text-[14px]">
                    Shape structure
                  </ButtonText>
                </HStack>
                {renderScopeBadge('hierarchy')}
              </Button>
            </HStack>
            <HStack className="gap-3">
              <Button
                variant="outline"
                action="secondary"
                className="flex-1 rounded-[20px] justify-between border-phase-border bg-phase-surface h-14 px-5 shadow-sm active:scale-95 transition-all"
                onPress={() => {
                  hapticLight();
                  onNavigate('invites');
                }}
              >
                <HStack className="items-center gap-3">
                  <ButtonIcon as={Building2} className="text-phaseText-primary" />
                  <ButtonText className="text-phaseText-primary font-bold text-[14px]">
                    Role invites
                  </ButtonText>
                </HStack>
                {renderScopeBadge('invites')}
              </Button>
            </HStack>
            <HStack className="gap-3">
              <Button
                variant="outline"
                action="secondary"
                className="flex-1 rounded-[20px] justify-between border-phase-border bg-phase-surface h-14 px-5 shadow-sm active:scale-95 transition-all"
                onPress={() => {
                  hapticLight();
                  onNavigate('notes');
                }}
              >
                <HStack className="items-center gap-3">
                  <ButtonIcon as={NotebookPen} className="text-phaseText-primary" />
                  <ButtonText className="text-phaseText-primary font-bold text-[14px]">
                    Open logbook
                  </ButtonText>
                </HStack>
                {renderScopeBadge('log')}
              </Button>
            </HStack>
          </VStack>
          <Box className="mt-6">{renderInstitutionZone?.({ schoolId, principalId })}</Box>
        </ZoneShell>

        <ZoneShell
          title="Outlook"
          subtitle="Aggregated patterns, community signals, and the ERP families this workspace is preparing to hold."
          count={outlookCount}
        >
          {publishedGradingCompletion && (
            <Box className="p-5 rounded-3xl border border-phase-border bg-phase-canvas shadow-inner mb-6">
              <HStack className="items-center gap-3 mb-2">
                <Icon as={TrendingUp} size="xs" className="text-phase-success" />
                <Text className="text-[10px] font-black uppercase tracking-widest text-phase-success">
                  Academic Performance
                </Text>
              </HStack>
              <Text className="text-[14px] leading-relaxed text-phaseText-secondary font-medium">
                Published grading is live in{' '}
                <Text className="font-black text-phaseText-primary">
                  {publishedGradingCompletion.classroomsWithPublishedGrades}
                </Text>{' '}
                of{' '}
                <Text className="font-black text-phaseText-primary">
                  {publishedGradingCompletion.totalClassrooms}
                </Text>{' '}
                classrooms.
              </Text>
            </Box>
          )}
          {renderOutlookZone?.({ schoolId, principalId })}
        </ZoneShell>
      </Box>
    </VStack>
  );
}
