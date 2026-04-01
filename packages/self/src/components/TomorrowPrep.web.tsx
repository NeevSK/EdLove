/**
 * TomorrowPrep.web.tsx
 *
 * Web override. The native version uses expo-haptics + @repo/ui Checkbox.
 * On web we deliver the same tomorrow preparation checklist CRUD with
 * HTML checkboxes and the same Supabase backend.
 * Metro resolves this over TomorrowPrep.tsx on the web platform.
 */
import React, { useState, useEffect } from 'react';
import { useTemporalStore } from '@repo/core';
import { useTomorrowPrep } from '../hooks/useTomorrowPrep';
import type { DailyPrepItem } from '../types';
import { Calendar, Plus, Trash2, Check } from 'lucide-react-native';

interface TomorrowPrepProps {
    userId?: string;
}

const getTomorrow = (): string => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0] as string;
};

export default function TomorrowPrep({ userId }: TomorrowPrepProps) {
    const { prepItems, isLoading, addPrepItem, updatePrepItem, removePrepItem } = useTomorrowPrep(userId);
    const isPastView = useTemporalStore(s => s.isPastView);
    const [showForm, setShowForm] = useState(false);
    const [itemText, setItemText] = useState('');
    const [saving, setSaving] = useState(false);
    const [toggling, setToggling] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    // Recomputes at midnight so date stays correct if the app stays open overnight
    const [tomorrow, setTomorrow] = useState<string>(getTomorrow);
    useEffect(() => {
        const now = new Date();
        const msUntilMidnight =
            new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
        const timer = setTimeout(() => setTomorrow(getTomorrow()), msUntilMidnight);
        return () => clearTimeout(timer);
    }, [tomorrow]);

    const tomorrowItems = prepItems.filter(i => i.prep_date === tomorrow);
    const completedCount = tomorrowItems.filter(i => i.is_completed).length;

    const handleAdd = async () => {
        if (!itemText.trim() || !userId) return;
        setSaving(true);
        try {
            await addPrepItem(itemText.trim(), tomorrow);
            setItemText('');
            setShowForm(false);
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (item: DailyPrepItem) => {
        setToggling(item.id);
        const newVal = !item.is_completed;
        try {
            await updatePrepItem(item.id, { is_completed: newVal });
        } catch {
            // no-op; hook state remains source of truth
        } finally {
            setToggling(null);
        }
    };

    const handleDelete = async (id: string) => {
        setDeleting(id);
        try {
            await removePrepItem(id);
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} color="var(--sanctuary-saffron)" />
                    <span style={{ fontSize: '14px', fontWeight: '800' }}>Tomorrow's Preparation</span>
                    {tomorrowItems.length > 0 && (
                        <span style={{ fontSize: '11px', padding: '2px 8px', background: 'var(--background-alt)', borderRadius: '6px', color: 'var(--ink-ghost)' }}>
                            {completedCount}/{tomorrowItems.length}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => !isPastView && setShowForm(v => !v)}
                    disabled={isPastView}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: isPastView ? 'transparent' : (showForm ? 'var(--sanctuary-saffron)' : 'transparent'), color: isPastView ? 'var(--ink-ghost)' : (showForm ? 'var(--text-on-action)' : 'var(--ink-ghost)'), cursor: isPastView ? 'default' : 'pointer', fontWeight: '700', transition: 'all 0.2s', opacity: isPastView ? 0.5 : 1 }}
                >
                    <Plus size={12} color={isPastView ? 'var(--ink-ghost)' : (showForm ? 'var(--text-on-action)' : 'var(--ink-ghost)')} />
                    {showForm ? 'Cancel' : 'Add'}
                </button>
            </div>

            {/* Progress bar */}
            {tomorrowItems.length > 0 && (
                <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px' }}>
                    <div style={{ width: `${(completedCount / tomorrowItems.length) * 100}%`, height: '100%', background: 'var(--sanctuary-saffron)', borderRadius: '2px', transition: 'width 0.4s ease' }} />
                </div>
            )}

            {/* Add form */}
            {showForm && (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        autoFocus
                        value={itemText}
                        onChange={e => setItemText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
                        placeholder="What do you need to prepare for tomorrow?"
                        style={{ flex: 1, padding: '9px 12px', borderRadius: '10px', border: '1.5px solid var(--sanctuary-saffron)', background: 'var(--background-alt)', color: 'var(--ink)', fontSize: '13px', fontFamily: 'var(--font-body)', outline: 'none' }}
                    />
                    <button
                        onClick={handleAdd}
                        disabled={saving || !itemText.trim()}
                        style={{ padding: '9px 16px', borderRadius: '10px', background: 'var(--sanctuary-saffron)', color: 'var(--text-on-action)', border: 'none', fontWeight: '700', fontSize: '12px', cursor: saving || !itemText.trim() ? 'not-allowed' : 'pointer', opacity: saving || !itemText.trim() ? 0.6 : 1 }}
                    >
                        {saving ? '...' : <Check size={14} color="var(--text-on-action)" />}
                    </button>
                </div>
            )}

            {/* Items */}
            {isLoading ? (
                <div style={{ height: '48px', background: 'var(--background-alt)', borderRadius: '10px' }} />
            ) : tomorrowItems.length === 0 ? (
                <div style={{ padding: '20px', background: 'var(--background-alt)', borderRadius: '12px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', margin: 0 }}>
                        Set your intentions for tomorrow. A prepared mind rests easier.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {tomorrowItems.map(item => (
                        <div
                            key={item.id}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--background-alt)', borderRadius: '10px', opacity: item.is_completed ? 0.6 : 1, transition: 'opacity 0.2s' }}
                        >
                            <input
                                type="checkbox"
                                checked={item.is_completed}
                                onChange={() => !isPastView && handleToggle(item)}
                                disabled={toggling === item.id || isPastView}
                                style={{ width: '16px', height: '16px', accentColor: 'var(--sanctuary-saffron)', cursor: isPastView ? 'default' : 'pointer', flexShrink: 0 }}
                            />
                            <span style={{ flex: 1, fontSize: '13px', textDecoration: item.is_completed ? 'line-through' : 'none', color: item.is_completed ? 'var(--ink-ghost)' : 'var(--ink)' }}>
                                {item.item_text}
                            </span>
                            <button
                                onClick={() => !isPastView && handleDelete(item.id)}
                                disabled={deleting === item.id || isPastView}
                                style={{ background: 'none', border: 'none', cursor: isPastView ? 'default' : 'pointer', padding: '2px', opacity: (deleting === item.id || isPastView) ? 0.4 : 0.6 }}
                            >
                                <Trash2 size={13} color="var(--ink-ghost)" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
