/**
 * FounderSelfView.web.tsx
 *
 * Personal sanctuary for the Founder on web.
 * Scope: Vision notes · Mood · Energy · Wisdom Seeds (WisdomSeeds)
 *
 * Institutional features (ecosystem stats, school gallery, executive oversight)
 * deliberately live in FounderDashboard (Classroom section) — not here.
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRole, useStore } from '@repo/core';
import { useMoodLogs, useEnergyForecast, useWisdom } from '@repo/self';
import { SkeletonCard } from '@repo/ui';
import {
    Compass,
    Sparkles,
    Zap,
    Lightbulb,
    Network,
    Heart,
    TrendingUp,
    Plus
} from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

// ── colour helpers ──────────────────────────────────────────────────────────
const MOOD_LABELS = ['', 'Depleted', 'Low', 'Steady', 'Energised', 'Vibrant'];
const MOOD_COLORS = ['', 'var(--ember)', 'var(--amber-glow)', 'var(--water)', 'var(--moss)', 'var(--lotus)'];
const ENERGY_COLORS = ['', 'var(--ember)', 'var(--amber-glow)', 'var(--water)', 'var(--moss)', 'var(--sanctuary-saffron)'];

type ActivePanel = 'vision' | 'mood' | 'energy' | 'philosophy';

export default function FounderSelfViewWeb() {
    const { t } = useTranslation();
    const { user } = useStore();
    const { userId } = useUserRole();

    const [activePanel, setActivePanel] = useState<ActivePanel>('vision');

    // ── Personal wellbeing hooks ─────────────────────────────────────────
    const { moodHistory, isLoading: moodLoading } = useMoodLogs(userId ?? undefined);
    const { forecasts, isLoading: energyLoading } = useEnergyForecast(userId ?? undefined);
    const { notes: wisdomNotes, isLoading: wisdomLoading } = useWisdom(userId ?? undefined);

    const latestMood = moodHistory[0];
    const todayForecast = forecasts[0];

    const TABS: { id: ActivePanel; icon: any; label: string; color: string; textColor: string }[] = [
        // vision uses the phase accent (--sanctuary-saffron) which can be any luminance,
        // so we use --text-on-action for WCAG-safe adaptive text.
        { id: 'vision',     icon: Compass,    label: 'Vision',       color: 'var(--sanctuary-saffron)', textColor: 'var(--text-on-action)' },
        // water (#3a7a9a), lotus (#c05878), ink (very dark) — all pass AA with white/vellum
        { id: 'mood',       icon: Sparkles,   label: 'Mood Lotus',   color: 'var(--water)',             textColor: '#FCF9F2' },
        { id: 'energy',     icon: Zap,        label: 'Energy',       color: 'var(--lotus)',             textColor: '#FCF9F2' },
        { id: 'philosophy', icon: Lightbulb,  label: 'Philosophy',   color: 'var(--ink)',               textColor: '#FCF9F2' },
    ];

    return (
        <div className="sub-view-container">
            {/* ── LEFT: Main Content ─────────────────────────── */}
            <div className="content-scroll-area">
                {/* Greeting */}
                <div className="greeting" style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ padding: '8px', background: 'rgba(255,166,0,0.1)', borderRadius: '8px', color: 'var(--sanctuary-saffron)' }}>
                            <Compass size={20} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--ink-ghost)' }}>
                            Original Intent
                        </span>
                    </div>
                    <h1 className="greeting-main">
                        The Dream <span style={{ color: 'var(--sanctuary-saffron)' }}>Recursive</span>.
                    </h1>
                    <p className="greeting-note">
                        {user?.full_name ? `${user.full_name.split(' ')[0]}, your personal sanctuary — away from the platform, inside yourself.` : 'Your personal sanctuary — away from the platform, inside yourself.'}
                    </p>
                </div>

                {/* Feature Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActivePanel(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 18px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                                fontWeight: '700', fontSize: '13px', transition: 'all 0.2s',
                                background: activePanel === tab.id ? tab.color : 'var(--background-alt)',
                                color: activePanel === tab.id ? tab.textColor : 'var(--ink)',
                            }}
                        >
                            <tab.icon size={15} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Active Panel */}
                <div className="sanctuary-card">
                    <div className="card-body-inner">
                        {activePanel === 'vision' && <VisionPanel />}
                        {activePanel === 'mood' && <MoodPanel moodHistory={moodHistory} moodLoading={moodLoading} />}
                        {activePanel === 'energy' && <EnergyPanel forecasts={forecasts} energyLoading={energyLoading} />}
                        {activePanel === 'philosophy' && <PhilosophyPanel notes={wisdomNotes} wisdomLoading={wisdomLoading} />}
                    </div>
                </div>
            </div>

            {/* ── RIGHT: Status Sidebar ──────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Mood Card */}
                <div className="sanctuary-card" style={{ background: 'var(--ink)', color: 'white' }}>
                    <div className="card-body-inner">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <Sparkles size={18} />
                            <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Personal State</h3>
                        </div>
                        {moodLoading ? (
                            <p style={{ fontSize: '13px', opacity: 0.7 }}>Loading…</p>
                        ) : latestMood ? (
                            <>
                                <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>
                                    {MOOD_LABELS[latestMood.mood_score]}
                                </div>
                                <div style={{ fontSize: '13px', opacity: 0.6, marginBottom: '8px' }}>{latestMood.mood_score}/5</div>
                                {latestMood.note && (
                                    <p style={{ fontSize: '12px', opacity: 0.7, lineHeight: '1.5', fontStyle: 'italic' }}>
                                        "{latestMood.note}"
                                    </p>
                                )}
                                <div style={{ fontSize: '10px', opacity: 0.4, marginTop: '8px' }}>
                                    {formatDistanceToNow(new Date(latestMood.created_at), { addSuffix: true })}
                                </div>
                            </>
                        ) : (
                            <p style={{ fontSize: '13px', opacity: 0.7 }}>No mood check-in yet today.</p>
                        )}
                    </div>
                </div>

                {/* Energy Snapshot */}
                {!energyLoading && todayForecast && (
                    <div className="sanctuary-card">
                        <div className="card-body-inner">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <Zap size={16} color={ENERGY_COLORS[todayForecast.energy_level ?? 3]} />
                                <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', margin: 0 }}>
                                    Energy Today
                                </h3>
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: ENERGY_COLORS[todayForecast.energy_level ?? 3] }}>
                                {todayForecast.energy_level ?? '—'}/5
                            </div>
                            {todayForecast.notes && (
                                <p style={{ fontSize: '12px', color: 'var(--ink-ghost)', lineHeight: '1.5', fontStyle: 'italic', marginTop: '8px' }}>
                                    "{todayForecast.notes}"
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Wisdom Count */}
                {!wisdomLoading && wisdomNotes.length > 0 && (
                    <div className="sanctuary-card">
                        <div className="card-body-inner">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <Lightbulb size={16} color="var(--sanctuary-saffron)" />
                                <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', margin: 0 }}>
                                    Wisdom Seeds
                                </h3>
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: '800' }}>{wisdomNotes.length}</div>
                            <div style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>Insights cultivated</div>
                        </div>
                    </div>
                )}

                {/* Ecological Reminder — points to Classroom */}
                <div className="sanctuary-card" style={{ background: 'var(--background-alt)', border: 'none' }}>
                    <div className="card-body-inner">
                        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px' }}>
                            <Network size={100} color="var(--ink)" style={{ position: 'absolute', bottom: '-20px', right: '-20px', opacity: 0.05 }} />
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', marginBottom: '8px' }}>
                                    Ecosystem Lives in Classroom
                                </div>
                                <p style={{ fontSize: '12px', color: 'var(--ink-ghost)', lineHeight: '1.5' }}>
                                    Platform stats, school gallery, and executive oversight are in the <strong>Classroom</strong> section — keeping this sanctuary purely personal.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Sub-panels ───────────────────────────────────────────────────────────────

