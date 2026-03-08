import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRole, useStore, naturePathsAPI } from '@repo/core';
import type { BanyanStage } from '@repo/core';
import { useNavigation } from '@react-navigation/native';
import { SkeletonCard } from '@repo/ui';
import { useMoodLogs, useJournalEntries, useEnergyForecast, VoiceJournaling } from '@repo/self';
import {
    Activity,
    BookOpen,
    MessageSquare,
    Users,
    Heart,
    Flame,
    Wind,
    PenLine,
    TrendingUp
} from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import {
    MOOD_LABELS,
    MOOD_COLORS,
    EnergyBarChart,
    MoodPickerCard,
    WarmMirrorCard,
    ImpactRipplesCard,
    useWellbeingEnrichment,
} from './selfViewShared';

export default function TeacherSelfViewWeb() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { user } = useStore();
    const { userId } = useUserRole();
    const [journalDraft, setJournalDraft] = React.useState('');
    const [showJournalForm, setShowJournalForm] = React.useState(false);
    const [showMoodPicker, setShowMoodPicker] = React.useState(false);
    const [savingMood, setSavingMood] = React.useState(false);

    // Warm Mirror + Impact Ripples — shared hook (eliminates duplicated useEffect blocks)
    const { warmMirrorText, ripples } = useWellbeingEnrichment(userId);
    // Nature Path — Banyan stage (teacher mentorship journey)
    const [banyanState, setBanyanState] = React.useState<{ banyan_stage: BanyanStage; peer_mentored_count: number } | null>(null);

    const { moodHistory, isLoading: moodLoading, addMoodLog } = useMoodLogs(userId ?? undefined);
    const { entries: journalEntries, loading: journalLoading, addJournalEntry } = useJournalEntries();
    const { forecasts, isLoading: energyLoading } = useEnergyForecast(userId ?? undefined);

    const recentMoods = moodHistory.slice(0, 9);
    const latestMood = moodHistory[0];
    const latestJournal = journalEntries[0];
    // Last 7 energy forecasts as a bar chart (most recent last)
    const energyBars = forecasts.slice(0, 7).reverse();

    // Fetch Banyan path state
    React.useEffect(() => {
        if (!userId) return;
        naturePathsAPI.getBanyanState(userId).then(state => {
            if (state) setBanyanState(state);
        }).catch(() => {});
    }, [userId]);

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

                {/* Energy Pulse Visualizer — real data from useEnergyForecast */}
                <div className="sanctuary-card" style={{ padding: '40px', marginBottom: '32px', border: 'none', background: 'var(--background-alt)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Energy Pulse</h2>
                        {energyLoading ? (
                            <SkeletonCard />
                        ) : (
                            <EnergyBarChart bars={energyBars} colors={MOOD_COLORS} />
                        )}
                    </div>
                </div>

                {/* Daily Professional Practice */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '20px' }}>
                    <div className="sanctuary-card interactive" style={{ padding: '32px' }}>
                        <div style={{ marginBottom: '16px', color: 'var(--moss)' }}><Wind size={24} /></div>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Breath & Presence</h3>
                        <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', marginBottom: '20px' }}>Reconnect with your center before the next instructional cycle.</p>
                        <button className="sidebar-item" style={{ background: 'var(--moss-soft)' }} onClick={() => (navigation as any).navigate('AIAssistant')}>Begin Centering</button>
                    </div>

                    <div className="sanctuary-card interactive" style={{ padding: '32px' }}>
                        <div style={{ marginBottom: '16px', color: 'var(--water)' }}><PenLine size={24} /></div>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Reflective Journal</h3>
                        {latestJournal ? (
                            <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', marginBottom: '20px', lineHeight: '1.5' }}>
                                Last entry {formatDistanceToNow(new Date(latestJournal.created_at), { addSuffix: true })}:
                                "{latestJournal.content.substring(0, 80)}{latestJournal.content.length > 80 ? '…' : ''}"
                            </p>
                        ) : (
                            <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', marginBottom: '20px' }}>
                                No journal entries yet. Begin your reflective practice.
                            </p>
                        )}
                        <button className="sidebar-item" style={{ background: 'var(--water-soft)' }} onClick={() => setShowJournalForm(v => !v)}>
                            {showJournalForm ? 'Close' : 'Add Entry'}
                        </button>
                        {showJournalForm && (
                            <div style={{ marginTop: '16px' }}>
                                <textarea
                                    value={journalDraft}
                                    onChange={e => setJournalDraft(e.target.value)}
                                    placeholder="What's on your mind today?"
                                    rows={4}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--glass-surface)', fontSize: '14px', fontFamily: 'var(--font-body)', color: 'var(--ink)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                                />
                                <button
                                    className="sidebar-item"
                                    style={{ background: 'var(--water)', color: '#fff', marginTop: '10px' }}
                                    onClick={async () => {
                                        if (journalDraft.trim()) {
                                            await addJournalEntry(journalDraft.trim());
                                            setJournalDraft('');
                                            setShowJournalForm(false);
                                        }
                                    }}
                                >
                                    Save Entry
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Voice Journaling */}
                    <div className="sanctuary-card interactive" style={{ padding: '32px' }}>
                        <VoiceJournaling userId={user?.id} onComplete={() => {}} />
                    </div>
                </div>
            </div>

            {/* 2. TEACHER SIDEBAR (Right) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
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

                {/* Quick Connections */}
                <div className="sanctuary-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', marginBottom: '16px' }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button className="sidebar-item"><Users size={16} /> <span>Educational Ecology</span></button>
                        <button className="sidebar-item"><Activity size={16} /> <span>Systemic Health</span></button>
                        <button className="sidebar-item"><MessageSquare size={16} /> <span>Faculty Resonance</span></button>
                    </div>
                </div>

                {/* Wellness Gauge — based on recent mood average */}
                <div className="sanctuary-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '800' }}>Wellness Gauge</h3>
                        <Heart size={16} color="var(--lotus)" />
                    </div>
                    {moodLoading ? (
                        <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>Loading…</div>
                    ) : recentMoods.length > 0 ? (
                        <>
                            <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
                                {(() => {
                                    const avg = recentMoods.reduce((s, m) => s + m.mood_score, 0) / recentMoods.length;
                                    if (avg >= 4) return 'High';
                                    if (avg >= 3) return 'Moderate';
                                    if (avg >= 2) return 'Low';
                                    return 'Depleted';
                                })()}
                            </div>
                            <p style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>
                                Based on your last {recentMoods.length} mood log{recentMoods.length !== 1 ? 's' : ''}.
                            </p>
                        </>
                    ) : (
                        <p style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>
                            No mood data recorded yet.
                        </p>
                    )}
                </div>

                {/* Impact Ripples — warm echoes from colleagues and students */}
                <ImpactRipplesCard ripples={ripples} />

                {/* Nature Path — Banyan (Vata Vriksha) badge */}
                {banyanState && (
                    <div className="sanctuary-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(16,185,129,0.04))' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '800' }}>Banyan Path 🌳</h3>
                            <span style={{ fontSize: '11px', color: 'var(--ink-ghost)', fontStyle: 'italic' }}>Vata Vriksha</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '32px' }}>
                                {banyanState.banyan_stage === 'sapling' ? '🌱' : banyanState.banyan_stage === 'roots_spreading' ? '🌿' : banyanState.banyan_stage === 'canopy' ? '🌳' : banyanState.banyan_stage === 'shade_giver' ? '🌲' : '🌳'}
                            </span>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--moss)', textTransform: 'capitalize' }}>
                                    {banyanState.banyan_stage.replace(/_/g, ' ')}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>
                                    {banyanState.peer_mentored_count} colleague{banyanState.peer_mentored_count !== 1 ? 's' : ''} nurtured
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Warm Mirror — weekly narrative */}
                <WarmMirrorCard text={warmMirrorText} />
            </div>
        </div>
    );
}
