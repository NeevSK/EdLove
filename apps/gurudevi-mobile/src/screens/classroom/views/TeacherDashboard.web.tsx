import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRole, useStore, supabase } from '@repo/core';
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
} from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

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

    // Fetch real classrooms from Supabase
    useEffect(() => {
        const fetchClassrooms = async () => {
            if (!userId) return;
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
                    // Fetch student counts in a separate query for accuracy
                    const classroomIds = data.map((c: Classroom) => c.id);

                    // Guard: Supabase .in('col', []) with empty array returns all rows unexpectedly
                    const countData = classroomIds.length > 0
                        ? (await supabase
                            .from('classroom_students')
                            .select('classroom_id')
                            .in('classroom_id', classroomIds)).data
                        : [];

                    const countMap: Record<string, number> = {};
                    (countData ?? []).forEach((row: { classroom_id: string }) => {
                        countMap[row.classroom_id] = (countMap[row.classroom_id] ?? 0) + 1;
                    });

                    const enriched = data.map((cls: Classroom) => ({
                        ...cls,
                        student_count: countMap[cls.id] ?? 0,
                    }));
                    setClassrooms(enriched);
                }
            } catch (err) {
                console.error('[TeacherDashboard] Error fetching classrooms:', err);
            } finally {
                setClassroomsLoading(false);
            }
        };

        fetchClassrooms();
    }, [userId, role, user?.school_id]);

    const filtered = classrooms.filter(cls =>
        cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cls.subject?.toLowerCase() ?? '').includes(searchQuery.toLowerCase())
    );

    const totalStudents = classrooms.reduce((acc, cls) => acc + (cls.student_count ?? 0), 0);

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
                    </div>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button className="premium-button" style={{ background: 'var(--sanctuary-saffron)', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowCreateClassroom(true)}>
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
                        { label: t('classroom.avgAttendance') || 'Avg. Attendance', value: '—', icon: CheckCircle2, color: 'var(--moss)' },
                        { label: t('classroom.engagement') || 'Engagement', value: '—', icon: BarChart3, color: 'var(--sanctuary-saffron)' },
                    ].map((stat, i) => (
                        <div key={i} className="sanctuary-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ padding: '12px', background: 'var(--background-alt)', borderRadius: '12px', color: stat.color }}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>{stat.label}</div>
                                <div style={{ fontSize: '24px', fontWeight: '800' }}>
                                    {stat.value}{isDemoMode && stat.value !== '—' && <span style={{ fontSize: '14px', color: 'var(--sanctuary-saffron)', marginLeft: 4 }}>*</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

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
                            <div className="search-box" style={{ width: '280px' }}>
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Search classrooms..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--ink)', width: '100%', outline: 'none', fontSize: '14px' }}
                                />
                            </div>
                            <button className="secondary-button" style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Filter size={14} />
                                Filter
                            </button>
                        </div>
                    </div>

                    {classroomsLoading ? (
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[1, 2, 3].map(i => (
                                <SkeletonCard key={i} />
                            ))}
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
                                        <th style={{ padding: '16px 24px' }}>Created</th>
                                        <th style={{ padding: '16px 24px' }}>Status</th>
                                        <th style={{ padding: '16px 24px' }}></th>
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
                                            <td style={{ padding: '20px 24px', fontWeight: '700' }}>{cls.name}</td>
                                            <td style={{ padding: '20px 24px', color: 'var(--ink-ghost)' }}>{cls.subject || '—'}</td>
                                            <td style={{ padding: '20px 24px' }}>{cls.student_count ?? 0} Members</td>
                                            <td style={{ padding: '20px 24px', color: 'var(--ink-ghost)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Clock size={14} />
                                                    {cls.created_at
                                                        ? formatDistanceToNow(new Date(cls.created_at), { addSuffix: true })
                                                        : '—'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <span style={{ padding: '4px 8px', background: 'var(--moss-soft)', color: 'var(--moss)', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>ACTIVE</span>
                                            </td>
                                            <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        className="secondary-button"
                                                        style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                        onClick={e => { e.stopPropagation(); navigation.navigate('Attendance', { classroomId: cls.id, classroomName: cls.name }); }}
                                                    >
                                                        <ClipboardList size={13} />
                                                        Attendance
                                                    </button>
                                                    <button style={{ background: 'transparent', border: 'none', color: 'var(--ink-ghost)', cursor: 'pointer' }} onClick={e => e.stopPropagation()}>
                                                        <MoreHorizontal size={20} />
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
