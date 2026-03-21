import React, { useState } from 'react';
import { useSchoolInvites } from '@repo/classroom';
import { ArrowLeft, Plus, Copy } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';

interface InvitesViewProps {
    schoolId: string;
    userId: string;
    isPastView: boolean;
    onBack: () => void;
}

export const InvitesView: React.FC<InvitesViewProps> = ({ schoolId, userId, isPastView, onBack }) => {
    const { inviteCodes, generating, generateCode } = useSchoolInvites(schoolId);
    const [inviteRole, setInviteRole] = useState<'teacher' | 'principal'>('teacher');

    const handleGenerateCode = async () => {
        try {
            await generateCode(inviteRole, userId);
        } catch (err) {
            // Error handled in hook
        }
    };

    const copyToClipboard = (code: string) => {
        if (typeof navigator !== 'undefined') {
            navigator.clipboard.writeText(code);
        }
    };

    return (
        <div>
            <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--glass-surface)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: '600', marginBottom: '24px' }}>
                <ArrowLeft size={14} /> Back to Dashboard
            </button>
            <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '800' }}>📬 Governance Invites</h2>
            <p style={{ margin: '0 0 24px', color: 'var(--ink-ghost)', fontSize: '14px' }}>Generate invite codes to onboard principals and teachers.</p>
            
            <div className="sanctuary-card" style={{ padding: '24px', marginBottom: '20px', opacity: isPastView ? 0.6 : 1 }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select 
                        value={inviteRole} 
                        onChange={e => setInviteRole(e.target.value as any)} 
                        disabled={isPastView} 
                        style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '14px' }}
                    >
                        <option value="teacher">Teacher</option>
                        <option value="principal">Principal</option>
                    </select>
                    <button 
                        onClick={handleGenerateCode} 
                        disabled={generating || isPastView} 
                        className="premium-button" 
                        style={{ background: 'var(--lotus)', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {generating ? '⏳' : <><Plus size={14} /> Generate Code</>}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {inviteCodes.length === 0 ? (
                    <p style={{ color: 'var(--ink-ghost)', fontStyle: 'italic' }}>No active codes. Generate one above.</p>
                ) : inviteCodes.map(c => (
                    <div key={c.id} className="sanctuary-card" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <code style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '3px', color: 'var(--lotus)' }}>{c.code}</code>
                            <div style={{ fontSize: '11px', color: 'var(--ink-ghost)', marginTop: '4px' }}>
                                {c.role} · {c.used ? 'Used' : 'Active'} · {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                            </div>
                        </div>
                        <button 
                            onClick={() => copyToClipboard(c.code)} 
                            title="Copy code" 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-ghost)' }}
                        >
                            <Copy size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
