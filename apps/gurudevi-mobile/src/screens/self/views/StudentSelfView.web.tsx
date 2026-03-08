import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUserRole, useStore } from '@repo/core';
import { SkeletonCard } from '@repo/ui';
import { useMoodLogs, useStudentGoals, useJournalEntries } from '@repo/self';
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
    Heart
} from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

const MOOD_COLORS = ['', 'var(--lotus)', 'var(--amber-glow)', 'var(--water)', 'var(--moss)', 'var(--action)'];
const MOOD_LABELS = ['', 'Depleted', 'Low', 'Steady', 'Energised', 'Vibrant'];

export default function StudentSelfViewWeb() {
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const { user } = useStore();
    const { userId } = useUserRole();

    const { moodHistory, isLoading: moodLoading } = useMoodLogs(userId ?? undefined);
    const { goals, isLoading: goalsLoading } = useStudentGoals(userId ?? undefined);
    const { entries: journalEntries, loading: journalLoading } = useJournalEntries();

    const latestMood = moodHistory[0];
    const completedGoals = goals.filter(g => g.progress >= 100).length;

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
                        <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            Active Goals
                            {!goalsLoading && goals.length > 0 && (
                                <span style={{ padding: '4px 8px', background: 'var(--background-alt)', borderRadius: '6px', fontSize: '11px', color: 'var(--ink-ghost)' }}>
                                    {goals.length} Total
                                </span>
                            )}
                        </h2>
                        {goalsLoading ? (
                            <SkeletonCard />
                        ) : goals.length === 0 ? (
                            <p style={{ color: 'var(--ink-ghost)', fontSize: '14px' }}>
                                No goals set yet. Start your growth journey by adding your first goal.
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

                {/* Journal Glimpse */}
                {!journalLoading && journalEntries.length > 0 && (
                    <div className="sanctuary-card">
                        <div className="card-body-inner" style={{ padding: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <Sparkles size={18} color="var(--water)" />
                                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>Latest Reflection</h3>
                                <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--ink-ghost)' }}>
                                    {formatDistanceToNow(new Date(journalEntries[0].created_at), { addSuffix: true })}
                                </span>
                            </div>
                            <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--ink)', fontStyle: 'italic' }}>
                                "{journalEntries[0].content.substring(0, 200)}{journalEntries[0].content.length > 200 ? '…' : ''}"
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── RIGHT COLUMN: UTILITIES ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Mood Resonance */}
                <div className="sanctuary-card card-water" style={{ background: 'var(--water)', color: 'white' }}>
                    <div className="card-body-inner">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <Heart size={20} />
                            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Mood Resonance</h3>
                        </div>
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
                            <p style={{ fontSize: '13px', opacity: 0.8 }}>Log your first mood check-in to see your resonance.</p>
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
