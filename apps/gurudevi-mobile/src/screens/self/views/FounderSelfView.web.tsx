/**
 * FounderSelfView.web.tsx
 *
 * Personal sanctuary for the Founder on web.
 * Scope: Vision notes · Mood · Energy · Wisdom Seeds (WisdomSeeds)
 *
 * Institutional features (ecosystem stats, school gallery, executive oversight)
 * deliberately live in FounderDashboard (Classroom section) — not here.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRole, useStore, supabase } from '@repo/core';
import { SkeletonCard } from '@repo/ui';
import {
    useMoodLogs,
    useEnergyForecast,
    useWisdom,
    useWellbeingEnrichment,
    BaseSelfView,
    MoodPickerCard,
    EnergyBarChart,
    WarmMirrorCard,
    ImpactRipplesCard,
    MOOD_LABELS,
    MOOD_COLORS,
    ENERGY_COLORS,
    MoodLotus,
    ResonancePatternCard,
    DailyContentCard,
    SleepTracker,
    BreathGuide,
    EnergyForecast,
    TomorrowPrep,
    CommunityPresence,
    RemindersManager,
    ShadowAgentDrawer,
    WelcomeModal,
} from '@repo/self';
import {
    Compass,
    Sparkles,
    Zap,
    Lightbulb,
    Network,
} from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { SanctuaryTabBar } from '../../../components/web/SanctuaryTabBar';
import type { SanctuaryTab } from '../../../components/web/SanctuaryTabBar';

type ActivePanel = 'vision' | 'mood' | 'energy' | 'philosophy';

export default function FounderSelfViewWeb() {
    const { t } = useTranslation();
    const { user } = useStore();
    const { userId } = useUserRole();
    const justFinishedOnboarding = useStore((s) => s.justFinishedOnboarding);
    const setJustFinishedOnboarding = useStore((s) => s.setJustFinishedOnboarding);

    const [activePanel, setActivePanel] = useState<ActivePanel>('vision');
    const [showMoodPicker, setShowMoodPicker] = useState(false);
    const [savingMood, setSavingMood] = useState(false);

    // ── Vision statement (persisted to users.bio) ────────────────────────
    const [visionText, setVisionText] = useState(user?.bio ?? '');
    const [savingVision, setSavingVision] = useState(false);
    const [visionSaved, setVisionSaved] = useState(false);

    // Keep in sync if user object loads after mount
    useEffect(() => {
        if (user?.bio && !visionText) setVisionText(user.bio);
    }, [user?.bio]);

    const handleSaveVision = useCallback(async () => {
        if (!userId || !visionText.trim()) return;
        setSavingVision(true);
        try {
            await supabase.from('users').update({ bio: visionText.trim() }).eq('id', userId);
            setVisionSaved(true);
            setTimeout(() => setVisionSaved(false), 2500);
        } catch (e) {
            console.error('[FounderSelfView] Failed to save vision:', e);
        } finally {
            setSavingVision(false);
        }
    }, [userId, visionText]);

    // ── Wisdom note add ──────────────────────────────────────────────────
    const { notes: wisdomNotes, isLoading: wisdomLoading, setNotes: setWisdomNotes } = useWisdom(userId ?? undefined);
    const [wisdomDraft, setWisdomDraft] = useState('');
    const [savingWisdom, setSavingWisdom] = useState(false);

    const handleAddWisdom = useCallback(async () => {
        if (!userId || !wisdomDraft.trim()) return;
        setSavingWisdom(true);
        try {
            const { data, error } = await supabase
                .from('user_wisdom')
                .insert({ user_id: userId, insight: wisdomDraft.trim(), tags: [] })
                .select()
                .single();
            if (!error && data) {
                setWisdomNotes(prev => [data, ...prev]);
                setWisdomDraft('');
            }
        } catch (e) {
            console.error('[FounderSelfView] Failed to add wisdom:', e);
        } finally {
            setSavingWisdom(false);
        }
    }, [userId, wisdomDraft, setWisdomNotes]);

    // ── Personal wellbeing hooks ─────────────────────────────────────────
    const { moodHistory, isLoading: moodLoading, addMoodLog } = useMoodLogs(userId ?? undefined);
    const { forecasts, isLoading: energyLoading } = useEnergyForecast(userId ?? undefined);
    const { warmMirrorText, ripples } = useWellbeingEnrichment(userId);

    const latestMood = moodHistory[0];
    const todayForecast = forecasts[0];
    const energyBars = forecasts.slice(0, 7).reverse();

    const TABS: SanctuaryTab<ActivePanel>[] = [
        { id: 'vision', icon: Compass, label: 'Vision', activeColor: 'var(--sanctuary-saffron)', activeTextColor: 'var(--text-on-action)' },
        { id: 'mood', icon: Sparkles, label: 'Mood Lotus', activeColor: 'var(--water)', activeTextColor: '#FCF9F2' },
        { id: 'energy', icon: Zap, label: 'Energy', activeColor: 'var(--lotus)', activeTextColor: '#FCF9F2' },
        { id: 'philosophy', icon: Lightbulb, label: 'Philosophy', activeColor: 'var(--ink)', activeTextColor: '#FCF9F2' },
    ];

    // ── personalLayer: the inner life — mood, energy pulse ──────────────
    const personalLayer = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Greeting */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ padding: '8px', background: 'rgba(255,166,0,0.1)', borderRadius: '8px', color: 'var(--sanctuary-saffron)' }}>
                        <Compass size={20} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--ink-ghost)' }}>Original Intent</span>
                </div>
                <h1 className="greeting-main">The Dream <span style={{ color: 'var(--sanctuary-saffron)' }}>Recursive</span>.</h1>
                <p className="greeting-note">
                    {user?.full_name ? `${user.full_name.split(' ')[0]}, your personal sanctuary — away from the platform, inside yourself.` : 'Your personal sanctuary — away from the platform, inside yourself.'}
                </p>
            </div>

            {/* Daily Content — founder-level insight */}
            <div className="sanctuary-card" style={{ padding: '4px' }}>
                <DailyContentCard type="motivation" />
            </div>

            {/* Energy Pulse */}
            <div className="sanctuary-card" style={{ padding: '32px', background: 'var(--background-alt)' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px' }}>Energy Pulse</h2>
                {energyLoading ? <SkeletonCard /> : <EnergyBarChart bars={energyBars} colors={MOOD_COLORS} />}
            </div>

            {/* Mood Lotus — bloom visualizer + breath guide */}
            <div className="sanctuary-card" style={{ padding: '28px' }}>
                <MoodLotus userId={userId ?? undefined} />
            </div>

            {/* Sleep Tracker — restore the dreamer */}
            <div className="sanctuary-card" style={{ padding: '28px' }}>
                <SleepTracker userId={userId ?? undefined} />
            </div>

            {/* Breath Guide — return to stillness */}
            <div className="sanctuary-card" style={{ padding: '28px' }}>
                <BreathGuide />
            </div>
        </div>
    );

    // ── workingLayer: vision alignment, philosophy, tabbed exploration + resonance ───
    const workingLayer = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
                <SanctuaryTabBar tabs={TABS} activeId={activePanel} onSelect={(id) => setActivePanel(id as ActivePanel)} />
                <div className="sanctuary-card" style={{ marginTop: '24px' }}>
                    <div className="card-body-inner">
                        {activePanel === 'vision' && (
                            <VisionPanel
                                visionText={visionText}
                                onVisionChange={setVisionText}
                                onSave={handleSaveVision}
                                saving={savingVision}
                                saved={visionSaved}
                            />
                        )}
                        {activePanel === 'mood' && <MoodPanel moodHistory={moodHistory} moodLoading={moodLoading} />}
                        {activePanel === 'energy' && <EnergyPanel forecasts={forecasts} energyLoading={energyLoading} />}
                        {activePanel === 'philosophy' && (
                            <PhilosophyPanel
                                notes={wisdomNotes}
                                wisdomLoading={wisdomLoading}
                                draft={wisdomDraft}
                                onDraftChange={setWisdomDraft}
                                onAdd={handleAddWisdom}
                                saving={savingWisdom}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Resonance Pattern — behavioral fingerprint */}
            <ResonancePatternCard
                orientationSeeds={(user as any)?.orientation_seeds ?? null}
                moodLogs={moodHistory}
                energyForecasts={forecasts}
            />

            {/* Energy Forecast — log your creative energy */}
            <div className="sanctuary-card">
                <div className="card-body-inner">
                    <EnergyForecast userId={userId ?? undefined} />
                </div>
            </div>

            {/* Tomorrow Prep — plant seeds for tomorrow */}
            <div className="sanctuary-card">
                <div className="card-body-inner">
                    <TomorrowPrep userId={userId ?? undefined} />
                </div>
            </div>
        </div>
    ); // mood picker, energy snapshot, mirrors, context nudge ─────────────────
    const sideBar = (
        <>
            <MoodPickerCard
                isOpen={showMoodPicker}
                onToggle={() => setShowMoodPicker(v => !v)}
                onSelect={async (mood, note) => {
                    setSavingMood(true);
                    try { await addMoodLog(mood, note || undefined); setShowMoodPicker(false); }
                    finally { setSavingMood(false); }
                }}
                isSaving={savingMood}
                latestMood={latestMood}
                isLoading={moodLoading}
                accent="dark"
            />

            {/* Energy snapshot */}
            {!energyLoading && todayForecast && (
                <div className="sanctuary-card">
                    <div className="card-body-inner">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <Zap size={16} color={ENERGY_COLORS[todayForecast.energy_level ?? 3]} />
                            <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', margin: 0 }}>Energy Today</h3>
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

            {/* Wisdom count */}
            {!wisdomLoading && wisdomNotes.length > 0 && (
                <div className="sanctuary-card">
                    <div className="card-body-inner">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <Lightbulb size={16} color="var(--sanctuary-saffron)" />
                            <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', margin: 0 }}>Wisdom Seeds</h3>
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: '800' }}>{wisdomNotes.length}</div>
                        <div style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>Insights cultivated</div>
                    </div>
                </div>
            )}

            {/* Mirrors */}
            <WarmMirrorCard text={warmMirrorText} />
            <ImpactRipplesCard ripples={ripples} />

            {/* Community Presence — your ecosystem pulse */}
            {userId && (
                <div className="sanctuary-card">
                    <div className="card-body-inner">
                        <CommunityPresence userId={userId} userRole="founder" compact />
                    </div>
                </div>
            )}

            {/* Reminders — personal nudges */}
            <div className="sanctuary-card">
                <div className="card-body-inner">
                    <RemindersManager userId={userId ?? undefined} />
                </div>
            </div>

            {/* Ecological reminder */}
            <div className="sanctuary-card" style={{ background: 'var(--background-alt)', border: 'none' }}>
                <div className="card-body-inner">
                    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px' }}>
                        <Network size={100} color="var(--ink)" style={{ position: 'absolute', bottom: -20, right: -20, opacity: 0.05 }} />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', marginBottom: '8px' }}>Ecosystem Lives in Classroom</div>
                            <p style={{ fontSize: '12px', color: 'var(--ink-ghost)', lineHeight: '1.5' }}>
                                Platform stats, school gallery, and executive oversight are in the <strong>Classroom</strong> section — keeping this sanctuary purely personal.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <>
            <BaseSelfView
                role="founder"
                description={t('self.founderDesc', 'Your personal sanctuary — away from the platform, inside yourself.')}
                personalLayer={personalLayer}
                workingLayer={workingLayer}
                sideBar={sideBar}
            />
            <ShadowAgentDrawer />
            <WelcomeModal
                isOpen={justFinishedOnboarding}
                onClose={() => setJustFinishedOnboarding(false)}
            />
        </>
    );
}
function VisionPanel({
    visionText,
    onVisionChange,
    onSave,
    saving,
    saved,
}: {
    visionText: string;
    onVisionChange: (v: string) => void;
    onSave: () => void;
    saving: boolean;
    saved: boolean;
}) {
    return (
        <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Vision Alignment</h2>
            <p style={{ fontSize: '14px', color: 'var(--ink-ghost)', marginBottom: '24px' }}>
                Connecting today's work to the infinite dream. Write your founding vision — the north star from which all decisions emanate.
            </p>

            {/* User's personal vision statement */}
            <div style={{ marginBottom: '24px' }}>
                <textarea
                    value={visionText}
                    onChange={e => onVisionChange(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onSave(); }}
                    placeholder="Write your vision statement… What is the dream you are building? What world are you trying to create?"
                    rows={5}
                    style={{ width: '100%', padding: '16px 20px', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontSize: '15px', fontFamily: 'var(--font-body)', lineHeight: '1.7', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                    <button
                        onClick={onSave}
                        disabled={saving || !visionText.trim()}
                        style={{ padding: '10px 22px', borderRadius: '10px', background: 'var(--sanctuary-saffron)', color: 'var(--text-on-action)', border: 'none', fontWeight: '700', fontSize: '13px', cursor: saving || !visionText.trim() ? 'not-allowed' : 'pointer', opacity: saving || !visionText.trim() ? 0.6 : 1, transition: 'opacity 0.2s' }}
                    >
                        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Vision (⌘↵)'}
                    </button>
                    {saved && <span style={{ fontSize: '12px', color: 'var(--moss)' }}>Vision statement updated.</span>}
                </div>
            </div>

            {/* Inspirational anchor */}
            <div style={{ padding: '24px 28px', background: 'var(--background-alt)', borderRadius: '14px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', opacity: 0.07 }}>
                    <Compass size={120} color="var(--sanctuary-saffron)" />
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Anchor Quote</div>
                    <div style={{ fontSize: '17px', fontFamily: 'serif', fontStyle: 'italic', lineHeight: '1.7', color: 'var(--ink-soft)', marginBottom: '12px' }}>
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

function PhilosophyPanel({
    notes,
    wisdomLoading,
    draft,
    onDraftChange,
    onAdd,
    saving,
}: {
    notes: any[];
    wisdomLoading: boolean;
    draft: string;
    onDraftChange: (v: string) => void;
    onAdd: () => void;
    saving: boolean;
}) {
    if (wisdomLoading) return <SkeletonCard />;
    return (
        <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Philosophy Logs</h2>
            <p style={{ fontSize: '14px', color: 'var(--ink-ghost)', marginBottom: '24px' }}>
                Your curated treasury of ideas, principles, and the architecture of your mind.
            </p>

            {/* Add new wisdom note */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
                <input
                    value={draft}
                    onChange={e => onDraftChange(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') onAdd(); }}
                    placeholder="Plant a wisdom seed — an insight, principle, or fragment of understanding…"
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontSize: '14px', fontFamily: 'var(--font-body)', outline: 'none' }}
                />
                <button
                    onClick={onAdd}
                    disabled={saving || !draft.trim()}
                    style={{ padding: '10px 20px', borderRadius: '10px', background: 'var(--sanctuary-saffron)', color: 'var(--text-on-action)', border: 'none', fontWeight: '700', fontSize: '13px', cursor: saving || !draft.trim() ? 'not-allowed' : 'pointer', opacity: saving || !draft.trim() ? 0.6 : 1, whiteSpace: 'nowrap' }}
                >
                    {saving ? '…' : 'Plant 🌱'}
                </button>
            </div>

            {notes.length === 0 ? (
                <div style={{ padding: '32px', background: 'var(--background-alt)', borderRadius: '16px', textAlign: 'center' }}>
                    <Lightbulb size={32} color="var(--ink-ghost)" style={{ marginBottom: 12 }} />
                    <p style={{ color: 'var(--ink-ghost)', fontSize: '14px', margin: 0 }}>No wisdom seeds yet. Plant your first insight above.</p>
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
