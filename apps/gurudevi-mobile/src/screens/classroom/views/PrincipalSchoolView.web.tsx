import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { 
    useStore, 
    staffManagementAPI, 
    supabase, 
    api, 
    schoolAPI, 
    StaffPresenceSummary, 
    TeacherCarouselItem, 
    StudentAttendancePulse, 
    StaffLeaveDTO, 
    useFeatureAccess,
    mappingAPI,
    useTemporalStore 
} from '@repo/core';
import { 
    useSchoolStats, 
    CreateClassroomModal, 
    AddStudentModal, 
    CreateSchoolModal,
    useSchoolSections,
    useSchoolInvites,
    usePrincipalObservations
} from '@repo/classroom';
import { useSchoolPulse } from '@repo/profile';
import { SkeletonCard, SandboxBanner, hapticLight, WebScreenHeader } from '@repo/ui';
import { KnowledgeTopology } from '@repo/graphics';

// Sub-components
import PrincipalOnboardingView from '../components/PrincipalOnboardingView';
import { PrincipalView } from './principal/types';
import { DashboardContent } from './principal/DashboardContent';
import { HierarchyView } from './principal/HierarchyView';
import { InvitesView } from './principal/InvitesView';
import { LogbookView } from './principal/LogbookView';
import { CyclesView } from './principal/CyclesView';

