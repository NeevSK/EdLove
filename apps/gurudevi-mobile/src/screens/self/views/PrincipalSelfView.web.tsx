/**
 * PrincipalSelfView.web.tsx
 *
 * Personal wellbeing sanctuary for principals on web.
 * Scope: Mood · Energy · Decision Journal · Leadership Wisdom
 *
 * Institutional features (school pulse, staff wellbeing) live in
 * PrincipalSchoolView (Classroom section) — not here.
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRole, useStore, supabase } from '@repo/core';
import { useSchoolPulse } from '@repo/profile';
import { useMoodLogs, useEnergyForecast, useDecisionJournal, useWisdom } from '@repo/self';
import { SkeletonCard } from '@repo/ui';
import {
    Battery,
    Activity,
    BookOpen,
    Lightbulb,
    Calendar,
    Zap,
    TrendingUp,
    Heart,
    Plus,
    Building
} from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

// ── colour helpers ──────────────────────────────────────────────────────────
const MOOD_LABELS = ['', 'Depleted', 'Low', 'Steady', 'Energised', 'Vibrant'];
const MOOD_COLORS = ['', 'var(--ember)', 'var(--amber-glow)', 'var(--water)', 'var(--moss)', 'var(--lotus)'];
const ENERGY_COLORS = ['', 'var(--ember)', 'var(--amber-glow)', 'var(--water)', 'var(--moss)', 'var(--sanctuary-saffron)'];

type ActivePanel = 'pulse' | 'energy' | 'decisions' | 'wisdom' | 'monthly';

export default function PrincipalSelfViewWeb() {
    const { t } = useTranslation();
    const { user } = useStore();
    const { userId } = useUserRole();
    const schoolId = user?.school_id ?? '';

    const [activePanel, setActivePanel] = useState<ActivePanel>('pulse');
    const [newDecision, setNewDecision] = useState('');
    const [addingDecision, setAddingDecision] = useState(false);

    // ── Personal wellbeing hooks ─────────────────────────────────────────
    const { moodHistory, isLoading: moodLoading } = useMoodLogs(userId ?? undefined);
    const { forecasts, isLoading: energyLoading } = useEnergyForecast(userId ?? undefined);
    const { decisions, isLoading: decisionLoading, refreshData: refreshDecisions } = useDecisionJournal(userId ?? undefined);
    const { notes: wisdomNotes, isLoading: wisdomLoading } = useWisdom(userId ?? undefined);

    // School pulse — lightweight contextual nudge only, not full school view
    const { pulse, loading: pulseLoading } = useSchoolPulse(schoolId || undefined);

    const latestMood = moodHistory[0];
    const todayForecast = forecasts[0];

    const handleAddDecision = async () => {
        if (!newDecision.trim() || !userId) return;
        setAddingDecision(true);
        try {
            await supabase.from('decision_journals').insert({
                user_id: userId,
                decision_text: newDecision.trim(),
                context: 'leadership',
                is_reviewed: false,
            });
            setNewDecision('');
            refreshDecisions();
        } catch (e) {
            console.error('[PrincipalSelfView] Error adding decision:', e);
        } finally {
            setAddingDecision(false);
        }
    };

    // ── Feature tabs ─────────────────────────────────────────────────────
    const TABS: { id: ActivePanel; icon: any; label: string }[] = [
        { id: 'pulse', icon: Activity, label: 'Personal Pulse' },
        { id: 'energy', icon: Battery, label: 'Energy' },
        { id: 'decisions', icon: BookOpen, label: 'Decisions' },
        { id: 'wisdom', icon: Lightbulb, label: 'Wisdom' },
        { id: 'monthly', icon: Calendar, label: 'Reflection' },
    ];

    return (
        <div className="sub-view-container">
            {/* ── LEFT: Main Content ─────────────────────────── */}
            <div className="content-scroll-area">
                {/* Greeting */}
                <div className="greeting" style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ padding: '8px', background: 'var(--moss-soft)', borderRadius: '8px', color: 'var(--moss)' }}>
                            <Building size={18} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--ink-ghost)' }}>
                            Personal Sanctuary
                        </span>
                    </div>
                    <h1 className="greeting-main">
                        Leadership <span style={{ color: 'var(--moss)' }}>Resonance</span>.
                    </h1>
                    <p className="greeting-note">
                        {user?.full_name
                            ? `${user.full_name.split(' ')[0]}, your wellbeing is the foundation of your school's wellbeing.`
                            : "Your wellbeing is the foundation of your school's wellbeing."}
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
                                background: activePanel === tab.id ? 'var(--moss)' : 'var(--background-alt)',
                                color: activePanel === tab.id ? 'white' : 'var(--ink)',
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
                        {activePanel === 'pulse' && <PulsePanel latestMood={latestMood} moodLoading={moodLoading} />}
                        {activePanel === 'energy' && <EnergyPanel forecasts={forecasts} energyLoading={energyLoading} />}
                        {activePanel === 'decisions' && (
                            <DecisionsPanel
                                decisions={decisions}
                                decisionLoading={decisionLoading}
                                newDecision={newDecision}
                                setNewDecision={setNewDecision}
                                onAdd={handleAddDecision}
                                addingDecision={addingDecision}
                            />
                        )}
                        {activePanel === 'wisdom' && <WisdomPanel notes={wisdomNotes} wisdomLoading={wisdomLoading} />}
                        {activePanel === 'monthly' && <MonthlyPanel moodHistory={moodHistory} decisions={decisions} />}
                    </div>
                </div>
            </div>

            {/* ── RIGHT: Status Sidebar ──────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Today's State Card */}
                <div className="sanctuary-card" style={{ background: 'var(--moss)', color: 'white' }}>
                    <div className="card-body-inner">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <Heart size={18} />
                            <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Today's State</h3>
                        </div>
                        {moodLoading ? (
                            <p style={{ fontSize: '13px', opacity: 0.8 }}>Loading…</p>
                        ) : latestMood ? (
                            <>
                                <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px' }}>
                                    {MOOD_LABELS[latestMood.mood_score]}
                                </div>
                                <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '8px' }}>{latestMood.mood_score}/5 energy</div>
                                {latestMood.note && (
                                    <p style={{ fontSize: '12px', opacity: 0.7, lineHeight: '1.5', fontStyle: 'italic', marginBottom: '8px' }}>
                                        "{latestMood.note}"
                                    </p>
                                )}
                                <div style={{ fontSize: '10px', opacity: 0.5 }}>
                                    {formatDistanceToNow(new Date(latestMood.created_at), { addSuffix: true })}
                                </div>
                            </>
                        ) : (
                            <p style={{ fontSize: '13px', opacity: 0.8 }}>No mood logged today yet.</p>
                        )}
                    </div>
                </div>

                {/* School Resonance Nudge — lightweight reference only */}
                {!pulseLoading && pulse && (
                    <div className="sanctuary-card">
                        <div className="card-body-inner">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <TrendingUp size={16} color="var(--lotus)" />
                                <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', margin: 0 }}>
                                    School Resonance
                                </h3>
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '4px' }}>
                                {Math.round(pulse.resonance_score)}%
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--ink-ghost)', textTransform: 'capitalize', marginBottom: '12px' }}>
                                {pulse.trend} · {pulse.aggregated_mood}
                            </div>
                            <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px' }}>
                                <div style={{ width: `${pulse.resonance_score}%`, height: '100%', background: 'var(--lotus)', borderRadius: '2px', transition: 'width 0.6s' }} />
                            </div>
                            <p style={{ fontSize: '11px', color: 'var(--ink-ghost)', marginTop: '8px' }}>
                                Visit <strong>Classroom</strong> for the full institutional view.
                            </p>
                        </div>
                    </div>
                )}

                {/* Today's Energy */}
                {!energyLoading && todayForecast && (
                    <div className="sanctuary-card">
                        <div className="card-body-inner">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <Zap size={16} color={ENERGY_COLORS[todayForecast.energy_level ?? 3]} />
                                <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', margin: 0 }}>
                                    Energy Today
                                </h3>
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: ENERGY_COLORS[todayForecast.energy_level ?? 3], marginBottom: '8px' }}>
                                {todayForecast.energy_level ?? '—'}/5
                            </div>
                            {todayForecast.notes && (
                                <p style={{ fontSize: '12px', color: 'var(--ink-ghost)', lineHeight: '1.5', fontStyle: 'italic' }}>
                                    "{todayForecast.notes}"
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Quick Decision Log */}
                <div className="sanctuary-card">
                    <div className="card-body-inner">
                        <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', marginBottom: '12px' }}>
                            Quick Decision
                        </h3>
                        <textarea
                            value={newDecision}
                            onChange={e => setNewDecision(e.target.value)}
                            placeholder="Record a key decision…"
                            style={{ width: '100%', minHeight: '80px', borderRadius: '10px', border: '1px solid var(--border)', padding: '10px 12px', fontSize: '13px', resize: 'vertical', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'inherit', boxSizing: 'border-box' }}
                        />
                        <button
                            onClick={handleAddDecision}
                            disabled={addingDecision || !newDecision.trim()}
                            style={{ marginTop: '10px', padding: '8px 16px', borderRadius: '8px', background: 'var(--moss)', color: 'white', border: 'none', fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: addingDecision || !newDecision.trim() ? 0.6 : 1 }}
                        >
                            <Plus size={14} /> {addingDecision ? 'Logging…' : 'Log Decision'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Sub-panels ───────────────────────────────────────────────────────────────

function PulsePanel({ latestMood, moodLoading }: { latestMood: any; moodLoading: boolean }) {
    if (moodLoading) return <SkeletonCard />;
    return (
        <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Personal Pulse</h2>
            <p style={{ fontSize: '14px', color: 'var(--ink-ghost)', marginBottom: '24px' }}>
                Your personal mood and energy patterns — the foundation from which you lead.
            </p>
            {latestMood ? (
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1', minWidth: '160px', padding: '24px', background: 'var(--background-alt)', borderRadius: '16px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase', marginBottom: '8px' }}>Last Mood</div>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: MOOD_COLORS[latestMood.mood_score] }}>{MOOD_LABELS[latestMood.mood_score]}</div>
                        <div style={{ fontSize: '12px', color: 'var(--ink-ghost)', marginTop: '4px' }}>{latestMood.mood_score}/5</div>
                    </div>
                    {latestMood.note && (
                        <div style={{ flex: '2', minWidth: '200px', padding: '24px', background: 'var(--background-alt)', borderRadius: '16px' }}>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase', marginBottom: '8px' }}>Reflection</div>
                            <p style={{ fontSize: '14px', lineHeight: '1.6', fontStyle: 'italic', margin: 0 }}>"{latestMood.note}"</p>
                        </div>
                    )}
                </div>
            ) : (
                <p style={{ color: 'var(--ink-ghost)', fontSize: '14px' }}>No mood logged yet. Use the mobile app to log your first check-in.</p>
            )}
        </div>
    );
}

function EnergyPanel({ forecasts, energyLoading }: { forecasts: any[]; energyLoading: boolean }) {
    if (energyLoading) return <SkeletonCard />;
    return (
        <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Energy Forecast</h2>
            <p style={{ fontSize: '14px', color: 'var(--ink-ghost)', marginBottom: '24px' }}>
                Your personal energy rhythm — know when you are at peak leadership capacity.
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

function DecisionsPanel({ decisions, decisionLoading, newDecision, setNewDecision, onAdd, addingDecision }: { decisions: any[]; decisionLoading: boolean; newDecision: string; setNewDecision: (v: string) => void; onAdd: () => void; addingDecision: boolean }) {
    if (decisionLoading) return <SkeletonCard />;
    return (
        <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Decision Journal</h2>
            <p style={{ fontSize: '14px', color: 'var(--ink-ghost)', marginBottom: '24px' }}>Record key decisions to build a personal leadership ledger.</p>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <input
                    value={newDecision}
                    onChange={e => setNewDecision(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) onAdd(); }}
                    placeholder="Log a key decision…"
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'inherit' }}
                />
                <button
                    onClick={onAdd}
                    disabled={addingDecision || !newDecision.trim()}
                    style={{ padding: '10px 20px', borderRadius: '10px', background: 'var(--moss)', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', opacity: addingDecision || !newDecision.trim() ? 0.6 : 1 }}
                >
                    {addingDecision ? '…' : 'Log'}
                </button>
            </div>
            {decisions.length === 0 ? (
                <p style={{ color: 'var(--ink-ghost)', fontSize: '14px' }}>No decisions logged yet.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {decisions.slice(0, 10).map((d: any) => (
                        <div key={d.id} style={{ padding: '16px 20px', background: 'var(--background-alt)', borderRadius: '12px', borderLeft: '3px solid var(--moss)' }}>
                            <div style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '6px' }}>{d.decision_text}</div>
                            <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>
                                {formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}
                                {d.context && <span style={{ marginLeft: '8px', padding: '2px 8px', background: 'var(--border)', borderRadius: '4px' }}>{d.context}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function WisdomPanel({ notes, wisdomLoading }: { notes: any[]; wisdomLoading: boolean }) {
    if (wisdomLoading) return <SkeletonCard />;
    return (
        <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Leadership Wisdom</h2>
            <p style={{ fontSize: '14px', color: 'var(--ink-ghost)', marginBottom: '24px' }}>Your curated treasury of insights, principles, and leadership philosophy.</p>
            {notes.length === 0 ? (
                <p style={{ color: 'var(--ink-ghost)', fontSize: '14px' }}>No wisdom notes yet. Add your first insight from the mobile app.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap: '16px' }}>
                    {notes.slice(0, 6).map((note: any) => (
                        <div key={note.id} style={{ padding: '20px 24px', background: 'var(--background-alt)', borderRadius: '14px' }}>
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

function MonthlyPanel({ moodHistory, decisions }: { moodHistory: any[]; decisions: any[] }) {
    const thisMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthMoods = moodHistory.filter(m => new Date(m.created_at) >= monthStart);
    const monthDecisions = decisions.filter(d => new Date(d.created_at) >= monthStart);
    const avgMood = monthMoods.length > 0
        ? (monthMoods.reduce((s, m) => s + m.mood_score, 0) / monthMoods.length).toFixed(1)
        : null;

    return (
        <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Monthly Reflection — {thisMonth}</h2>
            <p style={{ fontSize: '14px', color: 'var(--ink-ghost)', marginBottom: '24px' }}>A bird's-eye view of your personal leadership month.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                    { label: 'Mood Check-ins', value: String(monthMoods.length), color: 'var(--lotus)' },
                    { label: 'Avg Mood', value: avgMood ? `${avgMood}/5` : '—', color: avgMood ? MOOD_COLORS[Math.round(Number(avgMood))] : 'var(--ink-ghost)' },
                    { label: 'Decisions Logged', value: String(monthDecisions.length), color: 'var(--moss)' },
                ].map((s, i) => (
                    <div key={i} style={{ padding: '20px', background: 'var(--background-alt)', borderRadius: '14px' }}>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: s.color, marginBottom: '4px' }}>{s.value}</div>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>{s.label}</div>
                    </div>
                ))}
            </div>
            {monthDecisions.length > 0 && (
                <div>
                    <h3 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', marginBottom: '12px' }}>This Month's Decisions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {monthDecisions.slice(0, 5).map((d: any) => (
                            <div key={d.id} style={{ padding: '12px 16px', background: 'var(--background-alt)', borderRadius: '10px', fontSize: '13px', lineHeight: '1.5' }}>
                                {d.decision_text}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
