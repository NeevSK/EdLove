/**
 * MoodLotus.web.tsx
 *
 * Web override. The native version uses expo-haptics + react-native-reanimated
 * lotus bloom animations. On web we deliver the same core feature — a 1-5 mood
 * slider with a lotus bloom visual and an optional breath guide — using pure
 * HTML/CSS. Metro picks this file over MoodLotus.tsx on the web platform.
 */
import React, { useState, useRef, useEffect } from 'react';
import { supabase, useStore } from '@repo/core';
import { useMoodLogs } from '../hooks/useMoodLogs';
import { MOOD_COLORS, MOOD_LABELS } from '../constants/wellbeing';

interface MoodLotusProps {
    userId?: string;
    onMoodChange?: (mood: number) => void;
}

const LOTUS_EMOJIS = ['', '🪷', '🌷', '🌸', '💐', '✨'];
const BREATH_STEPS = [
    { label: 'Breathe in', seconds: 4, color: '#8B5CF6' },
    { label: 'Hold', seconds: 4, color: '#FCD34D' },
    { label: 'Breathe out', seconds: 6, color: '#3B82F6' },
];

export default function MoodLotus({ userId, onMoodChange }: MoodLotusProps) {
    const { moodHistory, addMoodLog, isLoading } = useMoodLogs(userId);
    const [selected, setSelected] = useState<number | null>(null);
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showBreath, setShowBreath] = useState(false);
    const [breathStep, setBreathStep] = useState(0);
    const [breathActive, setBreathActive] = useState(false);
    const breathTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
        };
    }, []);

    const latestScore = moodHistory[0]?.mood_score ?? null;
    const displayScore = selected ?? latestScore;

    const MOOD_OPTION_LABELS = ['', 'Struggling', 'Challenging', 'Okay', 'Good', 'Flourishing'];

    const handleSave = async () => {
        if (!selected) return;
        // Map score 1-5 to mood string
        const moodMap: Record<number, 'sad' | 'frustrated' | 'calm' | 'curious' | 'joyful'> = {
            1: 'sad', 2: 'frustrated', 3: 'calm', 4: 'curious', 5: 'joyful',
        };
        setSaving(true);
        try {
            await addMoodLog(moodMap[selected], note || undefined);
            onMoodChange?.(selected);
            setSaved(true);
            setNote('');
            setTimeout(() => setSaved(false), 2500);
        } finally {
            setSaving(false);
        }
    };

    const startBreath = () => {
        setBreathStep(0);
        setBreathActive(true);
        let step = 0;
        const advance = () => {
            step = (step + 1) % BREATH_STEPS.length;
            setBreathStep(step);
        };
        // Cycle through steps: in(4s) → hold(4s) → out(6s)
        const durations = [4000, 4000, 6000];
        let i = 0;
        const cycle = () => {
            breathTimerRef.current = setTimeout(() => {
                advance();
                i = (i + 1) % 3;
                cycle();
            }, durations[i]);
        };
        cycle();
    };

    const stopBreath = () => {
        if (breathTimerRef.current) {
            clearTimeout(breathTimerRef.current);
            breathTimerRef.current = null;
        }
        setBreathActive(false);
        setBreathStep(0);
    };

    const accent = displayScore ? MOOD_COLORS[displayScore] : 'var(--lotus)';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' } as React.CSSProperties}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--ink-ghost)', marginBottom: '4px' }}>
                        Mood Lotus
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--ink-ghost)' }}>
                        How are you feeling right now?
                    </div>
                </div>
                <button
                    onClick={() => { if (showBreath) stopBreath(); setShowBreath(v => !v); }}
                    style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--ink-ghost)' }}
                >
                    🌬 Breath
                </button>
            </div>

            {/* Lotus bloom visual */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    fontSize: displayScore ? '72px' : '56px',
                    filter: displayScore ? `drop-shadow(0 0 ${displayScore * 4}px ${accent}88)` : 'none',
                    transition: 'all 0.4s ease',
                    lineHeight: 1,
                }}>
                    {LOTUS_EMOJIS[displayScore ?? 0] || '🪷'}
                </div>
                {displayScore && (
                    <div style={{ fontSize: '14px', fontWeight: '700', color: accent, transition: 'color 0.3s' }}>
                        {MOOD_OPTION_LABELS[displayScore]}
                    </div>
                )}
            </div>

            {/* Mood selector — 5 petals */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map(score => (
                    <button
                        key={score}
                        onClick={() => setSelected(score)}
                        title={MOOD_OPTION_LABELS[score]}
                        style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            border: `2px solid ${selected === score ? MOOD_COLORS[score] : 'var(--border)'}`,
                            background: selected === score ? `${MOOD_COLORS[score]}22` : 'var(--background-alt)',
                            cursor: 'pointer',
                            fontSize: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            transform: selected === score ? 'scale(1.15)' : 'scale(1)',
                        }}
                    >
                        {LOTUS_EMOJIS[score]}
                    </button>
                ))}
            </div>

            {/* Note input (shown when a mood is selected) */}
            {selected !== null && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
                        placeholder="Add a note (optional)…"
                        style={{ padding: '9px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontSize: '13px', fontFamily: 'var(--font-body)', outline: 'none' }}
                    />
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{ padding: '9px 18px', borderRadius: '10px', background: accent, color: '#fff', border: 'none', fontWeight: '700', fontSize: '13px', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'all 0.2s' }}
                    >
                        {saving ? 'Saving…' : saved ? '✓ Logged' : 'Log Mood'}
                    </button>
                </div>
            )}

            {/* Breath guide */}
            {showBreath && (
                <div style={{ padding: '20px', background: 'rgba(139,92,246,0.06)', borderRadius: '14px', border: '1px solid rgba(139,92,246,0.15)', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#8B5CF6', marginBottom: '12px' }}>Breath Guide</div>
                    {breathActive ? (
                        <>
                            <div style={{ fontSize: '20px', fontWeight: '800', color: BREATH_STEPS[breathStep].color, marginBottom: '8px', transition: 'color 0.5s' }}>
                                {BREATH_STEPS[breathStep].label}
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--ink-ghost)', marginBottom: '14px' }}>
                                {BREATH_STEPS[breathStep].seconds}s
                            </div>
                            <button onClick={stopBreath} style={{ fontSize: '12px', padding: '6px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--ink-ghost)' }}>
                                Stop
                            </button>
                        </>
                    ) : (
                        <>
                            <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', marginBottom: '14px', margin: '0 0 14px' }}>
                                4-4-6 paced breathing to settle into your body.
                            </p>
                            <button onClick={startBreath} style={{ fontSize: '13px', padding: '8px 20px', borderRadius: '10px', background: '#8B5CF6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '700' }}>
                                Begin
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Recent mood history */}
            {!isLoading && moodHistory.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {moodHistory.slice(0, 7).map(m => (
                        <div
                            key={m.id}
                            title={`${MOOD_LABELS[m.mood_score]} — ${new Date(m.created_at).toLocaleDateString()}`}
                            style={{ width: '28px', height: '28px', borderRadius: '50%', background: MOOD_COLORS[m.mood_score], flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}
                        >
                            {LOTUS_EMOJIS[m.mood_score]}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
