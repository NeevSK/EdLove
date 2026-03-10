import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRole, useStore, supabase, useRewards, growthSignalsAPI, MOCK_CLASSROOMS } from '@repo/core';
import { Classroom } from '@repo/core';
import { SkeletonCard, SandboxBanner } from '@repo/ui';
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
    CheckCircle2,
    Clock,
    Trophy,
    Archive,
    Target,
    TrendingUp,
} from 'lucide-react-native';


// ── Mock data for student demo ────────────────────────────────────────────────
const DEMO_CLASSROOMS = MOCK_CLASSROOMS.filter(c => !(c as any).is_school).slice(0, 3);

const DEMO_ASSIGNMENTS = [
    { id: 'da1', title: 'Wave Function Practice', classroom: 'Grade 10 - Mathematics', due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], submitted: false },
    { id: 'da2', title: 'Lab Report: Photosynthesis', classroom: 'Grade 11 - Science', due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], submitted: true },
    { id: 'da3', title: 'Short Story Composition', classroom: 'Grade 10 - English', due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], submitted: false },
];

const DEMO_GOALS = [
    { id: 'g1', text: 'Complete all pending assignments this week', progress: 65 },
    { id: 'g2', text: 'Improve mathematics score to A grade', progress: 40 },
    { id: 'g3', text: 'Read one library resource daily', progress: 80 },
];

