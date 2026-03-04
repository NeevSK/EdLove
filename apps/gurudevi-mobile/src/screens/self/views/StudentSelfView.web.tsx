import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRole, useStore } from '@repo/core';
import {
    BookOpen,
    Sparkles,
    Zap,
    Clock,
    MessageSquare,
    TrendingUp,
    Library,
    Target,
    Compass
} from 'lucide-react-native';

export default function StudentSelfViewWeb() {
    const { t } = useTranslation();
    const { user } = useStore();

    const studyStats = [
        { id: '1', label: 'Study Hours', value: '38.5', icon: Clock, color: 'var(--water)' },
        { id: '2', label: 'Milestones', value: '12', icon: Target, color: 'var(--lotus)' },
        { id: '3', label: 'Resonance', value: '94%', icon: Sparkles, color: 'var(--moss)' },
    ];

    return (
        <div className="sub-view-container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '32px', height: '100%' }}>
            {/* 1. STUDENT DASHBOARD (Left) */}
            <div className="content-scroll-area">
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ padding: '8px', background: 'var(--water-soft)', borderRadius: '8px', color: 'var(--water)' }}>
                            <TrendingUp size={18} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--ink-ghost)' }}>
                            Growth Dashboard
                        </span>
                    </div>
                    <h1 style={{ fontSize: '38px', fontWeight: '800', margin: 0, color: 'var(--ink)' }}>
                        Peaceful <span style={{ color: 'var(--water)' }}>Progress</span>.
                    </h1>
                </div>

                {/* Growth Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
                    {studyStats.map(stat => (
                        <div key={stat.id} className="sanctuary-card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ padding: '10px', background: `${stat.color}-soft`, borderRadius: '12px', color: stat.color }}>
                                    <stat.icon size={20} />
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--ink-ghost)' }}>{stat.label}</span>
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--ink)' }}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Primary Study Suite */}
                <div className="sanctuary-card" style={{ padding: '32px', marginBottom: '32px', border: 'none', background: 'var(--background-alt)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>Continuing Exploration</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                        {['Mathematics', 'Quantum Physics', 'Sanskrit Philosophy'].map((subject, i) => (
                            <div key={i} className="sanctuary-card" style={{ padding: '20px', flex: '1', minWidth: '200px', background: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                                <div style={{ marginBottom: '12px', fontWeight: '800', color: 'var(--ink)' }}>{subject}</div>
                                <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: i === 0 ? '70%' : i === 1 ? '45%' : '85%', height: '100%', background: 'var(--water)', borderRadius: '2px' }}></div>
                                </div>
                                <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--ink-ghost)', textAlign: 'right' }}>{i === 0 ? '70%' : i === 1 ? '45%' : '85%'} Complete</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Personal Sanctuary Note */}
                <div className="sanctuary-card" style={{ padding: '32px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Whispers of Wisdom</h3>
                    <div style={{ fontSize: '18px', fontFamily: 'serif', fontStyle: 'italic', color: 'var(--ink-ghost)', lineHeight: '1.6' }}>
                        "The goal of your exploration today is not just to learn, but to resonate. Let the knowledge flow through you like water."
                    </div>
                </div>
            </div>

            {/* 2. STUDENT UTILITIES (Right) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* AI Study Companion */}
                <div className="sanctuary-card" style={{ padding: '24px', background: 'var(--water)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <Sparkles size={20} />
                        <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>Study Shadow Agent</h3>
                    </div>
                    <p style={{ fontSize: '13px', lineHeight: '1.5', opacity: 0.9, marginBottom: '20px' }}>
                        "I've analyzed your Sanskrit homework. Would you like to review the sandhi rules now?"
                    </p>
                    <button style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontWeight: '700', cursor: 'pointer' }}>Begin Review</button>
                </div>

                {/* Quick Resources */}
                <div className="sanctuary-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', marginBottom: '16px' }}>Library Quick-Jump</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button className="sidebar-item"><Library size={16} /> <span>Main Monastery Library</span></button>
                        <button className="sidebar-item"><BookOpen size={16} /> <span>Your Bookmarked Seeds</span></button>
                        <button className="sidebar-item"><MessageSquare size={16} /> <span>Resonant Discussions</span></button>
                    </div>
                </div>

                {/* Upcoming Resonance */}
                <div className="sanctuary-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px' }}>Timetable Pulse</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--water)' }}>10:30</div>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: '700' }}>Philosophy Discussion</div>
                                <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>Hall of Wisdom</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--lotus)' }}>12:00</div>
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: '700' }}>Energy Mapping</div>
                                <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>Observation Deck</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
