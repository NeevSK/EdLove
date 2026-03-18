/**
 * SleepTracker.web.tsx
 *
 * Web override. The native version uses expo-haptics + RN Slider.
 * On web we use an HTML range input for the 1-5 sleep quality check-in
 * with the same morning-only logic and Supabase backend.
 * Metro resolves this over SleepTracker.tsx on the web platform.
 */
import React, { useState, useEffect } from 'react';
import { supabase, useTemporalStore } from '@repo/core';
import { useSleepTracker } from '../hooks/useSleepTracker';

interface SleepTrackerProps {
    userId?: string;
}

const QUALITY_LABELS: Record<number, { label: string; emoji: string; color: string }> = {
    1: { label: 'Awful',     emoji: '😫', color: '#EF4444' },
    2: { label: 'Poor',      emoji: '😔', color: '#F97316' },
    3: { label: 'Fair',      emoji: '😐', color: '#EAB308' },
    4: { label: 'Good',      emoji: '😊', color: '#22C55E' },
    5: { label: 'Excellent', emoji: '✨', color: '#8B5CF6' },
};

export default function SleepTracker({ userId }: SleepTrackerProps) {
    const { sleepLogs, refreshData, setSleepLogs } = useSleepTracker(userId);
    const isPastView = useTemporalStore(s => s.isPastView);
    const [quality, setQuality] = useState(3);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const hour = new Date().getHours();
    const isMorning = hour >= 5 && hour < 12;
    const todayStr = new Date().toISOString().split('T')[0];
    const alreadyLoggedToday = sleepLogs.some(
        l => l.created_at.startsWith(todayStr)
    );

    const todayLog = sleepLogs.find(l => l.created_at.startsWith(todayStr));

    useEffect(() => {
        if (todayLog) setQuality(todayLog.quality);
    }, [todayLog?.quality]);

    const handleSave = async () => {
        if (!userId) return;
        setSaving(true);
        try {
            const { data, error } = await supabase
                .from('sleep_logs')
                .insert({ user_id: userId, quality, created_at: new Date().toISOString() })
                .select().single();
            if (!error && data) {
                setSleepLogs(prev => [data, ...prev]);
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
            }
        } finally {
            setSaving(false);
        }
    };

    const meta = QUALITY_LABELS[quality];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🌙</span>
                <span style={{ fontSize: '14px', fontWeight: '800' }}>Sleep Quality</span>
                {isMorning && !alreadyLoggedToday && !isPastView && (
                    <span style={{ marginLeft: 'auto', fontSize: '11px', padding: '3px 8px', background: 'rgba(139,92,246,0.1)', color: '#8B5CF6', borderRadius: '6px', fontWeight: '700' }}>
                        Morning check-in
                    </span>
                )}
            </div>

            {alreadyLoggedToday ? (
                <div style={{ padding: '16px', background: 'var(--background-alt)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '32px' }}>{QUALITY_LABELS[todayLog?.quality ?? quality].emoji}</span>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: '700' }}>
                            Sleep logged: <span style={{ color: QUALITY_LABELS[todayLog?.quality ?? quality].color }}>{QUALITY_LABELS[todayLog?.quality ?? quality].label}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>Checked in this morning ✓</div>
                    </div>
                </div>
            ) : (
                <>
                    <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <div style={{ fontSize: '48px', marginBottom: '8px', transition: 'all 0.2s' }}>{meta.emoji}</div>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: meta.color, transition: 'color 0.2s' }}>{meta.label}</div>
                        <div style={{ fontSize: '12px', color: 'var(--ink-ghost)', marginTop: '4px' }}>How well did you sleep last night?</div>
                    </div>

                    <input
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        value={quality}
                        onChange={e => setQuality(Number(e.target.value))}
                        disabled={isPastView}
                        style={{ width: '100%', accentColor: meta.color, cursor: isPastView ? 'default' : 'pointer', opacity: isPastView ? 0.6 : 1 }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        {[1, 2, 3, 4, 5].map(v => (
                            <span key={v} style={{ fontSize: '10px', color: quality === v ? meta.color : 'var(--ink-ghost)', fontWeight: quality === v ? '800' : '400' }}>
                                {QUALITY_LABELS[v].label}
                            </span>
                        ))}
                    </div>

                    {isMorning && !isPastView ? (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{ padding: '10px', borderRadius: '10px', background: meta.color, color: '#fff', border: 'none', fontWeight: '700', fontSize: '13px', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}
                        >
                            {saving ? 'Logging…' : saved ? '✓ Logged' : 'Log Sleep Quality'}
                        </button>
                    ) : (
                        <p style={{ fontSize: '12px', color: 'var(--ink-ghost)', textAlign: 'center', margin: 0 }}>
                            {isPastView ? 'Viewing historical sleep quality.' : 'Sleep check-in is available in the morning (5am – 12pm).'}
                        </p>
                    )}
                </>
            )}

            {/* Recent sleep history */}
            {sleepLogs.length > 1 && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    {sleepLogs.slice(0, 7).map((log, i) => {
                        const m = QUALITY_LABELS[log.quality];
                        return (
                            <div
                                key={log.id}
                                title={`${new Date(log.created_at).toLocaleDateString()} — ${m.label}`}
                                style={{ flex: 1, height: `${(log.quality / 5) * 32 + 8}px`, background: m.color, borderRadius: '3px', opacity: 0.7, minHeight: '8px' }}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
