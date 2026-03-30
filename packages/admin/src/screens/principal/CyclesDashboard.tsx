import React, { useState, useEffect } from 'react';
import { api } from '@repo/core';
import { SkeletonCard } from '@repo/ui';
import { ArrowLeft, Plus } from 'lucide-react-native';

interface CyclesDashboardProps {
    schoolId: string;
    isPastView: boolean;
    onBack: () => void;
}

export const CyclesDashboard: React.FC<CyclesDashboardProps> = ({ schoolId, isPastView, onBack }) => {
    const [academicCycles, setAcademicCycles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [newName, setNewName] = useState('');
    const [newStart, setNewStart] = useState('');
    const [newEnd, setNewEnd] = useState('');
    const [saving, setSaving] = useState(false);

    const loadAcademicCycles = async () => {
        if (!schoolId) return;
        setLoading(true);
        try {
            setAcademicCycles(await api.academicCycles.getAll(schoolId));
        } catch (err) {
            console.error('Failed to load academic cycles:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAcademicCycles();
    }, [schoolId]);

    const handleCreateCycle = async () => {
        if (!newName.trim() || !newStart || !schoolId) return;
        setSaving(true);
        try {
            const cycle = await api.academicCycles.create({ 
                name: newName.trim(), 
                school_id: schoolId, 
                start_date: newStart, 
                end_date: newEnd || undefined, 
                status: 'upcoming' 
            } as any);
            setAcademicCycles(prev => [cycle, ...prev]);
            setNewName(''); 
            setNewStart(''); 
            setNewEnd('');
        } catch (err) {
            console.error('Failed to create academic cycle:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--glass-surface)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: '600', marginBottom: '24px' }}
                <ArrowLeft size={14} /> Back to Dashboard
            </button
            <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '800' }}>\uD83D\uDCC5 Academic Cycles</h2
            <p style={{ margin: '0 0 24px', color: 'var(--ink-ghost)', fontSize: '14px' }}>Define terms, semesters and academic periods.</p
            
            <div className="sanctuary-card" style={{ padding: '24px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px', opacity: isPastView ? 0.6 : 1 }}
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--ink-ghost)' }}>New Cycle</h4
                <input 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)} 
                    disabled={isPastView} 
                    placeholder="e.g. First Term 2026" 
                    style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '14px' }} 
                /
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
                    <div style={{ flex: 1 }}
                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>Start Date</label
                        <input 
                            type="date" 
                            value={newStart} 
                            onChange={e => setNewStart(e.target.value)} 
                            disabled={isPastView} 
                            style={{ width: '100%', marginTop: '6px', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '14px', boxSizing: 'border-box' as const }} 
                        /
                    </div
                    <div style={{ flex: 1 }}
                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--ink-ghost)', textTransform: 'uppercase' }}>End Date</label
                        <input 
                            type="date" 
                            value={newEnd} 
                            onChange={e => setNewEnd(e.target.value)} 
                            disabled={isPastView} 
                            style={{ width: '100%', marginTop: '6px', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '14px', boxSizing: 'border-box' as const }} 
                        /
                    </div
                </div
                <button 
                    onClick={handleCreateCycle} 
                    disabled={!newName.trim() || !newStart || saving || isPastView} 
                    className="premium-button" 
                    style={{ alignSelf: 'flex-start', background: 'var(--lotus)', display: 'flex', alignItems: 'center', gap: '8px' }}
                
                    {saving ? '\u23F3' : <><Plus size={14} /> Create</>}
                </button
            </div

            {loading ? <SkeletonCard /> : academicCycles.length === 0 ? (
                <p style={{ color: 'var(--ink-ghost)', fontStyle: 'italic' }}>No academic cycles yet. Create the first one above.</p
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
                    {academicCycles.map(c => (
                        <div key={c.id} className="sanctuary-card" style={{ padding: '18px 24px', borderLeft: `3px solid ${c.status === 'active' ? 'var(--moss)' : c.status === 'upcoming' ? 'var(--water)' : 'var(--border)'}` }}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                <div
                                    <div style={{ fontWeight: '800', fontSize: '16px' }}>{c.name}</div
                                    <div style={{ fontSize: '12px', color: 'var(--ink-ghost)', marginTop: '4px' }}>{c.start_date} \u2192 {c.end_date ?? 'ongoing'}</div
                                </div
                                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: c.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)', color: c.status === 'active' ? 'var(--moss)' : 'var(--water)' }}>{c.status}</span
                            </div
                        </div
                    ))}
                </div
            )}
        </div
    );
};

export type { CyclesDashboardProps };
