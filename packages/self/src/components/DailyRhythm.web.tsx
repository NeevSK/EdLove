/**
 * DailyRhythm.web.tsx
 *
 * Web override. The native version uses @repo/ui Modal/Select components.
 * On web we deliver the same weekly timetable manager with HTML dialogs,
 * native <select>, and the same useTimetable hook.
 * Metro resolves this over DailyRhythm.tsx on the web platform.
 */
import React, { useState } from 'react';
import { useTimetable } from '../hooks/useTimetable';
import type { Period } from '../types';
import { Plus, Trash2, Clock } from 'lucide-react-native';

const DAYS = [
    { id: 1, label: 'Mon' },
    { id: 2, label: 'Tue' },
    { id: 3, label: 'Wed' },
    { id: 4, label: 'Thu' },
    { id: 5, label: 'Fri' },
];

const PERIOD_TYPES: Array<{ value: Period['type']; label: string }> = [
    { value: 'subject', label: 'Subject' },
    { value: 'relief',  label: 'Relief / Cover' },
    { value: 'interval', label: 'Interval / Break' },
];

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'white',
    color: 'var(--ink)',
    fontSize: '13px',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    boxSizing: 'border-box',
};

export default function DailyRhythm() {
    const today = new Date().getDay();
    const [activeDay, setActiveDay] = useState(today >= 1 && today <= 5 ? today : 1);
    const { periods, loading, addPeriod, deletePeriod } = useTimetable(activeDay);

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        subject: '',
        activity: '',
        class_name: '',
        type: 'subject' as Period['type'],
        start_time: '08:00',
        end_time: '09:00',
    });
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    const handleAdd = async () => {
        if (!form.subject.trim() && !form.activity.trim()) return;
        setSaving(true);
        try {
            await addPeriod({
                day_of_week: activeDay,
                period_number: periods.length + 1,
                subject: form.subject || undefined,
                activity: form.activity || undefined,
                class_name: form.class_name || undefined,
                type: form.type,
                start_time: form.start_time,
                end_time: form.end_time,
            } as Omit<Period, 'id' | 'user_id'>);
            setForm({ subject: '', activity: '', class_name: '', type: 'subject', start_time: '08:00', end_time: '09:00' });
            setShowForm(false);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeleting(id);
        try { await deletePeriod(id); } finally { setDeleting(null); }
    };

    const TYPE_COLORS: Record<Period['type'], string> = {
        subject: 'var(--water)',
        relief: 'var(--moss)',
        interval: 'var(--ink-ghost)',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '14px', fontWeight: '800' }}>Daily Rhythm</div>
                <button
                    onClick={() => setShowForm(v => !v)}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        fontSize: '12px', 
                        padding: '7px 14px', 
                        borderRadius: '8px', 
                        border: '1px solid var(--border)', 
                        background: showForm ? 'var(--water)' : 'transparent', 
                        color: showForm ? '#fff' : 'var(--ink-ghost)', 
                        cursor: 'pointer', 
                        fontWeight: '700', 
                        transition: 'all 0.2s' 
                    }}
                >
                    <Plus size={14} color={showForm ? '#fff' : 'var(--ink-ghost)'} />
                    {showForm ? 'Cancel' : 'Add Period'}
                </button>
            </div>

            {/* Day selector */}
            <div style={{ display: 'flex', gap: '8px' }}>
                {DAYS.map(d => (
                    <button
                        key={d.id}
                        onClick={() => setActiveDay(d.id)}
                        style={{ 
                            flex: 1, 
                            padding: '10px 4px', 
                            borderRadius: '10px', 
                            border: `1.5px solid ${activeDay === d.id ? 'var(--water)' : 'var(--border)'}`, 
                            background: activeDay === d.id ? 'var(--water)' : 'var(--background-alt)', 
                            color: activeDay === d.id ? '#fff' : 'var(--ink-ghost)', 
                            fontWeight: '700', 
                            fontSize: '12px', 
                            cursor: 'pointer', 
                            transition: 'all 0.2s' 
                        }}
                    >
                        {d.label}
                        {d.id === today && (
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: activeDay === d.id ? 'rgba(255,255,255,0.8)' : 'var(--water)', margin: '4px auto 0' }} />
                        )}
                    </button>
                ))}
            </div>

            {/* Add period form */}
            {showForm && (
                <div style={{ padding: '20px', background: 'var(--background-alt)', borderRadius: '14px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)', display: 'block', marginBottom: '4px' }}>Subject / Topic</label>
                            <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Mathematics" style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)', display: 'block', marginBottom: '4px' }}>Class</label>
                            <input value={form.class_name} onChange={e => setForm(f => ({ ...f, class_name: e.target.value }))} placeholder="e.g. Grade 10A" style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)', display: 'block', marginBottom: '4px' }}>Start</label>
                            <input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)', display: 'block', marginBottom: '4px' }}>End</label>
                            <input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} style={inputStyle} />
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)', display: 'block', marginBottom: '4px' }}>Type</label>
                        <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Period['type'] }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                            {PERIOD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={handleAdd}
                        disabled={saving || (!form.subject.trim() && !form.activity.trim())}
                        style={{ padding: '10px 20px', borderRadius: '10px', background: 'var(--water)', color: '#fff', border: 'none', fontWeight: '700', fontSize: '13px', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}
                    >
                        {saving ? 'Saving...' : '+ Add to Schedule'}
                    </button>
                </div>
            )}

            {/* Period list */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[1, 2].map(i => <div key={i} style={{ height: '52px', background: 'var(--background-alt)', borderRadius: '10px' }} />)}
                </div>
            ) : periods.length === 0 ? (
                <div style={{ padding: '24px', background: 'var(--background-alt)', borderRadius: '14px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: 'var(--ink-ghost)', margin: 0 }}>
                        No periods scheduled for this day. Add one above.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {periods.map(p => (
                        <div
                            key={p.id}
                            style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', background: 'var(--background-alt)', borderRadius: '12px', borderLeft: `3px solid ${TYPE_COLORS[p.type]}` }}
                        >
                            {/* Time */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ink-ghost)', flexShrink: 0 }}>
                                <Clock size={13} color="var(--ink-ghost)" />
                                <span style={{ fontSize: '11px', fontWeight: '600' }}>{p.start_time} - {p.end_time}</span>
                            </div>
                            {/* Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '13px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {p.subject ?? p.activity ?? p.type}
                                </div>
                                {p.class_name && (
                                    <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>{p.class_name}</div>
                                )}
                            </div>
                            {/* Type badge */}
                            <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: TYPE_COLORS[p.type], background: `${TYPE_COLORS[p.type]}18`, padding: '3px 8px', borderRadius: '5px', flexShrink: 0 }}>
                                {p.type}
                            </span>
                            {/* Delete */}
                            <button
                                onClick={() => handleDelete(p.id)}
                                disabled={deleting === p.id}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', opacity: deleting === p.id ? 0.4 : 1 }}
                                title="Remove period"
                            >
                                <Trash2 size={14} color="var(--ink-ghost)" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
