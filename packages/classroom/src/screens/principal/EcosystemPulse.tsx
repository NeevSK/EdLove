import React from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, MessageSquare, Heart, Shield } from 'lucide-react-native';

interface EcosystemPulseProps {
    pulse: any;
    echoItems: any[];
    onMarkRead: (id: string) => void;
    onReply: (id: string) => void;
}

export const EcosystemPulse: React.FC<EcosystemPulseProps> = ({ pulse, echoItems, onMarkRead, onReply }) => {
    const { t } = useTranslation();

    return (
        <div className="sanctuary-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--moss)', padding: '10px', borderRadius: '12px' }}>
                        <Activity size={20} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Ecosystem Pulse</h3>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-ghost)' }}>School community health and feedback</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '18px', borderRadius: '16px', background: 'var(--background-alt)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--moss)' }}>
                        <Heart size={14} /> <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>Resonance</span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '900' }}>{pulse?.resonance_score ?? 0}%</div>
                </div>
                <div style={{ padding: '18px', borderRadius: '16px', background: 'var(--background-alt)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--water)' }}>
                        <Activity size={14} /> <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>Participation</span>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '900' }}>{pulse?.participation_rate ?? 0}%</div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)' }}>Echo Chamber Feedback</h4>
                {echoItems.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-ghost)', fontStyle: 'italic' }}>No active feedback patterns.</p>
                ) : echoItems.map(item => (
                    <div key={item.id} style={{ padding: '16px', borderRadius: '12px', background: 'var(--background-alt)', borderLeft: '3px solid var(--water)', display: 'flex', flexDirection: 'column', gap: '8px', opacity: item.is_read ? 0.6 : 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water)' }}>{item.category}</span>
                            <span style={{ fontSize: '10px', color: 'var(--ink-ghost)' }}>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>{item.content}</p>
                        {!item.is_read && (
                            <button 
                                onClick={() => onMarkRead(item.id)} 
                                style={{ alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, color: 'var(--lotus)', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                            >
                                Mark as processed
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
