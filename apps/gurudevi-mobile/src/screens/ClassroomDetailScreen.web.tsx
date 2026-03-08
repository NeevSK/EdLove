import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useStore, supabase } from '@repo/core';
import { ArrowLeft, Users, BookOpen, BarChart3, Clock, UserPlus, GraduationCap } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { StackFallback } from '../components/web/WebScreenShimmer';

interface Student {
    id: string;
    full_name: string;
    email?: string;
    avatar_url?: string;
    index_number?: string;
    joined_at: string;
}

export default function ClassroomDetailScreenWeb() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { classroomId, classroomName } = route.params ?? {};
    const { user } = useStore();

    const [classroom, setClassroom] = useState<any>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'students' | 'activity'>('students');

    useEffect(() => {
        if (!classroomId) return;
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const { data: cls } = await supabase
                    .from('classrooms')
                    .select('*')
                    .eq('id', classroomId)
                    .single();
                if (cls) setClassroom(cls);

                const { data: enrollments } = await supabase
                    .from('classroom_students')
                    .select('student_id, joined_at, user_profiles!student_id(id, full_name, email, avatar_url, index_number)')
                    .eq('classroom_id', classroomId);

                if (enrollments) {
                    const mapped: Student[] = enrollments.map((e: any) => ({
                        id: e.student_id,
                        full_name: e.user_profiles?.full_name ?? 'Unknown',
                        email: e.user_profiles?.email,
                        avatar_url: e.user_profiles?.avatar_url,
                        index_number: e.user_profiles?.index_number,
                        joined_at: e.joined_at,
                    }));
                    setStudents(mapped);
                }
            } catch (err) {
                console.error('[ClassroomDetail] Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [classroomId]);

    if (loading) return <StackFallback variant="list" />;

    return (
        <div className="sanctuary-screen">
            <div className="sanctuary-container">
                {/* ── Back + Header ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <button
                        onClick={() => navigation.goBack()}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--glass-surface)', cursor: 'pointer', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: '600' }}
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: 'var(--ink)' }}>
                            {classroomName ?? classroom?.name ?? 'Classroom'}
                        </h1>
                        {classroom?.subject && (
                            <span style={{ fontSize: '14px', color: 'var(--action)', fontWeight: '600' }}>{classroom.subject}</span>
                        )}
                    </div>
                </div>

                {/* ── Stats Row ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    {[
                        { label: 'Students', value: String(students.length), icon: Users, color: 'var(--water)' },
                        { label: 'Subject', value: classroom?.subject ?? '—', icon: BookOpen, color: 'var(--action)' },
                        { label: 'Created', value: classroom?.created_at ? formatDistanceToNow(new Date(classroom.created_at), { addSuffix: true }) : '—', icon: Clock, color: 'var(--moss)' },
                    ].map((stat, i) => (
                        <div key={i} className="sanctuary-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ padding: '10px', background: 'var(--background-alt)', borderRadius: '10px', color: stat.color }}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>{stat.label}</div>
                                <div style={{ fontSize: '18px', fontWeight: '800' }}>{stat.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Tabs ── */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    {(['students', 'activity'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`top-tab ${activeTab === tab ? 'active' : ''}`}
                            style={{ textTransform: 'capitalize' }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* ── Students Tab ── */}
                {activeTab === 'students' && (
                    <div className="sanctuary-card" style={{ overflow: 'hidden' }}>
                        {students.length === 0 ? (
                            <div style={{ padding: '60px', textAlign: 'center' }}>
                                <UserPlus size={40} color="var(--ink-ghost)" style={{ opacity: 0.4 }} />
                                <p style={{ color: 'var(--ink-ghost)', marginTop: '16px', fontStyle: 'italic' }}>
                                    No students enrolled yet. Share the classroom QR code or invite link to enrol students.
                                </p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: 'var(--background-alt)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)' }}>
                                    <tr>
                                        <th style={{ padding: '14px 24px' }}>Student</th>
                                        <th style={{ padding: '14px 24px' }}>Index No.</th>
                                        <th style={{ padding: '14px 24px' }}>Enrolled</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(s => (
                                        <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ fontWeight: '700', fontSize: '14px' }}>{s.full_name}</div>
                                                {s.email && <div style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>{s.email}</div>}
                                            </td>
                                            <td style={{ padding: '16px 24px', color: 'var(--ink-ghost)', fontSize: '13px' }}>
                                                {s.index_number ?? '—'}
                                            </td>
                                            <td style={{ padding: '16px 24px', color: 'var(--ink-ghost)', fontSize: '13px' }}>
                                                {formatDistanceToNow(new Date(s.joined_at), { addSuffix: true })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* ── Activity Tab ── */}
                {activeTab === 'activity' && (
                    <div className="sanctuary-card" style={{ padding: '60px', textAlign: 'center' }}>
                        <BarChart3 size={40} color="var(--ink-ghost)" style={{ opacity: 0.4 }} />
                        <p style={{ color: 'var(--ink-ghost)', marginTop: '16px', fontStyle: 'italic' }}>
                            Activity tracking coming soon. Attendance and gradebook data will appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
