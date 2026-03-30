/**
 * MyGradesView.web.tsx
 *
 * Web override. The native version uses react-native-reanimated FadeInDown
 * entrance animations and RN ScrollView. On web we use a clean HTML table
 * with the same Supabase query and colour logic.
 * Metro resolves this over MyGradesView.tsx on the web platform.
 */
import React, { useState, useEffect } from 'react';
import { supabase } from '@repo/core';
import { formatDistanceToNow } from 'date-fns';

interface GradeRow {
    id: string;
    assignment_id: string;
    classroom_id: string;
    grade: number;
    feedback: string | null;
    submitted_at: string;
    assignments: { title: string } | null;
    classrooms: { name: string } | null;
}

interface MyGradesViewProps {
    userId?: string;
}

const GRADE_THRESHOLD_EXCELLENT = 75;
const GRADE_THRESHOLD_PASSING   = 50;

function gradeColor(grade: number): string {
    if (grade >= GRADE_THRESHOLD_EXCELLENT) return '#4caf50';
    if (grade >= GRADE_THRESHOLD_PASSING)   return '#ffc107';
    return '#f44336';
}

function gradeLabel(grade: number): string {
    if (grade >= GRADE_THRESHOLD_EXCELLENT) return 'Excellent';
    if (grade >= GRADE_THRESHOLD_PASSING)   return 'Passing';
    return 'Needs work';
}

export default function MyGradesView({ userId }: MyGradesViewProps) {
    const [grades, setGrades] = useState<GradeRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!userId) { setIsLoading(false); return; }
        const loadGrades = async () => {
            setIsLoading(true);
            try {
                const { data } = await supabase
                    .from('submissions')
                    .select('id, assignment_id, classroom_id, grade, feedback, submitted_at, assignments(title), classrooms(name)')
                    .eq('student_id', userId)
                    .not('grade', 'is', null)
                    .order('submitted_at', { ascending: false })
                    .limit(20);
                setGrades((data as any[] ?? []).filter(r => r && typeof r.grade === 'number'));
            } catch {
                setGrades([]);
            } finally {
                setIsLoading(false);
            }
        };

        void loadGrades();
    }, [userId]);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ height: '56px', background: 'var(--background-alt)', borderRadius: '10px' }} /
                ))}
            </div
        );
    }

    if (!grades.length) {
        return (
            <div style={{ padding: '24px', background: 'var(--background-alt)', borderRadius: '14px', textAlign: 'center' }}
                <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', margin: 0 }}
                    No graded assignments yet. Your grades will appear here when teachers mark your work.
                </p
            </div
        );
    }

    const avgGrade = grades.reduce((sum, g) => sum + g.grade, 0) / grades.length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            {/* Summary banner */}
            <div style={{ display: 'flex', gap: '16px' }}
                <div style={{ flex: 1, padding: '16px 20px', background: 'var(--background-alt)', borderRadius: '12px' }}
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase', marginBottom: '6px' }}>Assignments</div
                    <div style={{ fontSize: '24px', fontWeight: '800' }}>{grades.length}</div
                </div
                <div style={{ flex: 1, padding: '16px 20px', background: 'var(--background-alt)', borderRadius: '12px' }}
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase', marginBottom: '6px' }}>Average</div
                    <div style={{ fontSize: '24px', fontWeight: '800', color: gradeColor(avgGrade) }}
                        {Math.round(avgGrade)}%
                    </div
                </div
            </div

            {/* Grade rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
                {grades.map(item => (
                    <div
                        key={item.id}
                        style={{ padding: '16px 20px', background: 'var(--background-alt)', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '16px' }}
                    
                        {/* Grade circle */}
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: `${gradeColor(item.grade)}18`,
                            border: `2px solid ${gradeColor(item.grade)}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                            <span style={{ fontSize: '13px', fontWeight: '800', color: gradeColor(item.grade) }}
                                {item.grade}%
                            </span
                        </div

                        {/* Assignment info */}
                        <div style={{ flex: 1, minWidth: 0 }}
                            <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                {item.assignments?.title ?? 'Assignment'}
                            </div
                            <div style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}
                                {item.classrooms?.name ?? ''}
                                {item.classrooms?.name && ' \u00B7 '}
                                {formatDistanceToNow(new Date(item.submitted_at), { addSuffix: true })}
                            </div
                        </div

                        {/* Label badge */}
                        <div style={{
                            fontSize: '10px',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: `${gradeColor(item.grade)}18`,
                            color: gradeColor(item.grade),
                            flexShrink: 0,
                        }}
                            {gradeLabel(item.grade)}
                        </div
                    </div
                ))}
            </div

            {/* Feedback section (last graded that has feedback) */}
            {(() => {
                const withFeedback = grades.find(g => g.feedback);
                if (!withFeedback) return null;
                return (
                    <div style={{ padding: '16px 20px', background: 'rgba(139,92,246,0.06)', borderRadius: '12px', border: '1px solid rgba(139,92,246,0.15)' }}
                        <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#8B5CF6', marginBottom: '8px' }}
                            Latest Feedback
                        </div
                        <p style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: '1.6', fontStyle: 'italic', margin: 0 }}
                            "{withFeedback.feedback}"
                        </p
                    </div
                );
            })()}
        </div
    );
}
