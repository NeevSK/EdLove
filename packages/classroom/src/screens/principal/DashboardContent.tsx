import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
    WebScreenHeader, 
    TemporalNavigator, 
    SkeletonCard 
} from '@repo/ui';
import { UniversalPerspective } from '@repo/library';
import { Activity, Users, Heart, ClipboardCheck, TrendingUp, Search, Plus, Calendar, Settings, Bell, MessageSquare, Clock, GraduationCap, FileText, LayoutGrid, Building2, UserPlus, BookOpen, Share2 } from 'lucide-react-native';
import { 
    MorningSituationalBrief,
    PulseDashboard,
    TeacherCarousel,
    LeaveApprovalSection,
    InstitutionalCalendarSection,
    PrincipalObservationsSection,
    ResourceNeedsDashboard,
    DashboardEcho,
    ManagementStation
} from '../principal';
import { type PrincipalWorkspaceView } from '@repo/admin';
import { InstitutionalArcCard } from './InstitutionalArcCard';
import { getPrincipalFeatureScopeMeta } from './PrincipalIAScope';

interface DashboardContentProps {
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
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
    school, user, stats, presence, resonanceScore, pulse, echoItems,
    teachers, studentPulse, atRiskCount, pendingLeaves, calendarEvents,
    schoolTopology, topologyLoading, staffLoading, curriculumProgress, resourceNeeds,
    isPastView, onNavigate, onAddStaff, onAddClassroom, onMarkEchoRead,
    onApproveLeave, onRejectLeave, onShowAtRisk, onNavigateToProfile, onOpenCommons,
    onAddAction, onHistoryAction, observations = []
}) => {
    const { t } = useTranslation();
    const renderScopeBadge = (featureId: string) => {
        const scopeMeta = getPrincipalFeatureScopeMeta(featureId);
        if (!scopeMeta) return null;
        return (
            <span
                title={t(scopeMeta.scopeHelpTextKey)}
                style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    background: 'var(--background-alt)',
                    color: 'var(--ink-ghost)',
                    letterSpacing: '0.4px',
                }}
            >
                {t(scopeMeta.scopeBadgeLabelKey)}
            </span>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '64px' }}>
            {/* 1. Command Header */}
            <WebScreenHeader
                title={<>School <span style={{ color: 'var(--lotus)' }}>Ecosystem</span>.</>}
                note={`Welcome back, ${user?.full_name?.split(' ')[0] || 'Principal'}. Here is your situational brief.`}
                timeText={school?.name || 'School Ecosystem'}
                actions={(
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                            className="premium-button"
                            disabled={isPastView}
                            style={{ background: 'var(--lotus)', display: 'flex', alignItems: 'center', gap: '8px', opacity: isPastView ? 0.5 : 1, cursor: isPastView ? 'not-allowed' : 'pointer' }}
                            onClick={() => onAddAction('hierarchy')}
                        >
                            <Plus size={18} /> {t('principal.ia.actions.hierarchyCta') || 'Shape School Structure'}
                            {renderScopeBadge('hierarchy')}
                        </button>
                        <button
                            className="secondary-button"
                            disabled={isPastView}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: isPastView ? 0.5 : 1, cursor: isPastView ? 'not-allowed' : 'pointer' }}
                            onClick={() => onAddAction('invites')}
                        >
                            <Users size={18} /> {t('principal.ia.actions.invitesCta') || 'Invite Faculty Roles'}
                            {renderScopeBadge('invites')}
                        </button>
                        <button className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={onNavigateToProfile}>
                            <Building2 size={18} /> {t('principal.ia.actions.profileCta') || 'Institution Profile'}
                            {renderScopeBadge('school_profile')}
                        </button>
                        <button className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--water)', borderColor: 'var(--water)' }} onClick={onOpenCommons}>
                            <Share2 size={18} /> {t('principal.ia.actions.commonsCta') || 'Open Community Commons'}
                            {renderScopeBadge('open_commons')}
                        </button>
                    </div>
                )}
            />

            <div>
                <TemporalNavigator />
            </div>

            {/* 2. Morning Briefing */}
            <InstitutionalArcCard 
                featureId="morning_brief"
                title="Morning Brief"
                onAdd={() => onAddAction('morning_brief')}
                onHistory={() => onHistoryAction('morning_brief')}
                icon={Clock}
            >
                <MorningSituationalBrief stats={stats} presence={presence} resonanceScore={resonanceScore} schoolId={school?.id} />
            </InstitutionalArcCard>

            {/* 3. Command Center & Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <ManagementStation onAction={onNavigate} />
                    
                    <InstitutionalArcCard 
                        featureId="faculty_overview"
                        title="Faculty Overview"
                        onAdd={() => onAddAction('faculty_overview')}
                        onHistory={() => onHistoryAction('faculty_overview')}
                        icon={Heart}
                    >
                        <TeacherCarousel teachers={teachers} loading={staffLoading} onAddStaff={onAddStaff} />
                    </InstitutionalArcCard>

                    {/* School Topology Pulse */}
                    <InstitutionalArcCard 
                        featureId="hierarchy"
                        title="School Topology"
                        onAdd={() => onAddAction('hierarchy')}
                        onHistory={() => onHistoryAction('hierarchy')}
                        icon={Building2}
                    >
                        <div style={{ height: '320px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                            {topologyLoading ? <SkeletonCard /> : <UniversalPerspective topology={schoolTopology as any} onNodePress={() => { }} />}
                        </div>
                    </InstitutionalArcCard>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <InstitutionalArcCard 
                        featureId="student_pulse"
                        title="Student Pulse"
                        onAdd={() => onAddAction('student_pulse')}
                        onHistory={() => onHistoryAction('student_pulse')}
                        icon={Activity}
                    >
                        <PulseDashboard pulse={studentPulse} atRiskCount={atRiskCount} onShowAtRisk={onShowAtRisk} />
                    </InstitutionalArcCard>

                    <InstitutionalArcCard 
                        featureId="pending_approvals"
                        title="Pending Approvals"
                        onAdd={() => onAddAction('pending_approvals')}
                        onHistory={() => onHistoryAction('pending_approvals')}
                        icon={FileText}
                    >
                        <LeaveApprovalSection leaves={pendingLeaves} onApprove={onApproveLeave} onReject={onRejectLeave} />
                    </InstitutionalArcCard>

                    <InstitutionalArcCard 
                        featureId="ecosystem_resonance"
                        title="Ecosystem Resonance"
                        onAdd={() => onAddAction('ecosystem_resonance')}
                        onHistory={() => onHistoryAction('ecosystem_resonance')}
                        icon={Building2}
                    >
                        <DashboardEcho pulse={pulse} echoItems={echoItems} onMarkRead={onMarkEchoRead} />
                    </InstitutionalArcCard>

                    {/* Curriculum & Resources mini-widgets */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <ResourceNeedsDashboard progress={curriculumProgress} isSummary />
                        <ResourceNeedsDashboard needs={resourceNeeds} isSummary />
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px' }}>
                <InstitutionalArcCard 
                    featureId="institutional_calendar"
                    title="Institutional Calendar"
                    onAdd={() => onAddAction('institutional_calendar')}
                    onHistory={() => onHistoryAction('institutional_calendar')}
                    icon={Calendar}
                >
                    <InstitutionalCalendarSection events={calendarEvents} />
                </InstitutionalArcCard>
                
                <InstitutionalArcCard 
                    featureId="relief"
                    title="Relief Management"
                    onAdd={() => onAddAction('relief')}
                    onHistory={() => onHistoryAction('relief')}
                    icon={UserPlus}
                >
                    <PrincipalObservationsSection observations={observations} />
                </InstitutionalArcCard>
            </div>
        </div>
    );
};
