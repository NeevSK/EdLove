import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRole, useStore, supabase, growthSignalsAPI, naturePathsAPI } from '@repo/core';
import type { RiverStage, CrystalTier } from '@repo/core';
import { SkeletonCard } from '@repo/ui';
import {
    useMoodLogs,
    useStudentGoals,
    useJournalEntries,
    useEnergyForecast,
    useWellbeingEnrichment,
    BaseSelfView,
    MoodPickerCard,
    EnergyBarChart,
    WarmMirrorCard,
    ImpactRipplesCard,
    MOOD_COLORS,
    VoiceJournaling,
    MoodLotus,
    WisdomSeeds,
    DailyRhythm,
    ProgressTree,
    MyGradesView,
    WindDownRitual,
    DailyContentCard,
    SleepTracker,
    BreathGuide,
    EnergyForecast,
    TomorrowPrep,
    CommunityPresence,
    RemindersManager,
    WelcomeModal,
} from '@repo/self';
import type { Goal } from '@repo/self';
import { useNavigation } from '@react-navigation/native';
import {
    BookOpen,
    Sparkles,
    Zap,
    MessageSquare,
    TrendingUp,
    Library,
    Target,
    Compass,
    CheckCircle2,
    Heart,
    PenLine,
    Plus,
} from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

