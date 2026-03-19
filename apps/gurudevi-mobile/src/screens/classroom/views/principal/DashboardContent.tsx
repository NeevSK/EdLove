import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
    WebScreenHeader, 
    TemporalNavigator, 
    SkeletonCard 
} from '@repo/ui';
import { UniversalPerspective } from '@repo/library';
import { 
    Users, 
    Building, 
    Share2, 
    Plus,
    Building2,
    Activity,
    Package,
    Clock,
    Heart,
    FileText,
    Calendar,
    Layout,
    UserPlus,
    BookOpen
} from 'lucide-react-native';
import { PrincipalView } from './types';
import { MorningBrief } from './MorningBrief';
import { FacultyOverview } from './FacultyOverview';
import { StudentPulse } from './StudentPulse';
import { EcosystemPulse } from './EcosystemPulse';
import { CommandCenter } from './CommandCenter';
import { PendingApprovals } from './PendingApprovals';
import { InstitutionalCalendar } from './InstitutionalCalendar';
import { InstitutionalArcCard } from './InstitutionalArcCard';

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
    onNavigate: (view: PrincipalView) => void;
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
                            <Plus size={18} /> Establish Hierarchy
                        </button>
                        <button
                            className="secondary-button"
                            disabled={isPastView}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: isPastView ? 0.5 : 1, cursor: isPastView ? 'not-allowed' : 'pointer' }}
                            onClick={() => onAddAction('invites')}
                        >
                            <Users size={18} /> Invite Staff
                        </button>
                        <button className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={onNavigateToProfile}>
                            <Building size={18} /> School Profile
                        </button>
                        <button className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--water)', borderColor: 'var(--water)' }} onClick={onOpenCommons}>
                            <Share2 size={18} /> Open Commons
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
                <MorningBrief 
                    stats={stats} 
                    presence={presence} 
                    resonanceScore={resonanceScore} 
                />
            </InstitutionalArcCard>

            {/* 3. Command Center & Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <CommandCenter onNavigate={onNavigate} />
                    
                    <InstitutionalArcCard 
                        featureId="faculty_overview"
                        title="Faculty Overview"
                        onAdd={() => onAddAction('faculty_overview')}
                        onHistory={() => onHistoryAction('faculty_overview')}
                        icon={Heart}
                    >
                        <FacultyOverview 
                            teachers={teachers} 
                            loading={staffLoading} 
                            onAddStaff={onAddStaff} 
                        />
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
                        <StudentPulse 
                            pulse={studentPulse} 
                            atRiskCount={atRiskCount} 
                            onShowAtRisk={onShowAtRisk} 
                        />
                    </InstitutionalArcCard>

                    <InstitutionalArcCard 
                        featureId="pending_approvals"
                        title="Pending Approvals"
                        onAdd={() => onAddAction('pending_approvals')}
                        onHistory={() => onHistoryAction('pending_approvals')}
                        icon={FileText}
                    >
                        <PendingApprovals 
                            leaves={pendingLeaves} 
                            processingId={null} 
                            onApprove={onApproveLeave} 
                            onReject={onRejectLeave} 
                        />
                    </InstitutionalArcCard>

                    <InstitutionalArcCard 
                        featureId="ecosystem_resonance"
                        title="Ecosystem Resonance"
                        onAdd={() => onAddAction('ecosystem_resonance')}
                        onHistory={() => onHistoryAction('ecosystem_resonance')}
                        icon={Building2}
                    >
                        <EcosystemPulse 
                            pulse={pulse} 
                            echoItems={echoItems} 
                            onMarkRead={onMarkEchoRead} 
                            onReply={() => {}} 
                        />
                    </InstitutionalArcCard>

                    {/* Curriculum & Resources mini-widgets */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="sanctuary-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '3px solid var(--lotus)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--lotus)' }}>
                                <Activity size={14} /> <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>Curriculum</span>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '700' }}>{Math.round(curriculumProgress?.[0]?.coverage ?? 0)}% Complete</div>
                        </div>
                        <div className="sanctuary-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '3px solid var(--water)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--water)' }}>
                                <Package size={14} /> <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>Resources</span>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '700' }}>{resourceNeeds.length} Urgent Needs</div>
                        </div>
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
                    <InstitutionalCalendar events={calendarEvents} />
                </InstitutionalArcCard>
                
                <InstitutionalArcCard 
                    featureId="relief"
                    title="Relief Management"
                    onAdd={() => onAddAction('relief')}
                    onHistory={() => onHistoryAction('relief')}
                    icon={UserPlus}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {observations.slice(0, 3).map(o => (
                            <div key={o.id} style={{ padding: '12px', borderRadius: '12px', background: 'var(--background-alt)', fontSize: '13px' }}>
                                <div style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)', marginBottom: '4px' }}>{o.type}</div>
                                {o.content}
                            </div>
                        ))}
                    </div>
                </InstitutionalArcCard>
            </div>
        </div>
    );
};
