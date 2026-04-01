/**
 * RemindersManager.web.tsx
 *
 * Web override. Manages user reminders (CRUD) with the same `reminders` table.
 * Metro resolves this over RemindersManager.tsx on the web platform.
 */
import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Droplets } from 'lucide-react-native';
import {
    createReminder,
    deleteReminder,
    fetchReminders,
    type ReminderRecord,
    updateReminder,
} from '../api/selfFeatureRepository';

type Reminder = ReminderRecord;

interface RemindersManagerProps {
    userId?: string;
}

const DEFAULT_REMINDER = {
    title: 'Stay Hydrated',
    description: 'Drink water intermittently while teaching',
    icon_type: 'droplet',
    is_default: true,
};

export default function RemindersManager({ userId }: RemindersManagerProps) {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);
    const [toggling, setToggling] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) { setIsLoading(false); return; }
        fetchReminders(userId)
            .then((data) => {
                if (data.length === 0) createDefault();
                else setReminders(data);
            })
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, [userId]);

    const createDefault = async () => {
        if (!userId) return;
        const data = await createReminder(userId, { ...DEFAULT_REMINDER, is_active: true, icon_type: DEFAULT_REMINDER.icon_type });
        if (data) setReminders([data]);
    };

    const handleAdd = async () => {
        if (!title.trim() || !userId) return;
        setSaving(true);
        try {
            const data = await createReminder(userId, {
                title: title.trim(),
                description: description.trim() || undefined,
                icon_type: 'bell',
                is_default: false,
                is_active: true,
            });
            setReminders(p => [...p, data]);
            setTitle('');
            setDescription('');
            setShowForm(false);
        } finally { setSaving(false); }
    };

    const handleToggle = async (r: Reminder) => {
        setToggling(r.id);
        setReminders(p => p.map(x => x.id === r.id ? { ...x, is_active: !x.is_active } : x));
        await updateReminder(r.id, { is_active: !r.is_active });
        setToggling(null);
    };

    const handleDelete = async (id: string) => {
        setDeleting(id);
        setReminders(p => p.filter(x => x.id !== id));
        await deleteReminder(id);
        setDeleting(null);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bell size={15} color="var(--sanctuary-saffron)" />
                    <span style={{ fontSize: '13px', fontWeight: '800' }}>Gentle Reminders</span>
                </div>
                <button onClick={() => setShowForm(v => !v)} style={{ fontSize: '11px', padding: '5px 11px', borderRadius: '8px', border: '1px solid var(--border)', background: showForm ? 'var(--sanctuary-saffron)' : 'transparent', color: showForm ? 'var(--text-on-action)' : 'var(--ink-ghost)', cursor: 'pointer', fontWeight: '700' }}>
                    {showForm ? 'Cancel' : '+ Add'}
                </button>
            </div>

            {showForm && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'var(--background-alt)', borderRadius: '10px' }}>
                    <input value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="Reminder title" style={{ padding: '8px 11px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', color: 'var(--ink)', fontSize: '13px', fontFamily: 'var(--font-body)', outline: 'none' }} />
                    <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" style={{ padding: '8px 11px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', color: 'var(--ink)', fontSize: '13px', fontFamily: 'var(--font-body)', outline: 'none' }} />
                    <button onClick={handleAdd} disabled={saving || !title.trim()} style={{ padding: '8px', borderRadius: '8px', background: 'var(--sanctuary-saffron)', color: 'var(--text-on-action)', border: 'none', fontWeight: '700', fontSize: '12px', cursor: saving || !title.trim() ? 'not-allowed' : 'pointer', opacity: saving || !title.trim() ? 0.6 : 1 }}>
                        {saving ? '...' : '+ Add Reminder'}
                    </button>
                </div>
            )}

            {isLoading ? (
                <div style={{ height: '48px', background: 'var(--background-alt)', borderRadius: '10px' }} />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {reminders.map(r => (
                        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--background-alt)', borderRadius: '10px', opacity: r.is_active ? 1 : 0.5 }}>
                            {r.icon_type === 'droplet' ? <Droplets size={14} color="var(--water)" /> : <Bell size={14} color="var(--sanctuary-saffron)" />}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', fontWeight: '700' }}>{r.title}</div>
                                {r.description && <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>{r.description}</div>}
                            </div>
                            <input type="checkbox" checked={r.is_active} onChange={() => handleToggle(r)} disabled={toggling === r.id} style={{ accentColor: 'var(--sanctuary-saffron)', cursor: 'pointer' }} />
                            {!r.is_default && (
                                <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', opacity: 0.5 }}>
                                    <Trash2 size={12} color="var(--ink-ghost)" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
