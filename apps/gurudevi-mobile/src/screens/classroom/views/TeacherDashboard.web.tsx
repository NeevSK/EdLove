import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRole, useStore, supabase, MOCK_CLASSROOMS } from '@repo/core';
import { useNavigation } from '@react-navigation/native';
import { Classroom } from '@repo/core';
import { SkeletonCard, SandboxBanner, WebScreenHeader, PositiveInvitation, TemporalNavigator } from '@repo/ui';
import { useClassroomRoleData, CreateClassroomModal } from '@repo/classroom';
import { useTemporalStore } from '@repo/core';
import {
    Plus,
    Users,
    BookOpen,
    ScanLine,
    ShieldCheck,
    Search,
    Filter,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    UserPlus,
    BarChart3,
    School,
    Archive,
    ClipboardList,
    MessageCircle,
    X,
    GraduationCap,
    FileText,
    Calendar,
    ArrowRightLeft,
    CheckSquare,
    DollarSign,
} from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';


// ── Mock data enriched for demo teacher view ─────────────────────────────────
const DEMO_CLASSROOMS = MOCK_CLASSROOMS.filter(c => !(c as any).is_school).map((c, i) => ({
    ...c,
    student_count: [28, 35, 22][i] ?? 20,
    last_activity: [
        '2 hours ago',
        'Yesterday',
        '3 days ago',
    ][i] ?? 'Recently',
}));

const DEMO_RECENT_ASSIGNMENTS = [
    { id: 'da1', title: 'Wave Function Practice', classroom: 'Grade 10 - Mathematics', due_date: new Date(Date.now() + 3 * 86400000).toISOString(), submissions: 12, total: 28 },
    { id: 'da2', title: 'Lab Report: Photosynthesis', classroom: 'Grade 11 - Science', due_date: new Date(Date.now() + 5 * 86400000).toISOString(), submissions: 7, total: 35 },
    { id: 'da3', title: 'Short Story Composition', classroom: 'Grade 10 - English', due_date: new Date(Date.now() + 7 * 86400000).toISOString(), submissions: 0, total: 22 },
];

