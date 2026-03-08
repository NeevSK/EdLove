/**
 * selfViewShared.tsx
 *
 * Shared constants, hooks, and micro-components for all SelfView web screens.
 *
 * Extracted from the four role-specific SelfView files (Teacher / Student /
 * Principal / Founder) to eliminate copy-paste duplication.
 *
 * Rules:
 *  - No default export — every symbol is a named export.
 *  - No role-specific logic here; callers supply context via props/args.
 *  - Web-only (used only from *.web.tsx files).
 */
import React, { useEffect, useState } from 'react';
import { warmMirrorAPI, impactRipplesAPI } from '@repo/core';
import type { ImpactRipple } from '@repo/core';
import type { MoodLog } from '@repo/self';
import { formatDistanceToNow } from 'date-fns';

// ─── Mood / Energy constants ─────────────────────────────────────────────────

/** Human-readable labels for mood_score 1–5 (index 0 is unused placeholder). */
export const MOOD_LABELS = ['', 'Depleted', 'Low', 'Steady', 'Energised', 'Vibrant'] as const;

/**
 * CSS colour for each mood_score level 1–5.
 * Use the "lotus" family for teachers/students, "ember" family for
 * principals/founders — callers can pass `energyMode` flag.
 */
export const MOOD_COLORS = [
    '',
    'var(--ember)',
    'var(--amber-glow)',
    'var(--water)',
    'var(--moss)',
    'var(--lotus)',
] as const;

/** Colours used for energy-forecast bars (same scale, saffron high). */
export const ENERGY_COLORS = [
    '',
    'var(--ember)',
    'var(--amber-glow)',
    'var(--water)',
    'var(--moss)',
    'var(--sanctuary-saffron)',
] as const;

/** Ordered emoji options for the inline mood picker. */
export const MOOD_OPTIONS: { value: MoodLog['mood']; emoji: string; label: string }[] = [
    { value: 'sad',        emoji: '😔', label: 'Sad' },
    { value: 'frustrated', emoji: '😤', label: 'Frustrated' },
    { value: 'anxious',    emoji: '😰', label: 'Anxious' },
    { value: 'calm',       emoji: '😌', label: 'Calm' },
    { value: 'curious',    emoji: '🤔', label: 'Curious' },
    { value: 'joyful',     emoji: '😊', label: 'Joyful' },
];

/** Milliseconds to wait before marking delivered ripples as read. Long enough for the user to see them. */
const RIPPLE_DELIVERY_DELAY_MS = 3000;

// ─── useWellbeingEnrichment ──────────────────────────────────────────────────

export interface WellbeingEnrichment {
    warmMirrorText: string | null;
    ripples: ImpactRipple[];
}

/**
 * Fetches the Warm Mirror narrative and pending Impact Ripples for a user.
 * Marks ripples as delivered 3 s after they arrive (fire-and-forget).
 *
 * Used by TeacherSelfView and PrincipalSelfView. Safe to call from any role.
 */
export function useWellbeingEnrichment(userId: string | null | undefined): WellbeingEnrichment {
    const [warmMirrorText, setWarmMirrorText] = useState<string | null>(null);
    const [ripples, setRipples] = useState<ImpactRipple[]>([]);

    // Warm Mirror — "Your Week as a Story" narrative
    useEffect(() => {
        if (!userId) return;
        warmMirrorAPI
            .getDataPoints(userId)
            .then(data => setWarmMirrorText(warmMirrorAPI.generateNarrativeEn(data)))
            .catch(() => {});
    }, [userId]);

    // Impact Ripples — show undelivered, then mark delivered after display
    useEffect(() => {
        if (!userId) return;
        impactRipplesAPI
            .getPendingRipples(userId)
            .then(pending => {
                if (!pending.length) return;
                setRipples(pending);
                setTimeout(() => {
                    pending.forEach(r =>
                        void impactRipplesAPI
                            .markDelivered(r.id)
                            .catch(err =>
                                console.warn('[useWellbeingEnrichment] markDelivered failed:', err),
                            ),
                    );
                }, RIPPLE_DELIVERY_DELAY_MS);
            })
            .catch(() => {});
    }, [userId]);

    return { warmMirrorText, ripples };
}

// ─── EnergyBarChart ──────────────────────────────────────────────────────────

