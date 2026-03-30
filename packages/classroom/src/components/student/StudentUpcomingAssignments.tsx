import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react-native';

export const StudentUpcomingAssignments = ({ assignments, onOpenSubmission, isPastView }: { assignments: any[], onOpenSubmission: (a: any) => void, isPastView: boolean }) => {
    const pendingAssignments = assignments.filter((a: any) => !a.submitted);

    if (assignments.length === 0) return null;

    return (
        <div style={{ marginTop: '40px' }}            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}                <CheckCircle2 size={18} color="var(--moss)" /                Upcoming Assignments
                {pendingAssignments.length > 0 && (
                    <span style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.1)', borderRadius: '6px', fontSize: '11px', color: 'var(--ember)', fontWeight: '700' }}                        {pendingAssignments.length} pending
                    </span                )}
            </h2            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}                {assignments.map((a: any) => (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderRadius: '12px', background: 'var(--background-alt)', border: `1px solid ${a.submitted ? 'var(--moss)' : 'var(--border-light)'}` }}                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.submitted ? 'var(--moss)' : 'var(--ember)', flexShrink: 0 }} /                        <div style={{ flex: 1 }}                            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--ink)' }}>{a.title}</div                            <div style={{ fontSize: '11px', color: 'var(--ink-ghost)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}                                <span>{a.classroom ?? (a.classrooms as any)?.name ?? ''}</span                                <span>\u00B7</span                                <Clock size={10} /                                <span>Due {typeof a.due_date === 'string' ? a.due_date : new Date(a.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span                            </div                        </div                        {!a.submitted && !isPastView && (
                            <button
                                className="premium-button"
                                style={{ fontSize: '11px', padding: '6px 12px' }}
                                onClick={() => onOpenSubmission(a)}
                                                            Submit
                            </button                        )}
                        {a.submitted && (
                            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--moss)', display: 'flex', alignItems: 'center', gap: '4px' }}                                <CheckCircle2 size={13} /> Submitted
                            </span                        )}
                    </div                ))}
            </div        </div    );
};