function VisionPanel() {
    return (
        <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Vision Alignment</h2>
            <p style={{ fontSize: '14px', color: 'var(--ink-ghost)', marginBottom: '32px' }}>
                Connecting today's work to the infinite dream. Your founding vision is the north star from which all decisions emanate.
            </p>
            <div style={{ padding: '32px', background: 'var(--background-alt)', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', opacity: 0.07 }}>
                    <Compass size={160} color="var(--sanctuary-saffron)" />
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '20px', fontFamily: 'serif', fontStyle: 'italic', lineHeight: '1.7', color: 'var(--ink-soft)', marginBottom: '24px' }}>
                        "Education is not the filling of a pail, but the lighting of a fire."
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>— W.B. Yeats</div>
                </div>
            </div>
        </div>
    );
}

function MoodPanel({ moodHistory, moodLoading }: { moodHistory: any[]; moodLoading: boolean }) {
    if (moodLoading) return <SkeletonCard />;
    return (
        <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Mood Lotus</h2>
            <p style={{ fontSize: '14px', color: 'var(--ink-ghost)', marginBottom: '24px' }}>
                Your personal emotional resonance — the water from which everything grows.
            </p>
            {moodHistory.length === 0 ? (
                <p style={{ color: 'var(--ink-ghost)', fontSize: '14px' }}>No mood logged yet. Use the mobile app to log your first check-in.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {moodHistory.slice(0, 7).map((m: any) => (
                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 18px', background: 'var(--background-alt)', borderRadius: '12px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '6px', background: MOOD_COLORS[m.mood_score], flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '700', fontSize: '14px' }}>{MOOD_LABELS[m.mood_score]}</div>
                                {m.note && <div style={{ fontSize: '12px', color: 'var(--ink-ghost)', fontStyle: 'italic', marginTop: '2px' }}>"{m.note}"</div>}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>
                                {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function EnergyPanel({ forecasts, energyLoading }: { forecasts: any[]; energyLoading: boolean }) {
    if (energyLoading) return <SkeletonCard />;
    return (
        <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Energy Pulse</h2>
            <p style={{ fontSize: '14px', color: 'var(--ink-ghost)', marginBottom: '24px' }}>
                Your personal energy river — track your capacity to create and lead.
            </p>
            {forecasts.length === 0 ? (
                <p style={{ color: 'var(--ink-ghost)', fontSize: '14px' }}>No energy data yet. Log your energy levels in the mobile app.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {forecasts.slice(0, 7).map((f: any) => (
                        <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--ink-ghost)', width: '90px', flexShrink: 0 }}>
                                {new Date(f.created_at ?? f.date ?? Date.now()).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </div>
                            <div style={{ flex: 1, height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${(f.energy_level ?? 3) * 20}%`, height: '100%', background: ENERGY_COLORS[f.energy_level ?? 3], borderRadius: '4px', transition: 'width 0.4s' }} />
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: '700', width: '36px', textAlign: 'right', color: ENERGY_COLORS[f.energy_level ?? 3] }}>
                                {f.energy_level ?? '—'}/5
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function PhilosophyPanel({ notes, wisdomLoading }: { notes: any[]; wisdomLoading: boolean }) {
    if (wisdomLoading) return <SkeletonCard />;
    return (
        <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Philosophy Logs</h2>
            <p style={{ fontSize: '14px', color: 'var(--ink-ghost)', marginBottom: '24px' }}>
                Your curated treasury of ideas, principles, and the architecture of your mind.
            </p>
            {notes.length === 0 ? (
                <div style={{ padding: '32px', background: 'var(--background-alt)', borderRadius: '16px', textAlign: 'center' }}>
                    <Lightbulb size={32} color="var(--ink-ghost)" style={{ marginBottom: '12px' }} />
                    <p style={{ color: 'var(--ink-ghost)', fontSize: '14px', margin: 0 }}>No wisdom seeds yet. Plant your first insight from the mobile app.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap: '16px' }}>
                    {notes.slice(0, 8).map((note: any) => (
                        <div key={note.id} style={{ padding: '20px 24px', background: 'var(--background-alt)', borderRadius: '14px', borderLeft: '3px solid var(--sanctuary-saffron)' }}>
                            <p style={{ fontSize: '14px', fontStyle: 'italic', lineHeight: '1.6', margin: '0 0 8px' }}>"{note.insight}"</p>
                            {note.tags && note.tags.length > 0 && (
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {note.tags.map((tag: string) => (
                                        <span key={tag} style={{ padding: '2px 8px', background: 'var(--border)', borderRadius: '4px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--ink-ghost)' }}>{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
