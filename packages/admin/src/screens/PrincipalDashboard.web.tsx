import {
  api,
  type CalendarEvent,
  type StaffLeaveDTO,
  type StaffPresenceSummary,
  type TeacherCarouselItem,
} from '@repo/core/api';
import { useIsGuest } from '@repo/core/hooks';
import {
  type PublishedSchoolGradingCompletion,
  type PulseMetricsZod,
  useAuthStore,
  usePermissions,
  useTemporalStore,
} from '@repo/core/logic';
import type {
  MappingTopologyZod as KnowledgeTopology,
  School,
  SchoolStats,
  User,
} from '@repo/core/types';

import SandboxBanner from '@repo/ui/components/SandboxBanner';
import { WebScreenHeader } from '@repo/ui/components/WebScreenHeader.web';
import { hapticLight } from '@repo/ui/utils/haptics';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import type React from 'react';
import { useEffect, useState } from 'react';
import {
  useCurriculumPulse,
  useMappingTopologyQuery,
  useOperationalAwareness,
  useSchoolPulseQuery,
  useSchoolStatsQuery,
  useStaffResonance,
} from '@repo/admin/hooks/useDashboardHooks';
import type { FeedbackEcho, GradeProgress } from '@repo/admin/insights';
import type { ResourceNeedSummary } from '@repo/admin/inventory';
import type { PrincipalObservation } from '@repo/admin/observations';
import type { PrincipalWorkspaceView } from '@repo/admin/principal/workspace';
import { resolvePrincipalWorkspaceView } from '@repo/admin/principal/workspace';
import { type StudentPrincipalPulse, staffOperationsAPI } from '@repo/admin/staff';
import { PrincipalWorkspaceContainer } from '@repo/admin/screens/PrincipalWorkspaceContainer';
import { CyclesDashboard } from '@repo/admin/screens/principal/CyclesDashboard';
import { HierarchyDashboard } from '@repo/admin/screens/principal/HierarchyDashboard';
import { InvitesDashboard } from '@repo/admin/screens/principal/InvitesDashboard';
import { LegacyDashboard } from '@repo/admin/screens/principal/LegacyDashboard';
import { LogbookDashboard } from '@repo/admin/screens/principal/LogbookDashboard';

const DEMO_PRINCIPAL_SCHOOL_ID = 'mock-school';

interface DashboardContentProps {
  school: School | null;
  user: User | null;
  stats: SchoolStats | null;
  presence: StaffPresenceSummary | null;
  resonanceScore: number;
  pulse: PulseMetricsZod | null;
  echoItems: FeedbackEcho[];
  teachers: TeacherCarouselItem[];
  studentPulse: StudentPrincipalPulse | null;
  atRiskCount: number;
  pendingLeaves: StaffLeaveDTO[];
  calendarEvents: CalendarEvent[];
  schoolTopology: KnowledgeTopology | null;
  topologyLoading: boolean;
  staffLoading: boolean;
  curriculumProgress: GradeProgress[];
  resourceNeeds: ResourceNeedSummary[];
  isPastView: boolean;
  observations: PrincipalObservation[];
  viewDate: string;
  publishedGradingCompletion: PublishedSchoolGradingCompletion | null;
  onNavigate: (view: PrincipalWorkspaceView) => void;
  onAddAction: (featureId: string) => void;
  onHistoryAction: (featureId: string) => void;
  onAddStaff: () => void;
  onAddClassroom: () => void;
  onMarkEchoRead: (id: string) => void;
  onApproveLeave: (id: string) => void;
  onRejectLeave: (id: string) => void;
  onShowAtRisk: () => void;
  onNavigateToProfile: () => void;
  onOpenCommons: () => void;
}

interface HierarchyDashboardProps {
  schoolId: string;
  isPastView: boolean;
  onBack: () => void;
}

interface InvitesDashboardProps {
  schoolId: string;
  userId: string;
  isPastView: boolean;
  onBack: () => void;
}

interface LogbookDashboardProps {
  userId: string;
  schoolId: string;
  viewDate: string;
  isPastView: boolean;
  onBack: () => void;
}

interface LogbookDashboardProps {
  userId: string;
  schoolId: string;
  viewDate: string;
  isPastView: boolean;
  onBack: () => void;
}

interface CyclesDashboardProps {
  schoolId: string;
  isPastView: boolean;
  onBack: () => void;
}

interface PrincipalOnboardingViewProps {
  onTryDemo: () => void;
  onCreateSchool: () => void;
  onJoinSchool: () => void;
  isGuest: boolean;
}