export default function TeacherDashboardWeb({ forceDemo }: { forceDemo?: boolean } = {}) {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { user } = useStore();
    const { role, userId } = useUserRole();
    // forceDemo takes precedence; falls back to false for real users
    const isDemo = forceDemo === true;
    const [searchQuery, setSearchQuery] = useState('');
    const [classrooms, setClassrooms] = useState<(Classroom & { student_count?: number; last_activity?: string })[]>([]);
    const [classroomsLoading, setClassroomsLoading] = useState(true);
    const [showCreateClassroom, setShowCreateClassroom] = useState(false);
    const [showEchoModal, setShowEchoModal] = useState(false);
    const [echoCategory, setEchoCategory] = useState('support');
    const [echoPriority, setEchoPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [echoContent, setEchoContent] = useState('');
    const [echoSubmitting, setEchoSubmitting] = useState(false);
    const { isPastView } = useTemporalStore();

    // Echo history (teacher's sent echoes + principal responses)
    const [sentEchoes, setSentEchoes] = useState<Array<{
        id: string; category: string; content: string; priority: string;
        is_read: boolean; principal_response?: string; responded_at?: string; created_at: string;
    }>>([]);
    const [sentEchoesLoading, setSentEchoesLoading] = useState(false);
    const [showEchoHistory, setShowEchoHistory] = useState(false);
    const { data: roleData } = useClassroomRoleData();

    useEffect(() => {
        // ── Demo mode: show mock classrooms instantly ─────────────────────
        if (isDemo) {
            setClassrooms(DEMO_CLASSROOMS as any);
            setClassroomsLoading(false);
            return;
        }
        // ── Real fetch ────────────────────────────────────────────────────
        const fetchClassrooms = async () => {
            if (!userId) { setClassroomsLoading(false); return; }
            setClassroomsLoading(true);
            try {
                let query = supabase
                    .from('classrooms')
                    .select('*')
                    .eq('is_archived', false);

                if (role === 'teacher') {
                    query = query.eq('teacher_id', userId);
                } else if (role === 'grade_head' || role === 'section_head') {
                    query = query.eq('school_id', user?.school_id ?? '');
                }

                const { data, error } = await query.order('created_at', { ascending: false });
                if (!error && data) {
                    const classroomIds = data.map((c: Classroom) => c.id);
                    const countData = classroomIds.length > 0
                        ? (await supabase.from('classroom_students').select('classroom_id').in('classroom_id', classroomIds)).data
                        : [];
                    const countMap: Record<string, number> = {};
                    (countData ?? []).forEach((row: { classroom_id: string }) => {
                        countMap[row.classroom_id] = (countMap[row.classroom_id] ?? 0) + 1;
                    });
                    setClassrooms(data.map((cls: Classroom) => ({ ...cls, student_count: countMap[cls.id] ?? 0 })));
                }
            } catch (err) {
                console.error('[TeacherDashboard] Error fetching classrooms:', err);
            } finally {
                setClassroomsLoading(false);
            }
        };
        fetchClassrooms();
    }, [userId, role, user?.school_id, isDemo]);

    const loadSentEchoes = async () => {
        if (!userId) return;
        setSentEchoesLoading(true);
        try {
            const { data } = await supabase
                .from('school_echo_feedback')
                .select('id, category, content, priority, is_read, principal_response, responded_at, created_at')
                .eq('teacher_id', userId)
                .order('created_at', { ascending: false })
                .limit(10);
            setSentEchoes(data ?? []);
        } catch { /**/ }
        finally { setSentEchoesLoading(false); }
    };

    const filtered = classrooms.filter(cls =>
        cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cls.subject?.toLowerCase() ?? '').includes(searchQuery.toLowerCase())
    );

    const totalStudents = classrooms.reduce((acc, cls) => acc + (cls.student_count ?? 0), 0);

    const attendanceRate = isDemo ? '94%' : '—';
    const engagementScore = isDemo ? '87%' : '—';

    return (
        <>
            {isDemo && <SandboxBanner />}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Header & Quick Actions */}
                <WebScreenHeader
                    title={<>Registry & <span style={{ color: 'var(--sanctuary-saffron)' }}>Resonance</span>.</>}
                    note={isDemo ? 'Demo view — Sanduni Perera · Gurudevi Life School' : `Welcome back, ${user?.full_name?.split(' ')[0] ?? 'Teacher'}`}
                    timeText="Classroom Management"
                    actions={(
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <button 
                                className="premium-button" 
                                style={{ background: 'var(--sanctuary-saffron)', display: 'flex', alignItems: 'center', gap: '8px', opacity: isPastView ? 0.5 : 1 }} 
                                onClick={() => { if (isDemo || isPastView) return; setShowCreateClassroom(true); }}
                                disabled={isPastView}
                            >
                                <Plus size={18} />
                                Create Classroom
                            </button>
                            <button 
                                className="secondary-button" 
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: isPastView ? 0.5 : 1 }} 
                                onClick={() => { if (isPastView) return; navigation.navigate('Timetable', {}); }}
                                disabled={isPastView}
                            >
                                📅 Timetable
                            </button>
                            <button 
                                className="secondary-button" 
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: isPastView ? 0.5 : 1 }}
                                disabled={isPastView}
                                onClick={() => { if (isPastView) return; }}
                            >
                                <ScanLine size={18} />
                                Scan QR
                            </button>
                            <button
                                className="secondary-button"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', borderColor: 'var(--ember)', color: 'var(--ember)', opacity: isPastView ? 0.5 : 1 }}
                                onClick={() => { if (isPastView) return; setShowEchoModal(true); }}
                                disabled={isPastView}
                            >
                                <MessageCircle size={18} />
                                {t('teacher.actions.principalEcho') || 'Principal Echo'}
                            </button>
                            <button
                                className="secondary-button"
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}
                                onClick={() => { setShowEchoHistory(h => !h); if (!showEchoHistory) loadSentEchoes(); }}
                            >
                                <ClipboardList size={18} />
                                My Echoes
                                {sentEchoes.filter(e => e.principal_response && !e.is_read).length > 0 && (
                                    <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--moss)', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {sentEchoes.filter(e => e.principal_response && !e.is_read).length}
                                    </span>
                                )}
                            </button>
                        </div>
                    )}
                />

                {/* Temporal Travel */}
                <div style={{ maxWidth: '400px' }}>
                    <TemporalNavigator />
                </div>

                {/* Performance Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
                    {[
                        { label: t('classroom.activeClasses') || 'Active Classes', value: classroomsLoading ? '—' : String(classrooms.length), icon: School, color: 'var(--lotus)' },
                        { label: t('classroom.totalStudents') || 'Total Students', value: classroomsLoading ? '—' : String(totalStudents), icon: UserPlus, color: 'var(--water)' },
                        { label: t('classroom.avgAttendance') || 'Avg. Attendance', value: attendanceRate, icon: CheckCircle2, color: 'var(--moss)' },
                        { label: t('classroom.engagement') || 'Engagement', value: engagementScore, icon: BarChart3, color: 'var(--sanctuary-saffron)' },
                    ].map((stat, i) => (
                        <div key={i} className="sanctuary-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ padding: '12px', background: 'var(--background-alt)', borderRadius: '12px', color: stat.color }}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>{stat.label}</div>
                                <div style={{ fontSize: '24px', fontWeight: '800' }}>
                                    {stat.value}{isDemo && stat.value !== '—' && <span style={{ fontSize: '14px', color: 'var(--sanctuary-saffron)', marginLeft: 4 }}>✦</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Two-column layout: classrooms + sidebar ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>

                    {/* Classroom Registry Table */}
                    <div className="sanctuary-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                                Your Classrooms
                                {!classroomsLoading && (
                                    <span style={{ marginLeft: '10px', padding: '4px 8px', background: 'var(--background-alt)', borderRadius: '6px', fontSize: '11px', color: 'var(--ink-ghost)', fontWeight: '700' }}>
                                        {classrooms.length} Total
                                    </span>
                                )}
                            </h3>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div className="search-box" style={{ width: '220px' }}>
                                    <Search size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search classrooms..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--ink)', width: '100%', outline: 'none', fontSize: '14px' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {classroomsLoading ? (
                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                                <PositiveInvitation
                                    type="empty"
                                    title={isDemo ? "Begin your Teaching Journey" : "No Classrooms found"}
                                    description={isDemo 
                                        ? "You're exploring a demo environment. Ready to host your own classes and lead your students? Establish your digital sanctuary today."
                                        : "You haven't created any classrooms yet. Start by establishing your first sanctuary."
                                    }
                                    actionLabel="Create My First Classroom"
                                    onAction={() => setShowCreateClassroom(true)}
                                />
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ background: 'var(--background-alt)', color: 'var(--ink-ghost)', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>
                                        <tr>
                                            <th style={{ padding: '16px 24px' }}>Classroom Name</th>
                                            <th style={{ padding: '16px 24px' }}>Subject</th>
                                            <th style={{ padding: '16px 24px' }}>Students</th>
                                            <th style={{ padding: '16px 24px' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ fontSize: '14px' }}>
                                        {filtered.map(cls => (
                                            <tr
                                                key={cls.id}
                                                style={{ borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                                                onClick={() => navigation.navigate('ClassroomDetails', { classroomId: cls.id, classroomName: cls.name })}
                                                onMouseOver={e => (e.currentTarget.style.background = 'var(--background-alt)')}
                                                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                                            >
                                                <td style={{ padding: '20px 24px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: (cls as any).color_theme ?? 'var(--sanctuary-saffron)', opacity: 0.8 }} />
                                                        <div>
                                                            <div style={{ fontWeight: '800', fontSize: '14px' }}>{cls.name}</div>
                                                            {(cls as any).last_activity && <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>Active {(cls as any).last_activity}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 24px', color: 'var(--ink-ghost)' }}>{cls.subject || '—'}</td>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <GraduationCap size={14} color="var(--water)" />
                                                        {cls.student_count ?? 0}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '20px 24px' }}>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            className="secondary-button"
                                                            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                            onClick={e => { e.stopPropagation(); navigation.navigate('Attendance', { classroomId: cls.id, classroomName: cls.name }); }}
                                                        >
                                                            <ClipboardList size={13} />
                                                            Attend
                                                        </button>
                                                        <button
                                                            className="secondary-button"
                                                            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                            onClick={e => { e.stopPropagation(); navigation.navigate('Gradebook', { classroomId: cls.id, classroomName: cls.name }); }}
                                                        >
                                                            <CheckSquare size={13} />
                                                            Grades
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* ── Sidebar ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Upcoming Assignments */}
                        <div className="sanctuary-card" style={{ padding: '20px' }}>
                            <h4 style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)', letterSpacing: '1px' }}>
                                Recent Assignments
                            </h4>
                            {isDemo ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {DEMO_RECENT_ASSIGNMENTS.map(a => (
                                        <div key={a.id} style={{ padding: '12px', background: 'var(--background-alt)', borderRadius: '10px' }}>
                                            <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>{a.title}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--ink-ghost)', marginBottom: '6px' }}>{a.classroom}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '11px', color: 'var(--ink-ghost)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={10} /> Due {new Date(a.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                </span>
                                                <span style={{ fontSize: '11px', color: a.submissions > 0 ? 'var(--moss)' : 'var(--ink-ghost)', fontWeight: '700' }}>
                                                    {a.submissions}/{a.total} submitted
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: 'var(--ink-ghost)', fontSize: '13px', fontStyle: 'italic' }}>No upcoming assignments.</p>
                            )}
                        </div>

                        {/* Admin Quick Actions */}
                        <div className="sanctuary-card" style={{ padding: '20px' }}>
                            <h4 style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)', letterSpacing: '1px' }}>
                                Administrative Portal
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                {[
                                    { icon: FileText, label: 'Reports', color: 'var(--water)', action: () => classrooms[0] && navigation.navigate('ClassroomDetails', { classroomId: classrooms[0].id, classroomName: classrooms[0].name }) },
                                    { icon: Calendar, label: 'Schedule', color: 'var(--sanctuary-saffron)', action: () => navigation.navigate('Timetable', {}) },
                                    { icon: ClipboardList, label: 'Attendance', color: 'var(--moss)', action: () => classrooms[0] && navigation.navigate('Attendance', { classroomId: classrooms[0].id, classroomName: classrooms[0].name }) },
                                    { icon: CheckSquare, label: 'Grades', color: 'var(--lotus)', action: () => classrooms[0] && navigation.navigate('Gradebook', { classroomId: classrooms[0].id, classroomName: classrooms[0].name }) },
                                    { icon: ArrowRightLeft, label: 'Relief', color: 'var(--ember)', action: () => {} },
                                    { icon: DollarSign, label: 'Fees', color: 'var(--amber-glow)', action: () => {} },
                                ].map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={item.action}
                                        style={{ padding: '12px 8px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-body)' }}
                                    >
                                        <div style={{ padding: '6px', background: `${item.color}22`, borderRadius: '6px' }}>
                                            <item.icon size={16} color={item.color} />
                                        </div>
                                        <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--ink-ghost)' }}>{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Student count summary */}
                        {isDemo && (
                            <div className="sanctuary-card" style={{ padding: '20px' }}>
                                <h4 style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)', letterSpacing: '1px' }}>
                                    Student Snapshot
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {DEMO_CLASSROOMS.map((cls, i) => (
                                        <div key={cls.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: '600' }}>{cls.name}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ width: `${[85, 92, 78][i] ?? 80}px`, height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${[85, 92, 78][i] ?? 80}%`, height: '100%', background: 'var(--moss)', borderRadius: '3px' }} />
                                                </div>
                                                <span style={{ fontSize: '11px', color: 'var(--moss)', fontWeight: '700' }}>{[85, 92, 78][i] ?? 80}%</span>
                                            </div>
                                        </div>
                                    ))}
                                    <div style={{ fontSize: '11px', color: 'var(--ink-ghost)', marginTop: '4px', fontStyle: 'italic' }}>Attendance rate today</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Classroom Modal */}
            <CreateClassroomModal
                isOpen={showCreateClassroom}
                onClose={() => setShowCreateClassroom(false)}
                onSuccess={(newClass) => {
                    setClassrooms(prev => [newClass, ...prev]);
                    setShowCreateClassroom(false);
                }}
            />

            {/* ── Principal Echo Modal ──────────────────────────── */}
            {showEchoModal && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }} onClick={() => setShowEchoModal(false)}>
                    <div style={{
                        background: 'var(--background)', borderRadius: '16px', padding: '32px',
                        width: '100%', maxWidth: '480px', margin: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800' }}>
                                    {t('teacher.feedback.title') || 'Principal Echo'}
                                </h2>
                                <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-ghost)' }}>
                                    {t('teacher.feedback.subtitle') || 'Send a reflection or request to your principal'}
                                </p>
                            </div>
                            <button onClick={() => setShowEchoModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-ghost)', padding: '4px' }}>
                                <X size={22} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Category */}
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--ink-ghost)', display: 'block', marginBottom: '8px' }}>
                                    {t('teacher.feedback.category') || 'Category'}
                                </label>
                                <select
                                    value={echoCategory}
                                    onChange={e => setEchoCategory(e.target.value)}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background-alt)', fontSize: '14px', color: 'var(--ink)' }}
                                >
                                    <option value="support">Teaching Support</option>
                                    <option value="morale">Staff Morale</option>
                                    <option value="facility">Facility / Resource Alert</option>
                                    <option value="recognition">Recognition / Positive Note</option>
                                </select>
                            </div>

                            {/* Priority */}
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--ink-ghost)', display: 'block', marginBottom: '8px' }}>
                                    {t('teacher.feedback.priority') || 'Priority'}
                                </label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {(['low', 'medium', 'high'] as const).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setEchoPriority(p)}
                                            style={{
                                                flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', cursor: 'pointer',
                                                background: echoPriority === p ? (p === 'high' ? 'var(--ember)' : 'var(--lotus)') : 'var(--background-alt)',
                                                color: echoPriority === p ? '#fff' : 'var(--ink-ghost)',
                                                border: `1px solid ${p === 'high' ? 'var(--ember)' : 'var(--border)'}`,
                                            }}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Content */}
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--ink-ghost)', display: 'block', marginBottom: '8px' }}>
                                    {t('teacher.feedback.content') || 'Your Message'}
                                </label>
                                <textarea
                                    value={echoContent}
                                    onChange={e => setEchoContent(e.target.value)}
                                    placeholder={t('teacher.feedback.placeholder') || 'Share your thoughts with the principal…'}
                                    rows={4}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background-alt)', fontSize: '14px', color: 'var(--ink)', resize: 'vertical', boxSizing: 'border-box' }}
                                />
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button className="secondary-button" style={{ flex: 1 }} onClick={() => setShowEchoModal(false)}>
                                    {t('common.cancel') || 'Cancel'}
                                </button>
                                <button
                                    className="premium-button"
                                    style={{ flex: 2, background: 'var(--lotus)', opacity: echoSubmitting || !echoContent.trim() ? 0.6 : 1, cursor: echoSubmitting || !echoContent.trim() ? 'not-allowed' : 'pointer' }}
                                    disabled={echoSubmitting || !echoContent.trim()}
                                    onClick={async () => {
                                        if (!echoContent.trim() || !user?.school_id) return;
                                        setEchoSubmitting(true);
                                        try {
                                            await supabase.from('school_echo_feedback').insert({
                                                school_id: user.school_id,
                                                teacher_id: userId,
                                                source: 'teacher',
                                                category: echoCategory,
                                                content: echoContent.trim(),
                                                priority: echoPriority,
                                                is_read: false,
                                            });
                                            setEchoContent('');
                                            setShowEchoModal(false);
                                            // Refresh history if panel is open
                                            if (showEchoHistory) loadSentEchoes();
                                        } catch (err) {
                                            console.error('[PrincipalEcho] submit error', err);
                                        } finally {
                                            setEchoSubmitting(false);
                                        }
                                    }}
                                >
                                    {echoSubmitting ? '…' : (t('common.send') || 'Send')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── My Echo History Panel ─────────────────────────── */}
            {showEchoHistory && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 8000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
                    onClick={e => e.target === e.currentTarget && setShowEchoHistory(false)}>
                    <div style={{ background: 'var(--background)', borderRadius: '20px 20px 0 0', padding: '28px', width: '100%', maxWidth: '640px', maxHeight: '70vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>My Feedback History</h3>
                            <button onClick={() => setShowEchoHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--ink-ghost)' }}>✕</button>
                        </div>
                        {sentEchoesLoading ? (
                            [1,2,3].map(i => <div key={i} style={{ height: '60px', background: 'var(--background-alt)', borderRadius: '10px', marginBottom: '10px' }} />)
                        ) : sentEchoes.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--ink-ghost)', fontStyle: 'italic' }}>
                                No echoes sent yet. Use the "Principal Echo" button to share feedback.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {sentEchoes.map(e => (
                                    <div key={e.id} style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-light)', borderLeft: `4px solid ${e.priority === 'high' ? 'var(--ember)' : 'var(--lotus)'}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)' }}>
                                                {e.category} · {e.priority}
                                                {e.is_read && <span style={{ marginLeft: '6px', color: 'var(--moss)' }}>✓ read</span>}
                                            </span>
                                            <span style={{ fontSize: '10px', color: 'var(--ink-ghost)' }}>{new Date(e.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p style={{ margin: '0 0 6px', fontSize: '13px', lineHeight: '1.5' }}>{e.content}</p>
                                        {e.principal_response ? (
                                            <div style={{ marginTop: '8px', padding: '10px 12px', background: 'rgba(212,132,58,0.08)', borderRadius: '8px', borderLeft: '3px solid var(--sanctuary-saffron)' }}>
                                                <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--sanctuary-saffron)', textTransform: 'uppercase', marginBottom: '4px' }}>Principal's Reply</div>
                                                <p style={{ margin: 0, fontSize: '12px', lineHeight: '1.5' }}>{e.principal_response}</p>
                                                {e.responded_at && <div style={{ fontSize: '10px', color: 'var(--ink-ghost)', marginTop: '4px' }}>{formatDistanceToNow(new Date(e.responded_at), { addSuffix: true })}</div>}
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: '11px', color: 'var(--ink-ghost)', fontStyle: 'italic', marginTop: '4px' }}>Awaiting principal response…</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
