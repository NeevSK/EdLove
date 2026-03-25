import React from 'react';
import { Target } from 'lucide-react-native';
import { SkeletonCard } from '@repo/ui';
import { useNavigation } from '@react-navigation/native';

export const StudentGoals = ({ goals, loading }: { goals: any[], loading: boolean }) => {
    const navigation = useNavigation<any>();

    return (
        <div className="sanctuary-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)', letterSpacing: '1px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={14} /> Active Goals
            </h3>
            {loading ? (
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
    );
};
