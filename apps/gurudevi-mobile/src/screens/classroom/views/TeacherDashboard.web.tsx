import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRole, useStore, supabase, MOCK_CLASSROOMS, MOCK_STUDENTS, MOCK_ASSIGNMENTS } from '@repo/core';
import { useNavigation } from '@react-navigation/native';
import { Classroom } from '@repo/core';
import { SkeletonCard, SandboxBanner } from '@repo/ui';
import { useClassroomRoleData, CreateClassroomModal } from '@repo/classroom';
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

export default function TeacherDashboardWeb() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { user, isDemoMode } = useStore();
    const { role, userId } = useUserRole();
    const [searchQuery, setSearchQuery] = useState('');
    const [classrooms, setClassrooms] = useState<(Classroom & { student_count?: number; last_activity?: string })[]>([]);
    const [classroomsLoading, setClassroomsLoading] = useState(true);
    const [showCreateClassroom, setShowCreateClassroom] = useState(false);
    const [showEchoModal, setShowEchoModal] = useState(false);
    const [echoCategory, setEchoCategory] = useState('support');
    const [echoPriority, setEchoPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [echoContent, setEchoContent] = useState('');
    const [echoSubmitting, setEchoSubmitting] = useState(false);
    const { data: roleData } = useClassroomRoleData();

    useEffect(() => {
        // ── Demo mode: show mock classrooms instantly ─────────────────────
        if (isDemoMode) {
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
    }, [userId, role, user?.school_id, isDemoMode]);

    const filtered = classrooms.filter(cls =>
        cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cls.subject?.toLowerCase() ?? '').includes(searchQuery.toLowerCase())
    );

    const totalStudents = classrooms.reduce((acc, cls) => acc + (cls.student_count ?? 0), 0);

    // Attendance rate demo stat
    const attendanceRate = isDemoMode ? '94%' : '—';
    const engagementScore = isDemoMode ? '87%' : '—';

    return (
        <>
            {isDemoMode && <SandboxBanner />}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Header & Quick Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ padding: '8px', background: 'var(--sanctuary-saffron-soft)', borderRadius: '8px', color: 'var(--sanctuary-saffron)' }}>
                                <Users size={20} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--ink-ghost)' }}>
                                Classroom Management
                            </span>
                        </div>
                        <h1 style={{ fontSize: '36px', fontWeight: '800', margin: 0 }}>Registry & <span style={{ color: 'var(--sanctuary-saffron)' }}>Resonance</span>.</h1>
                        <p style={{ color: 'var(--ink-ghost)', marginTop: '8px', fontSize: '14px' }}>
                            {isDemoMode ? 'Demo view — Sanduni Perera · Gurudevi Life School' : `Welcome back, ${user?.full_name?.split(' ')[0] ?? 'Teacher'}`}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button className="premium-button" style={{ background: 'var(--sanctuary-saffron)', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => { if (isDemoMode) return; setShowCreateClassroom(true); }}>
                            <Plus size={18} />
                            Create Classroom
                        </button>
                        <button className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigation.navigate('Timetable', {})}>
                            📅 Timetable
                        </button>
                        <button className="secondary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ScanLine size={18} />
                            Scan QR
                        </button>
                        <button
                            className="secondary-button"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', borderColor: 'var(--ember)', color: 'var(--ember)' }}
                            onClick={() => setShowEchoModal(true)}
                        >
                            <MessageCircle size={18} />
                            {t('teacher.actions.principalEcho') || 'Principal Echo'}
                        </button>
                    </div>
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
                                    {stat.value}{isDemoMode && stat.value !== '—' && <span style={{ fontSize: '14px', color: 'var(--sanctuary-saffron)', marginLeft: 4 }}>✦</span>}
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
                            <div style={{ padding: '80px 24px', textAlign: 'center' }}>
                                <Archive size={40} color="var(--ink-ghost)" style={{ marginBottom: 16, opacity: 0.4 }} />
                                <p style={{ color: 'var(--ink-ghost)', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                                    {searchQuery ? 'No classrooms match your search.' : 'No classrooms yet — create your first one above.'}
                                </p>
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
                            {isDemoMode ? (
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
                                    { icon: FileText, label: 'Reports', color: 'var(--water)' },
                                    { icon: Calendar, label: 'Schedule', color: 'var(--sanctuary-saffron)' },
                                    { icon: ClipboardList, label: 'Attendance', color: 'var(--moss)' },
                                    { icon: CheckSquare, label: 'Grades', color: 'var(--lotus)' },
                                    { icon: ArrowRightLeft, label: 'Relief', color: 'var(--ember)' },
                                    { icon: DollarSign, label: 'Fees', color: 'var(--amber-glow)' },
                                ].map((item, i) => (
                                    <button
                                        key={i}
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
                        {isDemoMode && (
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
        </>
    );
}
