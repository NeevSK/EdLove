import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRole, useStore, staffManagementAPI, supabase, StaffPresenceSummary, TeacherCarouselItem, StudentAttendancePulse, StaffLeaveDTO } from '@repo/core';
import { useSchoolStats, CreateClassroomModal, AddStudentModal } from '@repo/classroom';
import { useSchoolPulse } from '@repo/profile';
import { SkeletonCard, SandboxBanner, getInitialsFromName } from '@repo/ui';
import {
    Users,
    Shield,
    TrendingUp,
    Plus,
    CheckCircle2,
    GraduationCap,
    AlertTriangle,
    UserCheck,
    CalendarOff,
    BookOpen,
    Zap,
    Building,
    Activity,
    UserPlus,
    Share2,
    MessageSquare,
    Heart,
    CalendarCheck,
    NotebookPen,
} from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

const LEAVE_STATUS_COLORS: Record<string, string> = {
    pending: 'var(--amber-glow)',
    approved: 'var(--moss)',
    rejected: 'var(--ember)',
};

const PRESENCE_STATUS_COLORS: Record<string, string> = {
    present: 'var(--moss)',
    absent: 'var(--ember)',
    on_leave: 'var(--amber-glow)',
    late: 'var(--water)',
    half_day: 'var(--lotus)',
};

function presenceColor(present: number, total: number): string {
    if (total === 0) return 'var(--ink-ghost)';
    const pct = present / total;
    if (pct >= 0.9) return 'var(--moss)';
    if (pct >= 0.7) return 'var(--amber-glow)';
    return 'var(--ember)';
}

