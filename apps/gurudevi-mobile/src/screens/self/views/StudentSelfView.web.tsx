import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRole, useStore, supabase } from '@repo/core';
import { SkeletonCard } from '@repo/ui';
import { useMoodLogs, useStudentGoals, useJournalEntries } from '@repo/self';
import type { MoodLog, Goal } from '@repo/self';
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

const MOOD_COLORS = ['', 'var(--lotus)', 'var(--amber-glow)', 'var(--water)', 'var(--moss)', 'var(--action)'];
const MOOD_LABELS = ['', 'Depleted', 'Low', 'Steady', 'Energised', 'Vibrant'];

const MOOD_OPTIONS: { value: MoodLog['mood']; emoji: string; label: string }[] = [
    { value: 'sad',        emoji: '😔', label: 'Sad' },
    { value: 'frustrated', emoji: '😤', label: 'Frustrated' },
    { value: 'anxious',    emoji: '😰', label: 'Anxious' },
    { value: 'calm',       emoji: '😌', label: 'Calm' },
    { value: 'curious',    emoji: '🤔', label: 'Curious' },
    { value: 'joyful',     emoji: '😊', label: 'Joyful' },
];

export default function StudentSelfViewWeb() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { user } = useStore();
    const { userId } = useUserRole();

    // Mood log
    const { moodHistory, isLoading: moodLoading, addMoodLog } = useMoodLogs(userId ?? undefined);
    const [showMoodPicker, setShowMoodPicker] = React.useState(false);
    const [moodNote, setMoodNote] = React.useState('');
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

    const latestMood = moodHistory[0];
    const completedGoals = goals.filter(g => g.progress >= 100).length;

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
                {/* Mood Resonance */}
                <div className="sanctuary-card card-water" style={{ background: 'var(--water)', color: 'white' }}>
                    <div className="card-body-inner">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Heart size={20} />
                                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Mood Resonance</h3>
                            </div>
                            <button
                                onClick={() => setShowMoodPicker(v => !v)}
                                style={{ background: showMoodPicker ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: 'white', fontSize: '11px', fontWeight: '700', fontFamily: 'var(--font-body)' }}
                            >
                                {showMoodPicker ? 'Cancel' : '+ Log Mood'}
                            </button>
                        </div>

                        {/* Inline mood picker */}
                        {showMoodPicker && (
                            <div style={{ marginBottom: '16px', padding: '14px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                                <p style={{ fontSize: '12px', opacity: 0.8, marginBottom: '12px' }}>How are you feeling right now?</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                                    {MOOD_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            disabled={savingMood}
                                            onClick={async () => {
                                                setSavingMood(true);
                                                try {
                                                    await addMoodLog(opt.value, moodNote || undefined);
                                                    setMoodNote('');
                                                    setShowMoodPicker(false);
                                                } finally {
                                                    setSavingMood(false);
                                                }
                                            }}
                                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 10px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '10px', cursor: 'pointer', color: 'white', fontSize: '10px', fontWeight: '600', fontFamily: 'var(--font-body)' }}
                                        >
                                            <span style={{ fontSize: '18px' }}>{opt.emoji}</span>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    value={moodNote}
                                    onChange={e => setMoodNote(e.target.value)}
                                    placeholder="Optional note…"
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '13px', fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                        )}

                        {moodLoading ? (
                            <p style={{ fontSize: '13px', opacity: 0.8 }}>Loading mood data…</p>
                        ) : latestMood ? (
                            <>
                                <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '4px' }}>
                                    {latestMood.mood_score}/5
                                </div>
                                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                                    {latestMood.mood
                                        ? latestMood.mood.charAt(0).toUpperCase() + latestMood.mood.slice(1)
                                        : MOOD_LABELS[latestMood.mood_score]}
                                </div>
                                {latestMood.note && (
                                    <p style={{ fontSize: '12px', opacity: 0.8, lineHeight: '1.5', fontStyle: 'italic', marginBottom: '8px' }}>
                                        "{latestMood.note}"
                                    </p>
                                )}
                                <div style={{ fontSize: '11px', opacity: 0.6 }}>
                                    {formatDistanceToNow(new Date(latestMood.created_at), { addSuffix: true })}
                                </div>
                            </>
                        ) : (
                            <p style={{ fontSize: '13px', opacity: 0.8 }}>Tap "+ Log Mood" to begin your wellbeing journey.</p>
                        )}
                    </div>
                </div>

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
            </div>
        </div>
    );
}

