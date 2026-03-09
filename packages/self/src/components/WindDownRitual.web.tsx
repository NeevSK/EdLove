/**
 * WindDownRitual.web.tsx
 *
 * Web override. The native version uses expo-haptics. On web we deliver the
 * same 3-step evening wind-down (breathe → reflect → release → set intent)
 * with pure HTML/CSS. Saves to Supabase `wind_down_rituals` table if it
 * exists; otherwise fires-and-forgets gracefully.
 * Metro resolves this over WindDownRitual.tsx on the web platform.
 */
import React, { useState } from 'react';
import { supabase } from '@repo/core';
import { Moon, CheckCircle2 } from 'lucide-react-native';

interface WindDownRitualProps {
    userId?: string;
}

const STEPS = [
    { id: 'breathe',  title: '🌬 Breathe',       description: 'Take three slow, deep breaths. Breathe in for 4 counts, hold for 4, out for 6.' },
    { id: 'reflect',  title: '🌙 What went well?', description: 'One thing that went well today, however small.', hasInput: true, placeholder: 'Something I noticed…' },
    { id: 'release',  title: '🍃 Release',          description: 'One thing to let go of before you sleep.', hasInput: true, placeholder: 'I release…' },
    { id: 'intent',   title: '⭐ Tomorrow\'s seed', description: 'One gentle intention for tomorrow.', hasInput: true, placeholder: 'Tomorrow I will…' },
];

export default function WindDownRitual({ userId }: WindDownRitualProps) {
    const [step, setStep] = useState(0);
    const [values, setValues] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [completed, setCompleted] = useState(false);

    const current = STEPS[step];
    const isLast = step === STEPS.length - 1;

    const handleNext = async () => {
        if (isLast) {
            setSaving(true);
            try {
                if (userId) {
                    await supabase.from('wind_down_rituals').insert({
                        user_id: userId,
                        went_well: values['reflect'] ?? '',
                        to_release: values['release'] ?? '',
                        tomorrow_intent: values['intent'] ?? '',
                        completed_at: new Date().toISOString(),
                    }).then(() => {}); // fire-and-forget
                }
            } catch { /* non-fatal */ } finally {
                setSaving(false);
                setCompleted(true);
            }
        } else {
            setStep(s => s + 1);
        }
    };

    if (completed) {
        return (
            <div style={{ padding: '28px', background: 'rgba(139,92,246,0.06)', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(139,92,246,0.15)' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌙</div>
                <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>Rest well.</div>
                <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', margin: 0 }}>
                    Your wind-down is complete. You've tended to your inner garden for today.
                </p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Progress bar */}
            <div style={{ display: 'flex', gap: '6px' }}>
                {STEPS.map((s, i) => (
                    <div
                        key={s.id}
                        style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= step ? '#8B5CF6' : 'var(--border)', transition: 'background 0.3s' }}
                    />
                ))}
            </div>

            {/* Step card */}
            <div style={{ padding: '28px', background: 'var(--background-alt)', borderRadius: '16px' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '10px' }}>{current.title}</div>
                <p style={{ fontSize: '14px', color: 'var(--ink-ghost)', lineHeight: '1.6', marginBottom: current.hasInput ? '16px' : '24px' }}>
                    {current.description}
                </p>

                {current.hasInput && (
                    <textarea
                        autoFocus
                        value={values[current.id] ?? ''}
                        onChange={e => setValues(v => ({ ...v, [current.id]: e.target.value }))}
                        placeholder={current.placeholder}
                        rows={3}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'white', color: 'var(--ink)', fontSize: '14px', fontFamily: 'var(--font-body)', outline: 'none', resize: 'vertical', marginBottom: '16px', boxSizing: 'border-box' }}
                    />
                )}

                <button
                    onClick={handleNext}
                    disabled={saving}
                    style={{ padding: '11px 24px', borderRadius: '10px', background: '#8B5CF6', color: '#fff', border: 'none', fontWeight: '700', fontSize: '14px', cursor: saving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    {saving ? 'Saving…' : isLast ? (
                        <><CheckCircle2 size={16} color="#fff" /> Complete Ritual</>
                    ) : (
                        `Next → ${STEPS[step + 1].title.split(' ').slice(1).join(' ')}`
                    )}
                </button>
            </div>

            {step > 0 && (
                <button
                    onClick={() => setStep(s => s - 1)}
                    style={{ background: 'none', border: 'none', color: 'var(--ink-ghost)', fontSize: '12px', cursor: 'pointer', alignSelf: 'flex-start' }}
                >
                    ← Back
                </button>
            )}
        </div>
    );
}
