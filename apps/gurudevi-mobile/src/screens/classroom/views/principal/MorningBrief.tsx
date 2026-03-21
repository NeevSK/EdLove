import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Activity, LayoutGrid } from 'lucide-react-native';

interface MorningBriefProps {
    stats: any;
    presence: any;
    resonanceScore: number;
}

export const MorningBrief: React.FC<MorningBriefProps> = ({ stats, presence, resonanceScore }) => {
    const { t } = useTranslation();

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div className="sanctuary-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '4px solid var(--lotus)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(217,70,239,0.1)', color: 'var(--lotus)', padding: '10px', borderRadius: '12px' }}>
                        <Users size={20} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)', letterSpacing: '1px' }}>Staff Presence</span>
                </div>
                <div>
                    <div style={{ fontSize: '32px', fontWeight: '900' }}>
                        {presence?.present ?? 0}<span style={{ fontSize: '16px', color: 'var(--ink-ghost)', fontWeight: '400' }}> / {presence?.total ?? 0}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--moss)', fontWeight: '600', marginTop: '4px' }}>
                        {presence?.on_leave ?? 0} on leave today
                    </div>
                </div>
            </div>

            <div className="sanctuary-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '4px solid var(--moss)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--moss)', padding: '10px', borderRadius: '12px' }}>
                        <Activity size={20} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)', letterSpacing: '1px' }}>Institutional Resonance</span>
                </div>
                <div>
                    <div style={{ fontSize: '32px', fontWeight: '900' }}>{resonanceScore}%</div>
                    <div style={{ fontSize: '13px', color: 'var(--ink-ghost)', marginTop: '4px' }}>Community collective mood</div>
                </div>
            </div>

            <div className="sanctuary-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '4px solid var(--water)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--water)', padding: '10px', borderRadius: '12px' }}>
                        <LayoutGrid size={20} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)', letterSpacing: '1px' }}>Active Classrooms</span>
                </div>
                <div>
                    <div style={{ fontSize: '32px', fontWeight: '900' }}>{stats?.active_classrooms ?? 0}</div>
                    <div style={{ fontSize: '13px', color: 'var(--ink-ghost)', marginTop: '4px' }}>Operational learning spaces</div>
                </div>
            </div>
        </div>
    );
};