export default function StudentDashboardWeb({ forceDemo }: { forceDemo?: boolean } = {}) {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { user } = useStore();
    const { userId } = useUserRole();
    const isDemo = forceDemo === true;
    const { rewards, isLoading: rewardsLoading } = useRewards();
    const { data: roleData, loading: roleLoading } = useClassroomRoleData();

    const { goals: realGoals, isLoading: goalsLoading } = useStudentGoals(isDemo ? undefined : (userId ?? undefined));
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [submissionModal, setSubmissionModal] = useState<{ open: boolean; assignment: any | null }>({ open: false, assignment: null });

    const [classroomsLoading, setClassroomsLoading] = useState(true);

    useEffect(() => {
        // ── Demo mode: show mock data instantly ───────────────────────────
        if (isDemo) {
            setClassrooms(DEMO_CLASSROOMS as any);
            setAssignments(DEMO_ASSIGNMENTS);
            setClassroomsLoading(false);
            return;
        }
        // ── Real fetch ────────────────────────────────────────────────────
        const fetchClassrooms = async () => {
            if (!userId) { setClassroomsLoading(false); return; }
            setClassroomsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('classroom_students')
                    .select('classroom_id, classrooms(id, name, subject, teacher_id, created_at, updated_at)')
                    .eq('student_id', userId);

                if (!error && data) {
                    const cls = data.map((row: any) => row.classrooms).filter(Boolean) as Classroom[];
                    setClassrooms(cls);

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
    }, [userId, user?.school_id, isDemo]);

    const goals = isDemo ? DEMO_GOALS : realGoals;
    const displayGoalsLoading = isDemo ? false : goalsLoading;
    const growthPoints = isDemo ? 340 : (rewards?.points ?? 0);

    const stats = [
        { label: 'Active Sanctuaries', value: classroomsLoading ? '—' : String(classrooms.length), icon: BookOpen, color: 'var(--water)' },
        { label: 'Goals Set', value: displayGoalsLoading ? '—' : String(goals.length), icon: Zap, color: 'var(--amber-glow)' },
        { label: 'Growth Points', value: rewardsLoading && !isDemo ? '—' : String(growthPoints), icon: Trophy, color: 'var(--sanctuary-saffron)' },
    ];

    const pendingAssignments = assignments.filter((a: any) => !a.submitted);

    return (
        <>
            {isDemo && <SandboxBanner />}
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
                            Radiate <span style={{ color: 'var(--water)' }}>Curiosity</span>{isDemo ? ', Amara' : (user?.full_name ? `, ${user.full_name.split(' ')[0]}` : '')}.
                        </h1>
                        {isDemo && (
                            <p style={{ color: 'var(--ink-ghost)', marginTop: '8px', fontSize: '14px' }}>
                                Demo view — Amara Jayasinghe · Grade 10 · Gurudevi Life School
                            </p>
                        )}
                    </div>

                    {/* Growth Stats Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                        {stats.map((stat, i) => (
                            <div key={i} className="sanctuary-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <stat.icon size={20} color={stat.color} />
                                <div>
                                    <div style={{ fontSize: '32px', fontWeight: '800' }}>
                                        {stat.value}{isDemo && stat.value !== '—' && <span style={{ fontSize: '14px', color: 'var(--sanctuary-saffron)', marginLeft: 4 }}>✦</span>}
                                    </div>
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
                                <div
                                    key={cls.id}
                                    className="sanctuary-card interactive"
                                    style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                                    onClick={() => navigation.navigate('ClassroomDetails', { classroomId: cls.id, classroomName: cls.name })}
                                >
                                    <div style={{ height: '80px', background: (cls as any).color_theme ?? 'var(--background-alt)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', opacity: 0.9 }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                            <BookOpen size={20} color="var(--water)" />
                                        </div>
                                        <span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.9)', borderRadius: '6px', fontSize: '10px', fontWeight: '800', color: 'var(--ink-ghost)' }}>Active</span>
                                    </div>
                                    <div style={{ padding: '24px' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px' }}>{cls.name}</h3>
                                        {cls.subject && (
                                            <p style={{ fontSize: '12px', color: 'var(--ink-ghost)', margin: '0 0 12px' }}>{cls.subject}</p>
                                        )}
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <span style={{ padding: '4px 8px', background: 'var(--background-alt)', borderRadius: '6px', fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)' }}>
                                                📖 Lessons
                                            </span>
                                            <span style={{ padding: '4px 8px', background: 'var(--background-alt)', borderRadius: '6px', fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)' }}>
                                                📋 Assignments
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upcoming / Pending Assignments */}
                    {(assignments.length > 0 || isDemo) && (
                        <div style={{ marginTop: '40px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <CheckCircle2 size={18} color="var(--moss)" />
                                Upcoming Assignments
                                {pendingAssignments.length > 0 && (
                                    <span style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.1)', borderRadius: '6px', fontSize: '11px', color: 'var(--ember)', fontWeight: '700' }}>
                                        {pendingAssignments.length} pending
                                    </span>
                                )}
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {assignments.map((a: any) => (
                                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderRadius: '12px', background: 'var(--background-alt)', border: `1px solid ${a.submitted ? 'var(--moss)' : 'var(--border-light)'}` }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.submitted ? 'var(--moss)' : 'var(--ember)', flexShrink: 0 }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>{a.title}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--ink-ghost)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                                <span>{a.classroom ?? (a.classrooms as any)?.name ?? ''}</span>
                                                <span>·</span>
                                                <Clock size={10} />
                                                <span>Due {typeof a.due_date === 'string' ? a.due_date : new Date(a.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                                            </div>
                                        </div>
                                        {!a.submitted && !isDemo && (
                                            <button
                                                className="premium-button"
                                                style={{ fontSize: '11px', padding: '6px 12px' }}
                                                onClick={() => setSubmissionModal({ open: true, assignment: a })}
                                            >
                                                Submit
                                            </button>
                                        )}
                                        {a.submitted && (
                                            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--moss)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <CheckCircle2 size={13} /> Submitted
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. STUDY SUITE (Right sidebar) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Active Goals */}
                    <div className="sanctuary-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)', letterSpacing: '1px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Target size={14} /> Active Goals
                        </h3>
                        {displayGoalsLoading ? (
                            <SkeletonCard />
                        ) : goals.length === 0 ? (
                            <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', margin: 0 }}>
                                No goals set yet. Start your growth journey.
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {goals.slice(0, 3).map((goal: any) => (
                                    <div key={goal.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>{goal.text}</div>
                                        <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ width: `${goal.progress ?? 0}%`, height: '100%', background: 'var(--water)', borderRadius: '3px' }} />
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--ink-ghost)', textAlign: 'right' }}>{goal.progress ?? 0}%</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button className="secondary-button" style={{ width: '100%', marginTop: '20px', fontSize: '12px' }} onClick={() => navigation.navigate('Main', { screen: 'Self' })}>
                            View All Goals →
                        </button>
                    </div>

                    {/* Growth Points Card */}
                    {isDemo && (
                        <div className="sanctuary-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(245,158,11,0.05), rgba(245,158,11,0.12))', borderColor: 'rgba(245,158,11,0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <Trophy size={20} color="var(--sanctuary-saffron)" />
                                <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>Growth Journey</h3>
                            </div>
                            <div style={{ fontSize: '40px', fontWeight: '800', color: 'var(--sanctuary-saffron)', marginBottom: '4px' }}>
                                340 <span style={{ fontSize: '16px', color: 'var(--ink-ghost)' }}>pts</span>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--ink-ghost)', marginBottom: '16px' }}>Level 4 — Inquisitive Learner</div>
                            <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                                <div style={{ width: '68%', height: '100%', background: 'var(--sanctuary-saffron)', borderRadius: '3px' }} />
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>160 pts to next level</div>
                        </div>
                    )}

                    {/* Quick Shortcuts */}
                    <div className="sanctuary-card" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px' }}>Study Suite</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                { label: 'Library', icon: BookOpen, color: 'var(--amber-glow)', onClick: () => navigation.navigate('Main', { screen: 'Library' }) },
                                { label: 'Community', icon: MessageSquare, color: 'var(--gurudevi-blue)', onClick: () => navigation.navigate('Main', { screen: 'Community' }) },
                                { label: 'Rewards', icon: Star, color: 'var(--sanctuary-saffron)', onClick: () => { } },
                                { label: 'Timetable', icon: Layout, color: 'var(--moss)', onClick: () => navigation.navigate('Timetable', {}) },
                                { label: 'Self Reflection', icon: TrendingUp, color: 'var(--water)', onClick: () => navigation.navigate('Main', { screen: 'Self' }) },
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
                        void growthSignalsAPI.emitSignal(userId, 'assignment_submitted', {
                            assignment_id: submissionModal.assignment.id,
                        }).catch(() => { });
                    }}
                />
            )}
        </>
    );
}
