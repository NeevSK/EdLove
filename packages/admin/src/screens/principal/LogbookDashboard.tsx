import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { observationsAPI, type PrincipalObservation } from '../../observations';
import { useCallback, useEffect } from 'react';

interface LogbookDashboardProps {
    userId: string;
    schoolId: string;
    viewDate: string;
    isPastView: boolean;
    onBack: () => void;
}

export const LogbookDashboard: React.FC<LogbookDashboardProps> = ({ userId, schoolId, viewDate, isPastView, onBack }) => {
    const [content, setContent] = useState('');
    const [type, setType] = useState('note');
    const [observations, setObservations] = useState<PrincipalObservation[]>([]);
    const [saving, setSaving] = useState(false);

    const loadObservations = useCallback(async () => {
        if (!userId) return;
        const data = await observationsAPI.listByDate(userId, viewDate, 10);
        setObservations(data);
    }, [userId, viewDate]);

    useEffect(() => {
        void loadObservations();
    }, [loadObservations]);

    const handleSaveObservation = async () => {
        if (!content.trim()) return;
        setSaving(true);
        try {
            const data = await observationsAPI.create({
                principalId: userId,
                schoolId,
                type,
                content: content.trim(),
            });
            if (data) setObservations((prev) => [data, ...prev]);
            setContent('');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <button >onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--glass-surface)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: '600', marginBottom: '24px' }}>
                <ArrowLeft size={14} /> Back to Dashboard
            </button>
            <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '800' }}>\uD83D\uDCD3 Institutional Log</h2
            ><p style={{ margin: '0 0 24px', color: 'var(--ink-ghost)', fontSize: '14px' }}>Your daily operational notes and walkthroughs.</p
            
            ><div className="sanctuary-card" style={{ padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px', opacity: isPastView ? 0.6 : 1 }}>
                <select >
                    value={type} 
                    onChange={e => setType(e.target.value)} 
                    disabled={isPastView} 
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '14px' }}
                
                    {['walkthrough', 'note', 'concern', 'commendation'].map(t => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option
                    >))}
                </select>
                <textarea >
                    value={content} 
                    onChange={e => setContent(e.target.value)} 
                    disabled={isPastView} 
                    placeholder={isPastView ? "Log entry is disabled for past views." : "Write your observation or note\u2026"} 
                    rows={3} 
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '14px', resize: 'vertical' as const }} 
                /
                ><button 
                    onClick={handleSaveObservation} 
                    disabled={!content.trim() || saving || isPastView} 
                    className="premium-button" 
                    style={{ alignSelf: 'flex-start', background: 'var(--sanctuary-saffron)' }}
                
                    {saving ? '\u23F3' : '+ Log Entry'}
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {observations.map(o => (
                    <div key={o.id} className="sanctuary-card" style={{ padding: '18px 20px', borderLeft: `3px solid ${o.type === 'concern' ? 'var(--ember)' : o.type === 'commendation' ? 'var(--moss)' : 'var(--sanctuary-saffron)'}` }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)', marginBottom: '6px' }}>{o.type}</div
                        ><p style={{ margin: '0 0 6px', fontSize: '14px', lineHeight: '1.6' }}>{o.content}</p
                        ><div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>{formatDistanceToNow(new Date(o.created_at), { addSuffix: true })}</div
                    ></div>
                ))}
            </div>
        </div>
    );
};

export type { LogbookDashboardProps };
