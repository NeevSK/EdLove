/**
 * JoyJar.web.tsx
 *
 * Web override. The native version uses expo-haptics + @repo/ui.
 * On web we deliver the same joy moment capture with 4 categories
 * and the same Supabase backend.
 * Metro resolves this over JoyJar.tsx on the web platform.
 */
import React, { useState } from 'react';
import { useJoyJar } from '../hooks/useJoyJar';
import type { JoyMoment } from '../types';
import { Sparkles, Plus } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

interface JoyJarProps {
    userId?: string;
}

type Category = 'breakthrough' | 'question' | 'connection' | 'other';

const CATEGORIES: Array<{ value: Category; label: string; emoji: string; color: string }> = [
    { value: 'breakthrough', label: 'Breakthrough', emoji: '\uD83D\uDCA1', color: '#F59E0B' },
    { value: 'question',     label: 'Great Question', emoji: '\u2753', color: '#8B5CF6' },
    { value: 'connection',   label: 'Connection',    emoji: '\uD83D\uDCAB', color: '#3B82F6' },
    { value: 'other',        label: 'Other',          emoji: '\u2728', color: '#22C55E' },
];

export default function JoyJar({ userId }: JoyJarProps) {
    const { joyMoments, isLoading, setJoyMoments, addJoyMoment } = useJoyJar(userId);
    const [showForm, setShowForm] = useState(false);
    const [studentName, setStudentName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<Category>('breakthrough');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!description.trim() || !userId) return;
        setSaving(true);
        try {
            const data = await addJoyMoment({
                student_name: studentName.trim() || undefined,
                moment_description: description.trim(),
                category,
            });
            if (data) {
                setJoyMoments(prev => [data, ...prev]);
                setStudentName('');
                setDescription('');
                setShowForm(false);
            }
        } finally {
            setSaving(false);
        }
    };

    const getCategoryMeta = (cat: string) => CATEGORIES.find(c => c.value === cat) ?? CATEGORIES[3]!;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    <Sparkles size={16} color="#F59E0B" /
                    <span style={{ fontSize: '14px', fontWeight: '800' }}>Joy Jar</span
                    {!isLoading && joyMoments.length > 0 && (
                        <span style={{ fontSize: '11px', padding: '2px 8px', background: 'var(--background-alt)', borderRadius: '6px', color: 'var(--ink-ghost)' }}
                            {joyMoments.length}
                        </span
                    )}
                </div
                <button
                    onClick={() => setShowForm(v => !v)}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: showForm ? '#F59E0B' : 'transparent', color: showForm ? '#fff' : 'var(--ink-ghost)', cursor: 'pointer', fontWeight: '700', transition: 'all 0.2s' }}
                
                    <Plus size={12} color={showForm ? '#fff' : 'var(--ink-ghost)'} /
                    {showForm ? 'Cancel' : 'Capture Moment'}
                </button
            </div

            {/* Add form */}
            {showForm && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: 'var(--background-alt)', borderRadius: '12px' }}
                    {/* Category selector */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.value}
                                onClick={() => setCategory(cat.value)}
                                style={{ padding: '8px 4px', borderRadius: '8px', border: `1.5px solid ${category === cat.value ? cat.color : 'var(--border)'}`, background: category === cat.value ? `${cat.color}18` : 'transparent', cursor: 'pointer', fontSize: '9px', fontWeight: '700', color: category === cat.value ? cat.color : 'var(--ink-ghost)', transition: 'all 0.2s', textAlign: 'center' }}
                            
                                <div style={{ fontSize: '16px', marginBottom: '3px' }}>{cat.emoji}</div
                                {cat.label}
                            </button
                        ))}
                    </div
                    <input
                        value={studentName}
                        onChange={e => setStudentName(e.target.value)}
                        placeholder="Student's name (optional)"
                        style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', color: 'var(--ink)', fontSize: '13px', fontFamily: 'var(--font-body)', outline: 'none' }}
                    /
                    <textarea
                        autoFocus
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSave(); }}
                        placeholder="Describe this moment of joy\u2026"
                        rows={3}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'white', color: 'var(--ink)', fontSize: '13px', fontFamily: 'var(--font-body)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                    /
                    <button
                        onClick={handleSave}
                        disabled={saving || !description.trim()}
                        style={{ padding: '10px', borderRadius: '10px', background: '#F59E0B', color: '#fff', border: 'none', fontWeight: '700', fontSize: '13px', cursor: saving || !description.trim() ? 'not-allowed' : 'pointer', opacity: saving || !description.trim() ? 0.6 : 1 }}
                    
                        {saving ? 'Saving\u2026' : '\u2728 Add to Jar'}
                    </button
                </div
            )}

            {/* Moments */}
            {isLoading ? (
                <div style={{ height: '60px', background: 'var(--background-alt)', borderRadius: '10px' }} /
            ) : joyMoments.length === 0 ? (
                <div style={{ padding: '20px', background: 'var(--background-alt)', borderRadius: '12px', textAlign: 'center' }}
                    <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', margin: 0 }}
                        Your jar is empty. What brought a spark of joy today?
                    </p
                </div
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
                    {joyMoments.slice(0, 6).map((moment: JoyMoment) => {
                        const meta = getCategoryMeta(moment.category);
                        return (
                            <div
                                key={moment.id}
                                style={{ padding: '14px 18px', background: 'var(--background-alt)', borderRadius: '12px', borderLeft: `3px solid ${meta.color}` }}
                            
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}
                                    <span>{meta.emoji}</span
                                    {moment.student_name && (
                                        <span style={{ fontSize: '12px', fontWeight: '700', color: meta.color }}>{moment.student_name}</span
                                    )}
                                    <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--ink-ghost)' }}
                                        {formatDistanceToNow(new Date(moment.created_at), { addSuffix: true })}
                                    </span
                                </div
                                <p style={{ fontSize: '13px', color: 'var(--ink-soft)', lineHeight: '1.6', margin: 0 }}
                                    {moment.moment_description}
                                </p
                            </div
                        );
                    })}
                </div
            )}
        </div
    );
}
