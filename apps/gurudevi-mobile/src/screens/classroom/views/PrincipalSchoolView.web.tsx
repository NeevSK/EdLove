import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRole, useStore, staffManagementAPI, StaffPresenceSummary, TeacherCarouselItem, StudentAttendancePulse, StaffLeaveDTO } from '@repo/core';
import { useSchoolStats } from '@repo/classroom';
import { useSchoolPulse } from '@repo/profile';
import { SkeletonCard } from '@repo/ui';
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
    Activity
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

function getInitials(name: string): string {
    return name.split(' ').map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2);
}

function presenceColor(present: number, total: number): string {
    if (total === 0) return 'var(--ink-ghost)';
    const pct = present / total;
    if (pct >= 0.9) return 'var(--moss)';
    if (pct >= 0.7) return 'var(--amber-glow)';
    return 'var(--ember)';
}

export default function PrincipalSchoolViewWeb({ schoolId, userId }: { schoolId?: string; userId?: string }) {
    const { t } = useTranslation();
    const { user } = useStore();
    const effectiveSchoolId = schoolId || user?.school_id || '';
    const effectiveUserId = userId || user?.id || '';

    const { stats: schoolStats, school, isLoading: statsLoading } = useSchoolStats(effectiveSchoolId);
    const { pulse, loading: pulseLoading } = useSchoolPulse(effectiveSchoolId);

    const [presence, setPresence] = useState<StaffPresenceSummary | null>(null);
    const [teachers, setTeachers] = useState<TeacherCarouselItem[]>([]);
    const [studentPulse, setStudentPulse] = useState<StudentAttendancePulse | null>(null);
    const [pendingLeaves, setPendingLeaves] = useState<StaffLeaveDTO[]>([]);
    const [staffLoading, setStaffLoading] = useState(true);

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
        <div className="sub-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '32px', height: '100%' }}>

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
                    <button className="premium-button" style={{ background: 'var(--lotus)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} /> Establish Hierarchy
                    </button>
                    <button className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                            <button style={{ color: 'var(--lotus)', background: 'transparent', border: 'none', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}>View All</button>
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
                                            {getInitials(teacher.fullName)}
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
                                <CheckCircle2 size={24} color="var(--moss)" style={{ marginBottom: '8px' }} />
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
                                            <button style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--moss-soft)', color: 'var(--moss)', border: 'none', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}>
                                                Approve
                                            </button>
                                            <button style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--background-alt)', color: 'var(--ink-ghost)', border: 'none', fontWeight: '700', fontSize: '11px', cursor: 'pointer' }}>
                                                Review
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
                </div>
            </div>
        </div>
    );
}
