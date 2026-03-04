import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRole, useStore } from '@repo/core';
import {
    LayoutGrid,
    Users,
    Shield,
    Activity,
    ArrowUpRight,
    TrendingUp,
    Building,
    Globe,
    FileText
} from 'lucide-react-native';

export default function PrincipalSelfViewWeb() {
    const { t } = useTranslation();
    const { user } = useStore();

    const ecologicalPulse = [
        { label: 'Institutional Health', value: '98%', icon: Shield, color: 'var(--moss)' },
        { label: 'Educational Flow', value: 'Optimal', icon: Activity, color: 'var(--water)' },
        { label: 'Pedagogical Reach', value: '1.2k', icon: Globe, color: 'var(--lotus)' },
    ];

    return (
        <div className="sub-view-container">
            {/* 1. LEADERSHIP COMMAND (Left) */}
            <div className="content-scroll-area">
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ padding: '8px', background: 'var(--moss-soft)', borderRadius: '8px', color: 'var(--moss)' }}>
                            <Building size={18} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--ink-ghost)' }}>
                            Institutional Oversight
                        </span>
                    </div>
                    <h1 style={{ fontSize: '38px', fontWeight: '800', margin: 0, color: 'var(--ink)' }}>
                        Leadership <span style={{ color: 'var(--moss)' }}>Resonancce</span>.
                    </h1>
                </div>

                {/* Ecological Pulse */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                    {ecologicalPulse.map((p, i) => (
                        <div key={i} className="sanctuary-card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ color: p.color }}><p.icon size={20} /></div>
                                <ArrowUpRight size={14} color="var(--ink-ghost)" />
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink-ghost)', marginBottom: '4px' }}>{p.label}</div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--ink)' }}>{p.value}</div>
                        </div>
                    ))}
                </div>

                {/* Institutional Gallery / Briefs */}
                <div className="sanctuary-card" style={{ padding: '40px', marginBottom: '32px', border: 'none', background: 'var(--background-alt)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>Situational Awareness Portfolio</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {['Faculty Performance Metrics', 'Student Energy Distribution', 'Campus Resource Resonance'].map((brief, i) => (
                            <div key={i} className="sanctuary-card interactive" style={{ padding: '24px', background: 'rgba(255,255,255,0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ padding: '10px', background: 'white', borderRadius: '12px', color: 'var(--ink)' }}><FileText size={18} /></div>
                                    <span style={{ fontWeight: '700' }}>{brief}</span>
                                </div>
                                <button className="sidebar-item" style={{ padding: '8px 16px', fontSize: '12px' }}>Access Files</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. COMMAND SIDEBAR (Right) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Executive Dashboard */}
                <div className="sanctuary-card" style={{ padding: '32px', background: 'var(--ink)', color: 'white' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px' }}>Administrative Pulse</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ opacity: 0.6, fontSize: '13px' }}>Classroom Activity</span>
                            <span style={{ fontWeight: '800', color: 'var(--lotus)' }}>High</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ opacity: 0.6, fontSize: '13px' }}>Admission Flow</span>
                            <span style={{ fontWeight: '800', color: 'var(--water)' }}>+14%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ opacity: 0.6, fontSize: '13px' }}>System Stability</span>
                            <span style={{ fontWeight: '800', color: 'var(--moss)' }}>99.9%</span>
                        </div>
                    </div>
                    <button style={{ width: '100%', marginTop: '32px', padding: '14px', borderRadius: '12px', background: 'white', color: 'var(--ink)', fontWeight: '800', border: 'none', cursor: 'pointer' }}>Generate Report</button>
                </div>

                {/* Growth Projections */}
                <div className="sanctuary-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '20px' }}>Ecology Projection</h3>
                    <div style={{ height: '120px', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                        {[20, 40, 30, 60, 40, 80, 50, 90].map((h, i) => (
                            <div key={i} style={{ flex: 1, background: 'var(--water)', height: `${h}%`, borderRadius: '2px', opacity: 0.2 + (h / 100) }}></div>
                        ))}
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={16} color="var(--moss)" />
                        <span style={{ fontSize: '13px', color: 'var(--ink-ghost)' }}>Projected 20% Growth in Term 3</span>
                    </div>
                </div>

                {/* Quick Navigation */}
                <div className="sanctuary-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', marginBottom: '16px' }}>Command Gates</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button className="sidebar-item"><Users size={16} /> <span>Staff Directory</span></button>
                        <button className="sidebar-item"><LayoutGrid size={16} /> <span>Educational Timetable</span></button>
                    </div>
                </div>
            </div>
        </div>
    );
}