interface PrincipalDashboardWebProps {
  schoolId?: string;
  userId?: string;
  forceDemo?: boolean;
  onRefresh?: () => void;
  DashboardContentComponent: React.ComponentType<DashboardContentProps>;
  HierarchyDashboardComponent?: React.ComponentType<HierarchyDashboardProps>;
  InvitesDashboardComponent?: React.ComponentType<InvitesDashboardProps>;
  LogbookDashboardComponent?: React.ComponentType<LogbookDashboardProps>;
  CyclesDashboardComponent?: React.ComponentType<CyclesDashboardProps>;
  PrincipalOnboardingViewComponent: React.ComponentType<PrincipalOnboardingViewProps>;
  CreateSchoolModalComponent: React.ComponentType<{
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
  }>;
  CreateClassroomModalComponent: React.ComponentType<{
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
  }>;
  LegacyDashboardComponent?: React.ComponentType<{
    schoolId: string;
    onBack: () => void;
  }>;
}

export default function PrincipalDashboardWeb({
  schoolId,
  userId,
  forceDemo,
  onRefresh,
  DashboardContentComponent,
  HierarchyDashboardComponent = HierarchyDashboard,
  InvitesDashboardComponent = InvitesDashboard,
  LogbookDashboardComponent = LogbookDashboard,
  CyclesDashboardComponent = CyclesDashboard,
  PrincipalOnboardingViewComponent,
  CreateSchoolModalComponent,
  CreateClassroomModalComponent,
  LegacyDashboardComponent = LegacyDashboard,
}: PrincipalDashboardWebProps) {
  const user = useAuthStore((state) => state.user) as User | null;
  const isGuest = useIsGuest();
  const { can } = usePermissions();
  const viewDate = useTemporalStore((s) => s.viewDate);
  const isPastView = useTemporalStore((s) => s.isPastView);
  const router = useRouter();

  const effectiveSchoolId = schoolId || user?.school_id || '';
  const effectiveUserId = userId || user?.id || '';
  const [isDemoMode, setIsDemoMode] = useState(forceDemo || false);

  const isDemo = isDemoMode || (!effectiveSchoolId && !isGuest);
  const principalSchoolId = effectiveSchoolId || (isDemoMode ? DEMO_PRINCIPAL_SCHOOL_ID : '');
  const showOnboarding = !effectiveSchoolId && !isDemoMode;

  const { data: statsData } = useSchoolStatsQuery(principalSchoolId);
  const school = statsData?.school || null;
  const schoolStats = statsData?.stats || null;

  const { data: pulse } = useSchoolPulseQuery(principalSchoolId);

  const [activeView, setActiveView] = useState<PrincipalWorkspaceView>('main');
  const [showCreateClassroom, setShowCreateClassroom] = useState(false);
  const [isCreateSchoolOpen, setIsCreateSchoolOpen] = useState(false);

  const staff = useStaffResonance(principalSchoolId);
  const curriculum = useCurriculumPulse(principalSchoolId);
  const operations = useOperationalAwareness(principalSchoolId, effectiveUserId);
  const topology = useMappingTopologyQuery(principalSchoolId);

  const studentPulseQuery = useQuery({
    queryKey: ['student-attendance-pulse', principalSchoolId, viewDate],
    queryFn: () =>
      staffOperationsAPI.getStudentPrincipalPulse(principalSchoolId, undefined, viewDate, {
        actorId: effectiveUserId,
        accessKind: 'institutional_read',
        reason: 'principal_dashboard_attendance_pulse',
      }),
    enabled: !!principalSchoolId,
  });

  const publishedGradingCompletionQuery = useQuery({
    queryKey: ['principal-published-grading-completion', principalSchoolId, viewDate],
    queryFn: () =>
      api.grading.getSchoolPublishedGradingCompletion(principalSchoolId, viewDate || '', {
        actorId: effectiveUserId,
        accessKind: 'institutional_read',
        reason: 'principal_dashboard_published_grading_completion',
      }),
    enabled: !!principalSchoolId,
  });

  const presence = staff.presence.data || null;
  const teachers = staff.teachers.data || [];
  const pendingLeaves = staff.pendingLeaves.data || [];
  const echoItems = curriculum.echoes.data || [];
  const curriculumProgress = curriculum.progress.data || [];
  const resourceNeeds = operations.resourceNeeds.data || [];
  const calendarEvents = operations.calendarEvents.data || [];
  const observations = operations.observations.data || [];
  const schoolTopology = topology.data || null;

  const staffLoading = staff.presence.isLoading || staff.teachers.isLoading;
  const topologyLoading = topology.isLoading;
  const studentPulse = studentPulseQuery.data || null;

  const handleTryDemo = () => {
    hapticLight();
    setIsDemoMode(true);
  };

  const handleCreateSchool = () => setIsCreateSchoolOpen(true);
  const handleJoinSchool = () => router.push('/welcome');
  const handleBackToDashboard = () => setActiveView('main');
  const canManageSchoolScope = !!principalSchoolId && (isDemoMode || can('manage', 'School'));

  const navigatePrincipalView = (nextView: PrincipalWorkspaceView) => {
    if (nextView === 'main') {
      setActiveView('main');
      return;
    }
    if (canManageSchoolScope) {
      setActiveView(nextView);
    }
  };

  useEffect(() => {
    if (!canManageSchoolScope && activeView !== 'main') {
      setActiveView('main');
    }
  }, [activeView, canManageSchoolScope]);

  const renderPrincipalView = (view: PrincipalWorkspaceView) => {
    if (view === 'hierarchy') {
      return (
        <HierarchyDashboardComponent
          schoolId={principalSchoolId}
          isPastView={isPastView}
          onBack={handleBackToDashboard}
        />
      );
    }
    if (view === 'invites') {
      return (
        <InvitesDashboardComponent
          schoolId={principalSchoolId}
          userId={effectiveUserId}
          isPastView={isPastView}
          onBack={handleBackToDashboard}
        />
      );
    }
    if (view === 'log' || view === 'notes') {
      return (
        <LogbookDashboardComponent
          userId={effectiveUserId}
          schoolId={principalSchoolId}
          viewDate={viewDate}
          isPastView={isPastView}
          onBack={handleBackToDashboard}
        />
      );
    }
    if (view === 'cycles') {
      return (
        <CyclesDashboardComponent
          schoolId={principalSchoolId}
          isPastView={isPastView}
          onBack={handleBackToDashboard}
        />
      );
    }
    if (view === 'legacy') {
      return (
        <LegacyDashboardComponent schoolId={principalSchoolId} onBack={handleBackToDashboard} />
      );
    }
    return null;
  };

  if (showOnboarding) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
        <WebScreenHeader title="Gurudevi Principal" note="Educational Management Sanctuary" />
        <PrincipalOnboardingViewComponent
          onTryDemo={handleTryDemo}
          onCreateSchool={handleCreateSchool}
          onJoinSchool={handleJoinSchool}
          isGuest={isGuest}
        />
        <CreateSchoolModalComponent
          isOpen={isCreateSchoolOpen}
          onClose={() => setIsCreateSchoolOpen(false)}
          onSuccess={() => onRefresh?.()}
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {isDemo && <SandboxBanner />}
      <div style={{ padding: '0px 24px 40px' }}>
        <PrincipalWorkspaceContainer
          activeView={activeView}
          onActiveViewChange={navigatePrincipalView}
          renderView={({ activeView: nextView }: { activeView: PrincipalWorkspaceView }) =>
            renderPrincipalView(nextView)
          }
          renderMain={() => (
            <DashboardContentComponent
              school={school ?? null}
              user={user ?? null}
              stats={schoolStats ?? null}
              presence={presence ?? null}
              resonanceScore={pulse?.resonance_score ?? 0}
              pulse={pulse ?? null}
              echoItems={echoItems}
              teachers={teachers}
              studentPulse={studentPulse ?? null}
              atRiskCount={studentPulse?.atRiskCount ?? 0}
              pendingLeaves={pendingLeaves}
              calendarEvents={calendarEvents}
              schoolTopology={schoolTopology as KnowledgeTopology}
              topologyLoading={topologyLoading}
              staffLoading={staffLoading}
              curriculumProgress={curriculumProgress}
              resourceNeeds={resourceNeeds}
              publishedGradingCompletion={publishedGradingCompletionQuery.data ?? null}
              isPastView={isPastView}
              observations={observations}
              viewDate={viewDate}
              onNavigate={navigatePrincipalView}
              onAddAction={(featureId: string) =>
                navigatePrincipalView(
                  resolvePrincipalWorkspaceView(featureId) as PrincipalWorkspaceView,
                )
              }
              onHistoryAction={(featureId: string) =>
                navigatePrincipalView(
                  resolvePrincipalWorkspaceView(featureId) as PrincipalWorkspaceView,
                )
              }
              onAddStaff={() => navigatePrincipalView('invites')}
              onAddClassroom={() => setShowCreateClassroom(true)}
              onMarkEchoRead={() => {}}
              onApproveLeave={() => {}}
              onRejectLeave={() => {}}
              onShowAtRisk={() => {}}
              onNavigateToProfile={() => router.push('/profile')}
              onOpenCommons={() => router.push('/community')}
            />
          )}
        />
      </div>
      <CreateClassroomModalComponent
        isOpen={showCreateClassroom}
        onClose={() => setShowCreateClassroom(false)}
        onSuccess={() => onRefresh?.()}
      />
    </div>
  );
}
