import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRole, useStore } from '@repo/core';
import {
    Activity,
    Zap,
    BookOpen,
    Coffee,
    MessageSquare,
    Users,
    Heart,
    Flame,
    Wind
} from 'lucide-react-native';

export default function TeacherSelfViewWeb() {
    const { t } = useTranslation();
    const { user } = useStore();

    return (
        <div className="sub-view-container">
            {/* 1. TEACHER SANCTUARY (Left) */}
            <div className="content-scroll-area">
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ padding: '8px', background: 'var(--lotus-soft)', borderRadius: '8px', color: 'var(--lotus)' }}>
                            <Flame size={18} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--ink-ghost)' }}>
                            Teacher's Resonance
                        </span>
                    </div>
                    <h1 style={{ fontSize: '38px', fontWeight: '800', margin: 0, color: 'var(--ink)' }}>
                        Radiate <span style={{ color: 'var(--lotus)' }}>Clarity</span>.
                    </h1>
                </div>

                {/* Energy Pulse Visualizer */}
                <div className="sanctuary-card" style={{ padding: '40px', marginBottom: '32px', border: 'none', background: 'var(--background-alt)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Energy Pulse Mapping</h2>
                        <p style={{ color: 'var(--ink-ghost)', fontSize: '14px', marginBottom: '32px' }}>Your resonance is currently at an optimal frequency for deep instructional relay.</p>

                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px' }}>
                            {[40, 60, 45, 80, 50, 90, 70, 85, 60].map((h, i) => (
                                <div key={i} style={{ flex: 1, background: 'var(--lotus)', height: `${h}%`, borderRadius: '4px', opacity: 0.3 + (h / 150) }}></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Daily Professional Practice */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="sanctuary-card interactive" style={{ padding: '32px' }}>
                        <div style={{ marginBottom: '16px', color: 'var(--moss)' }}><Wind size={24} /></div>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Breath & Presence</h3>
                        <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', marginBottom: '20px' }}>Reconnect with your center before the next instructional cycle.</p>
                        <button className="sidebar-item" style={{ background: 'var(--moss-soft)' }}>Begin Centering</button>
                    </div>

                    <div className="sanctuary-card interactive" style={{ padding: '32px' }}>
                        <div style={{ marginBottom: '16px', color: 'var(--water)' }}><BookOpen size={24} /></div>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Reflective Journal</h3>
                        <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', marginBottom: '20px' }}>How did the student resonance feel in the last Mathematics sanctuary?</p>
                        <button className="sidebar-item" style={{ background: 'var(--water-soft)' }}>Add Entry</button>
                    </div>
                </div>
            </div>

            {/* 2. TEACHER SIDEBAR (Right) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Pedagogical Insights */}
                <div className="sanctuary-card" style={{ padding: '24px', background: 'var(--ink)', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <Zap size={20} color="var(--lotus)" />
                        <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>Insight Brief</h3>
                    </div>
                    <p style={{ fontSize: '13px', opacity: 0.9, lineHeight: '1.5', marginBottom: '20px' }}>
                        Student focus has increased by **12%** today. The use of meditation before science class is yielding high resonance.
                    </p>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '20px' }}></div>
                    <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', opacity: 0.6 }}>Top Resonator</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', marginTop: '4px' }}>Grade 11 - Quantum Basics</div>
                </div>

                {/* Quick Connections */}
                <div className="sanctuary-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', marginBottom: '16px' }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button className="sidebar-item"><Users size={16} /> <span>Educational Ecology</span></button>
                        <button className="sidebar-item"><Activity size={16} /> <span>Systemic Health</span></button>
                        <button className="sidebar-item"><MessageSquare size={16} /> <span>Faculty Resonance</span></button>
                    </div>
                </div>

                {/* Wellness Anchor */}
                <div className="sanctuary-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '800' }}>Wellness Gauge</h3>
                        <Heart size={16} color="var(--lotus)" />
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>High</div>
                    <p style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>You have completed 3/4 daily grounding ceremonies.</p>
                </div>
            </div>
        </div>
    );
}
