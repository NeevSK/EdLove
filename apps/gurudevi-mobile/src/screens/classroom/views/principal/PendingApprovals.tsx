import React from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardList } from 'lucide-react-native';
import { StaffLeaveDTO } from '@repo/core';
import { LEAVE_STATUS_COLORS } from './types';

interface PendingApprovalsProps {
    leaves: StaffLeaveDTO[];
    processingId: string | null;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

export const PendingApprovals: React.FC<PendingApprovalsProps> = ({ leaves, processingId, onApprove, onReject }) => {
    const { t } = useTranslation();

    const formatLeaveLabel = (leave: StaffLeaveDTO) => leave.leave_type
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());

    return (
        <div className="sanctuary-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--amber-glow)', padding: '10px', borderRadius: '12px' }}>
                    <ClipboardList size={20} />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Pending Approvals</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-ghost)' }}>Staff leave and resource requests</p>
                </div>
            </div>

            {leaves.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                    <p style={{ margin: 0, color: 'var(--ink-ghost)', fontSize: '14px' }}>No pending requests at this time.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {leaves.map((leave) => (
                        <div key={leave.id} style={{ padding: '16px', borderRadius: '12px', background: 'var(--background-alt)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: LEAVE_STATUS_COLORS[leave.status] || 'var(--ink-ghost)' }} />
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '800' }}>{leave.user_id}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}>{formatLeaveLabel(leave)} · {leave.start_date} to {leave.end_date}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => onReject(leave.id)}
                                    disabled={processingId === leave.id}
                                    style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--ember)', background: 'none', color: 'var(--ember)', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => onApprove(leave.id)}
                                    disabled={processingId === leave.id}
                                    style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'var(--moss)', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                                >
                                    {processingId === leave.id ? '...' : 'Approve'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
