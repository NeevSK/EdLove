import React, { useState } from 'react';
import { usePrincipalObservations } from '@repo/classroom';
import { ArrowLeft } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

interface LogbookViewProps {
    userId: string;
    schoolId: string;
    viewDate: string;
    isPastView: boolean;
    onBack: () => void;
}

export const LogbookView: React.FC<LogbookViewProps> = ({ userId, schoolId, viewDate, isPastView, onBack }) => {
    const { observations, saving, saveObservation } = usePrincipalObservations(userId, schoolId, viewDate);
    const [content, setContent] = useState('');
    const [type, setType] = useState('note');

    const handleSaveObservation = async () => {
        if (!content.trim()) return;
        try {
            await saveObservation(content, type);
            setContent('');
        } catch (err) {
            // Error handled in hook
        }
    };

    return (
        <div>
            <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--glass-surface)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: '600', marginBottom: '24px' }}>
                <ArrowLeft size={14} /> Back to Dashboard
            </button>
            <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '800' }}>📓 Institutional Log</h2>
            <p style={{ margin: '0 0 24px', color: 'var(--ink-ghost)', fontSize: '14px' }}>Your daily operational notes and walkthroughs.</p>
            
            <div className="sanctuary-card" style={{ padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px', opacity: isPastView ? 0.6 : 1 }}>
                <select 
                    value={type} 
                    onChange={e => setType(e.target.value)} 
                    disabled={isPastView} 
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '14px' }}
                >
                    {['walkthrough', 'note', 'concern', 'commendation'].map(t => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                </select>
                <textarea 
                    value={content} 
                    onChange={e => setContent(e.target.value)} 
                    disabled={isPastView} 
                    placeholder={isPastView ? "Log entry is disabled for past views." : "Write your observation or note…"} 
                    rows={3} 
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '14px', resize: 'vertical' as const }} 
                />
                <button 
                    onClick={handleSaveObservation} 
                    disabled={!content.trim() || saving || isPastView} 
                    className="premium-button" 
                    style={{ alignSelf: 'flex-start', background: 'var(--sanctuary-saffron)' }}
                >
                    {saving ? '⏳' : '+ Log Entry'}
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {observations.map(o => (
                    <div key={o.id} className="sanctuary-card" style={{ padding: '18px 20px', borderLeft: `3px solid ${o.type === 'concern' ? 'var(--ember)' : o.type === 'commendation' ? 'var(--moss)' : 'var(--sanctuary-saffron)'}` }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)', marginBottom: '6px' }}>{o.type}</div>
                        <p style={{ margin: '0 0 6px', fontSize: '14px', lineHeight: '1.6' }}>{o.content}</p>
                        <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>{formatDistanceToNow(new Date(o.created_at), { addSuffix: true })}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