export default function StudentSelfViewWeb() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { user } = useStore();
    const { userId } = useUserRole();
    const justFinishedOnboarding = useStore((s) => s.justFinishedOnboarding);
    const setJustFinishedOnboarding = useStore((s) => s.setJustFinishedOnboarding);

    // ── Wellbeing hooks ──────────────────────────────────────────────────
    const { moodHistory, isLoading: moodLoading, addMoodLog } = useMoodLogs(userId ?? undefined);
    const { forecasts, isLoading: energyLoading } = useEnergyForecast(userId ?? undefined);
    const { warmMirrorText, ripples } = useWellbeingEnrichment(userId);

    const [showMoodPicker, setShowMoodPicker] = React.useState(false);
    const [savingMood, setSavingMood] = React.useState(false);

    // ── Journal ──────────────────────────────────────────────────────────
    const { entries: journalEntries, loading: journalLoading, addJournalEntry } = useJournalEntries();
    const [showJournalForm, setShowJournalForm] = React.useState(false);
    const [journalDraft, setJournalDraft] = React.useState('');
    const [savingJournal, setSavingJournal] = React.useState(false);

    // ── Goals ────────────────────────────────────────────────────────────
    const { goals, isLoading: goalsLoading, setGoals } = useStudentGoals(userId ?? undefined);
    const [showGoalForm, setShowGoalForm] = React.useState(false);
    const [goalDraft, setGoalDraft] = React.useState('');
    const [savingGoal, setSavingGoal] = React.useState(false);

    // ── Voice journaling ─────────────────────────────────────────────────
    const [showVoiceJournal, setShowVoiceJournal] = React.useState(false);

    // ── Nature Paths ─────────────────────────────────────────────────────
    const [studentPaths, setStudentPaths] = React.useState<{ river_stage: RiverStage; crystal_tier: CrystalTier; crystals_found_count: number } | null>(null);

    React.useEffect(() => {
        if (!userId) return;
        naturePathsAPI.getStudentPathState(userId).then(state => {
            if (state) setStudentPaths(state);
        }).catch(() => { });
    }, [userId]);

    const latestMood = moodHistory[0];
    const completedGoals = goals.filter(g => g.progress >= 100).length;
    const energyBars = forecasts.slice(0, 7).reverse();

    // ── Handlers ─────────────────────────────────────────────────────────
    const handleAddJournalEntry = async () => {
        if (!journalDraft.trim()) return;
        setSavingJournal(true);
        try {
            await addJournalEntry(journalDraft.trim());
            setJournalDraft('');
            setShowJournalForm(false);
        } finally {
            setSavingJournal(false);
        }
    };

    const handleAddGoal = async () => {
        if (!goalDraft.trim() || !userId) return;
        setSavingGoal(true);
        try {
            const { data, error } = await supabase
                .from('student_goals')
                .insert({ user_id: userId, text: goalDraft.trim(), progress: 0 })
                .select()
                .single();
            if (!error && data) {
                setGoals((prev: Goal[]) => [data, ...prev]);
                void growthSignalsAPI.emitSignal(userId, 'goal_set').catch(() => { });
            }
            setGoalDraft('');
            setShowGoalForm(false);
        } finally {
            setSavingGoal(false);
        }
    };

    // ── Layers ─────────────────────────────────────────────────────────

    // personalLayer: mood/energy pulse — the inner sanctuary
    const personalLayer = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Daily Content — motivation spark to start the day */}
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

            {/* Wisdom Seeds */}
            <div className="sanctuary-card" style={{ padding: '28px' }}>
                <WisdomSeeds userId={userId ?? undefined} />
            </div>

            {/* Energy Forecast — log today's energy level */}
            <div className="sanctuary-card" style={{ padding: '28px' }}>
                <EnergyForecast userId={userId ?? undefined} />
            </div>

            {/* Sleep Tracker — morning reflection on last night's rest */}
            <div className="sanctuary-card" style={{ padding: '28px' }}>
                <SleepTracker userId={userId ?? undefined} />
            </div>

            {/* Breath Guide — paced breathing for calm focus */}
            <div className="sanctuary-card" style={{ padding: '28px' }}>
                <BreathGuide />
            </div>

            {/* Reflective Journal */}
            <div className="sanctuary-card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Sparkles size={18} color="var(--water)" /> Reflections
                    </h2>
                    <button className="secondary-button" style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => setShowJournalForm(v => !v)}>
                        <PenLine size={14} /> {showJournalForm ? 'Cancel' : 'New Entry'}
                    </button>
                </div>
                {showJournalForm && (
                    <div style={{ marginBottom: '20px' }}>
                        <textarea autoFocus value={journalDraft} onChange={e => setJournalDraft(e.target.value)}
                            placeholder="How are you feeling? What's on your mind today…" rows={4}
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontSize: '14px', fontFamily: 'var(--font-body)', lineHeight: '1.6', outline: 'none', resize: 'vertical', marginBottom: '12px', boxSizing: 'border-box' }}
                        />
                        <button className="premium-button" style={{ background: 'var(--water)', fontSize: '13px' }} onClick={handleAddJournalEntry} disabled={savingJournal || !journalDraft.trim()}>
                            {savingJournal ? 'Saving…' : 'Save Reflection'}
                        </button>
                    </div>
                )}
                {journalLoading ? <SkeletonCard /> : journalEntries.length === 0 ? (
                    <p style={{ color: 'var(--ink-ghost)', fontSize: '14px' }}>Begin your reflection journey. Your first entry awaits.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {journalEntries.slice(0, 3).map(entry => (
                            <div key={entry.id} style={{ padding: '16px', background: 'var(--background-alt)', borderRadius: '12px', borderLeft: '3px solid var(--water)' }}>
                                <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--ink)', fontStyle: 'italic', margin: '0 0 8px' }}>
                                    "{entry.content.substring(0, 200)}{entry.content.length > 200 ? '…' : ''}"
                                </p>
                                <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>
                                    {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    // workingLayer: goals, grades, rhythm — the learning self
    const studyStats = [
        { id: '1', label: 'Goals Active', value: goalsLoading ? '—' : String(goals.length), icon: Target, color: 'var(--water)' },
        { id: '2', label: 'Goals Completed', value: goalsLoading ? '—' : String(completedGoals), icon: CheckCircle2, color: 'var(--lotus)' },
        { id: '3', label: 'Journal Entries', value: journalLoading ? '—' : String(journalEntries.length), icon: Sparkles, color: 'var(--moss)' },
    ];

    const workingLayer = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {studyStats.map(stat => (
                    <div key={stat.id} className="sanctuary-card">
                        <div className="card-body-inner">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ color: stat.color }}><stat.icon size={20} /></div>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-ghost)' }}>{stat.label}</span>
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--ink)' }}>{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Active Goals */}
            <div className="sanctuary-card">
                <div className="card-body-inner">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            Active Goals
                            {!goalsLoading && goals.length > 0 && (
                                <span style={{ padding: '4px 8px', background: 'var(--background-alt)', borderRadius: '6px', fontSize: '11px', color: 'var(--ink-ghost)' }}>
                                    {goals.length} Total
                                </span>
                            )}
                        </h2>
                        <button className="secondary-button" style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => setShowGoalForm(v => !v)}>
                            <Plus size={14} /> {showGoalForm ? 'Cancel' : 'Add Goal'}
                        </button>
                    </div>
                    {showGoalForm && (
                        <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--background-alt)', borderRadius: '12px' }}>
                            <input autoFocus value={goalDraft} onChange={e => setGoalDraft(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleAddGoal(); }}
                                placeholder="What do you want to achieve?"
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'white', color: 'var(--ink)', fontSize: '14px', fontFamily: 'var(--font-body)', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' }}
                            />
                            <button className="premium-button" onClick={handleAddGoal} disabled={savingGoal || !goalDraft.trim()} style={{ fontSize: '13px' }}>
                                {savingGoal ? 'Saving…' : 'Plant this Goal'}
                            </button>
                        </div>
                    )}
                    {goalsLoading ? <SkeletonCard /> : goals.length === 0 ? (
                        <p style={{ color: 'var(--ink-ghost)', fontSize: '14px' }}>No goals set yet. Start your growth journey by adding your first goal above.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {goals.slice(0, 5).map(goal => (
                                <div key={goal.id}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: '700' }}>{goal.text}</span>
                                        <span style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>{goal.progress ?? 0}%</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'var(--background-alt)', borderRadius: '10px', overflow: 'hidden' }}>
                                        <div style={{ width: `${goal.progress ?? 0}%`, height: '100%', background: 'linear-gradient(to right, var(--water), #5a9aba)', borderRadius: '10px' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Nature Paths */}
            {studentPaths && (
                <div className="sanctuary-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Your Paths ✨</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(59,130,246,0.08)', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.18)' }}>
                            <span style={{ fontSize: '20px' }}>🌊</span>
                            <div>
                                <div style={{ fontSize: '12px', fontWeight: '800', color: '#3b82f6', textTransform: 'capitalize' }}>{studentPaths.river_stage.replace(/_/g, ' ')}</div>
                                <div style={{ fontSize: '10px', color: 'var(--ink-ghost)' }}>River path (Ganga Pravaham)</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(139,92,246,0.08)', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.18)' }}>
                            <span style={{ fontSize: '20px' }}>💎</span>
                            <div>
                                <div style={{ fontSize: '12px', fontWeight: '800', color: '#8b5cf6', textTransform: 'capitalize' }}>{studentPaths.crystal_tier} tier</div>
                                <div style={{ fontSize: '10px', color: 'var(--ink-ghost)' }}>{studentPaths.crystals_found_count} crystal{studentPaths.crystals_found_count !== 1 ? 's' : ''} found</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Daily Rhythm — personal weekly timetable (matches native workingLayer) */}
            <div className="sanctuary-card">
                <div className="card-body-inner">
                    <DailyRhythm />
                </div>
            </div>

            {/* Progress Tree — organic growth milestones */}
            <div className="sanctuary-card" style={{ padding: '4px' }}>
                <ProgressTree userId={userId ?? undefined} />
            </div>

            {/* My Grades */}
            <div className="sanctuary-card">
                <div className="card-body-inner">
                    <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        📋 Grades
                    </h2>
                    <MyGradesView userId={userId ?? undefined} />
                </div>
            </div>

            {/* Tomorrow Prep — plan the day ahead */}
            <div className="sanctuary-card">
                <div className="card-body-inner">
                    <TomorrowPrep userId={userId ?? undefined} />
                </div>
            </div>
        </div>
    );

    // sideBar: mood picker, voice journal, mirrors, quick-jumps
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
                accent="water"
            />

            {/* Voice Journaling */}
            <div className="sanctuary-card">
                <div className="card-body-inner">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>🎙 Voice Journal</h3>
                        <button className="secondary-button" style={{ fontSize: '11px', padding: '4px 10px' }} onClick={() => setShowVoiceJournal(v => !v)}>
                            {showVoiceJournal ? 'Hide' : 'Record'}
                        </button>
                    </div>
                    {showVoiceJournal
                        ? <VoiceJournaling userId={userId ?? undefined} onComplete={() => setShowVoiceJournal(false)} />
                        : <p style={{ fontSize: '12px', color: 'var(--ink-ghost)', margin: 0, lineHeight: '1.5' }}>Capture your thoughts and reflections with your voice.</p>
                    }
                </div>
            </div>

            {/* Mirrors */}
            <WarmMirrorCard text={warmMirrorText} />
            <ImpactRipplesCard ripples={ripples} />

            {/* Wind-Down Ritual — evening sanctuary */}
            <div className="sanctuary-card">
                <div className="card-body-inner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <span style={{ fontSize: '18px' }}>🌙</span>
                        <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Evening Wind-Down</h3>
                    </div>
                    <WindDownRitual userId={userId ?? undefined} />
                </div>
            </div>

            {/* Community Presence — see who's learning alongside you */}
            {userId && (
                <div className="sanctuary-card">
                    <div className="card-body-inner">
                        <CommunityPresence userId={userId} userRole="student" compact />
                    </div>
                </div>
            )}

            {/* Reminders — personal nudges */}
            <div className="sanctuary-card">
                <div className="card-body-inner">
                    <RemindersManager userId={userId ?? undefined} />
                </div>
            </div>

            {/* Library quick-jumps */}
            <div className="sanctuary-card">
                <div className="card-body-inner">
                    <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Library Quick-Jump</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                            { icon: Library, label: 'Monastery Library', screen: 'Library' as const },
                            { icon: BookOpen, label: 'Bookmarked Seeds', screen: 'Library' as const },
                            { icon: MessageSquare, label: 'Resonant Discussions', screen: 'Community' as const },
                        ].map((item, idx) => (
                            <button key={idx} className="sidebar-item" style={{ margin: 0 }} onClick={() => navigation.navigate('Main', { screen: item.screen })}>
                                <item.icon size={16} /> <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <>
            <BaseSelfView
                role="student"
                description={t('self.studentDesc', 'A steady space to grow your mind and heart.')}
                domains={[
                    {
                        id: 'personal',
                        title: 'Inner Sanctuary',
                        accentColor: '#3B82F6', // Water/Blue
                        content: personalLayer
                    },
                    {
                        id: 'working',
                        title: 'Growth Dashboard',
                        accentColor: '#10B981', // Moss/Teal
                        content: workingLayer
                    }
                ]}
                sideBar={sideBar}
            />
            <WelcomeModal
                isOpen={justFinishedOnboarding}
                onClose={() => setJustFinishedOnboarding(false)}
            />
        </>
    );
}

