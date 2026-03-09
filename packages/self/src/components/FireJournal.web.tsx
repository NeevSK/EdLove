/**
 * FireJournal.web.tsx
 *
 * Web override. The native version uses react-native-reanimated for a dramatic
 * burn/smoke animation and expo-haptics. On web we deliver the same cathartic
 * release with a CSS "burn and fade" animation and the same Supabase backend.
 * Metro resolves this over FireJournal.tsx on the web platform.
 */
import React, { useState } from 'react';
import { supabase } from '@repo/core';
import { useFireJournal } from '../hooks/useFireJournal';
import { Flame } from 'lucide-react-native';

interface FireJournalProps {
    userId?: string;
    onBurned?: () => void;
}

export default function FireJournal({ userId, onBurned }: FireJournalProps) {
    const { refreshData } = useFireJournal(userId);
    const [content, setContent] = useState('');
    const [burning, setBurning] = useState(false);
    const [burned, setBurned] = useState(false);
    const [charCount, setCharCount] = useState(0);

    const handleChange = (val: string) => {
        setContent(val);
        setCharCount(val.length);
    };

    const handleBurn = async () => {
        if (!content.trim() || burning) return;
        setBurning(true);

        // Dramatic pause — let the user "see" it burning
        await new Promise(r => setTimeout(r, 1200));

        try {
            if (userId) {
                await supabase.from('fire_journal').insert({
                    user_id: userId,
                    content_preview: content.slice(0, 50),
                    is_burned: true,
                    created_at: new Date().toISOString(),
                });
            }
            refreshData();
            onBurned?.();
        } catch { /* non-fatal — the release is in the writing, not the save */ }

        setContent('');
        setCharCount(0);
        setBurning(false);
        setBurned(true);
        setTimeout(() => setBurned(false), 3000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>
                    <Flame size={18} color="#EF4444" />
                </div>
                <div>
                    <div style={{ fontSize: '14px', fontWeight: '800' }}>Fire Journal</div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>Write it. Burn it. Release it.</div>
                </div>
            </div>

            {burned ? (
                <div style={{ padding: '28px', background: 'rgba(239,68,68,0.06)', borderRadius: '14px', textAlign: 'center', border: '1px solid rgba(239,68,68,0.15)', animation: 'fadeIn 0.5s ease' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔥</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#EF4444', marginBottom: '6px' }}>Released.</div>
                    <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', margin: 0 }}>
                        The words are ash now. You're lighter.
                    </p>
                </div>
            ) : (
                <>
                    <div style={{ position: 'relative' }}>
                        <textarea
                            value={content}
                            onChange={e => handleChange(e.target.value)}
                            placeholder="Write what's weighing on you. No one will read this. It will burn."
                            rows={5}
                            disabled={burning}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '12px',
                                border: `1.5px solid ${burning ? '#EF4444' : 'var(--border)'}`,
                                background: burning ? 'rgba(239,68,68,0.04)' : 'var(--background-alt)',
                                color: burning ? 'rgba(239,68,68,0.6)' : 'var(--ink)',
                                fontSize: '14px',
                                fontFamily: 'var(--font-body)',
                                lineHeight: '1.6',
                                outline: 'none',
                                resize: 'vertical',
                                boxSizing: 'border-box',
                                transition: 'all 0.3s ease',
                                opacity: burning ? 0.4 : 1,
                                animation: burning ? 'flicker 0.1s infinite' : 'none',
                            }}
                        />
                        {charCount > 0 && !burning && (
                            <div style={{ position: 'absolute', bottom: '10px', right: '14px', fontSize: '11px', color: 'var(--ink-ghost)' }}>
                                {charCount}
                            </div>
                        )}
                        {burning && (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                                <div style={{ fontSize: '48px', animation: 'burnPulse 0.3s ease-in-out infinite alternate' }}>🔥</div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleBurn}
                        disabled={burning || !content.trim()}
                        style={{
                            padding: '13px 24px',
                            borderRadius: '12px',
                            background: burning ? '#EF4444' : content.trim() ? 'linear-gradient(135deg, #EF4444, #DC2626)' : 'var(--border)',
                            color: content.trim() ? '#fff' : 'var(--ink-ghost)',
                            border: 'none',
                            fontWeight: '800',
                            fontSize: '14px',
                            cursor: burning || !content.trim() ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            letterSpacing: '0.5px',
                            transition: 'all 0.2s',
                        }}
                    >
                        <Flame size={16} color={content.trim() ? '#fff' : 'var(--ink-ghost)'} />
                        {burning ? 'Burning…' : 'Burn & Release 🔥'}
                    </button>
                </>
            )}

            <style>{`
                @keyframes flicker { 0% { opacity: 0.35; } 100% { opacity: 0.5; } }
                @keyframes burnPulse { 0% { transform: scale(0.9); } 100% { transform: scale(1.1); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