export default function PrincipalSchoolViewWeb({ schoolId, userId, forceDemo, onRefresh }: { schoolId?: string; userId?: string; forceDemo?: boolean; onRefresh?: () => void }) {
    const { t } = useTranslation();
    const { user } = useStore();
    const { isGuest } = useFeatureAccess();
    const { viewDate, isPastView } = useTemporalStore();
    const navigation = useNavigation<any>();
    
    const effectiveSchoolId = schoolId || user?.school_id || '';
    const effectiveUserId = userId || user?.id || '';
    
    // Controlled demo mode state
    const [isDemoMode, setIsDemoMode] = useState(forceDemo || false);
    
    // Logic: If no school and not explicitly in demo mode, show onboarding.
    const isDemo = isDemoMode || (!effectiveSchoolId && !isGuest);
    const showOnboarding = !effectiveSchoolId && !isDemoMode;

    // ── Data Hooks ──────────────────────────────────────────────────────────
    const { stats: schoolStats, school, isLoading: statsLoading } = useSchoolStats(effectiveSchoolId);
    const { pulse, loading: pulseLoading } = useSchoolPulse(effectiveSchoolId);

    const [activeView, setActiveView] = useState<PrincipalView>('main');

    // Dashboard State
    const [presence, setPresence] = useState<StaffPresenceSummary | null>(null);
    const [teachers, setTeachers] = useState<TeacherCarouselItem[]>([]);
    const [studentPulse, setStudentPulse] = useState<StudentAttendancePulse | null>(null);
    const [pendingLeaves, setPendingLeaves] = useState<StaffLeaveDTO[]>([]);
    const [staffLoading, setStaffLoading] = useState(true);
    const [schoolTopology, setSchoolTopology] = useState<KnowledgeTopology | null>(null);
    const [topologyLoading, setTopologyLoading] = useState(true);
    const [echoItems, setEchoItems] = useState<any[]>([]);
    const [curriculumProgress, setCurriculumProgress] = useState<any[]>([]);
    const [resourceNeeds, setResourceNeeds] = useState<any[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

    // Modals
    const [showCreateClassroom, setShowCreateClassroom] = useState(false);
    const [showAddTeacher, setShowAddTeacher] = useState(false);
    const [isCreateSchoolOpen, setIsCreateSchoolOpen] = useState(false);

    // ── Topology & Ecosystem Loaders ────────────────────────────────────────
    useEffect(() => {
        if (!effectiveSchoolId) return;
        let mounted = true;
        const loadTopology = async () => {
            setTopologyLoading(true);
            try {
                const data = await mappingAPI.getSchoolPulse(effectiveSchoolId, viewDate);
                if (mounted && data) setSchoolTopology(data);
            } catch { /**/ } finally { if (mounted) setTopologyLoading(false); }
        };
        loadTopology();
        return () => { mounted = false; };
    }, [effectiveSchoolId, viewDate]);

    useEffect(() => {
        if (!effectiveSchoolId) return;
        let mounted = true;
        const loadDashboardData = async () => {
            setStaffLoading(true);
            try {
                const [pres, teacherList, sPulse, leaves, echo, curriculum, resources, events] = await Promise.all([
                    staffManagementAPI.getStaffPresenceSummary(effectiveSchoolId, viewDate),
                    staffManagementAPI.getTeacherCarousel(effectiveSchoolId, viewDate),
                    staffManagementAPI.getStudentAttendancePulse(effectiveSchoolId, undefined, viewDate),
                    staffManagementAPI.getPendingLeaves(effectiveSchoolId),
                    supabase.from('school_echo_feedback').select('*').eq('school_id', effectiveSchoolId).lte('created_at', viewDate + 'T23:59:59.999Z').order('created_at', { ascending: false }).limit(5),
                    supabase.from('curriculum_progress').select('*').eq('school_id', effectiveSchoolId).order('grade', { ascending: true }),
                    api.inventory.getSchoolResourceNeeds(effectiveSchoolId),
                    supabase.from('school_calendar_events').select('*').eq('school_id', effectiveSchoolId).gte('start_date', viewDate).limit(5)
                ]);

                if (!mounted) return;
                setPresence(pres);
                setTeachers(teacherList);
                setStudentPulse(sPulse);
                setPendingLeaves(leaves);
                setEchoItems(echo.data ?? []);
                setCurriculumProgress(curriculum.data ?? []);
                setResourceNeeds(resources ?? []);
                setCalendarEvents(events.data ?? []);
            } catch (err) {
                console.error('[PrincipalSchoolView] Data load error:', err);
            } finally {
                if (mounted) setStaffLoading(false);
            }
        };
        loadDashboardData();
        return () => { mounted = false; };
    }, [effectiveSchoolId, viewDate]);

    // Shared Observations (minimized for main dashboard, full for sub-view)
    const { observations, saveObservation } = usePrincipalObservations(effectiveUserId, effectiveSchoolId, viewDate);

    // ── Handlers ────────────────────────────────────────────────────────────
    const handleTryDemo = () => { hapticLight(); setIsDemoMode(true); };
    const handleCreateSchool = () => setIsCreateSchoolOpen(true);
    const handleJoinSchool = () => navigation.navigate('Search' as any);
    const handleBackToDashboard = () => setActiveView('main');

    // ── Render ──────────────────────────────────────────────────────────────
    if (showOnboarding) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
                <WebScreenHeader title="Gurudevi Principal" note="Educational Management Sanctuary" />
                <PrincipalOnboardingView onTryDemo={handleTryDemo} onCreateSchool={handleCreateSchool} onJoinSchool={handleJoinSchool} isGuest={isGuest} />
                <CreateSchoolModal isOpen={isCreateSchoolOpen} onClose={() => setIsCreateSchoolOpen(false)} onSuccess={() => onRefresh?.()} />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            {isDemo && <SandboxBanner />}
            
            <div style={{ padding: '0px 24px 40px' }}>
                {activeView === 'main' && (
                    <DashboardContent 
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
                        onNavigate={setActiveView}
                        onAddAction={(featureId) => {
                            if (featureId === 'morning_brief') setShowAddTeacher(true);
                            if (featureId === 'faculty_overview') setActiveView('invites');
                            // Add other mappings as needed
                        }}
                        onHistoryAction={(featureId) => {
                            if (featureId === 'log') setActiveView('log');
                            // Add other mappings as needed
                        }}
                        onAddStaff={() => setActiveView('invites')}
                        onAddClassroom={() => setShowCreateClassroom(true)}
                        onMarkEchoRead={() => {}} 
                        onApproveLeave={() => {}}
                        onRejectLeave={() => {}}
                        onShowAtRisk={() => {}}
                        onNavigateToProfile={() => navigation.navigate('SchoolProfile', { schoolId: effectiveSchoolId })}
                        onOpenCommons={() => navigation.navigate('Main', { screen: 'Community' })}
                    />
                )}

                {activeView === 'hierarchy' && (
                    <HierarchyView schoolId={effectiveSchoolId} isPastView={isPastView} onBack={handleBackToDashboard} />
                )}

                {activeView === 'invites' && (
                    <InvitesView schoolId={effectiveSchoolId} userId={effectiveUserId} isPastView={isPastView} onBack={handleBackToDashboard} />
                )}

                {activeView === 'log' && (
                    <LogbookView userId={effectiveUserId} schoolId={effectiveSchoolId} viewDate={viewDate} isPastView={isPastView} onBack={handleBackToDashboard} />
                )}

                {activeView === 'cycles' && (
                    <CyclesView schoolId={effectiveSchoolId} isPastView={isPastView} onBack={handleBackToDashboard} />
                )}
            </div>

            {/* Global Modals */}
            <CreateClassroomModal isOpen={showCreateClassroom} onClose={() => setShowCreateClassroom(false)} onSuccess={() => onRefresh?.()} />
            {/* Note: AddStudentModal is for students in classrooms, for staff we use InvitesView for now */}
            <AddStudentModal isOpen={showAddTeacher} onClose={() => setShowAddTeacher(false)} classroomId="" studentToEdit={null} onSuccess={() => onRefresh?.()} />
        </div>
    );
}
