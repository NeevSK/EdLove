import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@repo/core';
import {
    Compass,
    Sparkles,
    Zap,
    Lightbulb,
    Globe,
    Heart,
    Waves,
    History,
    Network,
    Terminal
} from 'lucide-react-native';

export default function FounderSelfViewWeb() {
    const { t } = useTranslation();
    const { user } = useStore();

    const coreFeatures = [
        { id: 'vision', label: 'Vision Alignment', icon: Compass, color: 'var(--sanctuary-saffron)' },
        { id: 'mood', label: 'Mood Lotus', icon: Sparkles, color: 'var(--water)' },
        { id: 'energy', label: 'Energy Pulse', icon: Zap, color: 'var(--lotus)' },
        { id: 'philosophy', label: 'Philosophy', icon: Lightbulb, color: 'var(--ink)' },
    ];

    return (
        <div className="sub-view-container">
            {/* 1. VISIONARY HALL (Left/Center) */}
            <div className="content-scroll-area">
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ padding: '8px', background: 'var(--sanctuary-saffron-soft)', borderRadius: '8px', color: 'var(--sanctuary-saffron)' }}>
                            <Compass size={20} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--ink-ghost)' }}>
                            Original Intent
                        </span>
                    </div>
                    <h1 style={{ fontSize: '42px', fontWeight: '800', lineHeight: '1.2', margin: 0, color: 'var(--ink)' }}>
                        The Dream <span style={{ color: 'var(--sanctuary-saffron)' }}>Recursive</span>.
                    </h1>
                </div>

                {/* Legacy Visualizer */}
                <div className="sanctuary-card" style={{ padding: '40px', marginBottom: '32px', background: 'var(--background-alt)', border: 'none', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', opacity: 0.1 }}>
                        <Network size={200} color="var(--ink)" />
                    </div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Ecological Impact</h2>
                        <p style={{ color: 'var(--ink-ghost)', fontSize: '14px', marginBottom: '24px', maxWidth: '400px' }}>
                            Your vision has reached **12,482** souls across **14** institutions today. The resonance is deepening in the primary sectors.
                        </p>
                        <div style={{ display: 'flex', gap: '48px' }}>
                            <div>
                                <div style={{ fontSize: '32px', fontWeight: '800' }}>14</div>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>Institutions</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '32px', fontWeight: '800' }}>92%</div>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>System Health</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {coreFeatures.map(f => (
                        <button key={f.id} className="sanctuary-card interactive" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <div style={{ padding: '12px', background: `${f.color}-soft`, borderRadius: '12px', color: f.color }}>
                                <f.icon size={24} />
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: '700' }}>{f.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. PHILOSOPHY SIDEBAR (Right) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div className="sanctuary-card" style={{ padding: '24px', background: 'var(--ink)', color: 'white' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Terminal size={18} color="rgba(255,255,255,0.5)" />
                        Philosophy Logs
                    </h3>
                    <div style={{ fontSize: '18px', fontFamily: 'serif', fontStyle: 'italic', marginBottom: '24px', lineHeight: '1.5' }}>
                        "The architecture of and for the soul must be as fluid as water yet as structural as stone."
                    </div>
                    <button style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontWeight: '700', cursor: 'pointer' }}>New Thesis</button>
                </div>

                <div className="sanctuary-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px' }}>Systemic Pulse</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Waves size={16} color="var(--water)" />
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: '700' }}>Diffusion Rate</div>
                                <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>Optimal - 1.4x Growth</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <History size={16} color="var(--lotus)" />
                            <div>
                                <div style={{ fontSize: '13px', fontWeight: '700' }}>Legacy Depth</div>
                                <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>3 Years of Resonance</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
