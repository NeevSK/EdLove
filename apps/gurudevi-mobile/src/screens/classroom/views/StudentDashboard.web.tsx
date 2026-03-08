import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRole, useStore, supabase, useRewards, assignmentsAPI, growthSignalsAPI } from '@repo/core';
import { Classroom } from '@repo/core';
import { SkeletonCard } from '@repo/ui';
import { useNavigation } from '@react-navigation/native';
import { useClassroomRoleData, SubmissionModal } from '@repo/classroom';
import { useStudentGoals } from '@repo/self';
import {
    BookOpen,
    MessageSquare,
    Star,
    Layout,
    Zap,
    ChevronRight,
    PlayCircle,
    CheckCircle2,
    Clock,
    Trophy,
    Archive
} from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

export default function StudentDashboardWeb() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { user } = useStore();
    const { userId } = useUserRole();
    const { rewards, isLoading: rewardsLoading } = useRewards();
    const { data: roleData, loading: roleLoading } = useClassroomRoleData();

    const { goals, isLoading: goalsLoading } = useStudentGoals(userId ?? undefined);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [submissionModal, setSubmissionModal] = useState<{ open: boolean; assignment: any | null }>({ open: false, assignment: null });

    const [classroomsLoading, setClassroomsLoading] = useState(true);
    useEffect(() => {
        const fetchClassrooms = async () => {
            if (!userId) return;
            setClassroomsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('classroom_students')
                    .select('classroom_id, classrooms(id, name, subject, teacher_id, created_at, updated_at)')
                    .eq('student_id', userId);

                if (!error && data) {
                    const cls = data
                        .map((row: any) => row.classrooms)
                        .filter(Boolean) as Classroom[];
                    setClassrooms(cls);

                    // Fetch upcoming assignments for all enrolled classrooms
                    if (cls.length > 0) {
                        const today = new Date().toISOString().split('T')[0];
                        const { data: asgn } = await supabase
                            .from('assignments')
                            .select('id, title, classroom_id, due_date, classrooms(name)')
                            .in('classroom_id', cls.map((c: any) => c.id))
                            .gte('due_date', today)
                            .order('due_date', { ascending: true })
                            .limit(6);
                        setAssignments(asgn ?? []);
                    }
                }
            } catch (err) {
                console.error('[StudentDashboard] Error fetching classrooms:', err);
            } finally {
                setClassroomsLoading(false);
            }
        };
        fetchClassrooms();
    }, [userId, user?.school_id]);

    const stats = [
        {
            label: 'Active Sanctuaries',
            value: classroomsLoading ? '—' : String(roleData?.realClassCount ?? classrooms.length),
            icon: BookOpen,
            color: 'var(--water)'
        },
        {
            label: 'Goals Set',
            value: goalsLoading ? '—' : String(goals.length),
            icon: Zap,
            color: 'var(--amber-glow)'
        },
        {
            label: 'Growth Points',
            value: rewardsLoading ? '—' : String(rewards?.points ?? 0),
            icon: Trophy,
            color: 'var(--sanctuary-saffron)'
        },
    ];

    return (
        <>
            <div className="sub-view-container">
                {/* 1. LEARNING PORTAL (Center) */}
                <div className="content-scroll-area">
                    <div style={{ marginBottom: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ padding: '8px', background: 'var(--water-soft)', borderRadius: '8px', color: 'var(--water)' }}>
                                <Star size={20} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--ink-ghost)' }}>
                                Your Learning Journey
                            </span>
                        </div>
                        <h1 style={{ fontSize: '42px', fontWeight: '800', lineHeight: '1.2', margin: 0, color: 'var(--ink)' }}>
                            Radiate <span style={{ color: 'var(--water)' }}>Curiosity</span>{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}.
                        </h1>
                    </div>

                    {/* Growth Stats Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                        {stats.map((stat, i) => (
                            <div key={i} className="sanctuary-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <stat.icon size={20} color={stat.color} />
                                <div>
                                    <div style={{ fontSize: '32px', fontWeight: '800' }}>{stat.value}</div>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Enrolled Classrooms */}
                    <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        Active Sanctuaries
                        {!classroomsLoading && (
                            <span style={{ padding: '4px 8px', background: 'var(--background-alt)', borderRadius: '6px', fontSize: '11px', color: 'var(--ink-ghost)' }}>
                                {classrooms.length} Total
                            </span>
                        )}
                    </h2>

                    {classroomsLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[1, 2].map(i => <SkeletonCard key={i} />)}
                        </div>
                    ) : classrooms.length === 0 ? (
                        <div style={{ padding: '60px 0', textAlign: 'center' }}>
                            <Archive size={40} color="var(--ink-ghost)" style={{ opacity: 0.3, marginBottom: 16 }} />
                            <p style={{ color: 'var(--ink-ghost)', fontSize: '15px', fontWeight: '600' }}>
                                You are not enrolled in any classrooms yet.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '24px' }}>
                            {classrooms.map(cls => (
                                <div key={cls.id} className="sanctuary-card interactive" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ height: '80px', background: 'var(--background-alt)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                            <BookOpen size={20} color="var(--water)" />
                                        </div>
                                        <span style={{ padding: '4px 8px', background: 'white', borderRadius: '6px', fontSize: '10px', fontWeight: '800', color: 'var(--ink-ghost)' }}>Active</span>
                                    </div>
                                    <div style={{ padding: '24px' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px' }}>{cls.name}</h3>
                                        {cls.subject && (
                                            <p style={{ fontSize: '12px', color: 'var(--ink-ghost)', margin: '0 0 20px' }}>{cls.subject}</p>
                                        )}
                                        <div style={{ fontSize: '11px', color: 'var(--ink-ghost)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Clock size={11} />
                                            {cls.updated_at
                                                ? formatDistanceToNow(new Date(cls.updated_at), { addSuffix: true })
                                                : 'Recently active'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. STUDY SUITE (Right) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Active Goals */}
                    <div className="sanctuary-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)', letterSpacing: '1px', marginBottom: '20px' }}>
                            Active Goals
                        </h3>
                        {goalsLoading ? (
                            <SkeletonCard />
                        ) : goals.length === 0 ? (
                            <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', margin: 0 }}>
                                No goals set yet. Start your growth journey.
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {goals.slice(0, 3).map(goal => (
                                    <div key={goal.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>{goal.text}</div>
                                        <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                                            <div style={{ width: `${goal.progress ?? 0}%`, height: '100%', background: 'var(--water)', borderRadius: '2px' }} />
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--ink-ghost)', textAlign: 'right' }}>{goal.progress ?? 0}%</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button className="secondary-button" style={{ width: '100%', marginTop: '20px', fontSize: '12px' }} onClick={() => navigation.navigate('Main', { screen: 'Self' })}>
                            View All Goals
                        </button>
                    </div>

                    {/* Quick Shortcuts */}
                    <div className="sanctuary-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px' }}>Study Suite</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                { label: 'Library', icon: BookOpen, color: 'var(--amber-glow)', onClick: () => navigation.navigate('Main', { screen: 'Library' }) },
                                { label: 'Sanctuaries', icon: MessageSquare, color: 'var(--gurudevi-blue)', onClick: () => navigation.navigate('Main', { screen: 'Community' }) },
                                { label: 'Rewards', icon: Star, color: 'var(--sanctuary-saffron)', onClick: () => { } },
                                { label: 'Timetable', icon: Layout, color: 'var(--moss)', onClick: () => navigation.navigate('Timetable', {}) },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', cursor: 'pointer' }} onMouseOver={e => (e.currentTarget.style.background = 'var(--background-alt)')} onMouseOut={e => (e.currentTarget.style.background = 'transparent')} onClick={item.onClick}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--background-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <item.icon size={16} color={item.color} />
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{item.label}</span>
                                    <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.2 }} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Assignments */}
                    {assignments.length > 0 && (
                        <div className="sanctuary-card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle2 size={16} color="var(--moss)" /> Upcoming Assignments
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {assignments.map(a => (
                                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'var(--background-alt)', border: '1px solid var(--border-light)' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>{a.title}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>
                                                {(a.classrooms as { name: string } | null)?.name ?? ''} · Due {a.due_date}
                                            </div>
                                        </div>
                                        <button
                                            className="premium-button"
                                            style={{ fontSize: '11px', padding: '6px 12px' }}
                                            onClick={() => setSubmissionModal({ open: true, assignment: a })}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Submission modal */}
            {submissionModal.assignment && (
                <SubmissionModal
                    isOpen={submissionModal.open}
                    assignmentTitle={submissionModal.assignment.title}
                    onClose={() => setSubmissionModal({ open: false, assignment: null })}
                    onSubmit={async (content, photoUri) => {
                        if (!userId || !submissionModal.assignment) return;
                        await supabase.from('submissions').insert({
                            assignment_id: submissionModal.assignment.id,
                            student_id: userId,
                            content,
                            photo_url: photoUri ?? null,
                            submitted_at: new Date().toISOString(),
                        });
                        // Growth signal
                        void growthSignalsAPI.emitSignal(userId, 'assignment_submitted', {
                            assignment_id: submissionModal.assignment.id,
                        }).catch(() => { });
                    }}
                />
            )}
        </>
    );
}
