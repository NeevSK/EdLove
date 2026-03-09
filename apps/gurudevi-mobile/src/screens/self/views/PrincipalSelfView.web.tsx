import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRole, useStore, supabase, schoolForestAPI } from '@repo/core';
import type { SchoolForestState } from '@repo/core';
import { useSchoolPulse } from '@repo/profile';
import { useMoodLogs, useEnergyForecast, useDecisionJournal, useWisdom, VoiceJournaling } from '@repo/self';
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
    MessageSquare,
    Users,
    Building
} from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import {
    EnergyBarChart,
    WarmMirrorCard,
    ImpactRipplesCard,
    useWellbeingEnrichment,
    BaseSelfView,
    MoodPickerCard,
    MOOD_COLORS,
    ENERGY_COLORS,
    MOOD_LABELS
} from '@repo/self';
import { SanctuaryTabBar } from '../../../components/web/SanctuaryTabBar';
import type { SanctuaryTab } from '../../../components/web/SanctuaryTabBar';

type ActivePanel = 'pulse' | 'energy' | 'decisions' | 'wisdom' | 'monthly';

export default function PrincipalSelfViewWeb() {
    const { t } = useTranslation();
    const { user } = useStore();
    const { userId } = useUserRole();
    const schoolId = user?.school_id ?? '';

    const [activePanel, setActivePanel] = useState<ActivePanel>('pulse');
    const [newDecision, setNewDecision] = useState('');
    const [addingDecision, setAddingDecision] = useState(false);
    const [forest, setForest] = useState<SchoolForestState | null>(null);
    const [showMoodPicker, setShowMoodPicker] = useState(false);
    const [savingMood, setSavingMood] = useState(false);

    // Warm Mirror + Impact Ripples via shared hook
    const { warmMirrorText, ripples } = useWellbeingEnrichment(userId);

    // ── Personal wellbeing hooks ─────────────────────────────────────────
    const { moodHistory, isLoading: moodLoading, addMoodLog } = useMoodLogs(userId ?? undefined);
    const { forecasts, isLoading: energyLoading } = useEnergyForecast(userId ?? undefined);
    const { decisions, isLoading: decisionLoading, refreshData: refreshDecisions } = useDecisionJournal(userId ?? undefined);
    const { notes: wisdomNotes, isLoading: wisdomLoading } = useWisdom(userId ?? undefined);

    // School pulse — lightweight contextual nudge only
    const { pulse, loading: pulseLoading } = useSchoolPulse(schoolId || undefined);

    const latestMood = moodHistory[0];
    const energyBars = forecasts.slice(0, 7).reverse();

    // School Forest — compassionate overview of teacher tree health
    React.useEffect(() => {
        if (!schoolId) return;
        schoolForestAPI.getForestOverview(schoolId).then(f => setForest(f)).catch(() => { });
    }, [schoolId]);

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

    const TABS: SanctuaryTab<ActivePanel>[] = [
        { id: 'pulse', icon: Activity, label: 'Personal Pulse' },
        { id: 'energy', icon: Battery, label: 'Energy' },
        { id: 'decisions', icon: BookOpen, label: 'Decisions' },
        { id: 'wisdom', icon: Lightbulb, label: 'Wisdom' },
        { id: 'monthly', icon: Calendar, label: 'Reflection' },
    ];

    // ── Personal Layer: The core sanctuary for the person ────────────────
    const personalLayer = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Energy Pulse Visualizer */}
            <div className="sanctuary-card" style={{ padding: '40px', background: 'var(--background-alt)' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Energy Pulse</h2>
                <p style={{ fontSize: '14px', color: 'var(--ink-ghost)', marginBottom: '24px' }}>
                    Your personal leadership capacity — the foundation of your impact.
                </p>
                {energyLoading ? (
                    <SkeletonCard />
                ) : (
                    <EnergyBarChart bars={energyBars} colors={MOOD_COLORS} />
                )}
            </div>

            {/* Voice Journaling — RESTORED to Principal for self-care */}
            <div className="sanctuary-card interactive" style={{ padding: '32px' }}>
                <div style={{ marginBottom: '16px', color: 'var(--lotus)' }}><MessageSquare size={24} /></div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Leadership Unburdening</h3>
                <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', marginBottom: '20px' }}>
                    Speak the truths that you can't share in the boardroom. A private space for your internal voice.
                </p>
                <VoiceJournaling userId={userId} onComplete={() => { }} />
            </div>
        </div>
    );

    // ── Working Layer: Leadership reflections (The Porch) ──────────────────
    const workingLayer = (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <Building size={16} color="var(--ink-ghost)" />
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>leadership Resonance</h2>
            </div>

            <SanctuaryTabBar
                tabs={TABS}
                activeId={activePanel}
                onSelect={(id) => setActivePanel(id as ActivePanel)}
            />

            <div className="sanctuary-card" style={{ marginTop: '24px' }}>
                <div style={{ padding: '32px' }}>
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
    );

    // ── Sidebar: Mirrors of Impact ──────────────────────────────────────────
    const sideBar = (
        <>
            {/* Mood Resonance */}
            <MoodPickerCard
                isOpen={showMoodPicker}
                onToggle={() => setShowMoodPicker(v => !v)}
                onSelect={async (mood, note) => {
                    setSavingMood(true);
                    try {
                        await addMoodLog(mood, note || undefined);
                        setShowMoodPicker(false);
                    } finally {
                        setSavingMood(false);
                    }
                }}
                isSaving={savingMood}
                latestMood={latestMood}
                isLoading={moodLoading}
                accent="dark"
            />

            {/* School Resonance Nudge — Relational Mirror */}
            {!pulseLoading && pulse && (
                <div className="sanctuary-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <TrendingUp size={16} color="var(--lotus)" />
                        <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', margin: 0 }}>
                            Relational Pulse
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
                </div>
            )}

            {/* Impact Ripples */}
            <ImpactRipplesCard ripples={ripples} />

            {/* Warm Mirror */}
            <WarmMirrorCard text={warmMirrorText} />
        </>
    );

    return (
        <BaseSelfView
            role="principal"
            personalLayer={personalLayer}
            workingLayer={workingLayer}
            sideBar={sideBar}
            description={t('principal.sanctuaryDesc', "Your wellbeing is the foundation of your school's wellbeing.")}
        />
    );
}

