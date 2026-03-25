import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useStore, useFeatureAccess, useCapabilities, mappingAPI, useTemporalStore } from '@repo/core';
import { approvalsAPI, adminCalendarAPI, adminInventoryAPI, insightsAPI, observationsAPI } from '../index';
import { PrincipalWorkspaceContainer } from './PrincipalWorkspaceContainer';
import { resolvePrincipalWorkspaceView, type PrincipalWorkspaceView } from '../principal/workspace';
import { staffOperationsAPI, type StaffPresenceSummary, type TeacherCarouselItem, type StaffLeaveDTO } from '@repo/people';
import { useSchoolPulse } from '@repo/profile';
import { SandboxBanner, hapticLight, WebScreenHeader } from '@repo/ui';
import { KnowledgeTopology } from '@repo/graphics';
import { useSchoolStats } from '../hooks/useSchoolStats';

const DEMO_PRINCIPAL_SCHOOL_ID = 'mock-school';

interface PrincipalDashboardWebProps {
  schoolId?: string;
  userId?: string;
  forceDemo?: boolean;
  onRefresh?: () => void;
  getStudentAttendancePulse: (schoolId: string, classroomId: string | undefined, viewDate: string) => Promise<any>;
  DashboardContentComponent: React.ComponentType<any>;
  HierarchyDashboardComponent: React.ComponentType<any>;
  InvitesDashboardComponent: React.ComponentType<any>;
  LogbookDashboardComponent: React.ComponentType<any>;
  CyclesDashboardComponent: React.ComponentType<any>;
  PrincipalOnboardingViewComponent: React.ComponentType<any>;
  CreateSchoolModalComponent: React.ComponentType<any>;
  CreateClassroomModalComponent: React.ComponentType<any>;
}

