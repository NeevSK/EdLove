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
        <div className="sub-view-container">
            {/* ── LEFT COLUMN: DASHBOARD ── */}
            <div className="content-scroll-area">
                {/* 1. GREETING SECTION */}
                <div className="greeting">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ padding: '8px', background: 'rgba(58, 122, 154, 0.1)', borderRadius: '8px', color: 'var(--water)' }}>
                            <TrendingUp size={18} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--ink-ghost)' }}>
                            Growth Dashboard
                        </span>
                    </div>
                    <h1 className="greeting-main">
                        Peaceful <span style={{ color: 'var(--water)' }}>Progress</span>.
                    </h1>
                    <p className="greeting-note">Welcome back to your sanctuary of growth.</p>
                </div>
                {/* Key Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                    {studyStats.map(stat => (
                        <div key={stat.id} className={`sanctuary-card ${stat.id === '1' ? 'card-water' : stat.id === '2' ? 'card-lotus' : 'card-moss'}`}>
                            <div className="card-body-inner">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                    <div style={{ color: stat.color }}>
                                        <stat.icon size={20} />
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-ghost)' }}>{stat.label}</span>
                                </div>
                                <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--ink)' }}>{stat.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Primary Study Suite */}
                <div className="sanctuary-card" style={{ marginBottom: '40px' }}>
                    <div className="card-body-inner">
                        <h2 style={{ fontSize: '22px', fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: '24px' }}>Continuing Exploration</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                            {['Mathematics', 'Quantum Physics', 'Sanskrit Philosophy'].map((subject, i) => (
                                <div key={i} className="sanctuary-card" style={{ padding: '20px', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.03)' }}>
                                    <div style={{ marginBottom: '16px', fontWeight: '700', color: 'var(--ink)' }}>{subject}</div>
                                    <div style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: i === 0 ? '70%' : i === 1 ? '45%' : '85%', height: '100%', background: 'linear-gradient(to right, var(--water), #5a9aba)', borderRadius: '10px' }}></div>
                                    </div>
                                    <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--ink-ghost)', fontWeight: '600' }}>{i === 0 ? '70' : i === 1 ? '45' : '85'}% Mastered</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Wisdom Inscription */}
                <div className="sanctuary-card">
                    <div className="card-body-inner" style={{ padding: '40px' }}>
                        <div style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--ink-soft)', lineHeight: '1.6', textAlign: 'center' }}>
                            "The goal of your exploration today is not just to learn, but to resonate. <br />Let the knowledge flow through you like water."
                        </div>
                    </div>
                </div>
            </div>

            {/* ── RIGHT COLUMN: UTILITIES ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Shadow Agent */}
                <div className="sanctuary-card card-water" style={{ background: 'var(--water)', color: 'white' }}>
                    <div className="card-body-inner">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <Sparkles size={20} />
                            <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', fontStyle: 'italic', margin: 0 }}>Study Shadow Agent</h3>
                        </div>
                        <p style={{ fontSize: '14px', lineHeight: '1.6', opacity: 0.9, marginBottom: '24px' }}>
                            "I've analyzed your Sanskrit homework. Would you like to review the sandhi rules now?"
                        </p>
                        <button style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontWeight: '700', transition: 'all 0.2s' }}>Begin Deep Review</button>
                    </div>
                </div>

                {/* Quick Jumps */}
                <div className="sanctuary-card">
                    <div className="card-body-inner">
                        <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>Library Quick-Jump</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                { icon: Library, label: 'Monastery Library' },
                                { icon: BookOpen, label: 'Bookmarked Seeds' },
                                { icon: MessageSquare, label: 'Resonant Discussions' }
                            ].map((item, idx) => (
                                <button key={idx} className="sidebar-item" style={{ margin: 0 }}>
                                    <item.icon size={16} /> <span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Time Pulse */}
                <div className="sanctuary-card">
                    <div className="card-body-inner">
                        <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>Timetable Pulse</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {[
                                { time: '10:30', title: 'Philosophy Discussion', loc: 'Hall of Wisdom', col: 'var(--water)' },
                                { time: '12:00', title: 'Energy Mapping', loc: 'Observation Deck', col: 'var(--lotus)' }
                            ].map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '900', color: item.col, paddingTop: '2px' }}>{item.time}</div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--ink)' }}>{item.title}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>{item.loc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
