/**
 * BreathGuide.web.tsx
 *
 * Web override of the RN BreathGuide. The native version uses react-native-reanimated
 * for a petal bloom animation and expo-haptics. On web we use CSS keyframe animations
 * and the same 4-4-2-6 breath cycle.
 * Metro resolves this over BreathGuide.tsx on the web platform.
 */
import React, { useState, useEffect, useRef } from 'react';

interface BreathGuideProps {
    onComplete?: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale' | 'rest';

const CYCLE: Array<{ phase: Phase; duration: number; label: string; color: string }> = [
    { phase: 'inhale', duration: 4000, label: 'Breathe in…',  color: '#8B5CF6' },
    { phase: 'hold',   duration: 2000, label: 'Hold…',         color: '#FCD34D' },
    { phase: 'exhale', duration: 6000, label: 'Breathe out…', color: '#3B82F6' },
    { phase: 'rest',   duration: 2000, label: 'Rest…',         color: '#6EE7B7' },
];
const TOTAL_CYCLES = 4;

export default function BreathGuide({ onComplete }: BreathGuideProps) {
    const [active, setActive] = useState(false);
    const [cycleIdx, setCycleIdx] = useState(0);
    const [phaseIdx, setPhaseIdx] = useState(0);
    const [done, setDone] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const current = CYCLE[phaseIdx];

    const advance = (ci: number, pi: number) => {
        const nextPi = (pi + 1) % CYCLE.length;
        const nextCi = nextPi === 0 ? ci + 1 : ci;
        if (nextCi >= TOTAL_CYCLES) {
            setActive(false);
            setDone(true);
            onComplete?.();
            return;
        }
        setPhaseIdx(nextPi);
        setCycleIdx(nextCi);
        timerRef.current = setTimeout(() => advance(nextCi, nextPi), CYCLE[nextPi].duration);
    };

    const start = () => {
        setDone(false);
        setPhaseIdx(0);
        setCycleIdx(0);
        setActive(true);
        timerRef.current = setTimeout(() => advance(0, 0), CYCLE[0].duration);
    };

    const stop = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setActive(false);
    };

    useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

    const scale = active && current.phase === 'inhale' ? 1.4
                : active && current.phase === 'exhale' ? 0.7
                : active && current.phase === 'hold'   ? 1.4
                : 1.0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '8px 0' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--ink-ghost)' }}>
                Breath Guide
            </div>

            {done ? (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🌸</div>
                    <p style={{ fontSize: '14px', color: 'var(--ink-ghost)', margin: 0 }}>
                        {TOTAL_CYCLES} cycles complete. You are grounded.
                    </p>
                </div>
            ) : (
                <>
                    {/* Petal orb */}
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${active ? current.color : '#E5E7EB'}88 0%, ${active ? current.color : '#E5E7EB'}22 100%)`,
                        border: `2px solid ${active ? current.color : 'var(--border)'}`,
                        transform: `scale(${scale})`,
                        transition: `transform ${active ? current.duration : 400}ms ease-in-out, background 0.5s, border-color 0.5s`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <span style={{ fontSize: '32px' }}>🌬</span>
                    </div>

                    {/* Phase label */}
                    <div style={{ textAlign: 'center', minHeight: '36px' }}>
                        {active ? (
                            <>
                                <div style={{ fontSize: '18px', fontWeight: '800', color: current.color, transition: 'color 0.3s' }}>
                                    {current.label}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--ink-ghost)', marginTop: '4px' }}>
                                    Cycle {cycleIdx + 1} of {TOTAL_CYCLES}
                                </div>
                            </>
                        ) : (
                            <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', margin: 0 }}>
                                4 cycles · ~1 minute · 4-2-6-2 rhythm
                            </p>
                        )}
                    </div>
                </>
            )}

            <button
                onClick={active ? stop : start}
                style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    background: active ? 'var(--border)' : '#8B5CF6',
                    color: active ? 'var(--ink-ghost)' : '#fff',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                }}
            >
                {done ? '↺ Again' : active ? '⏹ Stop' : '▶ Begin'}
            </button>
        </div>
    );
}