// ── Sub-panels (Extracted from original for cleanliness) ──────────────────────

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
                <p style={{ color: 'var(--ink-ghost)', fontSize: '14px' }}>No mood logged yet.</p>
            )}
        </div>
    );
}

function EnergyPanel({ forecasts, energyLoading }: { forecasts: any[]; energyLoading: boolean }) {
    if (energyLoading) return <SkeletonCard />;
    return (
        <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Energy Forecast</h2>
            {forecasts.length === 0 ? (
                <p style={{ color: 'var(--ink-ghost)', fontSize: '14px' }}>No energy data yet.</p>
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
            {decisionLoading ? <SkeletonCard /> : decisions.length === 0 ? (
                <p style={{ color: 'var(--ink-ghost)', fontSize: '14px' }}>No decisions logged yet.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {decisions.slice(0, 10).map((d: any) => (
                        <div key={d.id} style={{ padding: '16px 20px', background: 'var(--background-alt)', borderRadius: '12px', borderLeft: '3px solid var(--moss)' }}>
                            <div style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '6px' }}>{d.decision_text}</div>
                            <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>
                                {formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}
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
            {notes.length === 0 ? (
                <p style={{ color: 'var(--ink-ghost)', fontSize: '14px' }}>No wisdom notes yet.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap: '16px' }}>
                    {notes.slice(0, 6).map((note: any) => (
                        <div key={note.id} style={{ padding: '20px 24px', background: 'var(--background-alt)', borderRadius: '14px' }}>
                            <p style={{ fontSize: '14px', fontStyle: 'italic', lineHeight: '1.6', margin: '0' }}>"{note.insight}"</p>
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
        </div>
    );
}
