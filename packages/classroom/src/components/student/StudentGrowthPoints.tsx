import React from 'react';
import { Trophy } from 'lucide-react-native';

export const StudentGrowthPoints = ({ points, isDemo }: { points: number, isDemo: boolean }) => {
    if (!isDemo) return null; // Only for demo for now based on original code

    return (
        <div className="sanctuary-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(245,158,11,0.05), rgba(245,158,11,0.12))', borderColor: 'rgba(245,158,11,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Trophy size={20} color="var(--sanctuary-saffron)" />
                <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>Growth Journey</h3>
            </div>
            <div style={{ fontSize: '40px', fontWeight: '800', color: 'var(--sanctuary-saffron)', marginBottom: '4px' }}>
                {points} <span style={{ fontSize: '16px', color: 'var(--ink-ghost)' }}>pts</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--ink-ghost)', marginBottom: '16px' }}>Level 4 — Inquisitive Learner</div>
            <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ width: '68%', height: '100%', background: 'var(--sanctuary-saffron)', borderRadius: '3px' }} />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>160 pts to next level</div>
        </div>
    );
};