interface EnergyBarChartProps {
    /** Energy forecast rows, already reversed so oldest→newest left→right. */
    bars: Array<{ id?: string; energy_level: number; forecast_date?: string }>;
    /** Colour palette to use. Defaults to ENERGY_COLORS. */
    colors?: readonly string[];
    /** Height of the chart container in px. Defaults to 100. */
    height?: number;
}

/**
 * Simple 7-day energy bar chart.
 * Shared by TeacherSelfView (main panel) and FounderSelfView (energy panel).
 */
export function EnergyBarChart({ bars, colors = ENERGY_COLORS, height = 100 }: EnergyBarChartProps) {
    if (!bars.length) {
        return (
            <p style={{ color: 'var(--ink-ghost)', fontSize: '14px' }}>
                No energy logs yet. Log your first energy reading to see your pulse.
            </p>
        );
    }
    return (
        <>
            <p style={{ color: 'var(--ink-ghost)', fontSize: '14px', marginBottom: '24px' }}>
                Your energy over the last {bars.length} recorded day{bars.length !== 1 ? 's' : ''}.
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: `${height}px` }}>
                {bars.map((f, i) => (
                    <div
                        key={f.id ?? i}
                        title={`${MOOD_LABELS[f.energy_level] ?? f.energy_level}${f.forecast_date ? ` — ${f.forecast_date}` : ''}`}
                        style={{
                            flex: 1,
                            background: colors[f.energy_level] ?? 'var(--lotus)',
                            height: `${(f.energy_level / 5) * 100}%`,
                            borderRadius: '4px',
                            minHeight: '10%',
                            opacity: 0.7 + (f.energy_level / 5) * 0.3,
                        }}
                    />
                ))}
            </div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                    fontSize: '10px',
                    color: 'var(--ink-ghost)',
                }}
            >
                <span>Oldest</span>
                <span>Today</span>
            </div>
        </>
    );
}

// ─── MoodPickerCard ──────────────────────────────────────────────────────────

interface MoodPickerCardProps {
    /** Current open state of the picker overlay. */
    isOpen: boolean;
    /** Toggle the picker open/closed. */
    onToggle: () => void;
    /** Called when user selects a mood emoji. Should call addMoodLog internally. */
    onSelect: (mood: MoodLog['mood'], note: string) => Promise<void>;
    /** Whether the save is in flight. */
    isSaving: boolean;
    /** The latest logged mood (to display when picker is closed). */
    latestMood: MoodLog | null | undefined;
    /** Whether the mood history is still loading. */
    isLoading: boolean;
    /**
     * Optional card accent.
     * - 'dark'  → ink background (teachers)
     * - 'water' → water background (students)
     * Defaults to 'dark'.
     */
    accent?: 'dark' | 'water';
}

/**
 * Self-contained mood resonance card:
 *  - Header with "Log Mood" toggle
 *  - Emoji picker overlay
 *  - Optional note input
 *  - Latest mood display
 *
 * Used by TeacherSelfView, StudentSelfView, and FounderSelfView.
 */