export default function PrincipalSchoolViewWeb({ schoolId, userId }: { schoolId?: string; userId?: string }) {
    const { t } = useTranslation();
    const { user, isDemoMode } = useStore();
    const effectiveSchoolId = schoolId || user?.school_id || '';
    const effectiveUserId = userId || user?.id || '';

    const { stats: schoolStats, school, isLoading: statsLoading } = useSchoolStats(effectiveSchoolId);
    const { pulse, loading: pulseLoading } = useSchoolPulse(effectiveSchoolId);

    const [presence, setPresence] = useState<StaffPresenceSummary | null>(null);
    const [teachers, setTeachers] = useState<TeacherCarouselItem[]>([]);
    const [studentPulse, setStudentPulse] = useState<StudentAttendancePulse | null>(null);
    const [pendingLeaves, setPendingLeaves] = useState<StaffLeaveDTO[]>([]);
    const [staffLoading, setStaffLoading] = useState(true);
    const [showCreateClassroom, setShowCreateClassroom] = useState(false);
    const [showAddTeacher, setShowAddTeacher] = useState(false);
    const [processingLeave, setProcessingLeave] = useState<string | null>(null);

    // ── Echo / Feedback from teachers ─────────────────────────────────────
    const [echoItems, setEchoItems] = useState<Array<{
        id: string; source: string; category: string; content: string;
        priority: string; is_read: boolean; created_at: string;
    }>>([]);
    const [echoLoading, setEchoLoading] = useState(true);

    useEffect(() => {
        if (!effectiveSchoolId) return;
        let mounted = true;
        const loadEcho = async () => {
            setEchoLoading(true);
            try {
                const { data, error } = await supabase
                    .from('school_echo_feedback')
                    .select('*')
                    .eq('school_id', effectiveSchoolId)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (!mounted) return;
                if (error || !data?.length) {
                    // Sandbox fallback — same mock used by the native DashboardEcho
                    setEchoItems([
                        { id: 'e1', source: 'teacher', category: 'support',     content: 'Need guidance on the 2026 Mathematics syllabus transition for Grade 6.', priority: 'high',   is_read: false, created_at: new Date().toISOString() },
                        { id: 'e2', source: 'student', category: 'morale',      content: 'The new common area is great! Everyone is enjoying the study space.',      priority: 'low',    is_read: true,  created_at: new Date(Date.now() - 3600000).toISOString() },
                        { id: 'e3', source: 'teacher', category: 'facility',    content: 'Multimedia projector in Room 4 is flickering intermittently.',              priority: 'medium', is_read: false, created_at: new Date(Date.now() - 86400000).toISOString() },
                    ]);
                } else {
                    setEchoItems(data);
                }
            } catch {
                setEchoItems([]);
            } finally {
                if (mounted) setEchoLoading(false);
            }
        };
        loadEcho();
        return () => { mounted = false; };
    }, [effectiveSchoolId]);

    // ── Calendar events ────────────────────────────────────────────────────
    const [calendarEvents, setCalendarEvents] = useState<Array<{
        id: string; title: string; type: string; start_date: string; end_date?: string;
    }>>([]);
    const [calendarLoading, setCalendarLoading] = useState(true);

    useEffect(() => {
        if (!effectiveSchoolId) return;
        let mounted = true;
        (async () => {
            setCalendarLoading(true);
            try {
                const today = new Date().toISOString().split('T')[0];
                const { data, error } = await supabase
                    .from('school_calendar_events')
                    .select('*')
                    .eq('school_id', effectiveSchoolId)
                    .gte('start_date', today)
                    .order('start_date', { ascending: true })
                    .limit(5);
                if (!mounted) return;
                if (error || !data?.length) {
                    const y = new Date().getFullYear();
                    setCalendarEvents([
                        { id: 'c1', title: 'Second Term Begins', type: 'term_start', start_date: `${y}-04-07` },
                        { id: 'c2', title: 'Mid-Year Examinations', type: 'exam', start_date: `${y}-06-10`, end_date: `${y}-06-21` },
                        { id: 'c3', title: 'Sports Day', type: 'event', start_date: `${y}-05-15` },
                        { id: 'c4', title: 'Vesak Holiday', type: 'holiday', start_date: `${y}-05-12` },
                    ]);
                } else {
                    setCalendarEvents(data);
                }
            } catch {
                setCalendarEvents([]);
            } finally {
                if (mounted) setCalendarLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [effectiveSchoolId]);

    // ── Observations ───────────────────────────────────────────────────────
    const [observations, setObservations] = useState<Array<{
        id: string; type: string; content: string; created_at: string;
    }>>([]);
    const [obsLoading, setObsLoading] = useState(true);
    const [obsContent, setObsContent] = useState('');
    const [obsType, setObsType] = useState('note');
    const [savingObs, setSavingObs] = useState(false);

    useEffect(() => {
        if (!effectiveUserId) return;
        let mounted = true;
        (async () => {
            setObsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('principal_observations')
                    .select('*')
                    .eq('principal_id', effectiveUserId)
                    .order('created_at', { ascending: false })
                    .limit(5);
                if (!mounted) return;
                if (error || !data?.length) {
                    setObservations([
                        { id: 'o1', type: 'walkthrough', content: 'Grade 8A math class — excellent collaborative problem-solving observed. Recommend for school showcase.', created_at: new Date(Date.now() - 7200000).toISOString() },
                        { id: 'o2', type: 'concern',     content: 'Library attendance dropped 30% this month. Follow up with librarian to investigate causes.', created_at: new Date(Date.now() - 86400000).toISOString() },
                    ]);
                } else {
                    setObservations(data);
                }
            } catch {
                setObservations([]);
            } finally {
                if (mounted) setObsLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [effectiveUserId]);

    const handleSaveObservation = async () => {
        if (!obsContent.trim() || !effectiveUserId || !effectiveSchoolId) return;
        setSavingObs(true);
        try {
            await supabase.from('principal_observations').insert({
                principal_id: effectiveUserId,
                school_id: effectiveSchoolId,
                type: obsType,
                content: obsContent.trim(),
            });
            setObsContent('');
            // Reload
            const { data } = await supabase.from('principal_observations').select('*').eq('principal_id', effectiveUserId).order('created_at', { ascending: false }).limit(5);
            setObservations(data ?? observations);
        } catch { /**/ }
        finally { setSavingObs(false); }
    };

    useEffect(() => {
        if (!effectiveSchoolId) return;
        let mounted = true;
        const loadStaffData = async () => {
            setStaffLoading(true);
            try {
                const [pres, teacherList, pulse, leaves] = await Promise.all([
                    staffManagementAPI.getStaffPresenceSummary(effectiveSchoolId),
                    staffManagementAPI.getTeacherCarousel(effectiveSchoolId),
                    staffManagementAPI.getStudentAttendancePulse(effectiveSchoolId),
                    staffManagementAPI.getPendingLeaves(effectiveSchoolId),
                ]);
                if (!mounted) return;
                setPresence(pres);
                setTeachers(teacherList);
                setStudentPulse(pulse);
                setPendingLeaves(leaves.slice(0, 5));
            } catch (e) {
                console.error('[PrincipalSchoolView] Error loading staff data:', e);
            } finally {
                if (mounted) setStaffLoading(false);
            }
        };
        loadStaffData();
        return () => { mounted = false; };
    }, [effectiveSchoolId]);

    const attendancePct = studentPulse?.todayRate ?? 0;
    const resonanceScore = pulse?.resonance_score ?? 0;

    return (
        <>
            {isDemoMode && <SandboxBanner />}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                {/* ─── VISIONARY SANDBOX BANNER (ghost data) ─────── */}
                {(schoolStats as any)?.is_sample && (
                    <div style={{
                        background: 'rgba(245,158,11,0.1)',
                        border: '1px solid var(--amber-glow)',
                        borderRadius: '12px',
                        padding: '20px 24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        alignItems: 'center',
                        textAlign: 'center',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--amber-glow)', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <Zap size={16} fill="var(--amber-glow)" />
                            {t('demoMode.sandboxPerspective')}
                        </div>
                        <p style={{ margin: 0, color: 'var(--ink-ghost)', fontSize: '14px' }}>
                            {t('principal.sandboxDescription')}
                        </p>
                    </div>
                )}

                {/* ─── 1. COMMAND HEADER ─────────────────────────── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ padding: '8px', background: 'var(--lotus-soft)', borderRadius: '8px', color: 'var(--lotus)' }}>
                                <Shield size={20} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--ink-ghost)' }}>
                                {school?.name || 'School Ecosystem'}
                            </span>
                        </div>
                        <h1 style={{ fontSize: '40px', fontWeight: '800', margin: 0 }}>
                            School <span style={{ color: 'var(--lotus)' }}>Ecosystem</span>.
                        </h1>
                        <p style={{ color: 'var(--ink-ghost)', marginTop: '8px', fontSize: '14px' }}>
                            Welcome back, {user?.full_name?.split(' ')[0] || 'Principal'}. Here is your situational brief.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button className="premium-button" style={{ background: 'var(--lotus)', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowCreateClassroom(true)}>
                            <Plus size={18} /> Establish Hierarchy
                        </button>
                        <button className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowAddTeacher(true)}>
                            <Users size={18} /> Invite Staff
                        </button>
                    </div>
                </div>

                {/* ─── 2. MORNING BRIEF BANNER ───────────────────── */}
                <div className="sanctuary-card" style={{ padding: '32px', background: 'var(--lotus-soft)', border: '1px solid var(--lotus-soft)' }}>
                    {statsLoading || staffLoading ? (
                        <SkeletonCard />
                    ) : (
                        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <h3 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--lotus)', marginBottom: '12px' }}>Morning Briefing</h3>
                                <p style={{ fontSize: '15px', fontWeight: '600', lineHeight: '1.6', margin: 0 }}>
                                    {presence && presence.total > 0
                                        ? `${presence.present} of ${presence.total} staff present today. `
                                        : 'Staff presence data loading. '}
                                    {pendingLeaves.length > 0
                                        ? `${pendingLeaves.length} leave request${pendingLeaves.length > 1 ? 's' : ''} await your approval.`
                                        : 'No pending leave requests.'}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '32px', flexShrink: 0, flexWrap: 'wrap' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '28px', fontWeight: '800', color: presenceColor(attendancePct, 100) }}>
                                        {attendancePct > 0 ? `${Math.round(attendancePct)}%` : '—'}
                                    </div>
                                    <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--ink-ghost)' }}>STUDENT ATTENDANCE</div>
                                </div>
                                {!pulseLoading && pulse && (
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '28px', fontWeight: '800', color: resonanceScore >= 70 ? 'var(--moss)' : resonanceScore >= 40 ? 'var(--amber-glow)' : 'var(--ember)' }}>
                                            {Math.round(resonanceScore)}%
                                        </div>
                                        <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--ink-ghost)' }}>RESONANCE</div>
                                    </div>
                                )}
                                {schoolStats && (
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '28px', fontWeight: '800' }}>
                                            {schoolStats.total_classrooms ?? '—'}
                                        </div>
                                        <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--ink-ghost)' }}>CLASSROOMS</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── 3. MAIN GRID ──────────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '32px' }}>

                    {/* LEFT: Faculty & Student Pulse */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                        {/* Faculty Carousel */}
                        <div className="sanctuary-card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                                    Faculty Overview
                                    {presence && (
                                        <span style={{ marginLeft: '10px', fontSize: '12px', color: presenceColor(presence.present, presence.total), fontWeight: '700' }}>
                                            {presence.present}/{presence.total} present
                                        </span>
                                    )}
                                </h3>
                                <button style={{ color: 'var(--lotus)', background: 'transparent', border: 'none', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }} onClick={() => setShowCreateClassroom(true)}>+ New Classroom</button>
                            </div>
                            {staffLoading ? (
                                <SkeletonCard />
                            ) : teachers.length === 0 ? (
                                <p style={{ color: 'var(--ink-ghost)', fontSize: '14px' }}>No teachers enrolled yet.</p>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
                                    {teachers.slice(0, 6).map(teacher => (
                                        <div key={teacher.userId} style={{ padding: '16px', background: 'var(--background-alt)', borderRadius: '16px' }}>
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '18px',
                                                background: 'var(--water)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                marginBottom: '12px', color: 'white', fontWeight: '800', fontSize: '13px'
                                            }}>
                                                {getInitialsFromName(teacher.fullName)}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <div style={{ fontSize: '13px', fontWeight: '700' }}>{teacher.fullName.split(' ')[0]}</div>
                                                <div style={{
                                                    width: '8px', height: '8px', borderRadius: '4px',
                                                    background: PRESENCE_STATUS_COLORS[teacher.todayStatus ?? ''] ?? 'var(--border)',
                                                    flexShrink: 0
                                                }} title={teacher.todayStatus ?? 'Unknown'} />
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--ink-ghost)', marginBottom: '8px', textTransform: 'capitalize' }}>
                                                {teacher.role.replace(/_/g, ' ')}
                                            </div>
                                            <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--water)', textTransform: 'uppercase' }}>
                                                {teacher.classroomCount} class{teacher.classroomCount !== 1 ? 'es' : ''}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Student Pulse */}
                        <div className="sanctuary-card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Student Pulse</h3>
                            </div>
                            {staffLoading ? (
                                <SkeletonCard />
                            ) : studentPulse ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                    {[
                                        {
                                            label: 'Today\'s Attendance',
                                            value: studentPulse.todayRate > 0 ? `${Math.round(studentPulse.todayRate)}%` : '—',
                                            icon: CheckCircle2,
                                            color: attendancePct >= 90 ? 'var(--moss)' : attendancePct >= 75 ? 'var(--amber-glow)' : 'var(--ember)',
                                            sub: studentPulse.yesterdayRate > 0
                                                ? `Yesterday: ${Math.round(studentPulse.yesterdayRate)}%`
                                                : 'No data for yesterday'
                                        },
                                        {
                                            label: 'At-Risk Students',
                                            value: String(studentPulse.atRiskCount),
                                            icon: AlertTriangle,
                                            color: studentPulse.atRiskCount > 0 ? 'var(--ember)' : 'var(--moss)',
                                            sub: studentPulse.atRiskCount > 0 ? 'Needs attention' : 'All on track'
                                        },
                                        {
                                            label: 'Total Students',
                                            value: schoolStats?.total_students != null ? String(schoolStats.total_students) : '—',
                                            icon: GraduationCap,
                                            color: 'var(--water)',
                                            sub: schoolStats?.total_classrooms != null ? `Across ${schoolStats.total_classrooms} classes` : ''
                                        },
                                    ].map((item, i) => (
                                        <div key={i} style={{ padding: '20px', background: 'var(--background-alt)', borderRadius: '16px' }}>
                                            <div style={{ color: item.color, marginBottom: '12px' }}>
                                                <item.icon size={20} />
                                            </div>
                                            <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>{item.value}</div>
                                            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</div>
                                            {item.sub && <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>{item.sub}</div>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: 'var(--ink-ghost)', fontSize: '14px' }}>No student data available yet.</p>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Approvals & Ecosystem Pulse */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                        {/* Pending Leave Approvals */}
                        <div className="sanctuary-card" style={{ padding: '24px' }}>
                            <h3 style={{ margin: '0 0 20px', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)' }}>
                                Pending Approvals
                                {pendingLeaves.length > 0 && (
                                    <span style={{ marginLeft: '8px', padding: '3px 8px', background: 'var(--amber-glow)', color: 'white', borderRadius: '6px', fontSize: '11px' }}>
                                        {pendingLeaves.length}
                                    </span>
                                )}
                            </h3>
                            {staffLoading ? (
                                <SkeletonCard />
                            ) : pendingLeaves.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                    <CheckCircle2 size={24} color="var(--moss)" style={{ marginBottom: 8 }} />
                                    <p style={{ color: 'var(--ink-ghost)', fontSize: '13px', margin: 0 }}>No pending leave requests.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {pendingLeaves.map(leave => (
                                        <div key={leave.id} style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <CalendarOff size={14} />
                                                    {leave.leave_type.charAt(0).toUpperCase() + leave.leave_type.slice(1)} Leave
                                                </div>
                                                <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>
                                                    {new Date(leave.start_date).toLocaleDateString()} — {new Date(leave.end_date).toLocaleDateString()}
                                                </div>
                                                {leave.created_at && (
                                                    <div style={{ fontSize: '10px', color: 'var(--ink-ghost)', marginTop: '2px' }}>
                                                        {formatDistanceToNow(new Date(leave.created_at), { addSuffix: true })}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    disabled={processingLeave === leave.id}
                                                    onClick={async () => {
                                                        setProcessingLeave(leave.id);
                                                        const ok = await staffManagementAPI.approveLeave(leave.id, effectiveUserId, true);
                                                        if (ok) setPendingLeaves(prev => prev.filter(l => l.id !== leave.id));
                                                        setProcessingLeave(null);
                                                    }}
                                                    style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--moss-soft)', color: 'var(--moss)', border: 'none', fontWeight: '700', fontSize: '11px', cursor: 'pointer', opacity: processingLeave === leave.id ? 0.5 : 1 }}
                                                >
                                                    {processingLeave === leave.id ? '…' : 'Approve'}
                                                </button>
                                                <button
                                                    disabled={processingLeave === leave.id}
                                                    onClick={async () => {
                                                        setProcessingLeave(leave.id);
                                                        const ok = await staffManagementAPI.approveLeave(leave.id, effectiveUserId, false);
                                                        if (ok) setPendingLeaves(prev => prev.filter(l => l.id !== leave.id));
                                                        setProcessingLeave(null);
                                                    }}
                                                    style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--background-alt)', color: 'var(--ink-ghost)', border: 'none', fontWeight: '700', fontSize: '11px', cursor: 'pointer', opacity: processingLeave === leave.id ? 0.5 : 1 }}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Ecosystem Pulse */}
                        {!pulseLoading && pulse && (
                            <div className="sanctuary-card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800' }}>Ecosystem Pulse</h3>
                                    <Activity size={16} color={pulse.trend === 'rising' ? 'var(--moss)' : pulse.trend === 'failing' ? 'var(--ember)' : 'var(--water)'} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
                                            <span>Resonance Score</span>
                                            <span style={{ color: resonanceScore >= 70 ? 'var(--moss)' : resonanceScore >= 40 ? 'var(--amber-glow)' : 'var(--ember)' }}>
                                                {Math.round(resonanceScore)}%
                                            </span>
                                        </div>
                                        <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ width: `${resonanceScore}%`, height: '100%', background: 'var(--lotus)', borderRadius: '3px', transition: 'width 0.6s ease' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>
                                            <span>Participation Rate</span>
                                            <span style={{ color: 'var(--water)' }}>{Math.round(pulse.participation_rate)}%</span>
                                        </div>
                                        <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ width: `${pulse.participation_rate}%`, height: '100%', background: 'var(--water)', borderRadius: '3px', transition: 'width 0.6s ease' }} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <TrendingUp size={14} color={pulse.trend === 'rising' ? 'var(--moss)' : 'var(--ink-ghost)'} />
                                        <span style={{ fontSize: '12px', color: 'var(--ink-ghost)', textTransform: 'capitalize' }}>
                                            Trend: {pulse.trend}
                                        </span>
                                    </div>
                                    {pulse.top_subjects.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase', marginBottom: '8px' }}>Top Subjects</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                {pulse.top_subjects.slice(0, 4).map(s => (
                                                    <span key={s} style={{ padding: '3px 10px', background: 'var(--background-alt)', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* School Stats quick view */}
                        {schoolStats && (
                            <div className="sanctuary-card" style={{ padding: '24px' }}>
                                <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '800' }}>School Overview</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        { label: 'Teachers', value: String(schoolStats.total_teachers ?? 0), icon: UserCheck },
                                        { label: 'Classrooms', value: String(schoolStats.total_classrooms ?? 0), icon: BookOpen },
                                        { label: 'Students', value: String(schoolStats.total_students ?? 0), icon: GraduationCap },
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--background-alt)', borderRadius: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '600' }}>
                                                <item.icon size={16} color="var(--ink-ghost)" />
                                                {item.label}
                                            </div>
                                            <span style={{ fontSize: '16px', fontWeight: '800' }}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ─── Dashboard Echo (teacher/student feedback) ── */}
                        <div className="sanctuary-card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '800' }}>{t('principal.echo.title') || 'Echo Chamber'}</h3>
                                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--ink-ghost)' }}>{t('principal.echo.subtitle') || 'Feedback from your staff & students'}</p>
                                </div>
                            </div>
                            {echoLoading ? (
                                <SkeletonCard />
                            ) : echoItems.length === 0 ? (
                                <p style={{ color: 'var(--ink-ghost)', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', padding: '16px 0' }}>
                                    {t('principal.echo.empty') || 'No feedback yet.'}
                                </p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {echoItems.map(item => {
                                        const CategoryIcon = item.category === 'morale' ? Heart
                                            : item.category === 'facility' ? AlertTriangle
                                            : item.category === 'recognition' ? CheckCircle2
                                            : MessageSquare;
                                        const borderColor = item.priority === 'high' ? 'var(--ember)' : 'var(--lotus)';
                                        return (
                                            <div key={item.id} style={{
                                                padding: '14px',
                                                background: item.is_read ? 'var(--background-alt)' : 'var(--background)',
                                                border: '1px solid var(--border-light)',
                                                borderLeft: `4px solid ${borderColor}`,
                                                borderRadius: '10px',
                                                display: 'flex',
                                                gap: '12px',
                                                alignItems: 'flex-start',
                                            }}>
                                                <div style={{ padding: '8px', background: 'var(--background-alt)', borderRadius: '8px', flexShrink: 0 }}>
                                                    <CategoryIcon size={16} color="var(--lotus)" />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>
                                                            {item.source} · {item.category}
                                                        </span>
                                                        <span style={{ fontSize: '10px', color: 'var(--ink-ghost)' }}>
                                                            {new Date(item.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                                                        {item.content}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* ─── Institutional Calendar ─────────────────── */}
                        <div className="sanctuary-card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CalendarCheck size={16} color="var(--water)" /> Upcoming Events
                                </h3>
                            </div>
                            {calendarLoading ? (
                                <SkeletonCard />
                            ) : calendarEvents.length === 0 ? (
                                <p style={{ color: 'var(--ink-ghost)', fontSize: '13px', fontStyle: 'italic', textAlign: 'center', padding: '12px 0' }}>No upcoming events.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {calendarEvents.slice(0, 4).map(evt => {
                                        const typeColors: Record<string, string> = { term_start: 'var(--water)', exam: 'var(--ember)', holiday: 'var(--moss)', event: 'var(--sanctuary-saffron)', other: 'var(--ink-ghost)' };
                                        const color = typeColors[evt.type] ?? 'var(--ink-ghost)';
                                        return (
                                            <div key={evt.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', background: 'var(--background-alt)' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '13px', fontWeight: '700' }}>{evt.title}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>
                                                        {new Date(evt.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                        {evt.end_date && ` – ${new Date(evt.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                                                    </div>
                                                </div>
                                                <span style={{ padding: '2px 6px', background: `${color}22`, borderRadius: '4px', fontSize: '10px', fontWeight: '700', color, textTransform: 'uppercase' }}>
                                                    {evt.type.replace('_', ' ')}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* ─── Principal Observations ─────────────────── */}
                        <div className="sanctuary-card" style={{ padding: '24px' }}>
                            <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <NotebookPen size={16} color="var(--sanctuary-saffron)" /> My Observations
                            </h3>

                            {/* Quick-add form */}
                            <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    {(['walkthrough', 'note', 'concern', 'praise'] as const).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setObsType(type)}
                                            style={{ flex: 1, padding: '6px 4px', borderRadius: '8px', border: `1px solid ${obsType === type ? 'var(--sanctuary-saffron)' : 'var(--border)'}`, background: obsType === type ? 'rgba(245,158,11,0.08)' : 'var(--background-alt)', color: obsType === type ? 'var(--sanctuary-saffron)' : 'var(--ink-ghost)', fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: '700', cursor: 'pointer', textTransform: 'uppercase' }}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={obsContent}
                                    onChange={(e: any) => setObsContent(e.target.value)}
                                    placeholder="Quick observation…"
                                    rows={2}
                                    style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '13px', width: '100%', boxSizing: 'border-box' as const, resize: 'vertical' as const }}
                                />
                                <button
                                    className="premium-button"
                                    style={{ alignSelf: 'flex-end', fontSize: '12px', padding: '6px 14px', background: 'var(--sanctuary-saffron)' }}
                                    onClick={handleSaveObservation}
                                    disabled={!obsContent.trim() || savingObs}
                                >
                                    {savingObs ? '⏳' : '+ Log'}
                                </button>
                            </div>

                            {obsLoading ? (
                                <SkeletonCard />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {observations.map(obs => {
                                        const obsColors: Record<string, string> = { walkthrough: 'var(--water)', note: 'var(--ink-ghost)', concern: 'var(--ember)', praise: 'var(--moss)' };
                                        const color = obsColors[obs.type] ?? 'var(--ink-ghost)';
                                        return (
                                            <div key={obs.id} style={{ padding: '12px', borderRadius: '10px', borderLeft: `3px solid ${color}`, background: 'var(--background-alt)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                    <span style={{ fontSize: '10px', fontWeight: '800', color, textTransform: 'uppercase' }}>{obs.type}</span>
                                                    <span style={{ fontSize: '10px', color: 'var(--ink-ghost)' }}>{new Date(obs.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '12px', lineHeight: '1.5', color: 'var(--ink)' }}>{obs.content}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Modals ──────────────────────────────────────── */}
            <CreateClassroomModal
                isOpen={showCreateClassroom}
                onClose={() => setShowCreateClassroom(false)}
                onSuccess={() => setShowCreateClassroom(false)}
            />
            <AddStudentModal
                isOpen={showAddTeacher}
                onClose={() => setShowAddTeacher(false)}
                onSuccess={() => setShowAddTeacher(false)}
                classroomId=""
                studentToEdit={null}
            />
        </>
    );
}
