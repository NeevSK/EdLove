import React from 'react';
import { BookOpen, Zap, Trophy } from 'lucide-react-native';

export const StudentStatCard = ({ stat, isDemo }: { stat: any, isDemo: boolean }) => {
    if (!stat) return null;
    return (
        <div className="sanctuary-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '180px' }}>
            <stat.icon size={20} color={stat.color} />
            <div>
                <div style={{ fontSize: '32px', fontWeight: '800' }}>
                    {stat.value}{isDemo && stat.value !== '—' && <span style={{ fontSize: '14px', color: 'var(--sanctuary-saffron)', marginLeft: 4 }}>✦</span>}
                </div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>{stat.label}</div>
            </div>
        </div>
    );
};

export const StudentStats = ({ stats, isDemo }: { stats: any[], isDemo: boolean }) => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
            {stats.map((stat, i) => (
                <StudentStatCard key={i} stat={stat} isDemo={isDemo} />
            ))}
        </div>
    );
};
