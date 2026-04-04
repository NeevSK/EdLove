import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Copy, Plus, X } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { hapticSuccess } from '@repo/ui';
import { invitesAPI, type InviteCode } from '../../invites';

// —————————————————————————————————————————————————————————————————————————————
// TYPES
// —————————————————————————————————————————————————————————————————————————————

interface InvitesDashboardProps {
    schoolId: string;
    userId: string;
    isPastView: boolean;
    onBack: () => void;
}

// —————————————————————————————————————————————————————————————————————————————
// COMPONENT
// —————————————————————————————————————————————————————————————————————————————

export const InvitesDashboard: React.FC<InvitesDashboardProps> = ({ schoolId, userId, isPastView, onBack }) => {
    const [inviteRole, setInviteRole] = useState<'teacher' | 'principal'>('teacher');
    const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    const loadInviteCodes = useCallback(async () => {
        if (!schoolId) return;
        setLoading(true);
        try {
            const codes = await invitesAPI.getInviteCodesBySchool(schoolId);
            setInviteCodes(codes ?? []);
        } catch (error) {
            console.error('Failed to load invite codes:', error);
        } finally {
            setLoading(false);
        }
    }, [schoolId]);

    useEffect(() => {
        void loadInviteCodes();
    }, [loadInviteCodes]);

    const handleRevoke = async (code: string) => {
        if (!schoolId || !userId) return;
        try {
            await invitesAPI.revokeInviteCode(schoolId, code, userId);
            setInviteCodes((current) => 
                current.map(inv => inv.code === code ? { ...inv, is_active: false } : inv)
            );
            hapticSuccess();
        } catch (err) {
            console.error('[InvitesDashboard] revokeInviteCode failed:', err);
        }
    };

    const handleGenerateCode = async () => {
        if (!schoolId || !userId) return;
        setGenerating(true);
        try {
            const newCode = await invitesAPI.generateInviteCode(schoolId, inviteRole, userId);
            setInviteCodes((current) => [newCode, ...current]);
        } catch (err) {
            console.error('[InvitesDashboard] generateInviteCode failed:', err);
        } finally {
            setGenerating(false);
        }
    };

    const copyToClipboard = (code: string) => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(code).catch(err => {
                console.error('Failed to copy to clipboard:', err);
            });
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <button 
                onClick={onBack} 
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    padding: '8px 14px', 
                    borderRadius: '10px', 
                    border: '1px solid var(--border)', 
                    background: 'var(--glass-surface)', 
                    cursor: 'pointer', 
                    fontFamily: 'var(--font-body)', 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    marginBottom: '24px',
                    color: 'var(--ink)'
                }}
            >
                <ArrowLeft size={14} /> Back to Dashboard
            </button>
            
            <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '800', color: 'var(--ink)' }}>
                Governance Invites
            </h2>
            <p style={{ margin: '0 0 24px', color: 'var(--ink-ghost)', fontSize: '14px' }}>
                Generate invite codes to onboard principals and teachers.
            </p>

            <div className="sanctuary-card" style={{ padding: '24px', marginBottom: '20px', opacity: isPastView ? 0.6 : 1, backgroundColor: 'var(--glass-surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select
                        value={inviteRole}
                        onChange={e => setInviteRole(e.target.value as 'teacher' | 'principal')}
                        disabled={isPastView}
                        style={{ 
                            padding: '10px 14px', 
                            borderRadius: '10px', 
                            border: '1px solid var(--border)', 
                            background: 'var(--background-alt)', 
                            color: 'var(--ink)', 
                            fontFamily: 'var(--font-body)', 
                            fontSize: '14px',
                            minWidth: '120px'
                        }}
                    >
                        <option value="teacher">Teacher</option>
                        <option value="principal">Principal</option>
                    </select>

                    <button
                        onClick={handleGenerateCode}
                        disabled={generating || isPastView}
                        className="premium-button"
                        style={{ 
                            background: 'var(--lotus)', 
                            color: 'white',
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            cursor: (generating || isPastView) ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '600'
                        }}
                    >
                        {generating ? 'Generating...' : (
                            <>
                                <Plus size={14} color="white" />
                                <span>Generate Code</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {loading ? (
                    <p style={{ color: 'var(--ink-ghost)', fontStyle: 'italic', padding: '20px' }}>
                        Loading invite codes...
                    </p>
                ) : inviteCodes.length === 0 ? (
                    <p style={{ color: 'var(--ink-ghost)', fontStyle: 'italic', padding: '20px' }}>
                        No active codes. Generate one above.
                    </p>
                ) : (
                    inviteCodes.map((invite) => (
                        <div 
                            key={invite.code} 
                            className="sanctuary-card" 
                            style={{ 
                                padding: '18px 24px', 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                backgroundColor: 'var(--glass-surface)',
                                borderRadius: '12px',
                                border: '1px solid var(--border)'
                            }}
                        >
                            <div>
                                <code style={{ 
                                    fontSize: '20px', 
                                    fontWeight: '800', 
                                    letterSpacing: '3px', 
                                    color: 'var(--lotus)',
                                    fontFamily: 'monospace'
                                }}>
                                    {invite.code}
                                </code>
                                <div style={{ fontSize: '12px', color: 'var(--ink-ghost)', marginTop: '4px' }}>
                                    Role: {invite.authority.replace('_', ' ') || 'Guest'} • {invite.is_active === false ? 'Revoked' : invite.used ? 'Used' : 'Active'} • {formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => copyToClipboard(invite.code)}
                                    title="Copy code"
                                    style={{ 
                                        background: 'rgba(255,255,255,0.05)', 
                                        border: '1px solid var(--border)', 
                                        borderRadius: '8px',
                                        padding: '8px',
                                        cursor: 'pointer', 
                                        color: 'var(--ink-ghost)',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <Copy size={16} />
                                </button>
                                {!invite.used && invite.is_active !== false && (
                                    <button
                                        onClick={() => handleRevoke(invite.code)}
                                        title="Revoke code"
                                        style={{ 
                                            background: 'rgba(255,0,0,0.05)', 
                                            border: '1px solid rgba(255,0,0,0.2)', 
                                            borderRadius: '8px',
                                            padding: '8px',
                                            cursor: 'pointer', 
                                            color: '#ef4444',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export type { InvitesDashboardProps };
