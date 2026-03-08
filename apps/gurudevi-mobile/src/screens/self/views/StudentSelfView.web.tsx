import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRole, useStore, supabase, growthSignalsAPI, naturePathsAPI } from '@repo/core';
import type { RiverStage, CrystalTier } from '@repo/core';
import { SkeletonCard } from '@repo/ui';
import { useMoodLogs, useStudentGoals, useJournalEntries, VoiceJournaling } from '@repo/self';
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
    Plus
} from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import {
    MoodPickerCard,
} from './selfViewShared';

export default function StudentSelfViewWeb() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { user } = useStore();
    const { userId } = useUserRole();

    // Mood log
    const { moodHistory, isLoading: moodLoading, addMoodLog } = useMoodLogs(userId ?? undefined);
    const [showMoodPicker, setShowMoodPicker] = React.useState(false);
    const [savingMood, setSavingMood] = React.useState(false);

    // Journal
    const { entries: journalEntries, loading: journalLoading, addJournalEntry } = useJournalEntries();
    const [showJournalForm, setShowJournalForm] = React.useState(false);
    const [journalDraft, setJournalDraft] = React.useState('');
    const [savingJournal, setSavingJournal] = React.useState(false);

    // Goals
    const { goals, isLoading: goalsLoading, setGoals } = useStudentGoals(userId ?? undefined);
    const [showGoalForm, setShowGoalForm] = React.useState(false);
    const [goalDraft, setGoalDraft] = React.useState('');
    const [savingGoal, setSavingGoal] = React.useState(false);

    // Voice journaling panel toggle
    const [showVoiceJournal, setShowVoiceJournal] = React.useState(false);
    // Nature Paths — River stage + Crystal tier
    const [studentPaths, setStudentPaths] = React.useState<{ river_stage: RiverStage; crystal_tier: CrystalTier; crystals_found_count: number } | null>(null);

    const latestMood = moodHistory[0];
    const completedGoals = goals.filter(g => g.progress >= 100).length;

    // Fetch student nature path state
    React.useEffect(() => {
        if (!userId) return;
        naturePathsAPI.getStudentPathState(userId).then(state => {
            if (state) setStudentPaths(state);
        }).catch(() => {});
    }, [userId]);

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
                // Growth signal — fire-and-forget
                void growthSignalsAPI.emitSignal(userId, 'goal_set').catch(() => {});
            }
            setGoalDraft('');
            setShowGoalForm(false);
        } finally {
            setSavingGoal(false);
        }
    };

    const studyStats = [
        {
            id: '1',
            label: 'Goals Active',
            value: goalsLoading ? '—' : String(goals.length),
            icon: Target,
            color: 'var(--water)'
        },
        {
            id: '2',
            label: 'Goals Completed',
            value: goalsLoading ? '—' : String(completedGoals),
            icon: CheckCircle2,
            color: 'var(--lotus)'
        },
        {
            id: '3',
            label: 'Journal Entries',
            value: journalLoading ? '—' : String(journalEntries.length),
            icon: Sparkles,
            color: 'var(--moss)'
        },
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
                    <p className="greeting-note">
                        {user?.full_name ? `Welcome back, ${user.full_name.split(' ')[0]}.` : 'Welcome back to your sanctuary of growth.'}
                    </p>
                </div>

                {/* Key Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                    {studyStats.map(stat => (
                        <div key={stat.id} className="sanctuary-card">
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

                {/* Goals Progress */}
                <div className="sanctuary-card" style={{ marginBottom: '40px' }}>
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
                            <button
                                className="secondary-button"
                                style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                onClick={() => setShowGoalForm(v => !v)}
                            >
                                <Plus size={14} />
                                {showGoalForm ? 'Cancel' : 'Add Goal'}
                            </button>
                        </div>

                        {/* Inline goal creation form */}
                        {showGoalForm && (
                            <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--background-alt)', borderRadius: '12px' }}>
                                <input
                                    autoFocus
                                    value={goalDraft}
                                    onChange={e => setGoalDraft(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleAddGoal(); }}
                                    placeholder="What do you want to achieve?"
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'white', color: 'var(--ink)', fontSize: '14px', fontFamily: 'var(--font-body)', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' }}
                                />
                                <button
                                    className="premium-button"
                                    onClick={handleAddGoal}
                                    disabled={savingGoal || !goalDraft.trim()}
                                    style={{ fontSize: '13px' }}
                                >
                                    {savingGoal ? 'Saving…' : 'Plant this Goal'}
                                </button>
                            </div>
                        )}

                        {goalsLoading ? (
                            <SkeletonCard />
                        ) : goals.length === 0 ? (
                            <p style={{ color: 'var(--ink-ghost)', fontSize: '14px' }}>
                                No goals set yet. Start your growth journey by adding your first goal above.
                            </p>
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

                {/* Journal */}
                <div className="sanctuary-card" style={{ marginBottom: '40px' }}>
                    <div className="card-body-inner">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Sparkles size={18} color="var(--water)" />
                                Reflections
                            </h2>
                            <button
                                className="secondary-button"
                                style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                onClick={() => setShowJournalForm(v => !v)}
                            >
                                <PenLine size={14} />
                                {showJournalForm ? 'Cancel' : 'New Entry'}
                            </button>
                        </div>

                        {showJournalForm && (
                            <div style={{ marginBottom: '20px' }}>
                                <textarea
                                    autoFocus
                                    value={journalDraft}
                                    onChange={e => setJournalDraft(e.target.value)}
                                    placeholder="How are you feeling? What's on your mind today…"
                                    rows={4}
                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontSize: '14px', fontFamily: 'var(--font-body)', lineHeight: '1.6', outline: 'none', resize: 'vertical', marginBottom: '12px', boxSizing: 'border-box' }}
                                />
                                <button
                                    className="premium-button"
                                    style={{ background: 'var(--water)', fontSize: '13px' }}
                                    onClick={handleAddJournalEntry}
                                    disabled={savingJournal || !journalDraft.trim()}
                                >
                                    {savingJournal ? 'Saving…' : 'Save Reflection'}
                                </button>
                            </div>
                        )}

                        {journalLoading ? (
                            <SkeletonCard />
                        ) : journalEntries.length === 0 ? (
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
            </div>

            {/* ── RIGHT COLUMN: UTILITIES ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Mood Resonance — growth signal (mood_checkin) already emitted by selfAPI.logMood */}
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
                    accent="water"
                />

                {/* Quick Jumps */}
                <div className="sanctuary-card">
                    <div className="card-body-inner">
                        <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
                            Library Quick-Jump
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                { icon: Library, label: 'Monastery Library', screen: 'Library' as const },
                                { icon: BookOpen, label: 'Bookmarked Seeds', screen: 'Library' as const },
                                { icon: MessageSquare, label: 'Resonant Discussions', screen: 'Community' as const }
                            ].map((item, idx) => (
                                <button key={idx} className="sidebar-item" style={{ margin: 0 }} onClick={() => navigation.navigate('Main', { screen: item.screen })}>
                                    <item.icon size={16} /> <span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Voice Journaling */}
                <div className="sanctuary-card">
                    <div className="card-body-inner">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                                🎙 Voice Journal
                            </h3>
                            <button
                                className="secondary-button"
                                style={{ fontSize: '11px', padding: '4px 10px' }}
                                onClick={() => setShowVoiceJournal(v => !v)}
                            >
                                {showVoiceJournal ? 'Hide' : 'Record'}
                            </button>
                        </div>
                        {showVoiceJournal ? (
                            <VoiceJournaling userId={user?.id} onComplete={() => setShowVoiceJournal(false)} />
                        ) : (
                            <p style={{ fontSize: '12px', color: 'var(--ink-ghost)', margin: 0, lineHeight: '1.5' }}>
                                Capture your thoughts and reflections with your voice.
                            </p>
                        )}
                    </div>
                </div>

                {/* Nature Paths — River + Crystal tier badges */}
                {studentPaths && (
                    <div className="sanctuary-card" style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--ink-ghost)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
                            Your Paths ✨
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {/* River Path */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(59,130,246,0.08)', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.18)' }}>
                                <span style={{ fontSize: '20px' }}>🌊</span>
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#3b82f6', textTransform: 'capitalize' }}>
                                        {studentPaths.river_stage.replace(/_/g, ' ')}
                                    </div>
                                    <div style={{ fontSize: '10px', color: 'var(--ink-ghost)' }}>River path (Ganga Pravaham)</div>
                                </div>
                            </div>
                            {/* Crystal Tier */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(139,92,246,0.08)', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.18)' }}>
                                <span style={{ fontSize: '20px' }}>💎</span>
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#8b5cf6', textTransform: 'capitalize' }}>
                                        {studentPaths.crystal_tier} tier
                                    </div>
                                    <div style={{ fontSize: '10px', color: 'var(--ink-ghost)' }}>{studentPaths.crystals_found_count} crystal{studentPaths.crystals_found_count !== 1 ? 's' : ''} found</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