export function MoodPickerCard({
    isOpen,
    onToggle,
    onSelect,
    isSaving,
    latestMood,
    isLoading,
    accent = 'dark',
}: MoodPickerCardProps) {
    const [note, setNote] = React.useState('');

    const bg = accent === 'water' ? 'var(--water)' : 'var(--ink)';
    const overlayBg = accent === 'water' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.08)';

    const handleSelect = async (mood: MoodLog['mood']) => {
        await onSelect(mood, note);
        setNote('');
    };

    return (
        <div className="sanctuary-card" style={{ background: bg, color: 'white' }}>
            <div className="card-body-inner">
                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        marginBottom: '16px',
                    }}
                >
                    <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>Mood Resonance</h3>
                    <button
                        onClick={onToggle}
                        style={{
                            background: isOpen ? (accent === 'water' ? 'rgba(255,255,255,0.35)' : 'var(--lotus)') : 'rgba(255,255,255,0.15)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            cursor: 'pointer',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: '700',
                            fontFamily: 'var(--font-body)',
                            transition: 'background 0.2s',
                        }}
                    >
                        {isOpen ? 'Cancel' : '+ Log Mood'}
                    </button>
                </div>

                {/* Picker overlay */}
                {isOpen && (
                    <div
                        style={{
                            marginBottom: '16px',
                            padding: '16px',
                            background: overlayBg,
                            borderRadius: '12px',
                        }}
                    >
                        <p style={{ fontSize: '12px', opacity: 0.75, marginBottom: '12px' }}>
                            How are you feeling right now?
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                            {MOOD_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    disabled={isSaving}
                                    onClick={() => void handleSelect(opt.value)}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '8px 12px',
                                        background: 'rgba(255,255,255,0.12)',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        color: 'white',
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        fontFamily: 'var(--font-body)',
                                        transition: 'background 0.15s',
                                        opacity: isSaving ? 0.6 : 1,
                                    }}
                                >
                                    <span style={{ fontSize: '20px' }}>{opt.emoji}</span>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <input
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="Optional note…"
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'rgba(255,255,255,0.12)',
                                color: 'white',
                                fontSize: '13px',
                                fontFamily: 'var(--font-body)',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>
                )}

                {/* Latest mood display */}
                {isLoading ? (
                    <p style={{ fontSize: '13px', opacity: 0.7 }}>Loading mood data…</p>
                ) : latestMood ? (
                    <>
                        <div
                            style={{
                                fontSize: '28px',
                                fontWeight: '800',
                                marginBottom: '4px',
                                color: MOOD_COLORS[latestMood.mood_score] ?? 'var(--lotus)',
                            }}
                        >
                            {latestMood.mood_score}/5
                        </div>
                        <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '8px' }}>
                            {latestMood.mood
                                ? latestMood.mood.charAt(0).toUpperCase() + latestMood.mood.slice(1)
                                : MOOD_LABELS[latestMood.mood_score]}
                        </div>
                        {latestMood.note && (
                            <p
                                style={{
                                    fontSize: '12px',
                                    opacity: 0.7,
                                    lineHeight: '1.5',
                                    fontStyle: 'italic',
                                    marginBottom: '8px',
                                }}
                            >
                                "{latestMood.note}"
                            </p>
                        )}
                        <div style={{ fontSize: '11px', opacity: 0.5 }}>
                            {formatDistanceToNow(new Date(latestMood.created_at), { addSuffix: true })}
                        </div>
                    </>
                ) : (
                    <p style={{ fontSize: '13px', opacity: 0.7 }}>
                        No mood logs yet. Tap "+ Log Mood" above to begin.
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── WarmMirrorCard ──────────────────────────────────────────────────────────

interface WarmMirrorCardProps {
    text: string | null;
}

/**
 * Renders the "Your Week as a Story" warm mirror narrative card.
 * Null-safe — returns null when there's nothing to show yet.
 */
export function WarmMirrorCard({ text }: WarmMirrorCardProps) {
    if (!text) return null;
    return (
        <div
            className="sanctuary-card"
            style={{
                padding: '28px',
                background: 'linear-gradient(135deg, var(--lotus-soft) 0%, var(--background-alt) 100%)',
                border: '1px solid var(--lotus-soft)',
            }}
        >
            <h3
                style={{
                    fontSize: '12px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    color: 'var(--lotus)',
                    marginBottom: '12px',
                }}
            >
                🌸 Your Week as a Story
            </h3>
            <p
                style={{
                    fontSize: '14px',
                    lineHeight: '1.7',
                    color: 'var(--ink)',
                    fontStyle: 'italic',
                    margin: 0,
                }}
            >
                {text}
            </p>
        </div>
    );
}

// ─── ImpactRipplesCard ───────────────────────────────────────────────────────

interface ImpactRipplesCardProps {
    ripples: ImpactRipple[];
}

/**
 * Renders pending Impact Ripple notifications.
 * Null-safe — returns null when there are no ripples.
 */
export function ImpactRipplesCard({ ripples }: ImpactRipplesCardProps) {
    if (!ripples.length) return null;
    return (
        <div
            className="sanctuary-card"
            style={{
                padding: '24px',
                background: 'linear-gradient(135deg, rgba(58,122,154,0.08) 0%, var(--background-alt) 100%)',
                border: '1px solid rgba(58,122,154,0.2)',
            }}
        >
            <h3
                style={{
                    fontSize: '12px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    color: 'var(--water)',
                    marginBottom: '12px',
                }}
            >
                💧 Impact Ripples
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {ripples.map(r => (
                    <div
                        key={r.id}
                        style={{
                            padding: '12px 16px',
                            background: 'rgba(58,122,154,0.07)',
                            borderRadius: '10px',
                            fontSize: '13px',
                            lineHeight: '1.5',
                            color: 'var(--ink)',
                        }}
                    >
                        {r.warm_message_en ?? r.ripple_type}
                    </div>
                ))}
            </div>
        </div>
    );
}
