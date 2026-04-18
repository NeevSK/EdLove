import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, LayoutGrid, NotebookPen, Share2, Clock, Plus, Info, GraduationCap, TrendingUp, AlertTriangle } from 'lucide-react-native';
import type { PublishedSchoolGradingCompletion } from '@repo/core';
import {
  getPrincipalCapabilitiesByZone,
  type PrincipalWorkspaceView} from '../../principal/workspace';
import { 
    WebScreenHeader, 
    Box, 
    VStack, 
    HStack, 
    Text, 
    Heading, 
    Pressable, 
    Icon,
    Button,
    ButtonText,
    ButtonIcon
} from '@repo/ui';
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
  renderTodayZone?: (context: { schoolId: string; principalId: string } & Pick<DashboardContentProps, 'studentPulse' | 'atRiskCount' | 'onShowAtRisk'>) => React.ReactNode;
  renderInstitutionZone?: (context: { schoolId: string; principalId: string }) => React.ReactNode;
  renderOutlookZone?: (context: { schoolId: string; principalId: string }) => React.ReactNode;
}

function ZoneShell({
  title,
  subtitle,
  count,
  children}: {
  title: string;
  subtitle: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Box className="flex-col gap-5 min-w-0 bg-silk/50 border border-border rounded-[24px] p-5">
      <HStack className="justify-between items-start gap-3">
        <VStack className="flex-1 min-w-0">
          <Heading className="text-xl font-black text-ink">{title}</Heading>
          <Text className="text-[13px] leading-relaxed text-ink/60 mt-1">{subtitle}</Text>
        </VStack>
        <Box className="bg-white px-2.5 py-1 rounded-full border border-border/50">
          <Text className="text-[11px] font-black uppercase tracking-widest text-ink/40">
            {count} modules
          </Text>
        </Box>
      </HStack>
      {children}
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
  renderOutlookZone}: DashboardContentProps) {
  const { t } = useTranslation();
  const schoolId = school?.id ?? '';
  const principalId = user?.id ?? '';

  const renderScopeBadge = (featureId: string) => {
    const scopeMeta = getPrincipalFeatureScopeMeta(featureId);
    if (!scopeMeta) return null;

    return (
      <Box className="bg-silk px-2 py-0.5 rounded-full ml-2 border border-border/50">
        <Text className="text-[10px] font-black uppercase tracking-widest text-ink/40">
          {t(scopeMeta.scopeBadgeLabelKey)}
        </Text>
      </Box>
    );
  };

  const todayCount = getPrincipalCapabilitiesByZone('today', 'live').length;
  const institutionCount = getPrincipalCapabilitiesByZone('institution', 'live').length;
  const outlookCount = getPrincipalCapabilitiesByZone('outlook').filter((capability) => capability.status !== 'hidden').length;

  return (
    <VStack className="gap-6 pb-16">
      <WebScreenHeader
        title={<>Principal <Text className="text-primary font-black">Workspace</Text>.</>}
        note={`Balanced cockpit for ${school?.name || 'your school'}: operate today, govern the institution, and prepare the next layers.`}
        timeText={school?.name || 'Sri Lankan School Leadership'}
        actions={(
          <HStack className="gap-3 flex-wrap">
            <Button
              variant="outline"
              action="secondary"
              onPress={onNavigateToProfile}
              className="rounded-2xl border-border"
            >
              <ButtonIcon as={Building2} />
              <ButtonText>{t('principal.ia.actions.profileCta') || 'Institution Profile'}</ButtonText>
              {renderScopeBadge('school_profile')}
            </Button>
            <Button
              variant="outline"
              action="secondary"
              onPress={onOpenCommons}
              className="rounded-2xl border-water"
            >
              <ButtonIcon as={Share2} className="text-water" />
              <ButtonText className="text-water">{t('principal.ia.actions.commonsCta') || 'Open Community Commons'}</ButtonText>
              {renderScopeBadge('open_commons')}
            </Button>
          </HStack>
        )}
      />

      <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
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
          <VStack className="gap-3">
            <HStack className="gap-3">
                <Button
                    variant="outline"
                    action="secondary"
                    className="flex-1 rounded-2xl justify-between border-border"
                    onPress={() => onNavigate('hierarchy')}
                >
                    <HStack className="items-center gap-2">
                        <ButtonIcon as={LayoutGrid} />
                        <ButtonText>Shape structure</ButtonText>
                    </HStack>
                    {renderScopeBadge('hierarchy')}
                </Button>
            </HStack>
            <HStack className="gap-3">
                <Button
                    variant="outline"
                    action="secondary"
                    className="flex-1 rounded-2xl justify-between border-border"
                    onPress={() => onNavigate('invites')}
                >
                    <HStack className="items-center gap-2">
                        <ButtonIcon as={Building2} />
                        <ButtonText>Role invites</ButtonText>
                    </HStack>
                    {renderScopeBadge('invites')}
                </Button>
            </HStack>
            <HStack className="gap-3">
                <Button
                    variant="outline"
                    action="secondary"
                    className="flex-1 rounded-2xl justify-between border-border"
                    onPress={() => onNavigate('notes')}
                >
                    <HStack className="items-center gap-2">
                        <ButtonIcon as={NotebookPen} />
                        <ButtonText>Open logbook</ButtonText>
                    </HStack>
                    {renderScopeBadge('log')}
                </Button>
            </HStack>
          </VStack>
          {renderInstitutionZone?.({ schoolId, principalId })}
        </ZoneShell>

        <ZoneShell
          title="Outlook"
          subtitle="Aggregated patterns, community signals, and the ERP families this workspace is preparing to hold."
          count={outlookCount}
        >
          {publishedGradingCompletion && (
            <Box className="p-3.5 rounded-2xl border border-border bg-silk/70">
              <Text className="text-xs leading-relaxed text-ink/60">
                Published grading is live in {publishedGradingCompletion.classroomsWithPublishedGrades} of {publishedGradingCompletion.totalClassrooms} classrooms.
              </Text>
            </Box>
          )}
          {renderOutlookZone?.({ schoolId, principalId })}
        </ZoneShell>
      </Box>
    </VStack>
  );
}
