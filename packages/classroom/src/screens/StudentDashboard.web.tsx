import React, { useState, useEffect } from 'react';
import { usePermissions, useStore, supabase, useRewards, FeatureGuard, useTemporalStore } from '@repo/core';
import { Classroom } from '@repo/core';
import { SandboxBanner, TemporalNavigator } from '@repo/ui';
import { Star } from 'lucide-react-native';
import { SubmissionModal } from '../components';

// Sub-components
import { 
    StudentHeader,
    StudentStats,
    StudentClassroomList,
    StudentUpcomingAssignments,
    StudentGoals,
    StudentGrowthPoints,
    StudentStudySuite
} from '../components/student';

export default function StudentDashboardWeb({ forceDemo }: { forceDemo?: boolean } = {}) {
    const { user } = useStore();
    const { context } = usePermissions();
    const { userId } = context;
    const isDemo = forceDemo === true;
    const { rewards, isLoading: rewardsLoading } = useRewards();
    const { isPastView } = useTemporalStore();

    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [submissionModal, setSubmissionModal] = useState<{ open: boolean; assignment: any | null }>({ open: false, assignment: null });
    const [classroomsLoading, setClassroomsLoading] = useState(true);

    useEffect(() => {
        if (isDemo) {
            setClassroomsLoading(false);
            return;
        }
        const fetchClassrooms = async () => {
            if (!userId) { setClassroomsLoading(false); return; }
            setClassroomsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('classroom_students')
                    .select('classroom_id, classrooms(id, name, subject, teacher_id, created_at, updated_at, color_theme)')
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

    const growthPoints = isDemo ? 340 : (rewards?.points ?? 0);
    const stats = [
        { label: 'Active Sanctuaries', value: classroomsLoading ? '—' : String(classrooms.length), icon: Star, color: 'var(--water)' },
        { label: 'Goals Set', value: '3', icon: Star, color: 'var(--amber-glow)' },
        { label: 'Growth Points', value: rewardsLoading && !isDemo ? '—' : String(growthPoints), icon: Star, color: 'var(--sanctuary-saffron)' },
    ];

    return (
        <>
            {isDemo && <SandboxBanner />}
            <div className="sub-view-container" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px', padding: '24px' }}>
                {/* 1. Main Content Area */}
                <div className="content-scroll-area">
                    <StudentHeader isDemo={isDemo} />

                    <div style={{ marginBottom: '32px', maxWidth: '400px' }}>
                        <TemporalNavigator />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                        <StudentStats stats={stats} isDemo={isDemo} />
                    </div>
                    
                    <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>Active Sanctuaries</h2>
                    <StudentClassroomList classrooms={classrooms} loading={classroomsLoading} isDemo={isDemo} />
                    
                    <StudentUpcomingAssignments 
                        assignments={assignments} 
                        isPastView={isPastView} 
                        onOpenSubmission={(a: any) => setSubmissionModal({ open: true, assignment: a })} 
                    />
                </div>

                {/* 2. Side Panel Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <StudentGoals goals={[]} loading={false} />
                    <StudentGrowthPoints points={growthPoints} isDemo={isDemo} />
                    <StudentStudySuite />
                </div>
            </div>

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
                    }}
                />
            )}
        </>
    );
}