export default function PrincipalDashboardWeb({
  schoolId,
  userId,
  forceDemo,
  onRefresh,
  getStudentAttendancePulse,
  DashboardContentComponent,
  HierarchyDashboardComponent,
  InvitesDashboardComponent,
  LogbookDashboardComponent,
  CyclesDashboardComponent,
  PrincipalOnboardingViewComponent,
  CreateSchoolModalComponent,
  CreateClassroomModalComponent,
}: PrincipalDashboardWebProps) {
  const { user } = useStore();
  const { isGuest } = useFeatureAccess();
  const { policy } = useCapabilities();
  const { viewDate, isPastView } = useTemporalStore();
  const navigation = useNavigation<any>();

  const effectiveSchoolId = schoolId || user?.school_id || '';
  const effectiveUserId = userId || user?.id || '';
  const [isDemoMode, setIsDemoMode] = useState(forceDemo || false);

  const isDemo = isDemoMode || (!effectiveSchoolId && !isGuest);
  const principalSchoolId = effectiveSchoolId || (isDemoMode ? DEMO_PRINCIPAL_SCHOOL_ID : '');
  const showOnboarding = !effectiveSchoolId && !isDemoMode;

  const { stats: schoolStats, school } = useSchoolStats(principalSchoolId);
  const { pulse } = useSchoolPulse(principalSchoolId);

  const [activeView, setActiveView] = useState<PrincipalWorkspaceView>('main');
  const [presence, setPresence] = useState<StaffPresenceSummary | null>(null);
  const [teachers, setTeachers] = useState<TeacherCarouselItem[]>([]);
  const [studentPulse, setStudentPulse] = useState<any | null>(null);
  const [pendingLeaves, setPendingLeaves] = useState<StaffLeaveDTO[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [schoolTopology, setSchoolTopology] = useState<KnowledgeTopology | null>(null);
  const [topologyLoading, setTopologyLoading] = useState(true);
  const [echoItems, setEchoItems] = useState<any[]>([]);
  const [curriculumProgress, setCurriculumProgress] = useState<any[]>([]);
  const [resourceNeeds, setResourceNeeds] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  const [showCreateClassroom, setShowCreateClassroom] = useState(false);
  const [isCreateSchoolOpen, setIsCreateSchoolOpen] = useState(false);

  useEffect(() => {
    if (!principalSchoolId) return;
    let mounted = true;

    const loadTopology = async () => {
      setTopologyLoading(true);
      try {
        const data = await mappingAPI.getSchoolPulse(principalSchoolId, viewDate);
        if (mounted && data) setSchoolTopology(data);
      } catch {
      } finally {
        if (mounted) setTopologyLoading(false);
      }
    };

    void loadTopology();
    return () => {
      mounted = false;
    };
  }, [principalSchoolId, viewDate]);

  useEffect(() => {
    if (!principalSchoolId) return;
    let mounted = true;

    const loadDashboardData = async () => {
      setStaffLoading(true);
      try {
        const [pres, teacherList, sPulse, leaves, echo, curriculum, resources, events] = await Promise.all([
          staffOperationsAPI.getStaffPresenceSummary(principalSchoolId, viewDate),
          staffOperationsAPI.getTeacherCarousel(principalSchoolId, viewDate),
          getStudentAttendancePulse(principalSchoolId, undefined, viewDate),
          approvalsAPI.listPendingLeaveApprovals(principalSchoolId),
          insightsAPI.listFeedbackEchoes(principalSchoolId, 5, viewDate),
          insightsAPI.listCurriculumProgress(principalSchoolId),
          adminInventoryAPI.getResourceNeeds(principalSchoolId),
          adminCalendarAPI.listUpcomingEvents(principalSchoolId, 5, viewDate),
        ]);

        if (!mounted) return;
        setPresence(pres);
        setTeachers(teacherList);
        setStudentPulse(sPulse);
        setPendingLeaves(leaves);
        setEchoItems(echo ?? []);
        setCurriculumProgress(curriculum ?? []);
        setResourceNeeds(resources ?? []);
        setCalendarEvents(events ?? []);
      } catch (caughtError) {
        console.error('[PrincipalDashboard] Data load error:', caughtError);
      } finally {
        if (mounted) setStaffLoading(false);
      }
    };

    void loadDashboardData();
    return () => {
      mounted = false;
    };
  }, [getStudentAttendancePulse, principalSchoolId, viewDate]);

  useEffect(() => {
    if (!effectiveUserId) return;
    let mounted = true;

    const loadObservations = async () => {
      try {
        const data = await observationsAPI.listByDate(effectiveUserId, viewDate, 10);
        if (mounted) setObservations(data ?? []);
      } catch {
        if (mounted) setObservations([]);
      }
    };

    void loadObservations();
    return () => {
      mounted = false;
    };
  }, [effectiveUserId, viewDate]);

  const handleTryDemo = () => {
    hapticLight();
    setIsDemoMode(true);
  };

  const handleCreateSchool = () => setIsCreateSchoolOpen(true);
  const handleJoinSchool = () => navigation.navigate('Search' as any);
  const handleBackToDashboard = () => setActiveView('main');
  const canManageSchoolScope = !!principalSchoolId && (isDemoMode || policy.can('school.manage', { schoolId: principalSchoolId }));

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
      return <HierarchyDashboardComponent schoolId={principalSchoolId} isPastView={isPastView} onBack={handleBackToDashboard} />;
    }
    if (view === 'invites') {
      return <InvitesDashboardComponent schoolId={principalSchoolId} userId={effectiveUserId} isPastView={isPastView} onBack={handleBackToDashboard} />;
    }
    if (view === 'log' || view === 'notes') {
      return <LogbookDashboardComponent userId={effectiveUserId} schoolId={principalSchoolId} viewDate={viewDate} isPastView={isPastView} onBack={handleBackToDashboard} />;
    }
    if (view === 'cycles') {
      return <CyclesDashboardComponent schoolId={principalSchoolId} isPastView={isPastView} onBack={handleBackToDashboard} />;
    }
    return null;
  };

  if (showOnboarding) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
        <WebScreenHeader title="Gurudevi Principal" note="Educational Management Sanctuary" />
        <PrincipalOnboardingViewComponent onTryDemo={handleTryDemo} onCreateSchool={handleCreateSchool} onJoinSchool={handleJoinSchool} isGuest={isGuest} />
        <CreateSchoolModalComponent isOpen={isCreateSchoolOpen} onClose={() => setIsCreateSchoolOpen(false)} onSuccess={() => onRefresh?.()} />
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
          renderView={({ activeView: nextView }) => renderPrincipalView(nextView)}
          renderMain={() => (
            <DashboardContentComponent
              school={school}
              user={user}
              stats={schoolStats}
              presence={presence}
              resonanceScore={pulse?.resonance_score ?? 0}
              pulse={pulse}
              echoItems={echoItems}
              teachers={teachers}
              studentPulse={studentPulse}
              atRiskCount={studentPulse?.atRiskCount ?? 0}
              pendingLeaves={pendingLeaves}
              calendarEvents={calendarEvents}
              schoolTopology={schoolTopology}
              topologyLoading={topologyLoading}
              staffLoading={staffLoading}
              curriculumProgress={curriculumProgress}
              resourceNeeds={resourceNeeds}
              isPastView={isPastView}
              observations={observations}
              onNavigate={navigatePrincipalView}
              onAddAction={(featureId: string) => navigatePrincipalView(resolvePrincipalWorkspaceView(featureId))}
              onHistoryAction={(featureId: string) => navigatePrincipalView(resolvePrincipalWorkspaceView(featureId))}
              onAddStaff={() => navigatePrincipalView('invites')}
              onAddClassroom={() => setShowCreateClassroom(true)}
              onMarkEchoRead={() => {}}
              onApproveLeave={() => {}}
              onRejectLeave={() => {}}
              onShowAtRisk={() => {}}
              onNavigateToProfile={() => navigation.navigate('SchoolProfile', { schoolId: principalSchoolId })}
              onOpenCommons={() => navigation.navigate('Main', { screen: 'Community' })}
            />
          )}
        />
      </div>
      <CreateClassroomModalComponent isOpen={showCreateClassroom} onClose={() => setShowCreateClassroom(false)} onSuccess={() => onRefresh?.()} />
    </div>
  );
}
